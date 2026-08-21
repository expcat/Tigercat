/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  clampMasonryColumnCount,
  clampMasonryGap,
  computeMasonryColumnHeights,
  distributeMasonryItems,
  getMasonryColumnClasses,
  getMasonryColumnStyle,
  getMasonryGapStyle,
  getMasonryItemClasses,
  getMasonryRootClasses,
  moduloDistributeMasonryItems,
  readMasonryItemHeight,
  resolveMasonryColumnCount,
  resolveMasonryGap
} from '@expcat/tigercat-core'

describe('masonry-utils', () => {
  describe('clampMasonryColumnCount', () => {
    it('passes through valid positive integers', () => {
      expect(clampMasonryColumnCount(1)).toBe(1)
      expect(clampMasonryColumnCount(6)).toBe(6)
    })

    it('clamps invalid values to 1', () => {
      expect(clampMasonryColumnCount(0)).toBe(1)
      expect(clampMasonryColumnCount(-4)).toBe(1)
      expect(clampMasonryColumnCount(Number.NaN)).toBe(1)
      expect(clampMasonryColumnCount(Number.POSITIVE_INFINITY)).toBe(1)
    })

    it('floors fractional counts', () => {
      expect(clampMasonryColumnCount(2.9)).toBe(2)
      expect(clampMasonryColumnCount(0.5)).toBe(1)
    })
  })

  describe('clampMasonryGap', () => {
    it('passes through non-negative gaps', () => {
      expect(clampMasonryGap(0)).toBe(0)
      expect(clampMasonryGap(24)).toBe(24)
    })

    it('clamps invalid values to 0', () => {
      expect(clampMasonryGap(-8)).toBe(0)
      expect(clampMasonryGap(Number.NaN)).toBe(0)
    })
  })

  describe('resolveMasonryColumnCount', () => {
    it('falls back to the default when undefined', () => {
      expect(resolveMasonryColumnCount(undefined, 800)).toBe(3)
    })

    it('returns plain numbers untouched', () => {
      expect(resolveMasonryColumnCount(2, 800)).toBe(2)
      expect(resolveMasonryColumnCount(0, 800)).toBe(1)
    })

    it('resolves breakpoint maps by width', () => {
      const columns = { xs: 1, md: 3, lg: 4 }
      expect(resolveMasonryColumnCount(columns, 320)).toBe(1)
      expect(resolveMasonryColumnCount(columns, 768)).toBe(3)
      expect(resolveMasonryColumnCount(columns, 1024)).toBe(4)
      expect(resolveMasonryColumnCount(columns, 1920)).toBe(4)
    })

    it('falls back when no breakpoint matches above the map', () => {
      expect(resolveMasonryColumnCount({ sm: 2 }, 100)).toBe(3)
    })
  })

  describe('resolveMasonryGap', () => {
    it('falls back to the default when undefined', () => {
      expect(resolveMasonryGap(undefined, 800)).toBe(16)
    })

    it('resolves breakpoint maps and clamps negatives', () => {
      expect(resolveMasonryGap({ xs: 8, md: 24 }, 320)).toBe(8)
      expect(resolveMasonryGap({ xs: 8, md: 24 }, 900)).toBe(24)
      expect(resolveMasonryGap(-4, 800)).toBe(0)
    })
  })

  describe('distributeMasonryItems', () => {
    it('packs each item into the currently shortest column', () => {
      // 100 → col0 (tie, leftmost); 50 → col1; 150 → col1 (50 < 100); 10 → col0 (100 < 200)
      const columns = distributeMasonryItems([100, 50, 150, 10], 2)
      expect(columns).toEqual([
        [0, 3],
        [1, 2]
      ])
    })

    it('breaks height ties toward the leftmost column', () => {
      expect(distributeMasonryItems([10, 10, 10, 10], 2)).toEqual([
        [0, 2],
        [1, 3]
      ])
    })

    it('keeps item order within a column', () => {
      const columns = distributeMasonryItems([100, 90, 80, 70, 60], 1)
      expect(columns).toEqual([[0, 1, 2, 3, 4]])
    })

    it('treats non-finite heights as zero', () => {
      const columns = distributeMasonryItems([Number.NaN, 40, Number.POSITIVE_INFINITY], 2)
      // NaN and +Infinity both pack as height 0, so ties stay leftmost
      expect(columns).toEqual([[0, 1], [2]])
    })

    it('returns empty columns for no items', () => {
      expect(distributeMasonryItems([], 3)).toEqual([[], [], []])
    })

    it('clamps the column count', () => {
      expect(distributeMasonryItems([10, 20], 0)).toEqual([[0, 1]])
      expect(distributeMasonryItems([10, 20], -2)).toEqual([[0, 1]])
    })
  })

  describe('moduloDistributeMasonryItems', () => {
    it('deals items round-robin before measurement', () => {
      expect(moduloDistributeMasonryItems(5, 2)).toEqual([
        [0, 2, 4],
        [1, 3]
      ])
    })

    it('returns empty columns for no items', () => {
      expect(moduloDistributeMasonryItems(0, 3)).toEqual([[], [], []])
    })

    it('clamps the column count', () => {
      expect(moduloDistributeMasonryItems(2, -1)).toEqual([[0, 1]])
    })
  })

  describe('computeMasonryColumnHeights', () => {
    it('sums item heights plus inner gaps', () => {
      const heights = [100, 50, 150, 10]
      const columns = [
        [0, 3],
        [1, 2]
      ]
      expect(computeMasonryColumnHeights(heights, columns, 16)).toEqual([126, 216])
    })

    it('returns zero for empty columns', () => {
      expect(computeMasonryColumnHeights([10], [[]], 16)).toEqual([0])
    })
  })

  describe('readMasonryItemHeight', () => {
    it('reads the bounding rect height', () => {
      expect(readMasonryItemHeight({ getBoundingClientRect: () => ({ height: 128 }) })).toBe(128)
    })

    it('treats non-finite heights as zero', () => {
      expect(readMasonryItemHeight({ getBoundingClientRect: () => ({ height: Number.NaN }) })).toBe(
        0
      )
    })
  })

  describe('class and style builders', () => {
    it('joins custom class names onto the base classes', () => {
      expect(getMasonryRootClasses('px-2')).toContain('tiger-masonry')
      expect(getMasonryRootClasses('px-2')).toContain('px-2')
      expect(getMasonryColumnClasses('bordered')).toContain('tiger-masonry-column')
      expect(getMasonryItemClasses('mb-4')).toContain('tiger-masonry-item')
      expect(getMasonryRootClasses()).toBe('tiger-masonry flex w-full items-start')
    })

    it('builds the inline gap style with clamping', () => {
      expect(getMasonryGapStyle(24)).toEqual({ gap: '24px' })
      expect(getMasonryGapStyle(-4)).toEqual({ gap: '0px' })
    })

    it('builds the column row-gap style with clamping', () => {
      expect(getMasonryColumnStyle(24)).toEqual({ rowGap: '24px' })
      expect(getMasonryColumnStyle(-4)).toEqual({ rowGap: '0px' })
    })
  })
})
