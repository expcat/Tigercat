import { classNames } from './class-names'
import type {
  ExclusiveVirtualRange,
  VirtualRange,
  VirtualListSizeStrategy
} from '../types/virtual-list'

/* ------------------------------------------------------------------ */
/*  Style constants                                                    */
/* ------------------------------------------------------------------ */

export const virtualListContainerClasses = classNames(
  'overflow-auto relative',
  'bg-[var(--tiger-surface,#ffffff)]'
)

export const virtualListInnerClasses = 'relative w-full'

export type { ExclusiveVirtualRange, VirtualRange }

const EMPTY_EXCLUSIVE_RANGE: ExclusiveVirtualRange = {
  start: 0,
  end: 0,
  offsetTop: 0,
  totalHeight: 0
}

const EMPTY_INCLUSIVE_RANGE: VirtualRange = {
  startIndex: 0,
  endIndex: -1,
  offsetTop: 0,
  totalHeight: 0
}

function sanitizeRangeInput(
  scrollTop: number,
  viewportHeight: number,
  itemCount: number,
  overscan: number
): {
  scrollTop: number
  viewportHeight: number
  itemCount: number
  overscan: number
} {
  return {
    scrollTop: Number.isFinite(scrollTop) ? Math.max(0, scrollTop) : 0,
    viewportHeight: Number.isFinite(viewportHeight) ? Math.max(0, viewportHeight) : 0,
    itemCount: Number.isFinite(itemCount) ? Math.max(0, Math.floor(itemCount)) : 0,
    overscan: Number.isFinite(overscan) ? Math.max(0, Math.floor(overscan)) : 0
  }
}

/**
 * Exclusive `[start, end)` window for a fixed-height scroller.
 *
 * This is the single row-window helper for VirtualList, VirtualTable, and Table.
 * Overscan is applied once on each side (never `2 * overscan` after start already
 * subtracted overscan).
 */
export function calculateVirtualRange(
  scrollTop: number,
  viewportHeight: number,
  itemCount: number,
  itemHeight: number,
  overscan = 5
): ExclusiveVirtualRange {
  const safe = sanitizeRangeInput(scrollTop, viewportHeight, itemCount, overscan)
  const safeItemHeight = Number.isFinite(itemHeight) ? itemHeight : 0

  if (safe.itemCount === 0 || safeItemHeight <= 0 || safe.viewportHeight <= 0) {
    return EMPTY_EXCLUSIVE_RANGE
  }

  const totalHeight = safe.itemCount * safeItemHeight
  const startRaw = Math.floor(safe.scrollTop / safeItemHeight)
  const visibleCount = Math.ceil(safe.viewportHeight / safeItemHeight)
  const start = Math.max(0, Math.min(safe.itemCount, startRaw - safe.overscan))
  const end = Math.max(start, Math.min(safe.itemCount, startRaw + visibleCount + safe.overscan))

  return {
    start,
    end,
    offsetTop: start * safeItemHeight,
    totalHeight
  }
}

export function exclusiveRangeToInclusive(range: ExclusiveVirtualRange): VirtualRange {
  return {
    startIndex: range.start,
    endIndex: range.end - 1,
    offsetTop: range.offsetTop,
    totalHeight: range.totalHeight
  }
}

/**
 * Inclusive `startIndex..endIndex` window for fixed-height items.
 *
 * Wraps {@link calculateVirtualRange}. Empty windows use `endIndex = -1`.
 */
export function getFixedVirtualRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  itemCount: number,
  overscan: number
): VirtualRange {
  return exclusiveRangeToInclusive(
    calculateVirtualRange(scrollTop, containerHeight, itemCount, itemHeight, overscan)
  )
}

function binarySearchStart(
  offsets: ArrayLike<number>,
  itemCount: number,
  scrollTop: number
): number {
  let lo = 0
  let hi = itemCount - 1
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1
    if ((offsets[mid + 1] ?? 0) <= scrollTop) {
      lo = mid + 1
    } else {
      hi = mid - 1
    }
  }
  return Math.min(lo, itemCount - 1)
}

/**
 * Inclusive window for known per-item offsets (`offsets[i]` = start of item i).
 *
 * `endIndex` is the last item that intersects `[scrollTop, scrollTop + viewport)`.
 */
function getOffsetVirtualRange(
  offsets: ArrayLike<number>,
  itemCount: number,
  scrollTop: number,
  viewportHeight: number,
  overscan: number
): VirtualRange {
  const safe = sanitizeRangeInput(scrollTop, viewportHeight, itemCount, overscan)
  const count = Math.min(safe.itemCount, Math.max(0, offsets.length - 1))
  if (count <= 0) {
    return EMPTY_INCLUSIVE_RANGE
  }

  const totalHeight = offsets[count] ?? 0
  if (safe.viewportHeight <= 0) {
    return { startIndex: 0, endIndex: -1, offsetTop: 0, totalHeight }
  }

  const rawStart = binarySearchStart(offsets, count, safe.scrollTop)
  const viewEnd = safe.scrollTop + safe.viewportHeight
  let lastIntersecting = rawStart
  while (lastIntersecting < count - 1 && (offsets[lastIntersecting + 1] ?? 0) < viewEnd) {
    lastIntersecting++
  }

  const startIndex = Math.max(0, rawStart - safe.overscan)
  const endIndex = Math.min(count - 1, lastIntersecting + safe.overscan)

  return {
    startIndex,
    endIndex,
    offsetTop: offsets[startIndex] ?? 0,
    totalHeight
  }
}

/* ------------------------------------------------------------------ */
/*  Strategy implementations                                           */
/* ------------------------------------------------------------------ */

/**
 * Fixed-size strategy: all items share the same height.
 */
export function fixedSizeStrategy(itemHeight: number): VirtualListSizeStrategy {
  return {
    getRange(scrollTop, containerHeight, itemCount, overscan) {
      return getFixedVirtualRange(scrollTop, containerHeight, itemHeight, itemCount, overscan)
    },
    getItemHeight() {
      return itemHeight
    },
    getItemOffset(index) {
      return index * itemHeight
    }
  }
}

/**
 * Variable-size strategy: height per item is known upfront via a function.
 *
 * Internally builds a prefix-sum offset cache for O(log n) lookups.
 */
export function variableSizeStrategy(
  getHeight: (index: number) => number,
  itemCount: number
): VirtualListSizeStrategy {
  const builtCount = Number.isFinite(itemCount) ? Math.max(0, Math.floor(itemCount)) : 0
  const offsets = new Float64Array(builtCount + 1)
  for (let i = 0; i < builtCount; i++) {
    offsets[i + 1] = offsets[i] + getHeight(i)
  }

  return {
    getRange(scrollTop, containerHeight, rangeItemCount, overscan) {
      const count = rangeItemCount === undefined ? builtCount : Math.min(builtCount, rangeItemCount)
      return getOffsetVirtualRange(offsets, count, scrollTop, containerHeight, overscan)
    },
    getItemHeight(index) {
      return getHeight(index)
    },
    getItemOffset(index) {
      const safeIndex = Math.min(builtCount, Math.max(0, index))
      return offsets[safeIndex] ?? 0
    }
  }
}

/**
 * Dynamic-size strategy: uses estimatedHeight initially, then updates
 * offsets as items are measured in the DOM.
 *
 * `getRange`'s `itemCount` grows or shrinks the offset table without dropping
 * measurements for indexes that still exist (append-safe). Call
 * `updateItemHeight(index, measuredHeight)` after rendering each item.
 */
export function dynamicSizeStrategy(
  estimatedHeight: number,
  initialCount: number
): VirtualListSizeStrategy {
  let itemCount = Number.isFinite(initialCount) ? Math.max(0, Math.floor(initialCount)) : 0
  const measuredHeights = new Map<number, number>()
  let offsets = new Float64Array(itemCount + 1)
  const safeEstimated =
    Number.isFinite(estimatedHeight) && estimatedHeight > 0 ? estimatedHeight : 0
  for (let i = 0; i < itemCount; i++) {
    offsets[i + 1] = offsets[i] + safeEstimated
  }
  let dirtyFrom = itemCount

  function getHeight(index: number): number {
    return measuredHeights.get(index) ?? safeEstimated
  }

  function ensureCount(nextCount: number): void {
    const safe = Number.isFinite(nextCount) ? Math.max(0, Math.floor(nextCount)) : 0
    if (safe === itemCount) return
    if (safe < itemCount) {
      for (const key of [...measuredHeights.keys()]) {
        if (key >= safe) measuredHeights.delete(key)
      }
    }
    const next = new Float64Array(safe + 1)
    const copyLen = Math.min(offsets.length, next.length)
    next.set(offsets.subarray(0, copyLen))
    const rebuildFrom = Math.min(itemCount, safe)
    offsets = next
    itemCount = safe
    dirtyFrom = Math.min(dirtyFrom, rebuildFrom)
  }

  function rebuildOffsets(): void {
    if (dirtyFrom >= itemCount) return
    for (let i = dirtyFrom; i < itemCount; i++) {
      offsets[i + 1] = offsets[i] + getHeight(i)
    }
    dirtyFrom = itemCount
  }

  function getOffset(index: number): number {
    rebuildOffsets()
    const safeIndex = Math.min(itemCount, Math.max(0, index))
    return offsets[safeIndex] ?? 0
  }

  return {
    getRange(scrollTop, containerHeight, rangeItemCount, overscan) {
      ensureCount(rangeItemCount)
      rebuildOffsets()
      return getOffsetVirtualRange(offsets, itemCount, scrollTop, containerHeight, overscan)
    },
    getItemHeight(index) {
      return getHeight(index)
    },
    getItemOffset(index) {
      return getOffset(index)
    },
    updateItemHeight(index, measuredHeight) {
      if (
        index < 0 ||
        index >= itemCount ||
        !Number.isFinite(measuredHeight) ||
        measuredHeight <= 0 ||
        getHeight(index) === measuredHeight
      ) {
        return
      }
      measuredHeights.set(index, measuredHeight)
      dirtyFrom = Math.min(dirtyFrom, index)
    }
  }
}
