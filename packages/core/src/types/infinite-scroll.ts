/**
 * InfiniteScroll types
 *
 * Shared props for the InfiniteScroll wrapper component.
 *
 * Framework events (`onLoadMore` / `load-more`) live on the Vue/React wrappers.
 * `onLoadMore` must synchronously set `loading` to true, or the component
 * blocks a second request until `loading` goes true then false.
 */

import type { TigerLocale } from './locale'

export interface InfiniteScrollProps {
  /** Whether more data is available */
  hasMore?: boolean
  /** Whether a load is currently in progress */
  loading?: boolean
  /**
   * Pixel `rootMargin` before the sentinel intersects (not the IO ratio).
   * The padded edge follows `direction` and `inverse`.
   */
  threshold?: number
  /** Custom loading text */
  loadingText?: string
  /** Custom end text shown when !hasMore */
  endText?: string
  /** Scroll direction */
  direction?: 'vertical' | 'horizontal'
  /** Inverse scroll (load at the start edge, e.g. chat history) */
  inverse?: boolean
  /** Disable the infinite scroll trigger */
  disabled?: boolean
  /**
   * Optional px height. The box must be a scroll container (this prop, class,
   * or style); without a constrained size it will load until `hasMore` is false.
   */
  height?: number
  /**
   * IntersectionObserver root. `'container'` (default) uses this overflow box.
   * `null` uses the viewport for page-level infinite scroll.
   */
  root?: Element | null | 'container'
  locale?: Partial<TigerLocale>
  /** Custom CSS class */
  className?: string
}
