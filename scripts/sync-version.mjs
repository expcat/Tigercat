#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const requestedVersion = process.argv[2]
const rootPackagePath = path.join(rootDir, 'package.json')
const rootPackage = readJson(rootPackagePath)
const version = requestedVersion || rootPackage.version

assertSemver(version)

updateJsonVersion(rootPackagePath, version)

for (const packageName of ['core', 'vue', 'react', 'cli']) {
  updateJsonVersion(path.join(rootDir, 'packages', packageName, 'package.json'), version)
}

replaceInFile(path.join(rootDir, 'packages', 'cli', 'src', 'constants.ts'), [
  {
    pattern: /CLI_VERSION = '[^']+'/,
    next: `CLI_VERSION = '${version}'`
  },
  {
    pattern: /tigercat: '\^[^']+'/,
    next: `tigercat: '^${version}'`
  }
])

replaceInFile(path.join(rootDir, 'examples', 'index.html'), [
  {
    pattern: /(<span class="version-badge">)v[^<]+(<\/span>)/,
    next: `$1v${version}$2`
  },
  {
    pattern: /(Tigercat )v[^·<]+( · MIT License)/,
    next: `$1v${version}$2`
  }
])

replaceInFile(path.join(rootDir, 'docs', 'ROADMAP.md'), [
  {
    pattern: /(\| 发布版本 \| )v[^ ]+( 发布准备中\s*\|)/,
    next: `$1v${version}$2`
  },
  {
    pattern: /(- \[ \] )v[^ ]+( 发布执行：)/,
    next: `$1v${version}$2`
  }
])

console.log(`Synchronized Tigercat version to ${version}`)

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

function updateJsonVersion(filePath, version) {
  const json = readJson(filePath)
  if (json.version === version) return
  json.version = version
  writeFileSync(filePath, `${JSON.stringify(json, null, 2)}\n`)
}

function replaceInFile(filePath, replacements) {
  let source = readFileSync(filePath, 'utf-8')

  for (const { pattern, next } of replacements) {
    if (!pattern.test(source)) {
      throw new Error(`Could not find version marker in ${path.relative(rootDir, filePath)}`)
    }

    source = source.replace(pattern, next)
  }

  writeFileSync(filePath, source)
}

function assertSemver(version) {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error(`Invalid version: ${version}`)
  }
}
