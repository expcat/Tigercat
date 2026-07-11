#!/usr/bin/env node

import { existsSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { collectFiles, readJson, readText } from './utils/files.mjs'
import { c } from './utils/term.mjs'

const frameworks = [
  {
    name: 'React',
    root: 'examples/example/react/src/examples',
    pages: 'examples/example/react/src/pages',
    entry: 'App.tsx',
    expected: 456,
    packagePrefix: '@expcat/tigercat-react'
  },
  {
    name: 'Vue',
    root: 'examples/example/vue3/src/examples',
    pages: 'examples/example/vue3/src/pages',
    entry: 'App.vue',
    expected: 455,
    packagePrefix: '@expcat/tigercat-vue'
  }
]

const allowedBareImports = [
  'react',
  'react/',
  'react-dom/',
  'vue',
  '@expcat/tigercat-core',
  '@expcat/tigercat-react',
  '@expcat/tigercat-vue',
  '@demo-shared/',
  '@demo-runtime/'
]
const failures = []

function isBareImport(value) {
  return !value.startsWith('.') && !value.startsWith('/')
}

function isAllowedImport(value) {
  return allowedBareImports.some((prefix) => value === prefix || value.startsWith(prefix))
}

function relativeImportExists(importer, requested) {
  const candidate = resolve(dirname(importer), requested)
  const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.vue', '.json', '.css']
  return extensions.some((extension) => existsSync(`${candidate}${extension}`))
}

for (const framework of frameworks) {
  const metadataFiles = collectFiles(framework.root, ['.json'])
    .filter((file) => file.endsWith('/demo.json'))
    .sort()
  if (metadataFiles.length !== framework.expected) {
    failures.push(
      `${framework.name}: expected ${framework.expected} demo modules, found ${metadataFiles.length}`
    )
  }

  const ids = new Set()
  for (const metadataFile of metadataFiles) {
    const displayPath = relative(process.cwd(), metadataFile)
    const meta = readJson(metadataFile)
    if (!meta || typeof meta !== 'object') {
      failures.push(`${displayPath}: invalid JSON metadata`)
      continue
    }
    if (typeof meta.id !== 'string' || meta.id.length === 0) {
      failures.push(`${displayPath}: metadata.id is required`)
    } else if (ids.has(meta.id)) {
      failures.push(`${displayPath}: duplicate metadata.id ${meta.id}`)
    } else {
      ids.add(meta.id)
    }
    if (typeof meta.title !== 'string' || meta.title.length === 0) {
      failures.push(`${displayPath}: metadata.title is required`)
    }
    if (meta.entry !== framework.entry) {
      failures.push(`${displayPath}: entry must be ${framework.entry}`)
    }
    if (!Number.isInteger(meta.order) || meta.order < 1) {
      failures.push(`${displayPath}: order must be a positive integer`)
    }

    const entryFile = join(dirname(metadataFile), framework.entry)
    if (!existsSync(entryFile)) {
      failures.push(`${displayPath}: missing entry file ${framework.entry}`)
      continue
    }
    const source = readText(entryFile)
    if (/\bDemoBlock\b|\?raw/.test(source)) {
      failures.push(`${relative(process.cwd(), entryFile)}: legacy DemoBlock or ?raw source found`)
    }
    if (framework.name === 'React' && !/export\s+default\s+function/.test(source)) {
      failures.push(
        `${relative(process.cwd(), entryFile)}: React entry must default-export a function`
      )
    }
    if (framework.name === 'Vue' && !/<script\s+setup/.test(source)) {
      failures.push(`${relative(process.cwd(), entryFile)}: Vue entry must use <script setup>`)
    }

    const importPattern = /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g
    for (const match of source.matchAll(importPattern)) {
      const specifier = match[1]
      if (isBareImport(specifier) && !isAllowedImport(specifier)) {
        failures.push(`${relative(process.cwd(), entryFile)}: forbidden import ${specifier}`)
      }
      if (!isBareImport(specifier) && !relativeImportExists(entryFile, specifier)) {
        failures.push(`${relative(process.cwd(), entryFile)}: missing relative import ${specifier}`)
      }
      if (
        specifier.startsWith('@expcat/tigercat-') &&
        !specifier.startsWith(framework.packagePrefix) &&
        !specifier.startsWith('@expcat/tigercat-core')
      ) {
        failures.push(`${relative(process.cwd(), entryFile)}: cross-framework import ${specifier}`)
      }
    }
  }

  for (const page of collectFiles(
    framework.pages,
    framework.name === 'React' ? ['.tsx'] : ['.vue']
  )) {
    const source = readText(page)
    if (!source.includes('DemoPage')) continue
    const displayPath = relative(process.cwd(), page)
    if (!source.includes('getDemoModules')) {
      failures.push(`${displayPath}: migrated page must use getDemoModules`)
    }
    if (/\bDemoBlock\b|\bfullPageSnippet\b|\?raw/.test(source)) {
      failures.push(`${displayPath}: migrated page contains legacy demo source wiring`)
    }
  }
}

const reactBlock = readText('examples/example/react/src/components/DemoBlock.tsx')
const vueBlock = readText('examples/example/vue3/src/components/DemoBlock.vue')
if (
  !reactBlock.includes('module: DemoModuleDescriptor') ||
  /children:\s*React\.ReactNode/.test(reactBlock)
) {
  failures.push('React DemoBlock must use the DemoModuleDescriptor contract without children')
}
if (!vueBlock.includes('module: DemoModuleDescriptor') || /\bcode:\s*string/.test(vueBlock)) {
  failures.push('Vue DemoBlock must use the DemoModuleDescriptor contract without a code prop')
}

if (failures.length > 0) {
  console.error(c('red', 'Example source validation failed:'))
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(c('green', 'Example source validation passed (456 React + 455 Vue modules).'))
