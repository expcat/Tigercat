#!/usr/bin/env node

import { existsSync } from 'node:fs'
import { join } from 'node:path'

import { readText as readFileText } from './utils/files.mjs'

const root = join(import.meta.dirname, '..')

const packageFiles = {
  core: 'packages/core/package.json',
  vue: 'packages/vue/package.json',
  react: 'packages/react/package.json',
  cli: 'packages/cli/package.json'
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

function checkSourceVersions(expectedVersion) {
  for (const path of Object.values(sourceVersionFiles)) {
    const content = readText(path)
    const match = content.match(/export const version = ['"]([^'"]+)['"]/)
    check(match, `${path} must export a version constant`)
    if (match) {
      check(
        match[1] === expectedVersion,
        `${path} exports version ${match[1]}, expected ${expectedVersion}`
      )
    }
  }
}

function checkPackageExports(packages) {
  const coreExports = packages.core.exports ?? {}
  const requiredCoreExports = [
    '.',
    './tailwind',
    './tailwind/modern',
    './tokens.css',
    './figma-variables.json'
  ]

  for (const exportName of requiredCoreExports) {
    check(exportName in coreExports, `@expcat/tigercat-core missing export ${exportName}`)
  }

  for (const packageName of ['vue', 'react']) {
    const packageExports = packages[packageName].exports ?? {}
    check('.' in packageExports, `@expcat/tigercat-${packageName} missing root export`)
    check(
      `./*` in packageExports,
      `@expcat/tigercat-${packageName} missing component subpath export`
    )
  }
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

function checkRootScripts() {
  const rootPackage = readJson('package.json')
  const scripts = rootPackage.scripts ?? {}
  const requiredScripts = [
    'release:check',
    'publish:check',
    'quality:quick',
    'quality:size',
    'quality:examples',
    'quality:ssr',
    'quality:release',
    'example:ssr:build',
    'docs:api',
    'smoke:published'
  ]

  for (const scriptName of requiredScripts) {
    check(scriptName in scripts, `root package.json missing script ${scriptName}`)
  }

  const releaseGate = scripts['quality:release'] ?? ''
  const requiredReleaseSteps = [
    'release:check',
    'quality:quick',
    'test:coverage',
    'api:baseline:check',
    'docs:api:check',
    'quality:size',
    'test:validate',
    'quality:examples',
    'quality:ssr'
  ]

  for (const step of requiredReleaseSteps) {
    check(releaseGate.includes(step), `quality:release must include ${step}`)
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
      cliConstants.includes(`CLI_VERSION = '${expectedVersion}'`),
      `${cliConstantsPath} must keep CLI_VERSION aligned with v${expectedVersion}`
    )
    check(
      cliConstants.includes(`tigercat: '^${expectedVersion}'`),
      `${cliConstantsPath} must keep TEMPLATE_VERSIONS.tigercat aligned with v${expectedVersion}`
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
      releaseDoc.includes(`Current v${expectedVersion}`),
      `${releaseDocPath} must document v${expectedVersion}`
    )
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

checkSourceVersions(expectedVersion)
checkPackageExports(packages)
checkPackageRepositoryMetadata(packages)
checkRootScripts()
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
