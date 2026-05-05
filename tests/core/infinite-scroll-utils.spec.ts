import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  shouldLoadMore,
  getInfiniteScrollContainerClasses,
  infiniteScrollContainerClasses,
  infiniteScrollSentinelClasses,
  createInfiniteScrollObserver
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

  // ─── infiniteScrollSentinelClasses ────────────────────────

  describe('infiniteScrollSentinelClasses', () => {
    it('is a non-empty string', () => {
      expect(typeof infiniteScrollSentinelClasses).toBe('string')
      expect(infiniteScrollSentinelClasses.length).toBeGreaterThan(0)
    })
  })

  // ─── createInfiniteScrollObserver ─────────────────────────

  describe('createInfiniteScrollObserver', () => {
    let originalIO: typeof IntersectionObserver
    let mockObserve: ReturnType<typeof vi.fn>
    let mockDisconnect: ReturnType<typeof vi.fn>
    let lastCallback: IntersectionObserverCallback
    let lastOptions: IntersectionObserverInit | undefined

    beforeEach(() => {
      originalIO = globalThis.IntersectionObserver
      mockObserve = vi.fn()
      mockDisconnect = vi.fn()

      // Must be a real constructor (class), not vi.fn()
      globalThis.IntersectionObserver = class MockIO {
        constructor(cb: IntersectionObserverCallback, opts?: IntersectionObserverInit) {
          lastCallback = cb
          lastOptions = opts
        }
        observe = mockObserve
        disconnect = mockDisconnect
        unobserve = vi.fn()
        root = null
        rootMargin = ''
        thresholds = [] as number[]
        takeRecords = vi.fn()
      } as unknown as typeof IntersectionObserver
    })

    afterEach(() => {
      globalThis.IntersectionObserver = originalIO
    })

    it('creates observer and observes sentinel', () => {
      const sentinel = document.createElement('div')
      const onLoadMore = vi.fn()
      const teardown = createInfiniteScrollObserver(sentinel, { onLoadMore })
      expect(teardown).toBeTypeOf('function')
      expect(mockObserve).toHaveBeenCalledWith(sentinel)
    })

    it('calls onLoadMore when sentinel intersects', () => {
      const sentinel = document.createElement('div')
      const onLoadMore = vi.fn()
      createInfiniteScrollObserver(sentinel, { onLoadMore })

      lastCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
      expect(onLoadMore).toHaveBeenCalledOnce()
    })

    it('does not call onLoadMore when not intersecting', () => {
      const sentinel = document.createElement('div')
      const onLoadMore = vi.fn()
      createInfiniteScrollObserver(sentinel, { onLoadMore })

      lastCallback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
      expect(onLoadMore).not.toHaveBeenCalled()
    })

    it('teardown disconnects observer', () => {
      const sentinel = document.createElement('div')
      const teardown = createInfiniteScrollObserver(sentinel, { onLoadMore: vi.fn() })
      teardown!()
      expect(mockDisconnect).toHaveBeenCalledOnce()
    })

    it('uses vertical rootMargin by default', () => {
      const sentinel = document.createElement('div')
      createInfiniteScrollObserver(sentinel, { onLoadMore: vi.fn(), threshold: 200 })
      expect(lastOptions?.rootMargin).toBe('0px 0px 200px 0px')
    })

    it('uses horizontal rootMargin', () => {
      const sentinel = document.createElement('div')
      createInfiniteScrollObserver(sentinel, {
        onLoadMore: vi.fn(),
        threshold: 150,
        direction: 'horizontal'
      })
      expect(lastOptions?.rootMargin).toBe('0px 150px 0px 0px')
    })

    it('passes root to observer options', () => {
      const sentinel = document.createElement('div')
      const root = document.createElement('div')
      createInfiniteScrollObserver(sentinel, { onLoadMore: vi.fn(), root })
      expect(lastOptions?.root).toBe(root)
    })

    it('returns null when IntersectionObserver is unavailable', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).IntersectionObserver
      const sentinel = document.createElement('div')
      const result = createInfiniteScrollObserver(sentinel, { onLoadMore: vi.fn() })
      expect(result).toBeNull()
    })
  })
})
