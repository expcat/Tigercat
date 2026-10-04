#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import ts from 'typescript'

import { getComponentTestGroupFiles } from './lib/component-test-groups.mjs'
import { collectFiles } from './utils/files.mjs'

function readOption(args, name) {
  const index = args.indexOf(name)
  if (index === -1) return null
  const value = args[index + 1]
  if (!value || value.startsWith('--')) throw new Error(`${name} requires a value.`)
  return value
}

function collectValidationFiles() {
  const args = process.argv.slice(2)
  const group = readOption(args, '--group') || process.env.TEST_GROUP
  if (group) {
    return getComponentTestGroupFiles({
      group,
      framework: readOption(args, '--framework') || process.env.TEST_FRAMEWORK || 'all',
      filter: readOption(args, '--filter') || process.env.TEST_FILTER
    })
  }
  const directories = process.env.TEST_DIRS?.split(/\s+/).filter(Boolean) ?? ['tests']
  return directories
    .flatMap((dir) => collectFiles(dir, ['.js', '.ts', '.tsx']))
    .filter((file) => /\.(test|spec)\.(js|ts|tsx)$/.test(file))
}

function callPath(node) {
  if (ts.isCallExpression(node)) return callPath(node.expression)
  if (ts.isPropertyAccessExpression(node)) return [...callPath(node.expression), node.name.text]
  return ts.isIdentifier(node) ? [node.text] : []
}

function validateFile(file) {
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
  const errors = new Set()
  let hasTests = false

  function visit(node) {
    if (node.kind === ts.SyntaxKind.AnyKeyword) errors.add('Found any type usage')
    if (ts.isCallExpression(node)) {
      const [root, ...modifiers] = callPath(node.expression)
      if (root === 'it' || root === 'test') hasTests = true
      if (['describe', 'it', 'test'].includes(root) && modifiers.includes('only')) {
        errors.add('Focused test detected (.only)')
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  if (!hasTests) errors.add('No test declarations found')
  return [...errors]
}

try {
  const files = collectValidationFiles()
  if (files.length === 0) throw new Error('No test files found. Check TEST_DIRS or --group.')
  let failedFiles = 0
  for (const file of files) {
    const errors = validateFile(file)
    if (errors.length === 0) continue
    failedFiles++
    console.error(`${file}: ${errors.join('; ')}`)
  }
  console.log(`Test source checks: ${files.length} files, ${failedFiles} failed.`)
  process.exitCode = failedFiles > 0 ? 1 : 0
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
