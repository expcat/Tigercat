#!/usr/bin/env node

import { spawnSync } from 'node:child_process'

import { PNPM_SHELL } from './utils/pnpm.mjs'
import {
  TEST_GROUPS,
  assertComponentTestGroupFiles,
  getComponentTestGroupFiles
} from './lib/component-test-groups.mjs'

function readOption(args, name) {
  const index = args.indexOf(name)
  if (index === -1) return null
  const value = args[index + 1]
  if (!value || value.startsWith('--')) {
    throw new Error(`${name} requires a value.`)
  }
  return value
}

function hasFlag(args, name) {
  return args.includes(name)
}

function printUsage() {
  console.log('Usage: pnpm test:group -- --group <name> [--framework react|vue|all] [--list]')
  console.log('')
  console.log(`Groups: ${TEST_GROUPS.join(', ')}`)
  console.log('')
  console.log('Examples:')
  console.log('  pnpm test:group -- --group form --list')
  console.log('  pnpm test:group:feedback')
  console.log('  pnpm test:group:form -- --framework react --filter primitives')
}

function main() {
  const args = process.argv.slice(2)

  if (hasFlag(args, '--help') || hasFlag(args, '-h')) {
    printUsage()
    process.exit(0)
  }

  const group = readOption(args, '--group') || process.env.TEST_GROUP
  const framework = readOption(args, '--framework') || process.env.TEST_FRAMEWORK || 'all'
  const filter = readOption(args, '--filter') || process.env.TEST_FILTER
  const listOnly = hasFlag(args, '--list')

  if (!group) {
    printUsage()
    process.exit(1)
  }

  const options = { group, framework, filter }
  const files = listOnly
    ? getComponentTestGroupFiles(options)
    : assertComponentTestGroupFiles(options)

  if (listOnly) {
    if (files.length === 0) {
      console.log(`No test files found for group "${group}".`)
      process.exit(1)
    }
    console.log(files.join('\n'))
    process.exit(0)
  }

  console.log(`Running ${files.length} ${group} test file(s)...`)
  const result = spawnSync('corepack', ['pnpm', 'vitest', 'run', ...files], {
    shell: PNPM_SHELL,
    stdio: 'inherit'
  })
  process.exit(result.status ?? 1)
}

try {
  main()
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
