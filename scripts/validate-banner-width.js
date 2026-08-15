#!/usr/bin/env node

/**
 * Validates and auto-fixes comment banners in staged TypeScript/JavaScript files.
 * Ensures all banner lines are exactly 102 characters wide. Banner lines follow:
 *
 * // [ CATEGORY ] ... (102 chars total)
 * // 1.1. SECTION ... (102 chars total)
 * // 1.1. END ....... (102 chars total)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const BANNER_PATTERN = /^(\s*)\/\/\s+([\[\w\.\s\]\-\>]+?)\s+([\.\#]+)\s*$/;
const TARGET_WIDTH = 102;

let errors = [];
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
  let content = fs.readFileSync(file, 'utf-8');
  let lines = content.split('\n');
  let fileHasErrors = false;

  lines = lines.map((line, index) => {
    // Check if line matches banner pattern
    const match = line.match(BANNER_PATTERN);
    if (match) {
      const [, indent, label, fillerChar] = match;
      const lineLength = line.length;

      if (lineLength !== TARGET_WIDTH) {
        fileHasErrors = true;
        const prefix = indent + '// ' + label + ' ';
        const fillerNeeded = TARGET_WIDTH - prefix.length;
        const filler = fillerChar.charAt(0).repeat(fillerNeeded);
        const fixedLine = prefix + filler;

        errors.push({
          file,
          line: index + 1,
          length: lineLength,
          content: line,
          fixed: fixedLine,
        });

        return fixedLine;
      }
    }

    return line;
  });

  // Write back if file had errors
  if (fileHasErrors) {
    fs.writeFileSync(file, lines.join('\n'));
    fixes.push(file);
  }
});

// Report results
if (errors.length > 0) {
  console.log(
    `\n⚠️  Found ${errors.length} line(s) with incorrect width:\n`
  );

  errors.forEach(({ file, line, length, content }) => {
    console.log(`  ${file}:${line}`);
    console.log(`    Expected: ${TARGET_WIDTH} chars, Got: ${length} chars`);
    console.log(`    Content: |${content}|`);
  });

  console.log(`\nFixing .....\n`);

  fixes.forEach((file) => {
    console.log(`  ✓ Fixed ${file}`);
  });

  console.log(
    `\n✅ All ${errors.length} line(s) have been auto-fixed to ${TARGET_WIDTH} characters.`
  );
  console.log(`   Re-stage the changes and commit again.\n`);

  process.exit(1);
} else {
  console.log(`✓ All ${stagedFiles.length} file(s) pass banner width validation.`);
  process.exit(0);
}
