#!/usr/bin/env node

import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { readText as readFileText } from './utils/files.mjs'

const root = join(import.meta.dirname, '..')

const packageFiles = {
  core: 'packages/core/package.json',
  vue: 'packages/vue/package.json',
  react: 'packages/react/package.json',
  cli: 'packages/cli/package.json',
  mcp: 'packages/mcp/package.json'
}

const expectedRepositoryUrl = 'https://github.com/expcat/Tigercat'
const errors = []

function readText(path) {
  return readFileText(join(root, path))
}

function readJson(path) {
  return JSON.parse(readText(path))
}

function check(condition, message) {
  if (!condition) errors.push(message)
}

function checkPackageVersions(packages) {
  const versions = new Set(Object.values(packages).map((pkg) => pkg.version))
  check(versions.size === 1, `package versions are not aligned: ${[...versions].join(', ')}`)
  return [...versions][0]
}

function checkFrameworkSideEffects(packages) {
  for (const packageName of ['vue', 'react']) {
    const sideEffects = packages[packageName].sideEffects
    check(
      sideEffects === false,
      `@expcat/tigercat-${packageName} sideEffects must be false for tree-shaking`
    )
  }
}

function checkEsmOnlyPackageSurface(packages) {
  for (const [packageName, packageInfo] of Object.entries(packages)) {
    const surface = {
      main: packageInfo.main,
      module: packageInfo.module,
      exports: packageInfo.exports
    }
    const issues = collectNonEsmSurfaceIssues(surface)

    for (const issue of issues) {
      check(false, `@expcat/tigercat-${packageName} must be ESM-only: ${issue}`)
    }
  }
}

function collectNonEsmSurfaceIssues(value, path = 'package') {
  if (typeof value === 'string') {
    return value.endsWith('.cjs') ? [`${path} points to ${value}`] : []
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return []
  }

  const issues = []
  for (const [key, nestedValue] of Object.entries(value)) {
    const nextPath = `${path}.${key}`
    if (key === 'require') {
      issues.push(`${nextPath} is a require condition`)
    }
    issues.push(...collectNonEsmSurfaceIssues(nestedValue, nextPath))
  }

  return issues
}

function checkPackageRepositoryMetadata(packages) {
  const rootPackage = readJson('package.json')
  const packagesWithRoot = { root: rootPackage, ...packages }

  for (const [packageName, packageInfo] of Object.entries(packagesWithRoot)) {
    check(
      packageInfo.repository?.url === expectedRepositoryUrl,
      `${packageName} package.json repository.url must be ${expectedRepositoryUrl}`
    )
  }
}

function checkRootVersion(expectedVersion) {
  const rootPackage = readJson('package.json')
  check(
    rootPackage.version === expectedVersion,
    `root package.json version ${rootPackage.version}, expected ${expectedVersion}`
  )
}

function checkChangesetConfig(packages) {
  const config = readJson('.changeset/config.json')
  const fixedGroups = config.fixed ?? []
  const fixedPackages = new Set(fixedGroups.flat())

  for (const packageInfo of Object.values(packages)) {
    check(
      fixedPackages.has(packageInfo.name),
      `.changeset/config.json fixed group missing ${packageInfo.name}`
    )
  }
}

function checkReleaseDocs(expectedVersion) {
  for (const path of ['CHANGELOG.md', 'docs/MIGRATION.md']) {
    if (!existsSync(join(root, path))) {
      check(false, `${path} is missing`)
      continue
    }
    check(
      readText(path).includes(`## v${expectedVersion}`),
      `${path} must include v${expectedVersion}`
    )
  }
}

const packages = Object.fromEntries(
  Object.entries(packageFiles).map(([name, path]) => [name, readJson(path)])
)
const expectedVersion = checkPackageVersions(packages)

checkFrameworkSideEffects(packages)
checkEsmOnlyPackageSurface(packages)
checkPackageRepositoryMetadata(packages)
checkRootVersion(expectedVersion)
checkChangesetConfig(packages)
checkReleaseDocs(expectedVersion)

if (errors.length > 0) {
  console.error('Release readiness check failed:')
  for (const error of errors) {
    console.error(`- ${error}`)
  }
  process.exit(1)
}

console.log(
  `Release readiness check passed for ${Object.keys(packages).join(', ')} at ${expectedVersion}.`
)
