/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  ASPECT_RATIO_DEFAULT,
  aspectRatioContentClasses,
  aspectRatioRootClasses,
  getAspectRatioContentClasses,
  getAspectRatioRootClasses,
  getAspectRatioStyle,
  parseAspectRatio
} from '@expcat/tigercat-core'

describe('aspect-ratio-utils', () => {
  describe('parseAspectRatio', () => {
    it('accepts positive finite numbers', () => {
      expect(parseAspectRatio(16 / 9)).toBeCloseTo(1.777778)
      expect(parseAspectRatio(1)).toBe(1)
      expect(parseAspectRatio(0.5)).toBe(0.5)
    })

    it('parses fraction strings', () => {
      expect(parseAspectRatio('16/9')).toBeCloseTo(16 / 9)
      expect(parseAspectRatio('4/3')).toBeCloseTo(4 / 3)
      expect(parseAspectRatio('1/1')).toBe(1)
    })

    it('parses fraction strings with whitespace and decimals', () => {
      expect(parseAspectRatio('16 / 9')).toBeCloseTo(16 / 9)
      expect(parseAspectRatio(' 16/9 ')).toBeCloseTo(16 / 9)
      expect(parseAspectRatio('1.5/2')).toBe(0.75)
    })

    it('parses plain numeric strings', () => {
      expect(parseAspectRatio('1.5')).toBe(1.5)
      expect(parseAspectRatio('2')).toBe(2)
      expect(parseAspectRatio(' 0.75 ')).toBe(0.75)
    })

    it('falls back to the default for invalid numbers', () => {
      const fallback = parseAspectRatio(ASPECT_RATIO_DEFAULT)
      expect(parseAspectRatio(0)).toBe(fallback)
      expect(parseAspectRatio(-1)).toBe(fallback)
      expect(parseAspectRatio(Number.NaN)).toBe(fallback)
      expect(parseAspectRatio(Number.POSITIVE_INFINITY)).toBe(fallback)
    })

    it('falls back to the default for invalid strings', () => {
      const fallback = parseAspectRatio(ASPECT_RATIO_DEFAULT)
      expect(parseAspectRatio('abc')).toBe(fallback)
      expect(parseAspectRatio('')).toBe(fallback)
      expect(parseAspectRatio('16/0')).toBe(fallback)
      expect(parseAspectRatio('0/16')).toBe(fallback)
      expect(parseAspectRatio('-16/9')).toBe(fallback)
      expect(parseAspectRatio('16/')).toBe(fallback)
      expect(parseAspectRatio('/9')).toBe(fallback)
      expect(parseAspectRatio('16/9px')).toBe(fallback)
    })

    it('falls back for undefined input and honors a custom fallback', () => {
      expect(parseAspectRatio(undefined, 4)).toBe(4)
      expect(parseAspectRatio('bad', 4)).toBe(4)
      expect(parseAspectRatio('16/9', 4)).toBeCloseTo(16 / 9)
    })
  })

  describe('getAspectRatioStyle', () => {
    it('preserves fraction strings as CSS fractions', () => {
      expect(getAspectRatioStyle('16/9')).toEqual({ aspectRatio: '16 / 9' })
      expect(getAspectRatioStyle('1.5/2')).toEqual({ aspectRatio: '1.5 / 2' })
      expect(getAspectRatioStyle(' 21 / 9 ')).toEqual({ aspectRatio: '21 / 9' })
    })

    it('emits numeric inputs as plain CSS numbers', () => {
      expect(getAspectRatioStyle(1.5)).toEqual({ aspectRatio: '1.5' })
      expect(getAspectRatioStyle(1)).toEqual({ aspectRatio: '1' })
      expect(getAspectRatioStyle('0.75')).toEqual({ aspectRatio: '0.75' })
    })

    it('applies the default ratio when input is missing or invalid', () => {
      expect(getAspectRatioStyle()).toEqual({ aspectRatio: '16 / 9' })
      expect(getAspectRatioStyle('nope')).toEqual(getAspectRatioStyle(ASPECT_RATIO_DEFAULT))
    })
  })

  describe('class helpers', () => {
    it('clips the ratio box by default', () => {
      expect(aspectRatioRootClasses).toContain('overflow-hidden')
      expect(aspectRatioContentClasses).toContain('absolute')
      expect(aspectRatioContentClasses).toContain('inset-0')
    })

    it('appends extra class names after the base classes', () => {
      expect(getAspectRatioRootClasses('rounded-lg')).toBe(aspectRatioRootClasses + ' rounded-lg')
      expect(getAspectRatioContentClasses('p-2')).toBe(aspectRatioContentClasses + ' p-2')
    })

    it('returns the bare base classes without extras', () => {
      expect(getAspectRatioRootClasses()).toBe(aspectRatioRootClasses)
      expect(getAspectRatioRootClasses(undefined)).toBe(aspectRatioRootClasses)
      expect(getAspectRatioContentClasses()).toBe(aspectRatioContentClasses)
    })
  })
})
