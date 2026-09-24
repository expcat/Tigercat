#!/usr/bin/env node

import { rmSync } from 'node:fs'
import { isAbsolute, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))

const ALLOWED_DIRECTORIES = new Set(
  [
    'node_modules',
    'coverage',
    'packages/core/dist',
    'packages/vue/dist',
    'packages/react/dist',
    'packages/cli/dist',
    'packages/mcp/dist',
    'examples/nextjs/.next',
    'examples/nuxt/.output',
    'examples/nuxt/.nuxt'
  ].map((relativePath) => resolve(repoRoot, relativePath))
)

const paths = process.argv.slice(2)

if (paths.length === 0) {
  console.error('Usage: node ./scripts/rimraf.mjs <path> [path...]')
  process.exit(1)
}

for (const inputPath of paths) {
  if (isAbsolute(inputPath) || inputPath.split(/[\\/]/).includes('..')) {
    console.error(`Refusing to delete path outside the build-directory allowlist: ${inputPath}`)
    process.exit(1)
  }

  const absolutePath = resolve(process.cwd(), inputPath)
  if (!ALLOWED_DIRECTORIES.has(absolutePath)) {
    console.error(`Refusing to delete path outside the build-directory allowlist: ${inputPath}`)
    process.exit(1)
  }
}

for (const inputPath of paths) {
  rmSync(resolve(process.cwd(), inputPath), { recursive: true, force: true })
}
