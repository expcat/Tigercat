#!/usr/bin/env node

import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const dest = resolve(process.argv[2] ?? '')

if (!process.argv[2]) {
  console.error('Usage: node ./scripts/write-mcp-manifest.mjs <mcp-directory>')
  process.exit(1)
}

const version = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8')).version
const files = {}

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'manifest.json' || entry.name === 'version.json') continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full)
      continue
    }
    if (!entry.isFile()) continue
    const rel = relative(dest, full).split('\\').join('/')
    files[rel] = createHash('sha256').update(readFileSync(full)).digest('hex')
  }
}

walk(dest)

const ordered = Object.fromEntries(Object.keys(files).sort().map((key) => [key, files[key]]))
writeFileSync(
  join(dest, 'version.json'),
  `${JSON.stringify(
    { version, commit: process.env.GITHUB_SHA ?? '', algorithm: 'sha256', files: ordered },
    null,
    2
  )}\n`
)
writeFileSync(
  join(dest, 'manifest.json'),
  `${JSON.stringify({ version, algorithm: 'sha256', files: ordered }, null, 2)}\n`
)
console.log(`Wrote skill manifest for ${version} (${Object.keys(ordered).length} files)`)
