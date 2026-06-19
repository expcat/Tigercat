/**
 * InfiniteScroll utility functions
 *
 * Pure functions for scroll detection and styling.
 */

// ─── Tailwind class constants ─────────────────────────────────────

export const infiniteScrollContainerClasses = 'tiger-infinite-scroll relative overflow-auto'

export const infiniteScrollLoaderClasses =
  'flex items-center justify-center py-4 text-sm text-[var(--tiger-text-muted,#9ca3af)]'

export const infiniteScrollEndClasses =
  'flex items-center justify-center py-4 text-sm text-[var(--tiger-text-muted,#9ca3af)]'

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
  inverse: boolean = false
): boolean {
  if (direction === 'horizontal') {
    const scrollLeft = el.scrollLeft ?? 0
    const scrollWidth = el.scrollWidth ?? 0
    const clientWidth = el.clientWidth ?? 0
    if (inverse) {
      return scrollLeft <= threshold
    }
    return scrollWidth - scrollLeft - clientWidth <= threshold
  }

  if (inverse) {
    return el.scrollTop <= threshold
  }
  return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold
}

// ─── IntersectionObserver sentinel ────────────────────────────────

export interface InfiniteScrollObserverOptions {
  /** Distance (px) before the sentinel enters the viewport to trigger load */
  threshold?: number
  /** Scroll direction */
  direction?: 'vertical' | 'horizontal'
  /** Scroll root element. `null` = the sentinel's nearest scrollable ancestor is determined by IO */
  root?: Element | null
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

  const { threshold = 100, direction = 'vertical', root = null, onLoadMore } = options

  const rootMargin =
    direction === 'horizontal' ? `0px ${threshold}px 0px 0px` : `0px 0px ${threshold}px 0px`

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
    parts.push('flex flex-row')
  }
  if (className) parts.push(className)
  return parts.join(' ')
}
