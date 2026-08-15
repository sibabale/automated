#!/usr/bin/env node

/**
 * Validates and auto-fixes import ordering in staged TypeScript/JavaScript files.
 * Within each contiguous block of single-line imports (e.g. the EXTERNAL and
 * INTERNAL DEPENDENCIES sections) imports are ordered by line length, shortest
 * first and longest last:
 *
 * import { HttpError } from "../../errors/http-error.js";
 * import { calculateROE } from "../services/calculate-roe.service.js";
 */

const fs = require('fs');
const { execSync } = require('child_process');

const IMPORT_PATTERN = /^import\b.*;\s*$/;

let fixes = [];

// Get staged files from git
let stagedFiles = [];
try {
  const output = execSync('git diff --cached --name-only', {
    encoding: 'utf-8',
  });
  stagedFiles = output
    .split('\n')
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

// Check and fix each file
stagedFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');
  let fileHasErrors = false;

  let index = 0;
  while (index < lines.length) {
    // Only single-line imports form a sortable block
    if (!IMPORT_PATTERN.test(lines[index].trim())) {
      index += 1;
      continue;
    }

    // Collect the contiguous run of import lines
    const start = index;
    while (index < lines.length && IMPORT_PATTERN.test(lines[index].trim())) {
      index += 1;
    }

    const block = lines.slice(start, index);
    if (block.length < 2) {
      continue;
    }

    // Stable sort by line length, shortest first
    const sorted = [...block].sort((a, b) => a.length - b.length);

    const changed = sorted.some((line, i) => line !== block[i]);
    if (changed) {
      fileHasErrors = true;
      for (let i = 0; i < sorted.length; i += 1) {
        lines[start + i] = sorted[i];
      }
    }
  }

  if (fileHasErrors) {
    fs.writeFileSync(file, lines.join('\n'));
    fixes.push(file);
  }
});

// Report results
if (fixes.length > 0) {
  console.log(
    `\n⚠️  Found ${fixes.length} file(s) with unordered imports:\n`
  );

  fixes.forEach((file) => {
    console.log(`  ✓ Fixed ${file}`);
  });

  console.log(
    `\n✅ Imports ordered shortest-first in ${fixes.length} file(s).`
  );
  console.log(`   Re-stage the changes and commit again.\n`);

  process.exit(1);
} else {
  console.log(`✓ All ${stagedFiles.length} file(s) pass import order validation.`);
  process.exit(0);
}
