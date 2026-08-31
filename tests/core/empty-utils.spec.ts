import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import {
  getEmptyDescription,
  getEmptyIllustration,
  resolveEmptyImageMode,
  emptyIllustrationViewBox,
  emptyIllustrationPaths
} from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { jaJP } from '@expcat/tigercat-core/locales/ja-JP'

const presets = ['default', 'simple', 'no-data', 'no-results', 'error'] as const

describe('empty-utils', () => {
  describe('getEmptyDescription', () => {
    it.each(presets)('uses the official zh-TW empty segment for "%s"', (preset) => {
      const text = getEmptyDescription(preset, zhTW)
      expect(text).toBeTruthy()
      expect(text).not.toBe('No data')
      expect(text).not.toBe('No data available')
      expect(text).not.toBe('No results found')
      expect(text).not.toBe('Something went wrong')
    })

    it.each(presets)('uses the official ja-JP empty segment for "%s"', (preset) => {
      const text = getEmptyDescription(preset, jaJP)
      expect(text).toBeTruthy()
      expect(text).not.toMatch(/No data|No results|Something went wrong/)
    })

    it('reads the official zh-CN object for default copy', () => {
      expect(getEmptyDescription('default', zhCN)).toBe('暂无数据')
    })

    it('keeps default and simple on the same copy key', () => {
      expect(getEmptyDescription('simple', zhTW)).toBe(getEmptyDescription('default', zhTW))
    })
  })

  describe('resolveEmptyImageMode', () => {
    it('keeps a custom image even when showImage is false', () => {
      expect(
        resolveEmptyImageMode({ showImage: false, hasCustomImage: true, preset: 'default' })
      ).toBe('custom')
    })

    it('hides the built-in illustration for simple', () => {
      expect(
        resolveEmptyImageMode({ showImage: true, hasCustomImage: false, preset: 'simple' })
      ).toBe('none')
    })

    it('shows the built-in illustration for default', () => {
      expect(
        resolveEmptyImageMode({ showImage: true, hasCustomImage: false, preset: 'default' })
      ).toBe('builtin')
    })
  })

  describe('getEmptyIllustration', () => {
    it('returns no built-in mark for simple', () => {
      expect(getEmptyIllustration('simple')).toBeNull()
    })

    it('uses a different mark for error than for default', () => {
      const def = getEmptyIllustration('default')
      const err = getEmptyIllustration('error')
      expect(def).toBeTruthy()
      expect(err).toBeTruthy()
      expect(err!.paths.map((p) => p.d).join('|')).not.toBe(def!.paths.map((p) => p.d).join('|'))
    })

    it('uses a different mark for no-results than for default', () => {
      const def = getEmptyIllustration('default')
      const none = getEmptyIllustration('no-results')
      expect(none!.paths.map((p) => p.d).join('|')).not.toBe(def!.paths.map((p) => p.d).join('|'))
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
    it('default box viewBox is 0 0 64 41', () => {
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
