#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const rootDir = process.cwd()
const argv = process.argv.slice(2)
const publishedOnly = argv.includes('--published')
const version = getRootVersion(rootDir)
const tempDir = mkdtempSync(path.join(tmpdir(), 'tigercat-publish-check-'))
const tarballsDir = path.join(tempDir, 'tarballs')
const examplesDir = path.join(tempDir, 'examples')
const npmEnvSuffixesToStrip = new Set([
  'catalog',
  'npm-globalconfig',
  'verify-deps-before-run',
  '-jsr-registry'
])

process.noDeprecation = true

const publishablePackages = [
  { name: '@expcat/tigercat-core', dir: path.join(rootDir, 'packages', 'core') },
  { name: '@expcat/tigercat-vue', dir: path.join(rootDir, 'packages', 'vue') },
  { name: '@expcat/tigercat-react', dir: path.join(rootDir, 'packages', 'react') },
  { name: '@expcat/tigercat-cli', dir: path.join(rootDir, 'packages', 'cli') }
]

const exampleProjects = [
  {
    name: 'vue3 example',
    dir: path.join(examplesDir, 'example', 'vue3'),
    buildArgs: ['run', 'build'],
    prepare: prepareVueExample
  },
  {
    name: 'react example',
    dir: path.join(examplesDir, 'example', 'react'),
    buildArgs: ['run', 'build'],
    prepare: prepareReactExample
  },
  {
    name: 'nuxt example',
    dir: path.join(examplesDir, 'nuxt'),
    buildArgs: ['run', 'build'],
    prepare: prepareStandardExample
  },
  {
    name: 'nextjs example',
    dir: path.join(examplesDir, 'nextjs'),
    buildArgs: ['run', 'build'],
    prepare: prepareStandardExample
  }
]

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})

async function main() {
  if (publishedOnly) {
    const tag = version ? `@${version}` : '@latest'
    await runPublishedPackageSmoke({
      rootDir,
      version,
      label: `Tigercat ${tag}`,
      installTargets: [
        `@expcat/tigercat-core${tag}`,
        `@expcat/tigercat-vue${tag}`,
        `@expcat/tigercat-react${tag}`,
        `@expcat/tigercat-cli${tag}`
      ]
    })
    return
  }

  try {
    console.log(`Running local publish check for Tigercat v${version}`)

    console.log('')
    console.log('1/4 Building publishable packages...')
    runOrThrow('pnpm', ['build'], { cwd: rootDir })

    console.log('')
    console.log('2/4 Packing local tarballs...')
    mkdirSync(tarballsDir, { recursive: true })
    const tarballs = Object.fromEntries(
      publishablePackages.map((pkg) => [pkg.name, packPackage(pkg.dir, tarballsDir)])
    )

    console.log('')
    console.log('3/4 Verifying published package tarballs...')
    await runPublishedPackageSmoke({
      rootDir,
      version,
      label: `local Tigercat tarballs v${version}`,
      installTargets: [
        tarballs['@expcat/tigercat-core'],
        tarballs['@expcat/tigercat-vue'],
        tarballs['@expcat/tigercat-react'],
        tarballs['@expcat/tigercat-cli']
      ]
    })

    console.log('')
    console.log('4/4 Verifying examples against local tarballs...')
    smokeExamples(tarballs)

    console.log('')
    console.log('Local publish check passed.')
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
}

function packPackage(packageDir, destinationDir) {
  const result = spawnSync('pnpm', ['pack', '--pack-destination', destinationDir], {
    cwd: packageDir,
    encoding: 'utf8',
    shell: process.platform === 'win32',
    env: createCommandEnv('pnpm')
  })

  if (result.status !== 0) {
    throw new Error(result.stderr || `pnpm pack failed in ${packageDir}`)
  }

  const tarballName = String(result.stdout)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .at(-1)

  if (!tarballName) {
    throw new Error(`Could not determine tarball name for ${packageDir}`)
  }

  const tarballPath = path.isAbsolute(tarballName)
    ? tarballName
    : path.join(destinationDir, tarballName)
  if (!existsSync(tarballPath)) {
    throw new Error(`Packed tarball missing: ${tarballPath}`)
  }

  return tarballPath
}

function smokeExamples(tarballs) {
  copyExampleFixtures()

  for (const example of exampleProjects) {
    console.log(`Building ${example.name}...`)
    example.prepare(example.dir, tarballs)
    installWithRetry(['install', '--no-audit', '--fund=false'], example.dir)
    runOrThrow('npm', example.buildArgs, { cwd: example.dir })
  }
}

function copyExampleFixtures() {
  copyDir(
    path.join(rootDir, 'examples', 'example', 'shared'),
    path.join(examplesDir, 'example', 'shared')
  )
  copyDir(
    path.join(rootDir, 'examples', 'example', 'vue3'),
    path.join(examplesDir, 'example', 'vue3')
  )
  copyDir(
    path.join(rootDir, 'examples', 'example', 'react'),
    path.join(examplesDir, 'example', 'react')
  )
  copyDir(path.join(rootDir, 'examples', 'nuxt'), path.join(examplesDir, 'nuxt'))
  copyDir(path.join(rootDir, 'examples', 'nextjs'), path.join(examplesDir, 'nextjs'))
}

function copyDir(sourceDir, destinationDir) {
  cpSync(sourceDir, destinationDir, {
    recursive: true,
    filter: (sourcePath) => {
      const name = path.basename(sourcePath)
      return !['node_modules', 'dist', '.nuxt', '.next'].includes(name)
    }
  })
}

function prepareVueExample(exampleDir, tarballs) {
  prepareStandardExample(exampleDir, tarballs)
  embedSharedFixture(exampleDir)
  rewriteViteExampleConfig(path.join(exampleDir, 'vite.config.ts'))
  rewriteTsconfig(path.join(exampleDir, 'tsconfig.json'))
  rewriteTailwindEntry(path.join(exampleDir, 'src', 'style.css'), '@expcat/tigercat-vue')
}

function prepareReactExample(exampleDir, tarballs) {
  prepareStandardExample(exampleDir, tarballs)
  embedSharedFixture(exampleDir)
  rewriteViteExampleConfig(path.join(exampleDir, 'vite.config.ts'))
  rewriteTsconfig(path.join(exampleDir, 'tsconfig.json'))
  rewriteTailwindEntry(path.join(exampleDir, 'src', 'index.css'), '@expcat/tigercat-react')
}

function embedSharedFixture(exampleDir) {
  copyDir(path.join(examplesDir, 'example', 'shared'), path.join(exampleDir, '.publish-shared'))
}

function prepareStandardExample(exampleDir, tarballs) {
  const packageJsonPath = path.join(exampleDir, 'package.json')
  const packageJson = readJson(packageJsonPath)

  for (const sectionName of ['dependencies', 'devDependencies']) {
    const section = packageJson[sectionName]
    if (!section) continue

    for (const [dependencyName, dependencyVersion] of Object.entries(section)) {
      if (dependencyVersion === 'catalog:') {
        section[dependencyName] = readWorkspaceCatalogValue(rootDir, dependencyName)
        continue
      }

      if (dependencyVersion === 'workspace:*') {
        const tarballPath = tarballs[dependencyName]
        if (!tarballPath) {
          throw new Error(`Missing tarball mapping for ${dependencyName}`)
        }

        section[dependencyName] = `file:${toPortablePath(path.relative(exampleDir, tarballPath))}`
      }
    }
  }

  if (needsNodeTypes(exampleDir)) {
    packageJson.devDependencies ??= {}
    packageJson.devDependencies['@types/node'] ??= readWorkspaceCatalogValue(rootDir, '@types/node')
  }

  const coreTarballPath = tarballs['@expcat/tigercat-core']
  if (
    coreTarballPath &&
    !packageJson.dependencies?.['@expcat/tigercat-core'] &&
    !packageJson.devDependencies?.['@expcat/tigercat-core']
  ) {
    packageJson.devDependencies ??= {}
    packageJson.devDependencies['@expcat/tigercat-core'] = `file:${toPortablePath(
      path.relative(exampleDir, coreTarballPath)
    )}`
  }

  if (
    (packageJson.dependencies?.['@expcat/tigercat-core'] ||
      packageJson.devDependencies?.['@expcat/tigercat-core']) &&
    !packageJson.dependencies?.tailwindcss &&
    !packageJson.devDependencies?.tailwindcss
  ) {
    packageJson.devDependencies ??= {}
    packageJson.devDependencies.tailwindcss = readWorkspaceCatalogValue(rootDir, 'tailwindcss')
  }

  writeJson(packageJsonPath, packageJson)
}

function rewriteViteExampleConfig(filePath) {
  const source = readFileSync(filePath, 'utf-8')
  const withAlias = source.replace(
    /resolve:\s*\{\s*alias:\s*\{[\s\S]*?\}\s*\},/m,
    `resolve: {\n    alias: {\n      '@demo-shared': path.resolve(__dirname, './.publish-shared')\n    }\n  },`
  )

  const next = withAlias.replace(/chunkSizeWarningLimit:\s*\d+/, 'chunkSizeWarningLimit: 1024')

  if (withAlias === source) {
    throw new Error(`Could not rewrite Vite aliases in ${filePath}`)
  }

  writeFileSync(filePath, next)
}

function rewriteTsconfig(filePath) {
  const tsconfig = readJsonc(filePath)
  const paths = tsconfig.compilerOptions?.paths

  if (!paths) return

  if (paths['@demo-shared/*']) {
    paths['@demo-shared/*'] = ['./.publish-shared/*']
  }

  for (const key of Object.keys(paths)) {
    if (key.startsWith('@expcat/tigercat-')) {
      delete paths[key]
    }
  }

  if (Array.isArray(tsconfig.include)) {
    tsconfig.include = tsconfig.include.map((value) =>
      value === '../shared' || value === '../shared/**/*.ts' ? './.publish-shared/**/*.ts' : value
    )
  }

  writeJson(filePath, tsconfig)
}

function rewriteTailwindEntry(filePath, frameworkPackageName) {
  const source = readFileSync(filePath, 'utf-8')
  const next = source
    .replace(
      '@plugin "../../../../packages/core/src/tailwind-plugin.ts";',
      '@plugin "@expcat/tigercat-core/tailwind/modern";'
    )
    .replace(
      '@source "../../../../packages/vue/src";',
      `@source "../node_modules/${frameworkPackageName}/dist/**/*.{js,mjs}";`
    )
    .replace(
      '@source "../../../../packages/react/src";',
      `@source "../node_modules/${frameworkPackageName}/dist/**/*.{js,mjs}";`
    )
    .replace(
      '@source "../../../../packages/core/src";',
      '@source "../node_modules/@expcat/tigercat-core/dist/**/*.{js,mjs}";'
    )

  if (next === source) {
    throw new Error(`Could not rewrite Tailwind entry in ${filePath}`)
  }

  writeFileSync(filePath, next)
}

function needsNodeTypes(exampleDir) {
  const tsconfigPath = path.join(exampleDir, 'tsconfig.json')
  if (!existsSync(tsconfigPath)) return false

  const tsconfig = readJsonc(tsconfigPath)
  return tsconfig.compilerOptions?.types?.includes('node') === true
}

function runOrThrow(command, args, options) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: createCommandEnv(command, options?.env),
    ...options
  })

  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(' ')} failed${options?.cwd ? ` in ${options.cwd}` : ''}`
    )
  }
}

function getRootVersion(rootDir = process.cwd()) {
  const packagePath = path.join(rootDir, 'package.json')
  if (!existsSync(packagePath)) {
    throw new Error('Could not find root package.json')
  }

  return JSON.parse(readFileSync(packagePath, 'utf-8')).version
}

function readWorkspaceCatalogValue(rootDir, packageName) {
  const workspacePath = path.join(rootDir, 'pnpm-workspace.yaml')
  if (!existsSync(workspacePath)) {
    throw new Error('Could not find pnpm-workspace.yaml')
  }

  const source = readFileSync(workspacePath, 'utf-8')
  const escapedName = packageName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = new RegExp(`^\\s*['\"]?${escapedName}['\"]?:\\s*(\\S+)`, 'm').exec(source)

  if (!match) {
    throw new Error(`Could not resolve catalog version for ${packageName}`)
  }

  return match[1].replace(/^['\"]|['\"]$/g, '')
}

function installWithRetry(args, cwd, waitMs = 3000) {
  const attempts = 3
  const effectiveArgs = args.some((arg) => arg.startsWith('--loglevel='))
    ? args
    : [...args, '--loglevel=error']

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const result = spawnSync('npm', effectiveArgs, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: createCommandEnv('npm')
    })

    if (result.status === 0) {
      return
    }

    if (attempt === attempts) {
      throw new Error(`npm ${args[0]} failed in ${cwd}`)
    }

    console.log(`npm ${args[0]} failed; retrying (${attempt + 1}/${attempts})...`)
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, waitMs)
  }
}

async function runPublishedPackageSmoke({
  rootDir = process.cwd(),
  version,
  label,
  installTargets
}) {
  const effectiveVersion = version || getRootVersion(rootDir)
  const tempDir = mkdtempSync(path.join(tmpdir(), 'tigercat-published-smoke-'))

  try {
    console.log(`Running published package smoke test for ${label}`)
    writeFileSync(
      path.join(tempDir, 'package.json'),
      JSON.stringify({ private: true, type: 'module' }, null, 2)
    )

    installWithRetry(
      [
        'install',
        '--no-audit',
        '--fund=false',
        ...installTargets,
        `vue@${readWorkspaceCatalogValue(rootDir, 'vue')}`,
        `@vue/server-renderer@${readWorkspaceCatalogValue(rootDir, '@vue/server-renderer')}`,
        `react@${readWorkspaceCatalogValue(rootDir, 'react')}`,
        `react-dom@${readWorkspaceCatalogValue(rootDir, 'react-dom')}`,
        `tailwindcss@${readWorkspaceCatalogValue(rootDir, 'tailwindcss')}`
      ],
      tempDir,
      5000
    )

    await verifyInstalledPackages(tempDir, effectiveVersion)
    console.log('Published package smoke test passed.')
  } finally {
    rmSync(tempDir, { recursive: true, force: true })
  }
}

async function verifyInstalledPackages(tempDir, version) {
  const requireFromTemp = createRequire(path.join(tempDir, 'package.json'))
  const core = await importFromTemp(requireFromTemp, '@expcat/tigercat-core')
  const vue = await importFromTemp(requireFromTemp, 'vue')
  const vueServer = await importFromTemp(requireFromTemp, '@vue/server-renderer')
  const vueLib = await importFromTemp(requireFromTemp, '@expcat/tigercat-vue')
  const react = await importFromTemp(requireFromTemp, 'react')
  const reactServer = await importFromTemp(requireFromTemp, 'react-dom/server')
  const reactLib = await importFromTemp(requireFromTemp, '@expcat/tigercat-react')

  if (typeof core.createTigercatPlugin !== 'function') {
    throw new Error('core export createTigercatPlugin is missing')
  }

  const vueHtml = await vueServer.renderToString(
    vue.createSSRApp({
      render: () => vue.h(vueLib.Button, { variant: 'primary' }, () => 'Smoke')
    })
  )
  if (!vueHtml.includes('Smoke')) {
    throw new Error('Vue SSR smoke render failed')
  }

  const reactHtml = reactServer.renderToString(
    react.createElement(reactLib.Button, { variant: 'primary' }, 'Smoke')
  )
  if (!reactHtml.includes('Smoke')) {
    throw new Error('React SSR smoke render failed')
  }

  const cliEntry = path.join(tempDir, 'node_modules', '@expcat', 'tigercat-cli', 'dist', 'index.js')
  const cliResult = spawnSync(process.execPath, [cliEntry, '--version'], {
    cwd: tempDir,
    encoding: 'utf8'
  })

  if (cliResult.status !== 0) {
    throw new Error(cliResult.stderr || 'CLI smoke check failed')
  }

  const cliVersion = String(cliResult.stdout).trim()
  if (cliVersion !== version) {
    throw new Error(`CLI reported ${cliVersion}, expected ${version}`)
  }
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf-8'))
}

function readJsonc(filePath) {
  return JSON.parse(stripJsonComments(readFileSync(filePath, 'utf-8')))
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`)
}

function toPortablePath(filePath) {
  return filePath.split(path.sep).join('/')
}

async function importFromTemp(requireFromTemp, specifier) {
  const resolved = requireFromTemp.resolve(specifier)
  return import(pathToFileURL(resolved).href)
}

function createCommandEnv(command, extraEnv = {}) {
  const env = {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: '1',
    NUXT_TELEMETRY_DISABLED: '1',
    ...extraEnv
  }

  if (command === 'npm') {
    stripNpmConfigEnv(env)
    env.NODE_OPTIONS = appendNodeOption(env.NODE_OPTIONS, '--no-deprecation')
  }

  return env
}

function stripNpmConfigEnv(env) {
  for (const key of Object.keys(env)) {
    const normalizedKey = key.toLowerCase().replace(/_/g, '-')

    if (!normalizedKey.startsWith('npm-config-')) {
      continue
    }

    const suffix = normalizedKey.slice('npm-config-'.length)
    if (npmEnvSuffixesToStrip.has(suffix)) {
      delete env[key]
    }
  }
}

function appendNodeOption(existingValue, option) {
  if (!existingValue) {
    return option
  }

  const parts = existingValue.split(/\s+/).filter(Boolean)
  if (parts.includes(option)) {
    return existingValue
  }

  return `${existingValue} ${option}`
}

function stripJsonComments(source) {
  let result = ''
  let inString = false
  let escaped = false

  for (let index = 0; index < source.length; index++) {
    const char = source[index]
    const next = source[index + 1]

    if (inString) {
      result += char
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === '"') {
        inString = false
      }
      continue
    }

    if (char === '"') {
      inString = true
      result += char
      continue
    }

    if (char === '/' && next === '/') {
      while (index < source.length && source[index] !== '\n') {
        index++
      }
      result += source[index] ?? ''
      continue
    }

    if (char === '/' && next === '*') {
      index += 2
      while (index < source.length && !(source[index] === '*' && source[index + 1] === '/')) {
        index++
      }
      index++
      continue
    }

    result += char
  }

  return result
}
