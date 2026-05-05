import { classNames } from './class-names'
import type { VirtualRange, VirtualListSizeStrategy } from '../types/virtual-list'

/* ------------------------------------------------------------------ */
/*  Style constants                                                    */
/* ------------------------------------------------------------------ */

export const virtualListContainerClasses = classNames(
  'overflow-auto relative',
  'bg-[var(--tiger-virtuallist-bg,var(--tiger-surface,#ffffff))]'
)

export const virtualListInnerClasses = 'relative w-full'

/* ------------------------------------------------------------------ */
/*  Legacy range calculation (kept for backward compatibility)         */
/* ------------------------------------------------------------------ */

export type { VirtualRange }

/**
 * Calculate visible range for fixed-height items
 */
export function getFixedVirtualRange(
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  itemCount: number,
  overscan: number
): VirtualRange {
  const totalHeight = itemCount * itemHeight
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const endIndex = Math.min(itemCount - 1, startIndex + visibleCount + 2 * overscan)
  const offsetTop = startIndex * itemHeight

  return { startIndex, endIndex, offsetTop, totalHeight }
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
  // prefix-sum offsets: offsets[i] = sum of heights for items 0..(i-1)
  const offsets = new Float64Array(itemCount + 1)
  for (let i = 0; i < itemCount; i++) {
    offsets[i + 1] = offsets[i] + getHeight(i)
  }
  const totalHeight = offsets[itemCount] ?? 0

  function binarySearchStart(scrollTop: number): number {
    let lo = 0
    let hi = itemCount - 1
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1
      if (offsets[mid + 1] <= scrollTop) {
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
    return Math.min(lo, itemCount - 1)
  }

  return {
    getRange(scrollTop, containerHeight, _itemCount, overscan) {
      if (itemCount === 0) {
        return { startIndex: 0, endIndex: -1, offsetTop: 0, totalHeight: 0 }
      }
      const rawStart = binarySearchStart(scrollTop)
      const startIndex = Math.max(0, rawStart - overscan)

      const viewEnd = scrollTop + containerHeight
      let endIndex = rawStart
      while (endIndex < itemCount - 1 && offsets[endIndex] < viewEnd) {
        endIndex++
      }
      endIndex = Math.min(itemCount - 1, endIndex + overscan)

      const offsetTop = offsets[startIndex]

      return { startIndex, endIndex, offsetTop, totalHeight }
    },
    getItemHeight(index) {
      return getHeight(index)
    },
    getItemOffset(index) {
      return offsets[index] ?? 0
    }
  }
}

/**
 * Dynamic-size strategy: uses estimatedHeight initially, then updates
 * offsets as items are measured in the DOM.
 *
 * Call `updateItemHeight(index, measuredHeight)` after rendering each item.
 */
export function dynamicSizeStrategy(
  estimatedHeight: number,
  itemCount: number
): VirtualListSizeStrategy {
  const measuredHeights = new Map<number, number>()

  function getHeight(index: number): number {
    return measuredHeights.get(index) ?? estimatedHeight
  }

  function getOffset(index: number): number {
    let offset = 0
    for (let i = 0; i < index; i++) {
      offset += getHeight(i)
    }
    return offset
  }

  function getTotalHeight(): number {
    let total = 0
    for (let i = 0; i < itemCount; i++) {
      total += getHeight(i)
    }
    return total
  }

  return {
    getRange(scrollTop, containerHeight, _itemCount, overscan) {
      if (itemCount === 0) {
        return { startIndex: 0, endIndex: -1, offsetTop: 0, totalHeight: 0 }
      }

      // Linear scan from start — acceptable because overscan keeps the window small
      let accum = 0
      let rawStart = 0
      for (let i = 0; i < itemCount; i++) {
        const h = getHeight(i)
        if (accum + h > scrollTop) {
          rawStart = i
          break
        }
        accum += h
        if (i === itemCount - 1) rawStart = itemCount - 1
      }

      const startIndex = Math.max(0, rawStart - overscan)
      const viewEnd = scrollTop + containerHeight
      let endIndex = rawStart
      let endAccum = accum
      while (endIndex < itemCount - 1 && endAccum < viewEnd) {
        endAccum += getHeight(endIndex)
        endIndex++
      }
      endIndex = Math.min(itemCount - 1, endIndex + overscan)

      const offsetTop = getOffset(startIndex)
      const totalHeight = getTotalHeight()

      return { startIndex, endIndex, offsetTop, totalHeight }
    },
    getItemHeight(index) {
      return getHeight(index)
    },
    getItemOffset(index) {
      return getOffset(index)
    },
    updateItemHeight(index, measuredHeight) {
      measuredHeights.set(index, measuredHeight)
    }
  }
}
