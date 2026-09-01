#!/usr/bin/env node

import { basename, dirname, join, relative, sep } from 'node:path'
import { createJiti } from 'jiti'
import { collectFiles, readText } from './utils/files.mjs'
import { c } from './utils/term.mjs'

const jiti = createJiti(import.meta.url)
const { compileDemoBundle, transformModule } = await jiti.import(
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
  const metadataFiles = collectFiles(framework.root, ['.json'])
    .filter((file) => basename(file) === 'demo.json')
    .sort()

  for (const metadataFile of metadataFiles) {
    const path = displayPath(metadataFile)
    const directory = dirname(metadataFile)
    try {
      const meta = JSON.parse(readText(metadataFile))
      const files = {}
      for (const file of collectFiles(directory, [
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
        '.vue',
        '.css',
        '.json'
      ])) {
        if (basename(file) === 'demo.json') continue
        files[`/${basename(file)}`] = readText(file)
      }
      const entry = `/${meta.entry}`
      await compileDemoBundle({
        bundle: { entry, files, sourceHash: 'check' },
        compileFile(filename, source) {
          if (framework.name === 'Vue' && filename.endsWith('.vue')) {
            return compileVueFile(filename, source)
          }
          return {
            code: transformModule(source, {
              filename,
              jsx: framework.name === 'React' && /\.[jt]sx$/.test(filename)
            }),
            css: ''
          }
        }
      })
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
