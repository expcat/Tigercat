#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

import { getPnpmVersion, isPnpmAvailable, runPnpm } from './utils/pnpm.mjs';

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: false,
    ...options,
  });

  return result.status ?? 1;
}

function main() {
  console.log('🐯 Tigercat Development Setup');
  console.log('==============================');
  console.log('');

  console.log(`✓ Node.js ${process.versions.node} detected`);

  if (!isPnpmAvailable()) {
    console.log('Installing pnpm...');
    const status = run('npm', ['install', '-g', 'pnpm@10.26.2'], {
      shell: true,
    });
    if (status !== 0) process.exit(status);
    console.log('✓ pnpm installed');
  } else {
    const pnpmVersion = getPnpmVersion() ?? 'unknown';
    console.log(`✓ pnpm ${pnpmVersion} detected`);
  }

  console.log('');
  console.log('Installing dependencies...');
  let status = runPnpm(['install']);
  if (status !== 0) process.exit(status);

  console.log('');
  console.log('Building packages...');
  status = runPnpm(['build']);
  if (status !== 0) process.exit(status);

  console.log('');
  status = run(process.execPath, ['./scripts/check-env.mjs']);
  if (status !== 0) process.exit(status);

  console.log('');
  console.log('==============================');
  console.log('✓ Setup complete!');
  console.log('');
  console.log('Next steps:');
  console.log('  1. Read DEVELOPMENT.md for development guidelines');
  console.log("  2. Run 'pnpm test' to run all tests");
  console.log(
    "  3. Run 'pnpm example:vue' or 'pnpm example:react' to see the examples"
  );
  console.log("  4. Run 'pnpm dev' for watch mode during development");
  console.log('');
}

main();
