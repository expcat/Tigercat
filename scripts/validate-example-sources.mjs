#!/usr/bin/env node

import { existsSync } from 'node:fs'
import { basename, dirname, join, relative, resolve, sep } from 'node:path'
import { collectFiles, readJson, readText } from './utils/files.mjs'
import { c } from './utils/term.mjs'

const frameworks = [
  {
    name: 'React',
    root: 'examples/example/react/src/examples',
    pages: 'examples/example/react/src/pages',
    entry: 'App.tsx',
    key: 'react',
    packagePrefix: '@expcat/tigercat-react'
  },
  {
    name: 'Vue',
    root: 'examples/example/vue3/src/examples',
    pages: 'examples/example/vue3/src/pages',
    entry: 'App.vue',
    key: 'vue',
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
const inventories = new Map()
const allowedPermissions = new Set(['downloads', 'modals', 'popups', 'fullscreen'])
const reactOnlyModules = new Set(['use-controlled-state/01'])

function displayPath(path) {
  return relative(process.cwd(), path).split(sep).join('/')
}

function moduleLocation(metadataFile) {
  const moduleDirectory = dirname(metadataFile)
  return {
    route: basename(dirname(moduleDirectory)),
    directory: basename(moduleDirectory)
  }
}

function validateViewport(meta, path) {
  if (meta.viewport === undefined) return
  if (!meta.viewport || typeof meta.viewport !== 'object' || Array.isArray(meta.viewport)) {
    failures.push(`${path}: viewport must be an object`)
    return
  }
  if (meta.viewport.mode !== undefined && !['auto', 'fixed'].includes(meta.viewport.mode)) {
    failures.push(`${path}: viewport.mode must be auto or fixed`)
  }
  for (const field of ['height', 'minHeight', 'maxHeight']) {
    const value = meta.viewport[field]
    if (value !== undefined && (!Number.isFinite(value) || value <= 0)) {
      failures.push(`${path}: viewport.${field} must be a positive number`)
    }
  }
  if (
    Number.isFinite(meta.viewport.minHeight) &&
    Number.isFinite(meta.viewport.maxHeight) &&
    meta.viewport.minHeight > meta.viewport.maxHeight
  ) {
    failures.push(`${path}: viewport.minHeight cannot exceed viewport.maxHeight`)
  }
}

function validatePermissions(meta, path) {
  if (meta.permissions === undefined) return
  if (!Array.isArray(meta.permissions)) {
    failures.push(`${path}: permissions must be an array`)
    return
  }
  const seen = new Set()
  for (const permission of meta.permissions) {
    if (!allowedPermissions.has(permission)) {
      failures.push(`${path}: unsupported permission ${String(permission)}`)
    }
    if (seen.has(permission)) {
      failures.push(`${path}: duplicate permission ${permission}`)
    }
    seen.add(permission)
  }
}

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
    .filter((file) => basename(file) === 'demo.json')
    .sort()

  const ids = new Set()
  const modules = new Map()
  const modulesByRoute = new Map()
  for (const metadataFile of metadataFiles) {
    const path = displayPath(metadataFile)
    const { route, directory } = moduleLocation(metadataFile)
    const moduleKey = `${route}/${directory}`
    const meta = readJson(metadataFile)
    if (!meta || typeof meta !== 'object') {
      failures.push(`${path}: invalid JSON metadata`)
      continue
    }
    if (typeof meta.id !== 'string' || meta.id.length === 0) {
      failures.push(`${path}: metadata.id is required`)
    } else if (ids.has(meta.id)) {
      failures.push(`${path}: duplicate metadata.id ${meta.id}`)
    } else {
      ids.add(meta.id)
    }
    if (!/^\d{2}$/.test(directory)) {
      failures.push(`${path}: module directory must use a two-digit number`)
    }
    if (meta.id !== `${route}-${directory}`) {
      failures.push(`${path}: metadata.id must be ${route}-${directory}`)
    }
    if (typeof meta.title !== 'string' || meta.title.length === 0) {
      failures.push(`${path}: metadata.title is required`)
    }
    if (meta.entry !== framework.entry) {
      failures.push(`${path}: entry must be ${framework.entry}`)
    }
    if (!Number.isInteger(meta.order) || meta.order < 1) {
      failures.push(`${path}: order must be a positive integer`)
    } else if (meta.order !== Number(directory)) {
      failures.push(`${path}: metadata.order must match directory ${Number(directory)}`)
    }
    validateViewport(meta, path)
    validatePermissions(meta, path)

    modules.set(moduleKey, { route, directory, meta, metadataFile })
    const routeModules = modulesByRoute.get(route) ?? []
    routeModules.push({ directory, meta, metadataFile })
    modulesByRoute.set(route, routeModules)

    const entryFile = join(dirname(metadataFile), framework.entry)
    if (!existsSync(entryFile)) {
      failures.push(`${path}: missing entry file ${framework.entry}`)
      continue
    }
    const source = readText(entryFile)
    if (/\bDemoBlock\b|\?raw/.test(source)) {
      failures.push(`${displayPath(entryFile)}: legacy DemoBlock or ?raw source found`)
    }
    if (framework.name === 'React' && !/export\s+default\s+function/.test(source)) {
      failures.push(`${displayPath(entryFile)}: React entry must default-export a function`)
    }
    if (framework.name === 'Vue' && !/<script\s+setup/.test(source)) {
      failures.push(`${displayPath(entryFile)}: Vue entry must use <script setup>`)
    }

    const importPattern = /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g
    for (const match of source.matchAll(importPattern)) {
      const specifier = match[1]
      if (isBareImport(specifier) && !isAllowedImport(specifier)) {
        failures.push(`${displayPath(entryFile)}: forbidden import ${specifier}`)
      }
      if (!isBareImport(specifier) && !relativeImportExists(entryFile, specifier)) {
        failures.push(`${displayPath(entryFile)}: missing relative import ${specifier}`)
      }
      if (
        specifier.startsWith('@expcat/tigercat-') &&
        !specifier.startsWith(framework.packagePrefix) &&
        !specifier.startsWith('@expcat/tigercat-core')
      ) {
        failures.push(`${displayPath(entryFile)}: cross-framework import ${specifier}`)
      }
    }
  }

  for (const [route, routeModules] of modulesByRoute) {
    const directories = routeModules.map(({ directory }) => directory).sort()
    for (let index = 0; index < directories.length; index++) {
      const expected = String(index + 1).padStart(2, '0')
      if (directories[index] !== expected) {
        failures.push(
          `${framework.name} ${route}: module directories must be continuous from 01 (found ${directories.join(', ')})`
        )
        break
      }
    }
  }

  const pageRoutes = new Set()
  for (const page of collectFiles(
    framework.pages,
    framework.name === 'React' ? ['.tsx'] : ['.vue']
  )) {
    const source = readText(page)
    if (!source.includes('DemoPage')) continue
    const path = displayPath(page)
    if (!source.includes('getDemoModules')) {
      failures.push(`${path}: migrated page must use getDemoModules`)
    }
    if (/\bDemoBlock\b|\bfullPageSnippet\b|\?raw/.test(source)) {
      failures.push(`${path}: migrated page contains legacy demo source wiring`)
    }
    const routeMatch = /getDemoModules\(\s*['"]([^'"]+)['"]\s*\)/.exec(source)
    if (!routeMatch) {
      failures.push(`${path}: migrated page must request a literal demo route`)
      continue
    }
    const route = routeMatch[1]
    pageRoutes.add(route)
    if (!modulesByRoute.has(route))
      failures.push(`${path}: no demo modules found for route ${route}`)
  }

  for (const route of modulesByRoute.keys()) {
    if (!pageRoutes.has(route)) failures.push(`${framework.name}: orphan demo route ${route}`)
  }

  inventories.set(framework.key, { modules, count: metadataFiles.length })
}

const reactInventory = inventories.get('react')
const vueInventory = inventories.get('vue')
if (reactInventory && vueInventory) {
  const moduleKeys = new Set([...reactInventory.modules.keys(), ...vueInventory.modules.keys()])
  for (const moduleKey of moduleKeys) {
    const reactModule = reactInventory.modules.get(moduleKey)
    const vueModule = vueInventory.modules.get(moduleKey)
    if (!reactModule || !vueModule) {
      if (reactOnlyModules.has(moduleKey) && reactModule && !vueModule) continue
      failures.push(
        `${moduleKey}: module must exist in both frameworks${reactOnlyModules.has(moduleKey) ? ' with the documented React-only shape' : ''}`
      )
      continue
    }
    for (const field of ['id', 'title', 'order']) {
      if (reactModule.meta[field] !== vueModule.meta[field]) {
        failures.push(`${moduleKey}: React/Vue metadata.${field} must match`)
      }
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

console.log(
  c(
    'green',
    `Example source validation passed (${reactInventory?.count ?? 0} React + ${vueInventory?.count ?? 0} Vue modules).`
  )
)
