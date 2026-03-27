/**
 * InfiniteScroll types
 *
 * Shared props for the InfiniteScroll wrapper component.
 */

export interface InfiniteScrollProps {
  /** Whether more data is available */
  hasMore?: boolean
  /** Whether a load is currently in progress */
  loading?: boolean
  /** Distance (px) from bottom to trigger load */
  threshold?: number
  /** Custom loading text */
  loadingText?: string
  /** Custom end text shown when !hasMore */
  endText?: string
  /** Scroll direction */
  direction?: 'vertical' | 'horizontal'
  /** Inverse scroll (load at top, e.g. chat) */
  inverse?: boolean
  /** Disable the infinite scroll trigger */
  disabled?: boolean
  /** Custom CSS class */
  className?: string
}
