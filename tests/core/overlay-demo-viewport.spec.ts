/**
 * @vitest-environment node
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'

const FRAMEWORK_ROOTS = [
  'examples/example/vue3/src/examples',
  'examples/example/react/src/examples'
] as const

const RAISED_DEMOS = [
  'datepicker/01',
  'datepicker/02',
  'datepicker/03',
  'timepicker/01',
  'timepicker/02',
  'cascader/01',
  'cascader/02',
  'modal/01',
  'modal/02',
  'modal/03',
  'modal/04',
  'drawer/01',
  'drawer/02',
  'drawer/03',
  'tour/01',
  'tour/02',
  'loading/02',
  'loading/03',
  'spotlight/01',
  'spotlight/02',
  'dropdown/01',
  'dropdown/02',
  'crop-upload/01',
  'crop-upload/02'
] as const

const SKIP_DEMOS = ['loading/01', 'button/01'] as const

type DemoViewportFile = {
  viewport: { mode: string; minHeight: number; maxHeight: number; height?: number }
}

function readDemo(relativePath: string): DemoViewportFile {
  return JSON.parse(readFileSync(resolve(process.cwd(), relativePath), 'utf-8')) as DemoViewportFile
}

function demoPaths(demos: readonly string[]): string[] {
  return FRAMEWORK_ROOTS.flatMap((root) => demos.map((demo) => `${root}/${demo}/demo.json`))
}

describe('overlay demo viewports', () => {
  it.each(demoPaths(RAISED_DEMOS))(
    '%s minHeight fits overlay and does not freeze height',
    (relativePath) => {
      const demo = readDemo(relativePath)
      expect(demo.viewport.mode).toBe('auto')
      expect(demo.viewport.minHeight).toBeGreaterThanOrEqual(520)
      expect(demo.viewport.maxHeight).toBeGreaterThanOrEqual(720)
      expect(demo.viewport).not.toHaveProperty('height')
    }
  )

  it.each(demoPaths(SKIP_DEMOS))(
    '%s stays unraised (not a site-wide iframe bump)',
    (relativePath) => {
      const demo = readDemo(relativePath)
      expect(demo.viewport.mode).toBe('auto')
      expect(demo.viewport.minHeight).toBeLessThan(200)
      expect(demo.viewport).not.toHaveProperty('height')
    }
  )
})
