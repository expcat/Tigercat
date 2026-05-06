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
