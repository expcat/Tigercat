/**
 * Masonry utility functions
 *
 * Pure layout helpers plus Tailwind class builders shared by the Vue and
 * React Masonry implementations. The layout model is column-based: items are
 * packed into the currently shortest column, and the frameworks only render
 * columns and measure item heights.
 */

import { resolveResponsiveValue } from './responsive'
import type { MasonryResponsiveValue } from '../types/masonry'

/** Default column count */
export const MASONRY_DEFAULT_COLUMNS = 3

/** Default gap in px */
export const MASONRY_DEFAULT_GAP = 16

// ─── Tailwind class constants ─────────────────────────────────────

export const masonryRootClasses = 'tiger-masonry flex w-full items-start'

export const masonryColumnClasses = 'tiger-masonry-column flex min-w-0 flex-1 flex-col'

export const masonryItemClasses = 'tiger-masonry-item'

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
 * Ties go to the leftmost column, and items keep their relative order within
 * a column. Returns the item indices grouped per column.
 */
export function distributeMasonryItems(heights: number[], columnCount: number): number[][] {
  const count = clampMasonryColumnCount(columnCount)
  const columns: number[][] = Array.from({ length: count }, () => [])
  const totals = new Array<number>(count).fill(0)

  heights.forEach((rawHeight, index) => {
    const height = Number.isFinite(rawHeight) ? rawHeight : 0
    let target = 0
    for (let column = 1; column < count; column++) {
      if (totals[column] < totals[target]) target = column
    }
    columns[target].push(index)
    totals[target] += height
  })

  return columns
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
 * Classes for a single masonry column.
 */
export function getMasonryColumnClasses(className?: string): string {
  return [masonryColumnClasses, className].filter(Boolean).join(' ')
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
