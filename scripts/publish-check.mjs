#!/usr/bin/env node

import { spawn, spawnSync } from 'node:child_process'
import {
  cpSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync
} from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { build as esbuild } from 'esbuild'

import { readJson, readJsonc, writeJson } from './utils/files.mjs'

const rootDir = process.cwd()
const argv = process.argv.slice(2)
const publishedOnly = argv.includes('--published')
const version = getRootVersion(rootDir)
const tempDir = mkdtempSync(path.join(tmpdir(), 'tigercat-publish-check-'))
const tarballsDir = path.join(tempDir, 'tarballs')
const examplesDir = path.join(tempDir, 'examples')
let esmImportCounter = 0
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
  { name: '@expcat/tigercat-cli', dir: path.join(rootDir, 'packages', 'cli') },
  { name: '@expcat/tigercat-mcp', dir: path.join(rootDir, 'packages', 'mcp') }
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

const buttonSubpathBundleLimits = {
  react: 6000,
  vue: 8000
}
const npmInstallTimeoutMs = Number(
  process.env.TIGERCAT_PUBLISH_CHECK_NPM_TIMEOUT_MS ?? 10 * 60 * 1000
)

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
        `@expcat/tigercat-cli${tag}`,
        `@expcat/tigercat-mcp${tag}`
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
        tarballs['@expcat/tigercat-cli'],
        tarballs['@expcat/tigercat-mcp']
      ]
    })

    console.log('')
    console.log('4/4 Verifying examples against local tarballs...')
    await smokeExamples(tarballs)

    console.log('')
    console.log('Local publish check passed.')
  } finally {
    removeDirWithRetry(tempDir)
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

  assertTarballHasNoCjsArtifacts(tarballPath)
  return tarballPath
}

function assertTarballHasNoCjsArtifacts(tarballPath) {
  const result = spawnSync('tar', ['-tf', tarballPath], {
    encoding: 'utf8',
    shell: process.platform === 'win32'
  })

  if (result.status !== 0) {
    throw new Error(result.stderr || `Could not inspect tarball ${tarballPath}`)
  }

  const cjsEntries = result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.endsWith('.cjs'))

  if (cjsEntries.length > 0) {
    throw new Error(
      `${path.basename(tarballPath)} must not include CJS artifacts: ${cjsEntries.join(', ')}`
    )
  }
}

async function smokeExamples(tarballs) {
  copyExampleFixtures()

  for (const example of exampleProjects) {
    console.log(`Building ${example.name}...`)
    example.prepare(example.dir, tarballs)
    await installWithRetry(
      ['install', '--no-audit', '--fund=false'],
      example.dir
    )
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
  const aliasReplacement = `resolve: {\n    alias: {\n      '@demo-shared': path.resolve(__dirname, './.publish-shared')\n    }\n  },`
  const withAlias = source
    .replace(/resolve:\s*\{\s*alias:\s*\{[\s\S]*?\}\s*\},/m, aliasReplacement)
    .replace(/resolve:\s*\{\s*alias:\s*\[[\s\S]*?\r?\n    \]\r?\n  \},/m, aliasReplacement)

  const next = withAlias
    .replace(/chunkSizeWarningLimit:\s*\d+/, 'chunkSizeWarningLimit: 1024')
    .replaceAll("'../shared/playground/vite-runtime-plugin'", "'./.publish-shared/playground/vite-runtime-plugin'")
    .replaceAll("path.resolve(__dirname, '../shared/playground')", "path.resolve(__dirname, './.publish-shared/playground')")

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

  if (Array.isArray(tsconfig.exclude)) {
    tsconfig.exclude = tsconfig.exclude.map((value) =>
      value.startsWith('../shared/') ? value.replace('../shared/', './.publish-shared/') : value
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

async function installWithRetry(args, cwd, waitMs = 3000) {
  const attempts = 3
  const effectiveArgs = args.some((arg) => arg.startsWith('--loglevel='))
    ? args
    : [...args, '--loglevel=error']

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const result = await runNpmInstall(effectiveArgs, cwd)

    if (result.status === 0) {
      return
    }

    if (attempt === attempts) {
      const reason = result.timedOut ? ' timed out' : ''
      throw new Error(`npm ${args[0]}${reason} in ${cwd}`)
    }

    console.log(`npm ${args[0]} failed; retrying (${attempt + 1}/${attempts})...`)
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, waitMs)
  }
}

function runNpmInstall(args, cwd) {
  return new Promise((resolve) => {
    let finished = false
    let timedOut = false
    const child = spawn('npm', args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: createCommandEnv('npm')
    })
    const timeout = setTimeout(() => {
      timedOut = true
      terminateProcessTree(child.pid)
    }, npmInstallTimeoutMs)

    const finish = (result) => {
      if (finished) return
      finished = true
      clearTimeout(timeout)
      resolve({ timedOut, ...result })
    }

    child.on('error', (error) => finish({ status: 1, error }))
    child.on('close', (code, signal) => finish({ status: code ?? 1, signal }))
  })
}

function terminateProcessTree(pid) {
  if (!pid) return

  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(pid), '/T', '/F'], { stdio: 'ignore' })
    return
  }

  try {
    process.kill(pid, 'SIGTERM')
  } catch {
    // Process may have exited between timeout and termination.
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

    await installWithRetry(
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
    removeDirWithRetry(tempDir)
  }
}

function removeDirWithRetry(dir, attempts = 5, waitMs = 1000) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      rmSync(dir, { recursive: true, force: true })
      return
    } catch (error) {
      if (attempt === attempts) {
        throw error
      }
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, waitMs)
    }
  }
}

async function verifyInstalledPackages(tempDir, version) {
  assertInstalledPackagesHaveNoCjsArtifacts(tempDir)

  const core = await importFromTemp(tempDir, '@expcat/tigercat-core')
  const vue = await importFromTemp(tempDir, 'vue')
  const vueServer = await importFromTemp(tempDir, '@vue/server-renderer')
  const vueLib = await importFromTemp(tempDir, '@expcat/tigercat-vue')
  const react = await importFromTemp(tempDir, 'react')
  const reactServer = await importFromTemp(tempDir, 'react-dom/server')
  const reactLib = await importFromTemp(tempDir, '@expcat/tigercat-react')

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

  await verifyFrameworkButtonTreeShaking(tempDir)
  await verifyI18nTreeShaking(tempDir)

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

  // MCP 是 stdio 服务器包而非组件库,不参与 tree-shaking/体积断言,
  // 只验证库导出、bin 可执行(--help 不会启动 stdio)与版本一致。
  const mcpLib = await importFromTemp(tempDir, '@expcat/tigercat-mcp')
  if (typeof mcpLib.createTigercatMcpServer !== 'function') {
    throw new Error('mcp export createTigercatMcpServer is missing')
  }

  const mcpDir = path.join(tempDir, 'node_modules', '@expcat', 'tigercat-mcp')
  const mcpEntry = path.join(mcpDir, 'dist', 'index.js')
  const mcpResult = spawnSync(process.execPath, [mcpEntry, '--help'], {
    cwd: tempDir,
    encoding: 'utf8'
  })

  if (mcpResult.status !== 0 || !String(mcpResult.stdout).includes('tigercat-mcp')) {
    throw new Error(mcpResult.stderr || 'MCP CLI smoke check failed')
  }

  const mcpVersion = readJson(path.join(mcpDir, 'package.json')).version
  if (mcpVersion !== version) {
    throw new Error(`MCP package reports ${mcpVersion}, expected ${version}`)
  }
}

function toPortablePath(filePath) {
  return filePath.split(path.sep).join('/')
}

function assertInstalledPackagesHaveNoCjsArtifacts(tempDir) {
  const packageRoot = path.join(tempDir, 'node_modules', '@expcat')
  const cjsFiles = []

  for (const packageName of [
    'tigercat-core',
    'tigercat-vue',
    'tigercat-react',
    'tigercat-cli',
    'tigercat-mcp'
  ]) {
    const packageDir = path.join(packageRoot, packageName)
    if (!existsSync(packageDir)) continue

    for (const filePath of walkFiles(packageDir)) {
      if (filePath.endsWith('.cjs')) {
        cjsFiles.push(path.relative(tempDir, filePath))
      }
    }
  }

  if (cjsFiles.length > 0) {
    throw new Error(
      `Installed Tigercat packages must not include CJS artifacts: ${cjsFiles.join(', ')}`
    )
  }
}

function walkFiles(dir) {
  const files = []
  for (const entry of readdirSync(dir)) {
    const entryPath = path.join(dir, entry)
    const stats = statSync(entryPath)
    if (stats.isDirectory()) {
      files.push(...walkFiles(entryPath))
    } else if (stats.isFile()) {
      files.push(entryPath)
    }
  }
  return files
}

async function importFromTemp(tempDir, specifier) {
  const modulePath = path.join(tempDir, `.tigercat-esm-import-${esmImportCounter++}.mjs`)
  writeFileSync(
    modulePath,
    `import * as namespace from ${JSON.stringify(specifier)};\nexport default namespace;\n`
  )
  const imported = await import(pathToFileURL(modulePath).href)
  return imported.default
}

async function verifyFrameworkButtonTreeShaking(tempDir) {
  const cases = [
    {
      name: 'React root Button import',
      specifier: '@expcat/tigercat-react',
      importName: 'Button',
      framework: 'react',
      mode: 'root',
      externals: [
        '@expcat/tigercat-core',
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime'
      ]
    },
    {
      name: 'React Button subpath import',
      specifier: '@expcat/tigercat-react/Button',
      importName: 'Button',
      framework: 'react',
      mode: 'button-subpath',
      externals: [
        '@expcat/tigercat-core',
        'react',
        'react-dom',
        'react-dom/client',
        'react/jsx-runtime',
        'react/jsx-dev-runtime'
      ]
    },
    {
      name: 'Vue root Button import',
      specifier: '@expcat/tigercat-vue',
      importName: 'Button',
      framework: 'vue',
      mode: 'root',
      externals: ['@expcat/tigercat-core', 'vue']
    },
    {
      name: 'Vue Button subpath import',
      specifier: '@expcat/tigercat-vue/Button',
      importName: 'Button',
      framework: 'vue',
      mode: 'button-subpath',
      externals: ['@expcat/tigercat-core', 'vue']
    }
  ]

  for (const bundleCase of cases) {
    const bundle = await bundleInstalledImport(tempDir, bundleCase)
    assertBundleExcludesImperativeApis(bundleCase.name, bundle)
    if (bundleCase.mode === 'button-subpath') {
      assertButtonSubpathBundleBudget(bundleCase, bundle)
      assertButtonSubpathBundleIsIsolated(bundleCase.name, bundle)
    }
  }
}

async function bundleInstalledImport(tempDir, { name, specifier, importName, externals }) {
  const entryPath = path.join(tempDir, `.tigercat-bundle-${esmImportCounter++}.mjs`)
  writeFileSync(
    entryPath,
    `import { ${importName} } from ${JSON.stringify(specifier)};\nexport default ${importName};\n`
  )

  const result = await esbuild({
    entryPoints: [entryPath],
    absWorkingDir: tempDir,
    bundle: true,
    format: 'esm',
    platform: 'browser',
    write: false,
    logLevel: 'silent',
    external: externals
  })

  const output = result.outputFiles?.[0]?.text
  if (!output) {
    throw new Error(`${name} did not produce a bundle`)
  }

  return output
}

function assertBundleExcludesImperativeApis(name, bundle) {
  const forbiddenMarkers = [
    'tiger-message-container',
    'tiger-notification-container',
    'MessageHost',
    'NotificationHost',
    'react-dom/client',
    'createRoot',
    'createApp'
  ]

  const includedMarkers = forbiddenMarkers.filter((marker) => bundle.includes(marker))
  if (includedMarkers.length > 0) {
    throw new Error(
      `${name} should tree-shake imperative Message/notification APIs, but included: ${includedMarkers.join(', ')}`
    )
  }
}

function assertButtonSubpathBundleBudget({ name, framework }, bundle) {
  const limit = buttonSubpathBundleLimits[framework]
  const size = Buffer.byteLength(bundle, 'utf8')

  if (size > limit) {
    throw new Error(
      `${name} bundle is ${size} bytes, exceeding the ${limit} byte Button subpath budget`
    )
  }
}

function assertButtonSubpathBundleIsIsolated(name, bundle) {
  const forbiddenMarkers = [
    'ChartCanvas',
    'chart-tooltip',
    'chart-legend',
    'tiger-chart',
    'CodeEditor',
    'RichTextEditor',
    'MarkdownEditor',
    'defineLocale',
    'DATEPICKER_LOCALES',
    'zhCN',
    'jaJP',
    'koKR',
    'arSA'
  ]

  const includedMarkers = forbiddenMarkers.filter((marker) => bundle.includes(marker))
  if (includedMarkers.length > 0) {
    throw new Error(
      `${name} should not pull charts, editors, or full locale bundles, but included: ${includedMarkers.join(', ')}`
    )
  }
}

async function verifyI18nTreeShaking(tempDir) {
  const cases = [
    {
      name: 'defineText root import',
      source: `
        import { defineText } from '@expcat/tigercat-core';
        export default defineText({ modal: { okText: 'Confirm' } });
      `,
      forbiddenMarkers: getFullLocaleBundleMarkers()
    },
    {
      name: 'React DatePicker subpath import',
      source: `
        import { DatePicker } from '@expcat/tigercat-react/DatePicker';
        export default DatePicker;
      `,
      externals: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
      forbiddenMarkers: getFullLocaleBundleMarkers()
    },
    {
      name: 'Vue DatePicker subpath import',
      source: `
        import { DatePicker } from '@expcat/tigercat-vue/DatePicker';
        export default DatePicker;
      `,
      externals: ['vue'],
      forbiddenMarkers: getFullLocaleBundleMarkers()
    },
    {
      name: 'React DatePicker with zh-CN preset',
      source: `
        import { DatePicker } from '@expcat/tigercat-react/DatePicker';
        import { ZH_CN_DATEPICKER_LOCALE } from '@expcat/tigercat-core/datepicker-locales/zh-CN';
        export default { DatePicker, locale: ZH_CN_DATEPICKER_LOCALE };
      `,
      externals: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
      requiredMarkers: ['ZH_CN_DATEPICKER_LOCALE', '\\u4ECA\\u5929'],
      forbiddenMarkers: getFullLocaleBundleMarkers({ allowZhCN: true })
    },
    {
      name: 'Vue DatePicker with zh-CN preset',
      source: `
        import { DatePicker } from '@expcat/tigercat-vue/DatePicker';
        import { ZH_CN_DATEPICKER_LOCALE } from '@expcat/tigercat-core/datepicker-locales/zh-CN';
        export default { DatePicker, locale: ZH_CN_DATEPICKER_LOCALE };
      `,
      externals: ['vue'],
      requiredMarkers: ['ZH_CN_DATEPICKER_LOCALE', '\\u4ECA\\u5929'],
      forbiddenMarkers: getFullLocaleBundleMarkers({ allowZhCN: true })
    }
  ]

  for (const bundleCase of cases) {
    const bundle = await bundleInstalledSource(tempDir, bundleCase)
    assertBundleIncludesMarkers(bundleCase.name, bundle, bundleCase.requiredMarkers ?? [])
    assertBundleExcludesMarkers(bundleCase.name, bundle, bundleCase.forbiddenMarkers)
  }
}

async function bundleInstalledSource(tempDir, { name, source, externals = [] }) {
  const entryPath = path.join(tempDir, `.tigercat-bundle-${esmImportCounter++}.mjs`)
  writeFileSync(entryPath, source)

  const result = await esbuild({
    entryPoints: [entryPath],
    absWorkingDir: tempDir,
    bundle: true,
    format: 'esm',
    platform: 'browser',
    write: false,
    logLevel: 'silent',
    external: externals
  })

  const output = result.outputFiles?.[0]?.text
  if (!output) {
    throw new Error(`${name} did not produce a bundle`)
  }

  return output
}

function getFullLocaleBundleMarkers({ allowZhCN = false } = {}) {
  return [
    'DATEPICKER_LOCALES',
    'getDatePickerLabelsFromLocale',
    'getDatePickerLocalePreset',
    'FR_FR_DATEPICKER_LOCALE',
    'AR_SA_DATEPICKER_LOCALE',
    "Aujourd'hui",
    'الشهر السابق',
    'fr-FR',
    'ar-SA',
    ...(allowZhCN ? [] : ['ZH_CN_DATEPICKER_LOCALE', '\\u4ECA\\u5929'])
  ]
}

function assertBundleIncludesMarkers(name, bundle, markers) {
  const missingMarkers = markers.filter((marker) => !bundle.includes(marker))
  if (missingMarkers.length > 0) {
    throw new Error(`${name} should include markers: ${missingMarkers.join(', ')}`)
  }
}

function assertBundleExcludesMarkers(name, bundle, markers) {
  const includedMarkers = markers.filter((marker) => bundle.includes(marker))
  if (includedMarkers.length > 0) {
    throw new Error(
      `${name} should tree-shake unused i18n data, but included: ${includedMarkers.join(', ')}`
    )
  }
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
