#!/usr/bin/env node

import { basename, dirname, join, relative, sep } from 'node:path'
import { createJiti } from 'jiti'
import { collectFiles, readText } from './utils/files.mjs'
import { c } from './utils/term.mjs'

// Load the exact transform + import-scan used by the browser workers so this
// gate cannot drift from runtime behaviour (see the playground compiler
// proposal, §4). The shared modules are TypeScript; jiti transpiles them.
const jiti = createJiti(import.meta.url)
const { transformModule, scanImports } = await jiti.import(
  '../examples/example/shared/playground/compiler-utils.ts'
)
const { compileVueFile } = await jiti.import('../examples/example/vue3/src/playground/vue-sfc.ts')

const frameworks = [
  { name: 'React', root: 'examples/example/react/src/examples', entry: 'App.tsx' },
  { name: 'Vue', root: 'examples/example/vue3/src/examples', entry: 'App.vue' }
]

function displayPath(path) {
  return relative(process.cwd(), path).split(sep).join('/')
}

const failures = []
const counts = { React: 0, Vue: 0 }

for (const framework of frameworks) {
  const entryFiles = collectFiles(framework.root, ['.json'])
    .filter((file) => basename(file) === 'demo.json')
    .map((file) => join(dirname(file), framework.entry))
    .sort()

  for (const entryFile of entryFiles) {
    const path = displayPath(entryFile)
    try {
      const source = readText(entryFile)
      const js =
        framework.name === 'Vue'
          ? transformModule(compileVueFile(entryFile, source).code, {
              filename: entryFile,
              jsx: false
            })
          : transformModule(source, { filename: entryFile, jsx: true })
      await scanImports(js)
      counts[framework.name]++
    } catch (error) {
      failures.push(`${path}: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}

if (failures.length > 0) {
  console.error(c('red', 'Example compile validation failed:'))
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(
  c(
    'green',
    `Example compile validation passed (${counts.React} React + ${counts.Vue} Vue examples).`
  )
)
