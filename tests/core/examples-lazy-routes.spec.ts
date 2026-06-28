import { readdirSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { loadPublicComponentExports } from '../../scripts/lib/public-components.mjs'

function readWorkspaceFile(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf-8')
}

function collectFiles(dir: string): string[] {
  const entries = readdirSync(resolve(process.cwd(), dir))
  return entries.flatMap((entry) => {
    const path = `${dir}/${entry}`
    const stats = statSync(resolve(process.cwd(), path))
    if (stats.isDirectory()) return collectFiles(path)
    return /\.(ts|tsx|vue)$/.test(entry) ? [path] : []
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

describe('example lazy routes', () => {
  it('uses React.lazy for every React example page route', () => {
    const router = readWorkspaceFile('examples/example/react/src/router.tsx')

    expect(router).toContain("import { lazy } from 'react'")
    expect(router).toContain("const Home = lazy(() => import('./pages/Home'))")
    expect(router).not.toMatch(/import\s+\w+\s+from\s+'\.\/pages\//)
  })

  it('uses defineAsyncComponent for every Vue example page route', () => {
    const router = readWorkspaceFile('examples/example/vue3/src/router.ts')

    expect(router).toContain("import { defineAsyncComponent } from 'vue'")
    expect(router).toContain("const Home = lazyPage(() => import('./pages/Home.vue'))")
    expect(router).not.toMatch(/import\s+\w+\s+from\s+'\.\/pages\//)
    expect(router).not.toContain('component: () => import(')
  })

  it('keeps public component value imports on explicit framework subpaths', () => {
    const publicExports = loadPublicComponentExports(process.cwd())
    const publicComponents = {
      react: new Set(publicExports.react),
      vue: new Set(publicExports.vue)
    }
    const importRegex = /import\s+\{([^}]*)\}\s+from\s+['"]@expcat\/tigercat-(react|vue)['"]/g
    const violations: string[] = []

    for (const file of collectFiles('examples')) {
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
