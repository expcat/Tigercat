import { classNames } from './class-names'
import { devWarn } from './dev-warn'
import type {
  ExclusiveVirtualRange,
  VirtualRange,
  VirtualListSizeStrategy,
  VirtualScrollAlign
} from '../types/virtual-list'

/* ------------------------------------------------------------------ */
/*  Style constants                                                    */
/* ------------------------------------------------------------------ */

export const virtualListContainerClasses = classNames(
  'overflow-auto relative',
  'bg-[var(--tiger-surface)]'
)

export const virtualListInnerClasses = 'relative w-full'

function emptyExclusiveRange(): ExclusiveVirtualRange {
  return { start: 0, end: 0, offsetTop: 0, totalHeight: 0 }
}

function emptyInclusiveRange(): VirtualRange {
  return { startIndex: 0, endIndex: -1, offsetTop: 0, totalHeight: 0 }
}

function requirePositiveHeight(height: number, label: string): number {
  if (!Number.isFinite(height) || height <= 0) {
    throw new RangeError(`${label} must be a finite positive number`)
  }
  return height
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
 * Scrollport height for the one window formula.
 *
 * A positive `clientHeight` wins. Until the scrollport has been laid out,
 * a positive declared height is the viewport. Both missing → `0`, and
 * {@link calculateVirtualRange} keeps the total height on a new empty window.
 */
export function resolveScrollportViewport(clientHeight: number, declaredHeight = 0): number {
  if (Number.isFinite(clientHeight) && clientHeight > 0) return clientHeight
  if (Number.isFinite(declaredHeight) && declaredHeight > 0) return declaredHeight
  return 0
}

/**
 * Exclusive `[start, end)` window for a fixed-height scroller.
 *
 * This is the single row-window helper. The exclusive end is
 * `ceil((scrollTop + viewport) / itemHeight)` plus overscan, so the row
 * touched by the bottom edge is included. Overscan is applied once on each side.
 */
export function calculateVirtualRange(
  scrollTop: number,
  viewportHeight: number,
  itemCount: number,
  itemHeight: number,
  overscan = 5
): ExclusiveVirtualRange {
  const safe = sanitizeRangeInput(scrollTop, viewportHeight, itemCount, overscan)
  if (!Number.isFinite(itemHeight) || itemHeight <= 0 || safe.itemCount === 0) {
    return emptyExclusiveRange()
  }

  const totalHeight = safe.itemCount * itemHeight
  if (safe.viewportHeight <= 0) {
    return { start: 0, end: 0, offsetTop: 0, totalHeight }
  }

  const startRaw = Math.floor(safe.scrollTop / itemHeight)
  const endRaw = Math.ceil((safe.scrollTop + safe.viewportHeight) / itemHeight)
  const start = Math.max(0, Math.min(safe.itemCount, startRaw - safe.overscan))
  const end = Math.max(start, Math.min(safe.itemCount, endRaw + safe.overscan))

  return {
    start,
    end,
    offsetTop: start * itemHeight,
    totalHeight
  }
}

/**
 * `scrollTop` that places `offset`/`size` according to `align`.
 *
 * `auto` keeps `scrollTop` when the item already intersects the viewport.
 */
export function scrollTopForVirtualAlign(input: {
  scrollTop: number
  viewport: number
  offset: number
  size: number
  align?: VirtualScrollAlign
}): number {
  const scrollTop = Number.isFinite(input.scrollTop) ? Math.max(0, input.scrollTop) : 0
  const viewport = Number.isFinite(input.viewport) ? Math.max(0, input.viewport) : 0
  const offset = Number.isFinite(input.offset) ? Math.max(0, input.offset) : 0
  const size = Number.isFinite(input.size) ? Math.max(0, input.size) : 0
  const align = input.align ?? 'auto'
  const itemEnd = offset + size
  const viewEnd = scrollTop + viewport
  if (align === 'auto') {
    if (size === 0 || viewport === 0) return scrollTop
    if (offset < viewEnd && itemEnd > scrollTop) return scrollTop
    if (itemEnd <= scrollTop) return offset
    return Math.max(0, itemEnd - viewport)
  }
  if (align === 'center') return Math.max(0, offset - (viewport - size) / 2)
  if (align === 'end') return Math.max(0, itemEnd - viewport)
  return offset
}

/** Block size including top and bottom margins. `0` when the element is missing. */
export function readMarginBoxBlockSize(element: HTMLElement | null | undefined): number {
  if (!element || typeof getComputedStyle !== 'function') return 0
  const height = element.offsetHeight
  if (!Number.isFinite(height) || height <= 0) return 0
  const style = getComputedStyle(element)
  const marginTop = Number.parseFloat(style.marginTop)
  const marginBottom = Number.parseFloat(style.marginBottom)
  return (
    height +
    (Number.isFinite(marginTop) ? marginTop : 0) +
    (Number.isFinite(marginBottom) ? marginBottom : 0)
  )
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
    return emptyInclusiveRange()
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
  const valid = Number.isFinite(itemHeight) && itemHeight > 0
  const height = valid ? itemHeight : 0
  return {
    getRange(scrollTop, containerHeight, itemCount, overscan) {
      if (!valid) return exclusiveRangeToInclusive(emptyExclusiveRange())
      return getFixedVirtualRange(scrollTop, containerHeight, height, itemCount, overscan)
    },
    getItemHeight() {
      return requirePositiveHeight(height, 'Fixed row height')
    },
    getItemOffset(index) {
      if (!valid) return 0
      return index * height
    }
  }
}

function countOf(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
}

/**
 * Variable-size strategy: height per item is known upfront via a function.
 *
 * Internally builds a prefix-sum offset cache for O(log n) lookups.
 * `syncHeights` updates that cache in place so a new function identity
 * does not rebuild the table when the heights are unchanged.
 */
export function variableSizeStrategy(
  getHeight: (index: number) => number,
  itemCount: number
): VirtualListSizeStrategy {
  let heightFor = getHeight
  let builtCount = countOf(itemCount)
  let offsets = new Float64Array(builtCount + 1)

  function writeFrom(start: number): void {
    for (let i = start; i < builtCount; i++) {
      offsets[i + 1] = offsets[i] + requirePositiveHeight(heightFor(i), `Row height at ${i}`)
    }
  }

  writeFrom(0)

  return {
    syncHeights(nextGetHeight, nextCount) {
      heightFor = nextGetHeight
      const safeCount = countOf(nextCount)
      if (safeCount !== builtCount) {
        const next = new Float64Array(safeCount + 1)
        next.set(offsets.subarray(0, Math.min(offsets.length, next.length)))
        offsets = next
        const rebuildFrom = Math.min(builtCount, safeCount)
        builtCount = safeCount
        writeFrom(rebuildFrom)
        return
      }
      let dirty = builtCount
      for (let i = 0; i < builtCount; i++) {
        const nextHeight = requirePositiveHeight(heightFor(i), `Row height at ${i}`)
        if (nextHeight !== offsets[i + 1] - offsets[i]) {
          dirty = i
          break
        }
      }
      if (dirty < builtCount) writeFrom(dirty)
    },
    getRange(scrollTop, containerHeight, rangeItemCount, overscan) {
      const count = rangeItemCount === undefined ? builtCount : Math.min(builtCount, rangeItemCount)
      return getOffsetVirtualRange(offsets, count, scrollTop, containerHeight, overscan)
    },
    getItemHeight(index) {
      return heightFor(index)
    },
    getItemOffset(index) {
      const safeIndex = Math.min(builtCount, Math.max(0, index))
      return offsets[safeIndex] ?? 0
    }
  }
}

function itemKeyId(key: string | number): string {
  return String(key)
}

/**
 * Dynamic-size strategy. Measured heights are stored by item id.
 *
 * Until {@link VirtualListSizeStrategy.setItemKeys} runs, the id is the index.
 * Estimated height must be a finite positive number. Call
 * `updateItemHeight(index, measuredHeight, itemKey)` after a margin-box read.
 */
export function dynamicSizeStrategy(
  estimatedHeight: number,
  initialCount: number
): VirtualListSizeStrategy {
  let itemCount = countOf(initialCount)
  const measuredHeights = new Map<string, number>()
  let explicitKeys = false
  let keys: string[] = []
  let offsets = new Float64Array(itemCount + 1)
  const safeEstimated = requirePositiveHeight(estimatedHeight, 'Estimated row height')
  let dirtyFrom = 0
  let anchor: { key: string; viewportOffset: number } | null = null

  function keyAt(index: number): string {
    if (explicitKeys) return keys[index] ?? ''
    return String(index)
  }

  function indexOfKey(key: string): number {
    if (!explicitKeys) {
      if (!/^\d+$/.test(key)) return -1
      const index = Number(key)
      return index >= 0 && index < itemCount ? index : -1
    }
    return keys.indexOf(key)
  }

  function getHeight(index: number): number {
    const key = keyAt(index)
    if (!key) return safeEstimated
    return measuredHeights.get(key) ?? safeEstimated
  }

  function ensureCount(nextCount: number): void {
    const safe = explicitKeys ? keys.length : countOf(nextCount)
    if (safe === itemCount && offsets.length === safe + 1) return
    if (!explicitKeys && safe < itemCount) {
      for (const key of [...measuredHeights.keys()]) {
        if (/^\d+$/.test(key) && Number(key) >= safe) measuredHeights.delete(key)
      }
    }
    const next = new Float64Array(safe + 1)
    next.set(offsets.subarray(0, Math.min(offsets.length, next.length)))
    const rebuildFrom = Math.min(itemCount, safe)
    offsets = next
    itemCount = safe
    dirtyFrom = Math.min(dirtyFrom, rebuildFrom)
  }

  function rebuildOffsets(): void {
    if (dirtyFrom >= itemCount) return
    for (let i = Math.max(0, dirtyFrom); i < itemCount; i++) {
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
    setItemKeys(nextKeys) {
      const normalized = nextKeys.map(itemKeyId)
      const same =
        explicitKeys &&
        normalized.length === keys.length &&
        normalized.every((key, index) => key === keys[index])
      explicitKeys = true
      keys = normalized
      if (!same) dirtyFrom = 0
      ensureCount(normalized.length)
    },
    noteAnchor(key, scrollTop) {
      const index = indexOfKey(itemKeyId(key))
      if (index < 0) {
        anchor = null
        return
      }
      const safeScroll = Number.isFinite(scrollTop) ? scrollTop : 0
      anchor = { key: itemKeyId(key), viewportOffset: getOffset(index) - safeScroll }
    },
    consumeAnchorScrollTop() {
      if (!anchor) return null
      const index = indexOfKey(anchor.key)
      if (index < 0) return null
      const next = Math.max(0, getOffset(index) - anchor.viewportOffset)
      anchor = null
      return next
    },
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
    updateItemHeight(index, measuredHeight, itemKey) {
      const key = itemKey !== undefined ? itemKeyId(itemKey) : keyAt(index)
      if (
        !key ||
        index < 0 ||
        (!explicitKeys && index >= itemCount) ||
        (explicitKeys && index >= keys.length) ||
        !Number.isFinite(measuredHeight) ||
        measuredHeight <= 0 ||
        measuredHeights.get(key) === measuredHeight
      ) {
        return
      }
      measuredHeights.set(key, measuredHeight)
      dirtyFrom = Math.min(dirtyFrom, Math.max(0, index))
    }
  }
}

/** Warn once when a fixed-height row's content is taller than the contract. */
export function warnFixedRowOverflow(key: string, contentHeight: number, itemHeight: number): void {
  if (!Number.isFinite(contentHeight) || !Number.isFinite(itemHeight)) return
  if (contentHeight <= itemHeight + 1) return
  devWarn(
    key,
    `Fixed row height ${itemHeight}px is smaller than the measured content (${contentHeight}px)`
  )
}
