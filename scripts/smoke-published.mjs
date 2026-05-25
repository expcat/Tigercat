#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const rootDir = process.cwd()
const version = process.env.TIGERCAT_SMOKE_VERSION || readPackageVersion()
const tag = version ? `@${version}` : '@latest'
const tempDir = mkdtempSync(path.join(tmpdir(), 'tigercat-published-smoke-'))

function readPackageVersion() {
  const packagePath = path.join(rootDir, 'packages', 'core', 'package.json')
  if (!existsSync(packagePath)) return ''
  return JSON.parse(readFileSync(packagePath, 'utf-8')).version
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: tempDir,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options
  })

  return result.status ?? 1
}

function installWithRetry(args) {
  const attempts = 3
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const status = run('npm', args)
    if (status === 0) return
    if (attempt === attempts) process.exit(status)
    console.log(`npm install failed; retrying (${attempt + 1}/${attempts})...`)
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 5000)
  }
}

async function importFromTemp(requireFromTemp, specifier) {
  const resolved = requireFromTemp.resolve(specifier)
  return import(pathToFileURL(resolved).href)
}

try {
  console.log(`Running published package smoke test for Tigercat ${tag}`)
  writeFileSync(
    path.join(tempDir, 'package.json'),
    JSON.stringify({ private: true, type: 'module' }, null, 2)
  )

  installWithRetry([
    'install',
    '--no-audit',
    '--ignore-scripts',
    `@expcat/tigercat-core${tag}`,
    `@expcat/tigercat-vue${tag}`,
    `@expcat/tigercat-react${tag}`,
    'vue',
    '@vue/server-renderer',
    'react',
    'react-dom'
  ])

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

  const vueApp = vue.createSSRApp({
    render: () => vue.h(vueLib.Button, { variant: 'primary' }, () => 'Smoke')
  })
  const vueHtml = await vueServer.renderToString(vueApp)
  if (!vueHtml.includes('Smoke')) throw new Error('Vue SSR smoke render failed')

  const reactHtml = reactServer.renderToString(
    react.createElement(reactLib.Button, { variant: 'primary' }, 'Smoke')
  )
  if (!reactHtml.includes('Smoke')) throw new Error('React SSR smoke render failed')

  console.log('Published package smoke test passed.')
} finally {
  rmSync(tempDir, { recursive: true, force: true })
}
