import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

function readWorkspaceFile(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf-8')
}

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
})
