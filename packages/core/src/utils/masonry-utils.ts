/**
 * Masonry utility functions
 *
 * Pure layout helpers plus Tailwind class builders shared by the Vue and
 * React Masonry implementations. The default layout keeps source order in
 * CSS columns. Shortest-column packing is an explicit mode.
 */

import { resolveResponsiveValue } from './responsive'
import type { MasonryLayout, MasonryResponsiveValue } from '../types/masonry'

/** Default column count */
export const MASONRY_DEFAULT_COLUMNS = 3

/** Default gap in px */
export const MASONRY_DEFAULT_GAP = 16

// ─── Tailwind class constants ─────────────────────────────────────

export const masonryRootClasses = 'tiger-masonry relative w-full'

export const masonryItemClasses = 'tiger-masonry-item min-w-0 break-inside-avoid'

// ─── Resolution ───────────────────────────────────────────────────

/**
 * Clamp a column count to a positive integer.
 */
export function clampMasonryColumnCount(value: number): number {
  if (!Number.isFinite(value) || value < 1) return 1
  return Math.floor(value)
}

/**
 * Clamp a gap to a non-negative finite number.
 */
export function clampMasonryGap(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0
  return value
}

/**
 * Resolve the responsive column count for the given width.
 */
export function resolveMasonryColumnCount(
  columns: MasonryResponsiveValue | undefined,
  width: number
): number {
  const resolved = resolveResponsiveValue(
    columns ?? MASONRY_DEFAULT_COLUMNS,
    width,
    MASONRY_DEFAULT_COLUMNS
  )
  return clampMasonryColumnCount(resolved)
}

/**
 * Resolve the responsive gap in px for the given width.
 */
export function resolveMasonryGap(gap: MasonryResponsiveValue | undefined, width: number): number {
  const resolved = resolveResponsiveValue(gap ?? MASONRY_DEFAULT_GAP, width, MASONRY_DEFAULT_GAP)
  return clampMasonryGap(resolved)
}

// ─── Distribution ─────────────────────────────────────────────────

/**
 * Pack measured item heights into the currently shortest column.
 *
 * Ties go to the leftmost column. Items with height `<= 0` are skipped from
 * the shortest-column contest and fall back to modulo so they do not pull
 * later items into column 0.
 */
export function distributeMasonryItems(heights: number[], columnCount: number): number[][] {
  const count = clampMasonryColumnCount(columnCount)
  const columns: number[][] = Array.from({ length: count }, () => [])
  const totals = new Array<number>(count).fill(0)

  heights.forEach((rawHeight, index) => {
    const height = Number.isFinite(rawHeight) && rawHeight > 0 ? rawHeight : 0
    if (height === 0) {
      columns[index % count].push(index)
      return
    }
    let target = 0
    for (let column = 1; column < count; column++) {
      if (totals[column] < totals[target]) target = column
    }
    columns[target].push(index)
    totals[target] += height
  })

  return columns
}

export function hasMeasuredMasonryHeights(heights: number[]): boolean {
  return heights.some((height) => Number.isFinite(height) && height > 0)
}

export interface MasonryItemPosition {
  column: number
  /** Distance from the inline start, not a physical `left`. */
  inlineStart: number
  top: number
  width: number
}

/**
 * Absolute positions for packed items. `containerWidth` is the masonry root.
 */
export function computeMasonryPositions(
  heights: number[],
  columnCount: number,
  gap: number,
  containerWidth: number
): MasonryItemPosition[] {
  const count = clampMasonryColumnCount(columnCount)
  const spacing = clampMasonryGap(gap)
  const width =
    containerWidth > 0 ? Math.max((containerWidth - spacing * (count - 1)) / count, 0) : 0
  const columns = hasMeasuredMasonryHeights(heights)
    ? distributeMasonryItems(heights, count)
    : moduloDistributeMasonryItems(heights.length, count)
  const tops = new Array<number>(count).fill(0)
  const positions: MasonryItemPosition[] = new Array(heights.length)

  columns.forEach((indices, column) => {
    indices.forEach((index) => {
      const height = Number.isFinite(heights[index]) ? heights[index] : 0
      positions[index] = {
        column,
        inlineStart: column * (width + spacing),
        top: tops[column],
        width
      }
      tops[column] += height + spacing
    })
  })

  return positions
}

/**
 * Source-order columns: fill the inline-start column downward, then the next.
 * This matches CSS multi-column reading order and does not reorder items.
 */
export function distributeMasonrySourceItems(itemCount: number, columnCount: number): number[][] {
  const count = clampMasonryColumnCount(columnCount)
  const columns: number[][] = Array.from({ length: count }, () => [])
  const total = Number.isFinite(itemCount) && itemCount > 0 ? Math.floor(itemCount) : 0
  if (total === 0) return columns
  const perColumn = Math.ceil(total / count)
  for (let index = 0; index < total; index += 1) {
    const column = Math.min(count - 1, Math.floor(index / perColumn))
    columns[column]!.push(index)
  }
  return columns
}

/**
 * Column heights for the layout event. `source` keeps reading order.
 * `shortest` uses the packed columns once heights exist.
 */
export function masonryLayoutColumnHeights(
  heights: number[],
  columnCount: number,
  gap: number,
  layout: MasonryLayout
): number[] {
  const columns =
    layout === 'shortest'
      ? distributeMasonryItems(heights, columnCount)
      : distributeMasonrySourceItems(heights.length, columnCount)
  return computeMasonryColumnHeights(heights, columns, gap)
}

/**
 * Distribute items round-robin before any height has been measured (first
 * paint and SSR), so every item is visible immediately.
 */
export function moduloDistributeMasonryItems(itemCount: number, columnCount: number): number[][] {
  const count = clampMasonryColumnCount(columnCount)
  const columns: number[][] = Array.from({ length: count }, () => [])
  const total = Number.isFinite(itemCount) && itemCount > 0 ? Math.floor(itemCount) : 0

  for (let index = 0; index < total; index++) {
    columns[index % count].push(index)
  }

  return columns
}

/**
 * Occupied height of every column, including the gap between its items.
 */
export function computeMasonryColumnHeights(
  heights: number[],
  columns: number[][],
  gap: number
): number[] {
  const spacing = clampMasonryGap(gap)
  return columns.map((column) => {
    const total = column.reduce(
      (sum, index) => sum + (Number.isFinite(heights[index]) ? heights[index] : 0),
      0
    )
    return total + Math.max(column.length - 1, 0) * spacing
  })
}

/**
 * Read the rendered height of a masonry item off its DOM element.
 */
export function readMasonryItemHeight(element: {
  getBoundingClientRect: () => { height: number }
}): number {
  const height = element.getBoundingClientRect().height
  return Number.isFinite(height) ? height : 0
}

// ─── Styles ───────────────────────────────────────────────────────

/**
 * Root classes for the masonry container.
 */
export function getMasonryRootClasses(className?: string): string {
  return [masonryRootClasses, className].filter(Boolean).join(' ')
}

/**
 * Classes for an item measurement wrapper.
 */
export function getMasonryItemClasses(className?: string): string {
  return [masonryItemClasses, className].filter(Boolean).join(' ')
}

/**
 * Inline gap style for the root element. Applied inline because the gap is a
 * runtime number.
 */
export function getMasonryGapStyle(gap: number): { gap: string } {
  return { gap: `${clampMasonryGap(gap)}px` }
}

/**
 * Inline vertical-gap style for a column element. The root `gap` only
 * separates the horizontally laid-out columns; the column needs its own
 * row-gap so items inside a column keep the same spacing.
 */
export function getMasonryColumnStyle(gap: number): { rowGap: string } {
  return { rowGap: `${clampMasonryGap(gap)}px` }
}

export function getMasonryPackedRootStyle(height: number): {
  position: 'relative'
  height: string
} {
  return { position: 'relative', height: `${Math.max(height, 0)}px` }
}

export function getMasonryFlowRootStyle(
  columnCount: number,
  gap: number
): { columnCount: number; columnGap: string } {
  return {
    columnCount: clampMasonryColumnCount(columnCount),
    columnGap: `${clampMasonryGap(gap)}px`
  }
}

export function getMasonryItemPositionStyle(position: MasonryItemPosition): {
  position: 'absolute'
  insetInlineStart: string
  top: string
  width: string
} {
  return {
    position: 'absolute',
    insetInlineStart: `${position.inlineStart}px`,
    top: `${position.top}px`,
    width: `${position.width}px`
  }
}
