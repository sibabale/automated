#!/usr/bin/env node

/**
 * Validates and auto-fixes object property ordering in staged TypeScript/
 * JavaScript files under `backend/`.
 *
 * OPT-IN ONLY. Object property order is a first-class, observable feature of
 * JavaScript (JSON.stringify, Object.keys/entries, for...in, spread and CSS
 * cascade all read it back). Reordering silently is therefore dangerous, so
 * this script does NOTHING unless an object is explicitly certified as an
 * order-insensitive lookup map with a `@sort-keys` marker on a comment line
 * directly above it (a line comment or inside its JSDoc):
 *
 *   // @sort-keys
 *   export const FMP_ENDPOINTS = {
 *     profile: "profile",
 *     cashFlow: "cash-flow-statement",
 *     keyMetrics: "key-metrics",
 *     ratiosTtm: "ratios-ttm",
 *     balanceSheet: "balance-sheet-statement",
 *     incomeStatement: "income-statement",
 *   } as const;
 *
 * Within a marked object the entries are ordered by KEY length, shortest first.
 * When two keys share the same length, the entry with the shorter VALUE comes
 * first. Equal-length pairs keep their original relative order (stable).
 *
 * NEVER mark objects whose order carries meaning — CSS-in-JS style objects,
 * ORM `orderBy` clauses, signed/hashed JSON payloads, or anything an iteration
 * consumes in order. See the object-key-ordering skill for the full list.
 *
 * To stay safe the script also only touches a marked block when every non-blank
 * line between the braces is a single-line `key: scalar,` pair. A scalar is a
 * string, number, boolean, null, or a dotted identifier — never a nested
 * object, array, call, comment, method, or spread.
 */

const fs = require('fs');
const { execSync } = require('child_process');

// Opens an object literal: a line whose last meaningful character is `{`.
const OPEN_PATTERN = /\{\s*$/;
// Closes an object literal: a line that starts with `}` (e.g. `}`, `} as const;`).
const CLOSE_PATTERN = /^\}/;
// A single-line property: `key: value` with an optional trailing comma.
const PAIR_PATTERN = /^([A-Za-z_$][\w$]*|"[^"]*"|'[^']*')\s*:\s*(.+?),?$/;
// A value we consider safe to reorder (no brackets, braces, parens, comments).
const SIMPLE_VALUE_PATTERN = /^(?!.*\/\/)[^{}[\]()`]+$/;

let fixes = [];

// Get staged files from git
let stagedFiles = [];
try {
  const output = execSync('git diff --cached --name-only', {
    encoding: 'utf-8',
  });
  stagedFiles = output
    .split('\n')
    .filter((f) => f.startsWith('backend/'))
    .filter((f) => f.match(/\.(ts|tsx|js|jsx)$/))
    .filter((f) => fs.existsSync(f));
} catch (e) {
  console.error('Error reading staged files:', e.message);
  process.exit(1);
}

if (stagedFiles.length === 0) {
  console.log('✓ No TypeScript/JavaScript files staged.');
  process.exit(0);
}

/**
 * Determines whether an object opener is explicitly certified as an
 * order-insensitive lookup map via a `@sort-keys` marker.
 *
 * The marker may sit on the opener line itself or on any contiguous run of
 * comment / blank lines directly above it (so it works inside a JSDoc block).
 */
function hasSortMarker(lines, openerIndex) {
  if (lines[openerIndex].includes('@sort-keys')) {
    return true;
  }

  let cursor = openerIndex - 1;
  while (cursor >= 0) {
    const trimmed = lines[cursor].trim();
    if (trimmed === '') {
      cursor -= 1;
      continue;
    }

    const isComment =
      trimmed.startsWith('//') ||
      trimmed.startsWith('*') ||
      trimmed.startsWith('/*') ||
      trimmed.endsWith('*/');
    if (!isComment) {
      return false;
    }
    if (trimmed.includes('@sort-keys')) {
      return true;
    }
    cursor -= 1;
  }

  return false;
}

/**
 * Parses a single property line into `{ key, value }`, or returns null when the
 * line is not a simple, safe-to-reorder scalar pair.
 */
function parsePair(rawLine) {
  const trimmed = rawLine.trim();

  // Object-literal properties are comma-separated; a trailing semicolon means
  // this is an interface or type member, which we must never reorder.
  if (trimmed.endsWith(';')) {
    return null;
  }

  const match = trimmed.match(PAIR_PATTERN);
  if (!match) {
    return null;
  }

  const key = match[1];
  const value = match[2].trim();
  if (!SIMPLE_VALUE_PATTERN.test(value)) {
    return null;
  }

  return { key, value };
}

/**
 * Orders parsed pairs by key length, then value length, preserving the
 * original order for entries that tie on both.
 */
function orderPairs(pairs) {
  return pairs
    .map((pair, position) => ({ ...pair, position }))
    .sort((a, b) => {
      if (a.key.length !== b.key.length) {
        return a.key.length - b.key.length;
      }
      if (a.value.length !== b.value.length) {
        return a.value.length - b.value.length;
      }
      return a.position - b.position;
    });
}

// Check and fix each file
stagedFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  let fileHasErrors = false;

  let index = 0;
  while (index < lines.length) {
    if (!OPEN_PATTERN.test(lines[index])) {
      index += 1;
      continue;
    }

    // Opt-in only: skip any object not explicitly certified with @sort-keys.
    if (!hasSortMarker(lines, index)) {
      index += 1;
      continue;
    }

    // Scan the body until the matching closing line. Any nested brace aborts.
    const bodyStart = index + 1;
    let cursor = bodyStart;
    let aborted = false;
    while (cursor < lines.length && !CLOSE_PATTERN.test(lines[cursor].trim())) {
      const trimmed = lines[cursor].trim();
      if (trimmed.includes('{') || trimmed.includes('}')) {
        aborted = true;
        break;
      }
      cursor += 1;
    }

    if (aborted || cursor >= lines.length) {
      index += 1;
      continue;
    }

    const body = lines.slice(bodyStart, cursor);
    const propertyLines = body.filter((line) => line.trim() !== '');

    // Every non-blank body line must be a simple scalar pair, and there must be
    // at least two of them for ordering to be meaningful.
    const pairs = propertyLines.map(parsePair);
    if (propertyLines.length < 2 || pairs.some((pair) => pair === null)) {
      index = cursor + 1;
      continue;
    }

    // Preserve the indentation of the first property.
    const indentMatch = propertyLines[0].match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1] : '';

    const ordered = orderPairs(pairs);
    const rebuilt = ordered.map((pair) => `${indent}${pair.key}: ${pair.value},`);
    const original = propertyLines;

    const changed =
      rebuilt.length !== original.length ||
      rebuilt.some((line, i) => line !== original[i]);

    if (changed) {
      fileHasErrors = true;
      lines.splice(bodyStart, cursor - bodyStart, ...rebuilt);
      cursor = bodyStart + rebuilt.length;
    }

    index = cursor + 1;
  }

  if (fileHasErrors) {
    fs.writeFileSync(file, lines.join('\n'));
    fixes.push(file);
  }
});

// Report results
if (fixes.length > 0) {
  console.log(`\n⚠️  Found ${fixes.length} file(s) with unordered object keys:\n`);

  fixes.forEach((file) => {
    console.log(`  ✓ Fixed ${file}`);
  });

  console.log(`\n✅ Object keys ordered shortest-first in ${fixes.length} file(s).`);
  console.log(`   Re-stage the changes and commit again.\n`);

  process.exit(1);
} else {
  console.log(`✓ All ${stagedFiles.length} file(s) pass object key order validation.`);
  process.exit(0);
}
