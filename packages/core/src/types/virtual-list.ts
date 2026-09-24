/**
 * Exclusive `[start, end)` window shared by VirtualList, VirtualTable, and Table.
 *
 * The exclusive end is `ceil((scrollTop + viewport) / itemHeight) + overscan`.
 * Overscan is applied once on each side.
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

  /**
   * Record a measured margin-box height. Dynamic strategy keys this by
   * `itemKey` (or the index when no id has been bound).
   */
  updateItemHeight?(index: number, measuredHeight: number, itemKey?: string | number): void

  /** Bind the current id for each index. Dynamic measurements follow these ids. */
  setItemKeys?(keys: readonly (string | number)[]): void

  /**
   * Refresh known variable heights without rebuilding when every height matches.
   * Inline `getItemHeight` functions must go through this instead of a new strategy.
   */
  syncHeights?(getHeight: (index: number) => number, itemCount: number): void

  /** Remember which id should stay at the same distance from the viewport top. */
  noteAnchor?(key: string | number, scrollTop: number): void

  /** Scroll offset that keeps the last {@link noteAnchor} id in place, once. */
  consumeAnchorScrollTop?(): number | null
}

/** Where `scrollToIndex` places the item inside the viewport. */
export type VirtualScrollAlign = 'auto' | 'start' | 'center' | 'end'

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
 * `scrollToIndex(i)` defaults to `start` (item top at the viewport top).
 * `auto` keeps `scrollTop` when the item already intersects the viewport.
 */
export interface VirtualListHandle {
  scrollToIndex: (index: number, align?: VirtualScrollAlign) => void
  scrollToOffset: (offset: number) => void
  getScrollElement: () => HTMLElement | null
}
