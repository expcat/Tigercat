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

// ─── Scroll detection ─────────────────────────────────────────────

/**
 * Check whether the scroll position is within the threshold of the end.
 *
 * For vertical scroll: checks distance from the bottom.
 * For horizontal scroll: checks distance from the right.
 * For inverse: checks distance from the top/left.
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
