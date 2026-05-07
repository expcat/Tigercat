#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

import { getPnpmVersion } from './utils/pnpm.mjs'
import { c } from './utils/term.mjs'

function extractMajor(versionRange) {
  const match = String(versionRange).match(/(\d+)/)
  return match ? Number.parseInt(match[1], 10) : 0
}

function parseVersion(version) {
  const match = String(version).match(/(\d+)(?:\.(\d+))?(?:\.(\d+))?/)
  if (!match) return null

  return {
    major: Number.parseInt(match[1] ?? '0', 10),
    minor: Number.parseInt(match[2] ?? '0', 10),
    patch: Number.parseInt(match[3] ?? '0', 10)
  }
}

function compareVersions(current, required) {
  const currentVersion = parseVersion(current)
  const requiredVersion = parseVersion(required)
  if (!currentVersion || !requiredVersion) return -1

  if (currentVersion.major !== requiredVersion.major) {
    return currentVersion.major > requiredVersion.major ? 1 : -1
  }
  if (currentVersion.minor !== requiredVersion.minor) {
    return currentVersion.minor > requiredVersion.minor ? 1 : -1
  }
  if (currentVersion.patch !== requiredVersion.patch) {
    return currentVersion.patch > requiredVersion.patch ? 1 : -1
  }
  return 0
}

function checkVersion(name, current, required) {
  if (!current) {
    console.log(`${c('red', '✗')} ${name} is not installed`)
    return false
  }

  if (compareVersions(current, required) >= 0) {
    console.log(`${c('green', '✓')} ${name}: ${current} (required: >= ${required})`)
    return true
  }

  console.log(`${c('red', '✗')} ${name}: ${current} (required: >= ${required})`)
  return false
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function readCatalogRange(packageName) {
  if (!existsSync('pnpm-workspace.yaml')) return ''

  const content = readFileSync('pnpm-workspace.yaml', 'utf8')
  const escapedName = escapeRegex(packageName)
  const pattern = new RegExp(
    `^[ \\t]*(?:'${escapedName}'|"${escapedName}"|${escapedName}):\\s*([^\\n#]+)`,
    'm'
  )
  const match = content.match(pattern)
  return match?.[1]?.trim().replace(/^['"]|['"]$/g, '') ?? ''
}

function resolveCatalogRange(packageName, value) {
  if (typeof value !== 'string') return ''
  if (value !== 'catalog:') return value
  return readCatalogRange(packageName)
}

function safeReadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function main() {
  console.log('🐯 Tigercat Development Environment Check')
  console.log('==========================================')
  console.log('')

  let hasErrors = false

  console.log('Checking Node.js...')
  const nodeVersion = process.versions.node
  const pkg = safeReadJson('package.json')
  const requiredNode = String(pkg?.engines?.node ?? '>=20.11.0').replace(/^>=\s*/, '')
  if (!checkVersion('Node.js', nodeVersion, requiredNode)) hasErrors = true
  console.log('')

  console.log('Checking pnpm...')
  const pnpmVersion = getPnpmVersion()
  const requiredPnpm = String(pkg?.engines?.pnpm ?? '>=8.0.0').replace(/^>=\s*/, '')
  if (!pnpmVersion) {
    console.log(`${c('red', '✗')} pnpm is not installed`)
    console.log(`${c('yellow', 'ℹ')} Install pnpm: npm install -g pnpm@10.26.2`)
    hasErrors = true
  } else if (!checkVersion('pnpm', pnpmVersion, requiredPnpm)) {
    hasErrors = true
  }
  console.log('')

  console.log('Checking dependencies...')
  if (existsSync('node_modules')) {
    console.log(`${c('green', '✓')} Dependencies are installed`)
  } else {
    console.log(`${c('yellow', '⚠')} Dependencies are not installed`)
    console.log(`${c('yellow', 'ℹ')} Run: pnpm install`)
    hasErrors = true
  }
  console.log('')

  console.log('Checking framework versions...')
  if (existsSync('node_modules')) {
    const reactRange = resolveCatalogRange('react', pkg?.devDependencies?.react ?? '')
    const vueRange = resolveCatalogRange('vue', pkg?.devDependencies?.vue ?? '')

    const require = createRequire(import.meta.url)

    try {
      // Resolve from repo root node_modules
      const reactVersionInstalled = require('react/package.json').version
      const reactRequiredMajor = extractMajor(reactRange)
      if (!checkVersion('react', reactVersionInstalled, `${reactRequiredMajor || 0}.0.0`)) {
        console.log(`${c('yellow', 'ℹ')} Declared range: ${reactRange}`)
        hasErrors = true
      } else {
        console.log(`${c('yellow', 'ℹ')} Declared range: ${reactRange}`)
      }
    } catch {
      console.log(`${c('red', '✗')} react is not installed`)
      console.log(`${c('yellow', 'ℹ')} Declared range: ${reactRange}`)
      hasErrors = true
    }

    try {
      const vueVersionInstalled = require('vue/package.json').version
      const vueRequiredMajor = extractMajor(vueRange)
      if (!checkVersion('vue', vueVersionInstalled, `${vueRequiredMajor || 0}.0.0`)) {
        console.log(`${c('yellow', 'ℹ')} Declared range: ${vueRange}`)
        hasErrors = true
      } else {
        console.log(`${c('yellow', 'ℹ')} Declared range: ${vueRange}`)
      }
    } catch {
      console.log(`${c('red', '✗')} vue is not installed`)
      console.log(`${c('yellow', 'ℹ')} Declared range: ${vueRange}`)
      hasErrors = true
    }
  } else {
    console.log(
      `${c('yellow', '⚠')} Dependencies are not installed; skipping React/Vue version check`
    )
  }
  console.log('')

  console.log('Checking build artifacts...')
  const built =
    existsSync('packages/core/dist/index.js') &&
    existsSync('packages/vue/dist/index.js') &&
    existsSync('packages/react/dist/index.js')

  if (built) {
    console.log(`${c('green', '✓')} All packages are built`)
  } else {
    console.log(`${c('yellow', '⚠')} Some packages are not built`)
    console.log(`${c('yellow', 'ℹ')} Run: pnpm build`)
    hasErrors = true
  }
  console.log('')

  console.log('==========================================')
  if (!hasErrors) {
    console.log(`${c('green', '✓')} Environment check passed! You're ready to develop.`)
    console.log('')
    console.log('Quick start commands:')
    console.log('  pnpm test              # Run all tests')
    console.log('  pnpm example:vue       # Run Vue3 example')
    console.log('  pnpm example:react     # Run React example')
    console.log('  pnpm dev               # Watch mode for all packages')
    process.exit(0)
  } else {
    console.log(`${c('red', '✗')} Environment check failed. Please install missing dependencies.`)
    process.exit(1)
  }
}

main()
