#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

import { c } from './utils/term.mjs';

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(fullPath);
    } else if (entry.isFile()) {
      yield fullPath;
    }
  }
}

function countTests(content) {
  const matches = content.match(/\bit\s*\(/g);
  return matches ? matches.length : 0;
}

function stripCommentLines(content) {
  return content
    .split(/\r?\n/g)
    .filter((line) => {
      const trimmed = line.trim();
      return !(
        trimmed.startsWith('//') ||
        trimmed.startsWith('/*') ||
        trimmed.startsWith('*') ||
        trimmed.startsWith('*/')
      );
    })
    .join('\n');
}

function checkTestCategories(filePath, content, counters) {
  const categories = [
    'Rendering',
    'Props',
    'Events',
    'States',
    'Accessibility',
    'Snapshots',
  ];
  const missing = [];

  for (const cat of categories) {
    const pattern = new RegExp(`describe\\s*\\([^\\n]*['\"]${cat}`, 'm');
    if (!pattern.test(content)) missing.push(cat);
  }

  if (missing.length > 0) {
    console.log(c('yellow', `  ⚠ Missing: ${missing.join(' ')}`));
    counters.warnings++;
    return false;
  }

  return true;
}

function checkTestNaming(filePath, content, counters) {
  const lines = content.split(/\r?\n/g);
  const bad = [];

  for (const line of lines) {
    const match = line.match(/\bit\s*\(\s*(['"`])([^\1]+?)\1/); // naive
    if (!match) continue;

    const name = match[2];
    const lower = name.toLowerCase();
    if (!lower.includes('should') && !lower.includes('snapshot'))
      bad.push(name);
  }

  if (bad.length > 0) {
    console.log(c('yellow', `  ⚠ Some tests don't use 'should' naming`));
    counters.warnings++;
    return false;
  }

  return true;
}

function checkEdgeCases(content, counters) {
  if (/describe\s*\([^\n]*(Edge Cases|Boundary)/m.test(content)) return true;
  console.log(c('yellow', '  ⚠ No Edge Cases or Boundary tests'));
  counters.warnings++;
  return false;
}

function checkAccessibility(content, counters) {
  if (content.includes('expectNoA11yViolations')) return true;
  console.log(c('yellow', '  ⚠ No accessibility checks'));
  counters.warnings++;
  return false;
}

function checkTypeSafety(content, counters) {
  const stripped = stripCommentLines(content);
  if (/:\s*any\b/.test(stripped)) {
    console.log(c('yellow', "  ⚠ Found 'any' type usage"));
    counters.warnings++;
    return false;
  }
  return true;
}

function minTestsForFile(filename) {
  if (
    filename.includes('Upload') ||
    filename.includes('DatePicker') ||
    filename.includes('TimePicker')
  )
    return 50;
  return 30;
}

async function main() {
  const counters = {
    totalFiles: 0,
    passedFiles: 0,
    failedFiles: 0,
    warnings: 0,
  };

  console.log('🐯 Tigercat Test Quality Validation');
  console.log('====================================');
  console.log('');

  console.log('Scanning test files...');
  console.log('');

  const testDirsEnv = process.env.TEST_DIRS;
  const testDirs = (
    testDirsEnv ? testDirsEnv.split(/\s+/g) : ['tests/vue', 'tests/react']
  ).filter(Boolean);

  const testFiles = [];
  for (const dir of testDirs) {
    try {
      for await (const filePath of walk(dir)) {
        if (filePath.endsWith('.spec.ts') || filePath.endsWith('.spec.tsx'))
          testFiles.push(filePath);
      }
    } catch {
      // ignore missing dir
    }
  }

  if (testFiles.length === 0) {
    console.log(c('red', `No test files found in: ${testDirs.join(' ')}`));
    console.log('Set TEST_DIRS to customize directories.');
    process.exit(1);
  }

  for (const filePath of testFiles) {
    counters.totalFiles++;
    const filename = path.basename(filePath);

    console.log(c('blue', `Checking: ${filename}`));

    const content = readFileSync(filePath, 'utf8');

    const testCount = countTests(content);
    const minTests = minTestsForFile(filename);

    console.log(`  📊 Test count: ${testCount}`);
    if (testCount < minTests) {
      console.log(c('yellow', `  ⚠ Below minimum (${minTests})`));
      counters.warnings++;
    }

    let issues = 0;

    if (!checkTestCategories(filePath, content, counters)) issues++;
    if (!checkTestNaming(filePath, content, counters)) issues++;
    if (!checkEdgeCases(content, counters)) issues++;
    if (!checkAccessibility(content, counters)) issues++;
    if (!checkTypeSafety(content, counters)) issues++;

    if (issues === 0) {
      console.log(c('green', '  ✓ All checks passed'));
      counters.passedFiles++;
    } else {
      console.log(c('red', `  ✗ ${issues} issue(s)`));
      counters.failedFiles++;
    }

    console.log('');
  }

  console.log('====================================');
  console.log('📈 Summary');
  console.log('====================================');
  console.log(
    `Total: ${counters.totalFiles} | ${c(
      'green',
      `Passed: ${counters.passedFiles}`
    )} | ${c('red', `Failed: ${counters.failedFiles}`)} | ${c(
      'yellow',
      `Warnings: ${counters.warnings}`
    )}`
  );
  console.log('');

  if (counters.failedFiles > 0) {
    console.log(c('red', '❌ Validation failed'));
    console.log('See tests/TEST_QUALITY_GUIDELINES.md for standards.');
    process.exit(1);
  }

  console.log(c('green', '✅ All tests meet quality standards'));
  if (counters.warnings > 0)
    console.log(
      c(
        'yellow',
        `Note: ${counters.warnings} warning(s) - consider addressing for better quality`
      )
    );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
