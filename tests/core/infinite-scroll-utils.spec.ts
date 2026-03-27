import { describe, it, expect } from 'vitest'
import {
  shouldLoadMore,
  getInfiniteScrollContainerClasses,
  infiniteScrollContainerClasses
} from '@expcat/tigercat-core'

describe('infinite-scroll-utils', () => {
  // ─── shouldLoadMore ───────────────────────────────────────

  describe('shouldLoadMore — vertical', () => {
    const el = (scrollTop: number, scrollHeight: number, clientHeight: number) => ({
      scrollTop,
      scrollHeight,
      clientHeight
    })

    it('returns true when near bottom', () => {
      expect(shouldLoadMore(el(800, 1000, 200), 100)).toBe(true)
    })

    it('returns false when far from bottom', () => {
      expect(shouldLoadMore(el(0, 1000, 200), 100)).toBe(false)
    })

    it('returns true at exact threshold', () => {
      // remaining = 1000 - 800 - 100 = 100 <= 100 → true
      expect(shouldLoadMore(el(800, 1000, 100), 100)).toBe(true)
    })

    it('returns true when scrolled to bottom', () => {
      expect(shouldLoadMore(el(800, 1000, 200), 0)).toBe(true)
    })
  })

  describe('shouldLoadMore — vertical inverse', () => {
    const el = (scrollTop: number) => ({
      scrollTop,
      scrollHeight: 1000,
      clientHeight: 200
    })

    it('returns true when near top', () => {
      expect(shouldLoadMore(el(50), 100, 'vertical', true)).toBe(true)
    })

    it('returns false when far from top', () => {
      expect(shouldLoadMore(el(500), 100, 'vertical', true)).toBe(false)
    })
  })

  describe('shouldLoadMore — horizontal', () => {
    it('returns true when near right edge', () => {
      const el = {
        scrollTop: 0,
        scrollHeight: 0,
        clientHeight: 0,
        scrollLeft: 700,
        scrollWidth: 1000,
        clientWidth: 200
      }
      expect(shouldLoadMore(el, 100, 'horizontal')).toBe(true)
    })

    it('returns false when far from right edge', () => {
      const el = {
        scrollTop: 0,
        scrollHeight: 0,
        clientHeight: 0,
        scrollLeft: 100,
        scrollWidth: 1000,
        clientWidth: 200
      }
      expect(shouldLoadMore(el, 100, 'horizontal')).toBe(false)
    })

    it('inverse: checks left edge', () => {
      const el = {
        scrollTop: 0,
        scrollHeight: 0,
        clientHeight: 0,
        scrollLeft: 30,
        scrollWidth: 1000,
        clientWidth: 200
      }
      expect(shouldLoadMore(el, 100, 'horizontal', true)).toBe(true)
    })
  })

  // ─── getInfiniteScrollContainerClasses ────────────────────

  describe('getInfiniteScrollContainerClasses', () => {
    it('returns base classes for vertical', () => {
      const cls = getInfiniteScrollContainerClasses('vertical')
      expect(cls).toContain(infiniteScrollContainerClasses)
      expect(cls).not.toContain('flex-row')
    })

    it('adds flex-row for horizontal', () => {
      const cls = getInfiniteScrollContainerClasses('horizontal')
      expect(cls).toContain('flex flex-row')
    })

    it('appends custom className', () => {
      const cls = getInfiniteScrollContainerClasses('vertical', 'my-cls')
      expect(cls).toContain('my-cls')
    })
  })
})
