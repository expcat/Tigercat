/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'

import {
  compileDemoBundle,
  demoFileSpecifier,
  transformModule
} from '../../examples/example/shared/playground/compiler-utils'

describe('example playground compiler', () => {
  it('compiles sibling files and rewrites relative imports', async () => {
    const result = await compileDemoBundle({
      bundle: {
        entry: '/App.tsx',
        sourceHash: 'test',
        files: {
          '/App.tsx': `import { label } from './data'\nexport default function App() { return label }`,
          '/data.ts': `export const label = 'ok'`
        }
      },
      compileFile(filename, source) {
        return {
          code: transformModule(source, { filename, jsx: filename.endsWith('.tsx') }),
          css: ''
        }
      }
    })

    expect(result.modules[demoFileSpecifier('/data.ts')]).toContain("export const label = 'ok'")
    expect(result.js).toContain(demoFileSpecifier('/data.ts'))
    expect(result.js).not.toContain('./data')
  })

  it('rejects relative imports that are not in the bundle', async () => {
    await expect(
      compileDemoBundle({
        bundle: {
          entry: '/App.tsx',
          sourceHash: 'test',
          files: {
            '/App.tsx': `import { label } from './missing'\nexport default function App() { return label }`
          }
        },
        compileFile(filename, source) {
          return {
            code: transformModule(source, { filename, jsx: true }),
            css: ''
          }
        }
      })
    ).rejects.toThrow('找不到示例文件：./missing')
  })
})
