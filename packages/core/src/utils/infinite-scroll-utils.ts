/**
 * InfiniteScroll utility functions
 *
 * Pure functions for scroll detection and styling.
 */

// ─── Tailwind class constants ─────────────────────────────────────

export const infiniteScrollContainerClasses = 'tiger-infinite-scroll relative overflow-auto'

export const infiniteScrollLoaderClasses =
  'flex items-center justify-center py-4 text-sm text-[var(--tiger-text-secondary,#6b7280)]'

export const infiniteScrollEndClasses =
  'flex items-center justify-center py-4 text-sm text-[var(--tiger-text-secondary,#6b7280)]'

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
function getLogicalInlineScroll(scrollLeft: number, maxScroll: number, dir: 'ltr' | 'rtl'): number {
  if (dir !== 'rtl') return Math.max(0, scrollLeft)
  if (scrollLeft <= 0) return Math.abs(scrollLeft)
  return Math.max(0, maxScroll - scrollLeft)
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
  /** Scroll direction */
  direction?: 'vertical' | 'horizontal'
  /** Scroll root element. `null` = the sentinel's nearest scrollable ancestor is determined by IO */
  root?: Element | null
  /** Whether the sentinel is placed at the start edge instead of the end edge */
  inverse?: boolean
  /** Called when the sentinel becomes visible (should load more) */
  onLoadMore: () => void
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
    direction = 'vertical',
    root = null,
    inverse = false,
    onLoadMore
  } = options

  const rootMargin =
    direction === 'horizontal'
      ? inverse
        ? `0px 0px 0px ${threshold}px`
        : `0px ${threshold}px 0px 0px`
      : inverse
        ? `${threshold}px 0px 0px 0px`
        : `0px 0px ${threshold}px 0px`

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[entries.length - 1]
      if (entry && entry.isIntersecting) {
        onLoadMore()
      }
    },
    { root, rootMargin, threshold: 0 }
  )

  observer.observe(sentinel)
  return () => observer.disconnect()
}

// ─── Class generators ─────────────────────────────────────────────

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
