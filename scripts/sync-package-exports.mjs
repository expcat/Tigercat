#!/usr/bin/env node

import { existsSync } from 'node:fs'
import { join } from 'node:path'

import {
  REQUIRED_CORE_PACKAGE_EXPORTS,
  buildFrameworkPackageExports,
  getComponentPackageTarget,
  loadPublicComponentExports
} from './lib/public-components.mjs'
import { readJson, writeJson } from './utils/files.mjs'

const root = join(import.meta.dirname, '..')
const checkMode = process.argv.includes('--check')
const frameworkPackages = {
  react: {
    packagePath: 'packages/react/package.json',
    componentDir: 'packages/react/src/components',
    extension: '.tsx'
  },
  vue: {
    packagePath: 'packages/vue/package.json',
    componentDir: 'packages/vue/src/components',
    extension: '.ts'
  }
}

const issues = []

function addIssue(message) {
  issues.push(message)
}

function stringify(value) {
  return JSON.stringify(value, null, 2)
}

function assertSameExports(packageName, actual, expected) {
  if (stringify(actual) === stringify(expected)) return

  const actualKeys = new Set(Object.keys(actual ?? {}))
  const expectedKeys = new Set(Object.keys(expected))
  const missing = [...expectedKeys].filter((key) => !actualKeys.has(key))
  const extra = [...actualKeys].filter((key) => !expectedKeys.has(key))
  const changed = [...expectedKeys].filter(
    (key) => actualKeys.has(key) && stringify(actual[key]) !== stringify(expected[key])
  )

  if (missing.length > 0) {
    addIssue(`${packageName} missing exports: ${missing.join(', ')}`)
  }
  if (extra.length > 0) {
    addIssue(`${packageName} has unexpected exports: ${extra.join(', ')}`)
  }
  if (changed.length > 0) {
    addIssue(`${packageName} has drifted export targets: ${changed.join(', ')}`)
  }
}

function assertComponentTargetsExist(framework, components, info) {
  for (const component of components) {
    const target = getComponentPackageTarget(component)
    const sourcePath = join(root, info.componentDir, `${target}${info.extension}`)
    if (!existsSync(sourcePath)) {
      addIssue(`${framework} export ${component} points to missing source component ${target}`)
    }
  }
}

function syncFrameworkPackage(framework, components, info) {
  const packagePath = join(root, info.packagePath)
  const packageJson = readJson(packagePath)
  const expectedExports = buildFrameworkPackageExports(components)

  assertComponentTargetsExist(framework, components, info)

  if (checkMode) {
    assertSameExports(`@expcat/tigercat-${framework}`, packageJson.exports ?? {}, expectedExports)
    return
  }

  packageJson.exports = expectedExports
  writeJson(packagePath, packageJson)
}

function checkCorePackageExports() {
  const packageJson = readJson(join(root, 'packages/core/package.json'))
  const packageExports = packageJson.exports ?? {}

  for (const exportName of REQUIRED_CORE_PACKAGE_EXPORTS) {
    if (!(exportName in packageExports)) {
      addIssue(`@expcat/tigercat-core missing required export ${exportName}`)
    }
  }
}

const publicComponents = loadPublicComponentExports(root)

for (const [framework, info] of Object.entries(frameworkPackages)) {
  syncFrameworkPackage(framework, publicComponents[framework], info)
}
checkCorePackageExports()

if (issues.length > 0) {
  console.error('Package exports check failed:')
  for (const issue of issues) {
    console.error(`- ${issue}`)
  }
  process.exit(1)
}

console.log(
  checkMode
    ? 'Package exports are in sync with public component facts.'
    : 'Package exports synced from public component facts.'
)
