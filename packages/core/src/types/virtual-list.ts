/**
 * VirtualList item height mode
 */
export type VirtualListItemSize = 'fixed' | 'variable'

/**
 * Shared VirtualList props (framework-agnostic)
 */
export interface VirtualListProps {
  /** Total number of items */
  itemCount?: number
  /** Fixed item height (px) — used when itemSize is 'fixed' */
  itemHeight?: number
  /** Estimated item height for variable-height mode */
  estimatedItemHeight?: number
  /** Visible container height (px) */
  height?: number
  /** Overscan count: extra items to render above/below viewport */
  overscan?: number
  /** Custom class name */
  className?: string
}
