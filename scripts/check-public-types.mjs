#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')

async function listComponentNames(packageName, extension) {
  const dir = join(root, 'packages', packageName, 'src', 'components')
  const files = await readdir(dir)
  return files
    .filter((file) => file.endsWith(extension))
    .map((file) => file.slice(0, -extension.length))
    .sort()
}

function flattenExports(content) {
  return content.replace(/\s+/g, ' ')
}

function hasTypeExport(indexContent, typeName) {
  return new RegExp(`export type \\{[^}]*\\b${typeName}\\b[^}]*\\} from './components/`).test(
    indexContent
  )
}

async function checkPackage(packageName, indexFile, prefix, extension) {
  const components = await listComponentNames(packageName, extension)
  const indexContent = flattenExports(
    await readFile(join(root, 'packages', packageName, 'src', indexFile), 'utf-8')
  )
  const missing = []

  for (const componentName of components) {
    const typeName = `${prefix}${componentName}Props`
    if (!hasTypeExport(indexContent, typeName)) {
      missing.push(`${componentName} (${typeName})`)
    }
  }

  return missing
}

const vueMissing = await checkPackage('vue', 'index.ts', 'Vue', '.ts')
const reactMissing = await checkPackage('react', 'index.tsx', '', '.tsx')

if (vueMissing.length > 0 || reactMissing.length > 0) {
  if (vueMissing.length > 0) console.error(`Vue props types missing: ${vueMissing.join(', ')}`)
  if (reactMissing.length > 0)
    console.error(`React props types missing: ${reactMissing.join(', ')}`)
  process.exit(1)
}

console.log('All public component props types are exported.')
