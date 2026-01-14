#!/usr/bin/env node

import { rmSync } from 'node:fs';
import { resolve } from 'node:path';

const paths = process.argv.slice(2);

if (paths.length === 0) {
  console.error('Usage: node ./scripts/rimraf.mjs <path> [path...]');
  process.exit(1);
}

for (const inputPath of paths) {
  const absolutePath = resolve(process.cwd(), inputPath);
  rmSync(absolutePath, { recursive: true, force: true });
}
