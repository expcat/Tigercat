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
  /**
   * Fixed item height in px. Used when `getItemHeight` and
   * `estimatedItemHeight` are omitted. Ignored when `estimatedItemHeight` is set.
   */
  itemHeight?: number
  /**
   * Estimated item height for dynamic measurement. When set (and
   * `getItemHeight` is not), the list measures rendered items and writes
   * heights back through the size strategy.
   */
  estimatedItemHeight?: number
  /** Known height per index (variable mode). Takes precedence over estimated/fixed. */
  getItemHeight?: (index: number) => number
  /**
   * Custom size strategy. Overrides `itemHeight` / `getItemHeight` /
   * `estimatedItemHeight`. If the strategy implements `updateItemHeight`,
   * visible items are measured after each window commit.
   */
  sizeStrategy?: VirtualListSizeStrategy
  /**
   * Visible container height in px (not `%`, not observed from the parent).
   * @default 400
   */
  height?: number
  /** Extra items to render above and below the viewport (each side, not doubled). */
  overscan?: number
  /** Stable key for an index. Defaults to the index. */
  getItemKey?: (index: number) => string | number
  /** Accessible name for the scrollable list. */
  ariaLabel?: string
  /** Custom class name */
  className?: string
}

/**
 * Imperative handle exposed by Vue/React VirtualList.
 *
 * `scrollToIndex(i)` sets `scrollTop` to the item's offset (item aligned to
 * the top of the viewport).
 */
export interface VirtualListHandle {
  scrollToIndex: (index: number) => void
  scrollToOffset: (offset: number) => void
  getScrollElement: () => HTMLElement | null
}
