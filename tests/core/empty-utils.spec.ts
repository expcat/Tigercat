import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import {
  emptyBaseClasses,
  emptyImageClasses,
  emptyDescriptionClasses,
  emptyActionsClasses,
  getEmptyDescription,
  emptyIllustrationViewBox,
  emptyIllustrationPaths
} from '@expcat/tigercat-core'

describe('empty-utils', () => {
  it('base classes include centering', () => {
    expect(emptyBaseClasses).toContain('items-center')
    expect(emptyBaseClasses).toContain('text-center')
  })

  it('image classes include margin', () => {
    expect(emptyImageClasses).toContain('mb-')
  })

  it('description classes include text color', () => {
    expect(emptyDescriptionClasses).toContain('text-')
  })

  it('actions classes include flex layout', () => {
    expect(emptyActionsClasses).toContain('flex')
  })

  describe('getEmptyDescription', () => {
    it('returns "No data" for default preset', () => {
      expect(getEmptyDescription('default')).toBe('No data')
    })

    it('returns "No data" for simple preset', () => {
      expect(getEmptyDescription('simple')).toBe('No data')
    })

    it('returns correct text for no-data preset', () => {
      expect(getEmptyDescription('no-data')).toBe('No data available')
    })

    it('returns correct text for no-results preset', () => {
      expect(getEmptyDescription('no-results')).toBe('No results found')
    })

    it('returns correct text for error preset', () => {
      expect(getEmptyDescription('error')).toBe('Something went wrong')
    })
  })

  describe('empty/02 demo viewport', () => {
    it.each([
      'examples/example/vue3/src/examples/empty/02/demo.json',
      'examples/example/react/src/examples/empty/02/demo.json'
    ])('%s minHeight fits two rows and does not freeze height', (relativePath) => {
      const demo = JSON.parse(readFileSync(resolve(process.cwd(), relativePath), 'utf-8')) as {
        viewport: { mode: string; minHeight: number; maxHeight: number; height?: number }
      }
      expect(demo.viewport.mode).toBe('auto')
      expect(demo.viewport.minHeight).toBeGreaterThanOrEqual(480)
      expect(demo.viewport.maxHeight).toBeGreaterThanOrEqual(720)
      expect(demo.viewport).not.toHaveProperty('height')
    })
  })

  describe('illustration', () => {
    it('viewBox is 0 0 64 41', () => {
      expect(emptyIllustrationViewBox).toBe('0 0 64 41')
    })

    it('paths is a non-empty array of SVG path descriptors', () => {
      expect(emptyIllustrationPaths.length).toBeGreaterThan(0)
      for (const p of emptyIllustrationPaths) {
        expect(p.d).toBeTruthy()
      }
    })
  })
})
