import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { loadPublicComponentExports } from '../../scripts/lib/public-components.mjs'

function readWorkspaceFile(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf-8')
}

function collectFiles(dir: string): string[] {
  const entries = readdirSync(resolve(process.cwd(), dir), { withFileTypes: true })
  return entries.flatMap((entry) => {
    if (entry.isSymbolicLink() || GENERATED_EXAMPLE_DIRS.has(entry.name)) return []
    const path = `${dir}/${entry.name}`
    if (entry.isDirectory()) return collectFiles(path)
    return /\.(ts|tsx|vue)$/.test(entry.name) ? [path] : []
  })
}

function splitSpecifiers(specifierBlock: string) {
  return specifierBlock
    .split(',')
    .map((specifier) => specifier.trim())
    .filter(Boolean)
}

function getImportedName(specifier: string) {
  return specifier
    .replace(/^type\s+/, '')
    .split(/\s+as\s+/)[0]
    .trim()
}

const ROOT_COMMAND_APIS = new Set(['Message', 'notification'])
const GENERATED_EXAMPLE_DIRS = new Set(['node_modules', 'dist', '.next', '.nuxt', '.output'])
const EXAMPLE_SOURCE_ROOTS = ['examples/example', 'examples/nextjs', 'examples/nuxt']

describe('example lazy routes', () => {
  it('uses React.lazy for every React example page route', () => {
    const router = readWorkspaceFile('examples/example/react/src/router.tsx')

    expect(router).toContain("import { lazy } from 'react'")
    expect(router).toContain("const Home = lazy(() => import('./pages/Home'))")
    expect(router).not.toMatch(/import\s+\w+\s+from\s+'\.\/pages\//)
  })

  it('uses native Vue Router import factories for every Vue example page route', () => {
    const router = readWorkspaceFile('examples/example/vue3/src/router.ts')

    expect(router).not.toContain('defineAsyncComponent')
    expect(router).not.toContain('lazyPage')
    expect(router).toContain("const Home = () => import('./pages/Home.vue')")
    expect(router).toContain("component: () => import('./pages/ButtonDemo.vue')")
    expect(router).not.toMatch(/import\s+\w+\s+from\s+'\.\/pages\//)
  })

  it('keeps public component value imports on explicit framework subpaths', () => {
    const publicExports = loadPublicComponentExports(process.cwd())
    const publicComponents = {
      react: new Set(publicExports.react),
      vue: new Set(publicExports.vue)
    }
    const importRegex = /import\s+\{([^}]*)\}\s+from\s+['"]@expcat\/tigercat-(react|vue)['"]/g
    const violations: string[] = []

    for (const file of EXAMPLE_SOURCE_ROOTS.flatMap(collectFiles)) {
      const content = readWorkspaceFile(file)
      let match: RegExpExecArray | null
      while ((match = importRegex.exec(content)) !== null) {
        const [, specifierBlock, framework] = match
        for (const specifier of splitSpecifiers(specifierBlock)) {
          if (/^type\s+/.test(specifier)) continue
          const importedName = getImportedName(specifier)
          if (ROOT_COMMAND_APIS.has(importedName)) continue
          if (publicComponents[framework as 'react' | 'vue'].has(importedName)) {
            violations.push(`${file}: ${importedName}`)
          }
        }
      }
    }

    expect(violations).toEqual([])
  }, 15_000)
})
