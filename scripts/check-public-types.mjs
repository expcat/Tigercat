#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  PUBLIC_PROPS_TYPE_EXCEPTIONS,
  loadPublicComponentExports
} from './lib/public-components.mjs'

const root = join(import.meta.dirname, '..')

function flattenExports(content) {
  return content.replace(/\s+/g, ' ')
}

function hasTypeExport(indexContent, typeName) {
  return new RegExp(`export type \\{[^}]*\\b${typeName}\\b[^}]*\\} from './components/`).test(
    indexContent
  )
}

function getExpectedTypeName(packageName, componentName) {
  return packageName === 'vue' ? `Vue${componentName}Props` : `${componentName}Props`
}

async function checkPackage(packageName, indexFile, componentNames) {
  const indexContent = flattenExports(
    await readFile(join(root, 'packages', packageName, 'src', indexFile), 'utf-8')
  )
  const missing = []

  for (const componentName of componentNames) {
    const exceptionKey = `${packageName}:${componentName}`
    if (PUBLIC_PROPS_TYPE_EXCEPTIONS.has(exceptionKey)) continue

    const typeName = getExpectedTypeName(packageName, componentName)
    if (!hasTypeExport(indexContent, typeName)) {
      missing.push(`${componentName} (${typeName})`)
    }
  }

  return missing
}

const publicExports = loadPublicComponentExports(root)
const vueMissing = await checkPackage('vue', 'index.ts', publicExports.vue)
const reactMissing = await checkPackage('react', 'index.tsx', publicExports.react)

if (vueMissing.length > 0 || reactMissing.length > 0) {
  if (vueMissing.length > 0) console.error(`Vue props types missing: ${vueMissing.join(', ')}`)
  if (reactMissing.length > 0)
    console.error(`React props types missing: ${reactMissing.join(', ')}`)
  process.exit(1)
}

console.log('All public component props types are exported.')
