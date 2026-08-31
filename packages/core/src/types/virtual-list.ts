/**
 * Exclusive `[start, end)` window shared by VirtualList, VirtualTable, and Table.
 *
 * Overscan is applied symmetrically: `start = startRaw - overscan`,
 * `end = startRaw + visibleCount + overscan`.
 */
export interface ExclusiveVirtualRange {
  /** First visible index (inclusive) */
  start: number
  /** One past the last visible index (exclusive). `0` when the window is empty. */
  end: number
  /** Offset in px from top for the first rendered item */
  offsetTop: number
  /** Total scrollable height in px */
  totalHeight: number
}

/**
 * Inclusive window consumed by VirtualList / Select / Cascader render loops
 * (`for (i = startIndex; i <= endIndex)`). Empty windows use `endIndex = -1`.
 */
export interface VirtualRange {
  /** First visible index (inclusive) */
  startIndex: number
  /** Last visible index (inclusive). `-1` when the window is empty. */
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
