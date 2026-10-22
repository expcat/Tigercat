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

const sourceVersionFiles = {
  core: 'packages/core/src/index.ts',
  vue: 'packages/vue/src/index.ts',
  react: 'packages/react/src/index.tsx'
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

function checkSourceVersions() {
  for (const path of Object.values(sourceVersionFiles)) {
    const content = readText(path)
    check(
      !/export const version = ['"]/.test(content),
      `${path} must not export a version constant; version lives in package.json`
    )
  }
}

function checkFrameworkSideEffects(packages) {
  for (const packageName of ['vue', 'react']) {
    const sideEffects = packages[packageName].sideEffects
    check(
      sideEffects === false,
      `@expcat/tigercat-${packageName} sideEffects must be false for tree-shaking`
    )

    const sideEffectEntries = Array.isArray(sideEffects) ? sideEffects : []
    for (const entry of sideEffectEntries) {
      check(
        !entry.includes('dist/chunk-*') && !entry.includes('dist/components/*'),
        `@expcat/tigercat-${packageName} must not use broad sideEffects entry ${entry}`
      )
    }
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

function checkPublishWorkflows() {
  const manualPublishWorkflow = readText('.github/workflows/publish.yml')
  const tagPublishWorkflow = readText('.github/workflows/publish-on-tag.yml')

  check(
    !manualPublishWorkflow.includes('pnpm quality:release'),
    '.github/workflows/publish.yml must not run pnpm quality:release; run the release gate locally before publishing'
  )
  check(
    !manualPublishWorkflow.includes('--no-git-checks'),
    '.github/workflows/publish.yml must not publish with --no-git-checks'
  )
  check(
    !tagPublishWorkflow.includes('--no-git-checks'),
    '.github/workflows/publish-on-tag.yml must not publish with --no-git-checks'
  )
  check(
    !tagPublishWorkflow.includes('continue-on-error'),
    '.github/workflows/publish-on-tag.yml must fail when an artifact download fails'
  )
  check(
    !tagPublishWorkflow.includes('${{ inputs.tag }}'),
    '.github/workflows/publish-on-tag.yml must not interpolate a tag into the shell script'
  )
  check(
    !/(^|\n)\s+(push|pull_request|schedule|workflow_run):/.test(manualPublishWorkflow),
    '.github/workflows/publish.yml must stay workflow_dispatch-only'
  )
  check(
    !tagPublishWorkflow.includes('pnpm quality:release'),
    '.github/workflows/publish-on-tag.yml must not run pnpm quality:release; run the release gate locally before pushing a release tag'
  )
  check(
    !/(^|\n)\s+(pull_request|schedule):/.test(tagPublishWorkflow),
    '.github/workflows/publish-on-tag.yml must not add pull_request or schedule triggers'
  )
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
  const requiredDocs = [
    'CHANGELOG.md',
    'docs/MIGRATION.md',
    'skills/tigercat/references/release.md',
    'skills/tigercat/references/ssr.md',
    'skills/tigercat/references/theme.md',
    'skills/tigercat/references/tokens.md'
  ]

  for (const docPath of requiredDocs) {
    check(existsSync(join(root, docPath)), `${docPath} is missing`)
  }

  if (existsSync(join(root, 'docs/MIGRATION.md'))) {
    const migration = readText('docs/MIGRATION.md')
    check(
      migration.includes(`## v${expectedVersion}`),
      `docs/MIGRATION.md must include v${expectedVersion}`
    )
  }

  if (existsSync(join(root, 'CHANGELOG.md'))) {
    const changelog = readText('CHANGELOG.md')
    check(
      changelog.includes(`## v${expectedVersion}`),
      `CHANGELOG.md must include v${expectedVersion}`
    )
  }

  const exampleIndexPath = 'examples/index.html'
  if (existsSync(join(root, exampleIndexPath))) {
    const exampleIndex = readText(exampleIndexPath)
    check(
      exampleIndex.includes(`<span class="version-badge">v${expectedVersion}</span>`),
      `${exampleIndexPath} must display v${expectedVersion} in the header`
    )
    check(
      exampleIndex.includes(`Tigercat v${expectedVersion} · MIT License`),
      `${exampleIndexPath} footer must display v${expectedVersion}`
    )
  }

  const cliConstantsPath = 'packages/cli/src/constants.ts'
  if (existsSync(join(root, cliConstantsPath))) {
    const cliConstants = readText(cliConstantsPath)
    check(
      cliConstants.includes('readCliPackageVersion'),
      `${cliConstantsPath} must read CLI_VERSION from package.json`
    )
    check(
      cliConstants.includes('tigercat: `^${CLI_VERSION}`'),
      `${cliConstantsPath} must pin template tigercat packages to CLI_VERSION`
    )
  }

  const roadmapPath = 'docs/ROADMAP.md'
  check(existsSync(join(root, roadmapPath)), `${roadmapPath} is missing`)
  if (existsSync(join(root, roadmapPath))) {
    const roadmap = readText(roadmapPath)
    check(
      roadmap.includes('type: active-roadmap'),
      `${roadmapPath} must declare the active implementation roadmap marker`
    )
  }

  const releaseDocPath = 'skills/tigercat/references/release.md'
  if (existsSync(join(root, releaseDocPath))) {
    const releaseDoc = readText(releaseDocPath)
    check(releaseDoc.includes('Release Candidate'), `${releaseDocPath} must document RC flow`)
    check(
      releaseDoc.includes('pnpm quality:release'),
      `${releaseDocPath} must document release gate`
    )
  }
}

const packages = Object.fromEntries(
  Object.entries(packageFiles).map(([name, path]) => [name, readJson(path)])
)
const expectedVersion = checkPackageVersions(packages)

checkSourceVersions()
checkFrameworkSideEffects(packages)
checkEsmOnlyPackageSurface(packages)
checkPackageRepositoryMetadata(packages)
checkPublishWorkflows()
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
