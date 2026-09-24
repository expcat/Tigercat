#!/usr/bin/env node

import { cpSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))
const dest = join(repoRoot, 'packages', 'mcp', 'snapshot')

rmSync(dest, { recursive: true, force: true })
mkdirSync(dest, { recursive: true })
cpSync(join(repoRoot, 'context7.json'), join(dest, 'context7.json'))
cpSync(join(repoRoot, 'skills'), join(dest, 'skills'), { recursive: true })

const result = spawnSync(process.execPath, [join(repoRoot, 'scripts', 'write-mcp-manifest.mjs'), dest], {
  stdio: 'inherit'
})
process.exit(result.status ?? 1)
