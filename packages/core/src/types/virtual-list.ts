/**
 * VirtualList item height mode
 */
export type VirtualListItemSize = 'fixed' | 'variable' | 'dynamic'

/**
 * Virtual range result returned by size strategies
 */
export interface VirtualRange {
  startIndex: number
  endIndex: number
  offsetTop: number
  totalHeight: number
}

/**
 * Size strategy interface — the single abstraction consumed by
 * Vue / React VirtualList components.
 *
 * Implementations:
 * - fixedSizeStrategy: all items share the same height
 * - variableSizeStrategy: height per item is known upfront via a function
 * - dynamicSizeStrategy: uses estimatedHeight initially, updates after DOM measurement
 */
export interface VirtualListSizeStrategy {
  /** Compute the visible range given current scroll state */
  getRange(
    scrollTop: number,
    containerHeight: number,
    itemCount: number,
    overscan: number
  ): VirtualRange

  /** Get height for a specific item index */
  getItemHeight(index: number): number

  /** Get the Y offset for a specific item index */
  getItemOffset(index: number): number

  /** Notify the strategy that an item was measured in the DOM (dynamic mode) */
  updateItemHeight?(index: number, measuredHeight: number): void
}

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
  /** Function returning the height for a given index (variable mode) */
  getItemHeight?: (index: number) => number
  /** Custom size strategy — overrides itemSize / itemHeight / getItemHeight */
  sizeStrategy?: VirtualListSizeStrategy
  /** Visible container height (px) */
  height?: number
  /** Overscan count: extra items to render above/below viewport */
  overscan?: number
  /** Custom class name */
  className?: string
}
