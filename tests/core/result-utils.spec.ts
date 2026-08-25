import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import {
  resultBaseClasses,
  resultIconContainerBaseClasses,
  resultIconClasses,
  resultTitleClasses,
  resultSubTitleClasses,
  resultExtraClasses,
  getResultColorScheme,
  getResultIconPath,
  isHttpResultStatus
} from '@expcat/tigercat-core'
import type { ResultStatus } from '@expcat/tigercat-core'

describe('result-utils', () => {
  it('base classes include centering', () => {
    expect(resultBaseClasses).toContain('items-center')
    expect(resultBaseClasses).toContain('text-center')
  })

  it('icon container includes rounded-full', () => {
    expect(resultIconContainerBaseClasses).toContain('rounded-full')
  })

  it('icon classes include sizing', () => {
    expect(resultIconClasses).toContain('h-16')
    expect(resultIconClasses).toContain('w-16')
  })

  it('title classes include font-semibold', () => {
    expect(resultTitleClasses).toContain('font-semibold')
  })

  it('subtitle classes include secondary text color', () => {
    expect(resultSubTitleClasses).toContain('text-')
  })

  it('extra classes include flex layout', () => {
    expect(resultExtraClasses).toContain('flex')
  })

  describe('getResultColorScheme', () => {
    const statuses: ResultStatus[] = ['success', 'error', 'warning', 'info', '404', '403', '500']

    for (const status of statuses) {
      it(`returns color scheme for "${status}"`, () => {
        const scheme = getResultColorScheme(status)
        expect(scheme).toHaveProperty('iconBg')
        expect(scheme).toHaveProperty('iconColor')
        expect(scheme).toHaveProperty('titleColor')
        expect(scheme.iconBg).toBeTruthy()
        expect(scheme.iconColor).toBeTruthy()
      })
    }

    it('HTTP error statuses reuse semantic colors', () => {
      expect(getResultColorScheme('404').iconColor).toBe(getResultColorScheme('info').iconColor)
      expect(getResultColorScheme('403').iconColor).toBe(getResultColorScheme('warning').iconColor)
      expect(getResultColorScheme('500').iconColor).toBe(getResultColorScheme('error').iconColor)
    })
  })

  describe('getResultIconPath', () => {
    it('returns non-empty SVG path for each status', () => {
      const statuses: ResultStatus[] = ['success', 'error', 'warning', 'info', '404', '403', '500']
      for (const status of statuses) {
        expect(getResultIconPath(status)).toBeTruthy()
        expect(typeof getResultIconPath(status)).toBe('string')
      }
    })

    it('HTTP error statuses share icon paths with semantic statuses', () => {
      expect(getResultIconPath('404')).toBe(getResultIconPath('info'))
      expect(getResultIconPath('403')).toBe(getResultIconPath('warning'))
      expect(getResultIconPath('500')).toBe(getResultIconPath('error'))
    })
  })

  describe('isHttpResultStatus', () => {
    it('returns true for HTTP error statuses', () => {
      expect(isHttpResultStatus('404')).toBe(true)
      expect(isHttpResultStatus('403')).toBe(true)
      expect(isHttpResultStatus('500')).toBe(true)
    })

    it('returns false for non-HTTP statuses', () => {
      expect(isHttpResultStatus('success')).toBe(false)
      expect(isHttpResultStatus('error')).toBe(false)
      expect(isHttpResultStatus('info')).toBe(false)
      expect(isHttpResultStatus('warning')).toBe(false)
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
