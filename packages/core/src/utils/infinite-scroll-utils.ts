/**
 * InfiniteScroll utility functions
 *
 * Pure functions for scroll detection and styling.
 */

// ─── Tailwind class constants ─────────────────────────────────────

export const infiniteScrollContainerClasses = 'tiger-infinite-scroll relative overflow-auto'

export const infiniteScrollLoaderClasses =
  'flex items-center justify-center py-4 text-sm text-[var(--tiger-text-secondary)]'

export const infiniteScrollEndClasses =
  'flex items-center justify-center py-4 text-sm text-[var(--tiger-text-secondary)]'

export const infiniteScrollSentinelClasses = 'tiger-infinite-scroll-sentinel'

// ─── Scroll detection (IntersectionObserver fallback) ─────────────

/**
 * Check whether the scroll position is within the threshold of the end.
 *
 * This is the scroll-event fallback used by InfiniteScroll when
 * `IntersectionObserver` is unavailable (e.g. older browsers or test
 * environments). Prefer `createInfiniteScrollObserver` when IO is present;
 * this function is intentionally retained as the progressive-enhancement
 * fallback path and is not deprecated.
 */
/**
 * Distance from the inline start, in pixels.
 *
 * LTR uses `scrollLeft`. RTL accepts the negative Chrome model and the
 * non-negative Firefox model (`0` is the physical left, which is the inline end).
 */
export function getLogicalInlineScroll(
  scrollLeft: number,
  maxScroll: number,
  dir: 'ltr' | 'rtl'
): number {
  const safeMax = Number.isFinite(maxScroll) ? Math.max(0, maxScroll) : 0
  const safeLeft = Number.isFinite(scrollLeft) ? scrollLeft : 0
  if (dir !== 'rtl') return Math.max(0, safeLeft)
  if (safeLeft <= 0) return Math.abs(safeLeft)
  return Math.max(0, safeMax - safeLeft)
}

/** The scrollport can reveal more content. A short container must not auto-load. */
export function infiniteScrollContainerCanAdvance(
  el: {
    scrollHeight: number
    clientHeight: number
    scrollWidth?: number
    clientWidth?: number
  },
  orientation: 'vertical' | 'horizontal'
): boolean {
  if (orientation === 'horizontal') {
    return (el.scrollWidth ?? 0) - (el.clientWidth ?? 0) > 1
  }
  return el.scrollHeight - el.clientHeight > 1
}

/**
 * rootMargin that preloads the inline start (inverse) or inline end.
 * `top right bottom left`.
 */
export function infiniteScrollRootMargin(input: {
  threshold: number
  orientation: 'vertical' | 'horizontal'
  inverse: boolean
  dir?: 'ltr' | 'rtl'
}): string {
  const threshold = Number.isFinite(input.threshold) ? Math.max(0, input.threshold) : 0
  const edge = `${threshold}px`
  const zero = '0px'
  if (input.orientation === 'vertical') {
    return input.inverse ? `${edge} ${zero} ${zero} ${zero}` : `${zero} ${zero} ${edge} ${zero}`
  }
  const towardEnd = !input.inverse
  const physicalRight = (input.dir ?? 'ltr') === 'rtl' ? !towardEnd : towardEnd
  return physicalRight ? `${zero} ${edge} ${zero} ${zero}` : `${zero} ${zero} ${zero} ${edge}`
}

/**
 * Growth at the inline start should move the scroll offset by the same amount.
 * Growth at the end does not. Horizontal RTL with a negative `scrollLeft`
 * moves further negative.
 */
export function compensateInverseScrollStart(input: {
  orientation: 'vertical' | 'horizontal'
  dir?: 'ltr' | 'rtl'
  previousStart: number | null
  nextStart: number
  scrollTop: number
  scrollLeft: number
}): { scrollTop: number; scrollLeft: number } {
  const previous = input.previousStart
  const delta = previous == null ? 0 : input.nextStart - previous
  if (!(delta > 0)) {
    return { scrollTop: input.scrollTop, scrollLeft: input.scrollLeft }
  }
  if (input.orientation === 'horizontal') {
    const rtlNegative = (input.dir ?? 'ltr') === 'rtl' && input.scrollLeft <= 0
    return {
      scrollTop: input.scrollTop,
      scrollLeft: rtlNegative ? input.scrollLeft - delta : input.scrollLeft + delta
    }
  }
  return { scrollTop: input.scrollTop + delta, scrollLeft: input.scrollLeft }
}

export function shouldLoadMore(
  el: {
    scrollTop: number
    scrollHeight: number
    clientHeight: number
    scrollLeft?: number
    scrollWidth?: number
    clientWidth?: number
  },
  threshold: number,
  direction: 'vertical' | 'horizontal' = 'vertical',
  inverse: boolean = false,
  dir: 'ltr' | 'rtl' = 'ltr'
): boolean {
  if (direction === 'horizontal') {
    const scrollLeft = el.scrollLeft ?? 0
    const scrollWidth = el.scrollWidth ?? 0
    const clientWidth = el.clientWidth ?? 0
    const maxScroll = scrollWidth - clientWidth
    const fromStart = getLogicalInlineScroll(scrollLeft, maxScroll, dir)
    if (inverse) return fromStart <= threshold
    return maxScroll - fromStart <= threshold
  }

  if (inverse) {
    return el.scrollTop <= threshold
  }
  return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold
}

export function getInfiniteScrollSentinelStyle(
  direction: 'vertical' | 'horizontal'
): Record<string, string | number> {
  if (direction === 'horizontal') {
    return { width: '1px', height: '100%', overflow: 'hidden', flexShrink: 0 }
  }
  return { height: '1px', width: '100%', overflow: 'hidden' }
}

export function getInfiniteScrollChromeClasses(
  direction: 'vertical' | 'horizontal',
  base: string
): string {
  return direction === 'horizontal' ? `${base} shrink-0` : base
}

// ─── IntersectionObserver sentinel ────────────────────────────────

export interface InfiniteScrollObserverOptions {
  /** Distance (px) before the sentinel enters the viewport to trigger load */
  threshold?: number
  /** Scroll orientation */
  orientation?: 'vertical' | 'horizontal'
  /** Scroll root element. `null` uses the viewport. */
  root?: Element | null
  /** Whether the sentinel is placed at the inline start instead of the inline end */
  inverse?: boolean
  /** Writing direction. Horizontal preload follows the inline end or start. */
  dir?: 'ltr' | 'rtl'
  /** Called when the sentinel becomes visible (should load more) */
  onLoadMore: () => void
  /** Called when the sentinel leaves the root. */
  onLeave?: () => void
}

/**
 * Create an IntersectionObserver that watches a sentinel element and calls
 * `onLoadMore` when it enters (or is about to enter) the viewport.
 *
 * The `sentinel` should be a zero-height element placed at the boundary
 * where new content would appear (end of list for normal, start for inverse).
 *
 * `threshold` controls how early the callback fires via `rootMargin`.
 *
 * Returns a teardown function. If `IntersectionObserver` is unavailable,
 * returns `null` so callers can fall back to scroll events.
 */
export function createInfiniteScrollObserver(
  sentinel: Element,
  options: InfiniteScrollObserverOptions
): (() => void) | null {
  if (typeof IntersectionObserver === 'undefined') return null

  const {
    threshold = 100,
    orientation = 'vertical',
    root = null,
    inverse = false,
    dir = 'ltr',
    onLoadMore,
    onLeave
  } = options

  const rootMargin = infiniteScrollRootMargin({ threshold, orientation, inverse, dir })

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[entries.length - 1]
      if (!entry) return
      if (entry.isIntersecting) onLoadMore()
      else onLeave?.()
    },
    { root, rootMargin, threshold: 0 }
  )

  observer.observe(sentinel)
  return () => observer.disconnect()
}

// ─── Class generators ─────────────────────────────────────────────

/**
 * One in-flight page load.
 *
 * A returned Promise, or `loading` / `error`, ends the flight. A callback that
 * returns nothing and never sets `loading` does not stay latched. After a
 * success the sentinel must leave the threshold before the next automatic request.
 */
export function createInfiniteScrollFlight() {
  let inFlight = false
  let awaitingExit = false
  let generation = 0

  return {
    get inFlight() {
      return inFlight
    },
    get awaitingExit() {
      return awaitingExit
    },
    canRequest(input: { disabled?: boolean; hasMore?: boolean; error?: boolean; loading?: boolean }) {
      if (input.disabled || input.hasMore === false || input.error || input.loading) return false
      if (inFlight || awaitingExit) return false
      return true
    },
    begin(result: unknown) {
      const token = ++generation
      if (result && typeof (result as { then?: unknown }).then === 'function') {
        inFlight = true
        const promise = result as Promise<unknown>
        promise.then(
          () => {
            if (token !== generation) return
            inFlight = false
            awaitingExit = true
          },
          () => {
            if (token !== generation) return
            inFlight = false
          }
        )
        return
      }
      awaitingExit = true
    },
    noteLoading(loading: boolean, wasLoading: boolean) {
      if (loading) {
        inFlight = true
        return
      }
      if (wasLoading && !loading) {
        inFlight = false
        awaitingExit = true
      }
    },
    noteError() {
      inFlight = false
      awaitingExit = false
      generation += 1
    },
    noteSentinel(intersecting: boolean) {
      if (!intersecting) awaitingExit = false
    },
    reset() {
      inFlight = false
      awaitingExit = false
      generation += 1
    }
  }
}

export function getInfiniteScrollContainerClasses(
  direction: 'vertical' | 'horizontal',
  className?: string
): string {
  const parts = [infiniteScrollContainerClasses]
  if (direction === 'horizontal') {
    parts.push('flex flex-row flex-nowrap min-w-0')
  }
  if (className) parts.push(className)
  return parts.join(' ')
}
