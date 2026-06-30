#!/usr/bin/env node
import { relative } from 'node:path'
import { collectFiles, readText } from './utils/files.mjs'
import { c } from './utils/term.mjs'

const roots = ['examples/example/react/src/pages', 'examples/example/vue3/src/pages']
const failures = []

for (const root of roots) {
  for (const file of collectFiles(root, ['.tsx', '.vue']).sort()) {
    const source = readText(file)
    if (!source.includes('DemoBlock')) continue

    const displayPath = relative(process.cwd(), file)
    const rawImports = new Set()
    const importPattern = /import\s+([A-Za-z_$][\w$]*)\s+from\s+['"][^'"]+\?(?:raw|raw[^'"]*)['"]/g
    for (const match of source.matchAll(importPattern)) {
      rawImports.add(match[1])
    }

    if (/\b:?script\s*=/.test(source)) {
      failures.push(`${displayPath}: DemoBlock must not receive script/script tab content`)
    }

    if (rawImports.size === 0) {
      failures.push(`${displayPath}: DemoBlock page must import code from ?raw source`)
      continue
    }

    const codePropPattern = /(?:\bcode=\{([A-Za-z_$][\w$]*)\}|\s:code="([A-Za-z_$][\w$]*)")/g
    let codePropCount = 0
    for (const match of source.matchAll(codePropPattern)) {
      codePropCount++
      const identifier = match[1] ?? match[2]
      if (!rawImports.has(identifier)) {
        failures.push(`${displayPath}: DemoBlock code prop "${identifier}" is not a ?raw import`)
      }
    }

    if (codePropCount === 0) {
      failures.push(`${displayPath}: DemoBlock page has no checked code prop`)
    }
  }
}

if (failures.length > 0) {
  console.error(c('red', 'Example source validation failed:'))
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log(c('green', 'Example source validation passed.'))
