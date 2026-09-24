/**
 * InfiniteScroll types
 *
 * Shared props for the InfiniteScroll wrapper component.
 *
 * Framework events (`onLoadMore` / `load-more`) live on the Vue/React wrappers.
 * One request is in flight until the callback's Promise settles, or until
 * `loading` / `error` says the attempt finished. A callback that never sets
 * `loading` can run again after the sentinel leaves and re-enters.
 */

import type { TigerLocale } from './locale'

export interface InfiniteScrollProps {
  /** Whether more data is available */
  hasMore?: boolean
  /** Whether a load is currently in progress */
  loading?: boolean
  /** The last request failed. The error region stays until this is cleared or retried. */
  error?: boolean
  /** Accessible name and text for the error region. */
  errorText?: string
  /** Accessible name for the retry control shown with `error`. */
  retryText?: string
  /**
   * Pixel `rootMargin` before the sentinel intersects (not the IO ratio).
   * The padded edge follows `direction` and `inverse`.
   */
  threshold?: number
  /** Custom loading text */
  loadingText?: string
  /** Custom end text shown when !hasMore */
  endText?: string
  /** Scroll orientation */
  orientation?: 'vertical' | 'horizontal'
  /** Inverse scroll (load at the start edge, e.g. chat history) */
  inverse?: boolean
  /** Disable the infinite scroll trigger */
  disabled?: boolean
  /**
   * Optional px height. The box must be a scroll container (this prop, class,
   * or style). A container that cannot scroll does not request the next page.
   */
  height?: number
  /**
   * IntersectionObserver root. `null` (default) uses the viewport.
   * `'container'` uses this overflow box.
   */
  root?: Element | null | 'container'
  locale?: Partial<TigerLocale>
  /** Custom CSS class */
  className?: string
}
