import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import {
  RESULT_ICON_SIZE_PX,
  getResultColorScheme,
  getResultIconPath,
  isHttpResultStatus,
  resultHeadingTag,
  resolveResultHeadingLevel
} from '@expcat/tigercat-core'

describe('result-utils', () => {
  describe('getResultColorScheme', () => {
    it('washes the status hue instead of painting a solid fill', () => {
      const scheme = getResultColorScheme('success')
      expect(scheme.iconBg).toContain('color-mix')
      expect(scheme.iconBg).toContain('#16a34a')
      expect(scheme.iconBg).not.toBe('#16a34a')
    })

    it('aligns fallback hex with the Alert semantic tokens', () => {
      expect(getResultColorScheme('success').iconColor).toContain('#16a34a')
      expect(getResultColorScheme('warning').iconColor).toContain('#d97706')
      expect(getResultColorScheme('error').iconColor).toContain('#dc2626')
    })

    it('falls back to info for unknown status', () => {
      expect(getResultColorScheme('foo').iconColor).toBe(getResultColorScheme('info').iconColor)
      expect(getResultColorScheme('').iconColor).toBe(getResultColorScheme('info').iconColor)
    })
  })

  describe('getResultIconPath', () => {
    it('returns a path for semantic statuses', () => {
      for (const status of ['success', 'error', 'warning', 'info'] as const) {
        expect(getResultIconPath(status).length).toBeGreaterThan(0)
      }
    })

    it('falls back to info for unknown status', () => {
      expect(getResultIconPath('foo')).toBe(getResultIconPath('info'))
    })
  })

  describe('isHttpResultStatus', () => {
    it('returns true for HTTP error statuses', () => {
      expect(isHttpResultStatus('404')).toBe(true)
      expect(isHttpResultStatus('403')).toBe(true)
      expect(isHttpResultStatus('500')).toBe(true)
    })

    it('returns false for non-HTTP and unknown statuses', () => {
      expect(isHttpResultStatus('success')).toBe(false)
      expect(isHttpResultStatus('foo')).toBe(false)
      expect(isHttpResultStatus('')).toBe(false)
    })
  })

  describe('heading', () => {
    it('defaults to h2 and clamps unknown levels', () => {
      expect(resolveResultHeadingLevel()).toBe(2)
      expect(resolveResultHeadingLevel(7)).toBe(2)
      expect(resultHeadingTag(1)).toBe('h1')
      expect(resultHeadingTag(3)).toBe('h3')
    })
  })

  describe('icon geometry', () => {
    it('uses an equal width and height for the circle', () => {
      expect(RESULT_ICON_SIZE_PX).toBeGreaterThan(0)
      expect(RESULT_ICON_SIZE_PX).toBe(RESULT_ICON_SIZE_PX)
    })
  })

  describe('result/02 demo viewport', () => {
    it.each([
      'examples/example/vue3/src/examples/result/02/demo.json',
      'examples/example/react/src/examples/result/02/demo.json'
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
})
