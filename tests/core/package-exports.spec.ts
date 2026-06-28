import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  REQUIRED_CORE_PACKAGE_EXPORTS,
  buildFrameworkPackageExports,
  getComponentPackageTarget,
  loadPublicComponentExports
} from '../../scripts/lib/public-components.mjs'

const root = resolve(process.cwd())

function readPackageJson(path: string) {
  return JSON.parse(readFileSync(resolve(root, path), 'utf-8')) as {
    exports?: Record<string, unknown>
  }
}

describe('package exports', () => {
  it('syncs React and Vue explicit component exports from public component facts', () => {
    const publicComponents = loadPublicComponentExports(root)

    for (const framework of ['react', 'vue'] as const) {
      const packageJson = readPackageJson(`packages/${framework}/package.json`)
      const expectedExports = buildFrameworkPackageExports(publicComponents[framework])

      expect(packageJson.exports).toEqual(expectedExports)
      expect(packageJson.exports).not.toHaveProperty('./*')
      expect(Object.keys(packageJson.exports ?? {})).toHaveLength(
        publicComponents[framework].length + 1
      )
    }
  })

  it('points every explicit framework component export at an existing source entry', () => {
    const publicComponents = loadPublicComponentExports(root)

    for (const framework of ['react', 'vue'] as const) {
      const extension = framework === 'react' ? '.tsx' : '.ts'

      for (const component of publicComponents[framework]) {
        const target = getComponentPackageTarget(component)
        expect(
          existsSync(
            join(root, 'packages', framework, 'src', 'components', `${target}${extension}`)
          )
        ).toBe(true)
      }
    }
  })

  it('keeps required core subpath exports available', () => {
    const packageJson = readPackageJson('packages/core/package.json')

    for (const exportName of REQUIRED_CORE_PACKAGE_EXPORTS) {
      expect(packageJson.exports).toHaveProperty(exportName)
    }
  })
})
