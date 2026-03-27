/**
 * Splitter component utilities
 * Shared styles and helpers for Splitter components
 */

import type { SplitDirection } from '../types/splitter'

// ─── Style Constants ────────────────────────────────────────────────

export const splitterBaseClasses = 'relative flex w-full h-full overflow-hidden'

export const splitterHorizontalClasses = 'flex-row'

export const splitterVerticalClasses = 'flex-col'

export const splitterPaneBaseClasses = 'relative overflow-auto'

export const splitterGutterBaseClasses =
  'relative flex-shrink-0 bg-gray-200 transition-colors duration-150 hover:bg-[var(--tiger-primary,#2563eb)] z-10'

export const splitterGutterHorizontalClasses =
  'cursor-col-resize w-[var(--tiger-splitter-gutter,4px)] h-full'

export const splitterGutterVerticalClasses =
  'cursor-row-resize h-[var(--tiger-splitter-gutter,4px)] w-full'

export const splitterGutterDraggingClasses = 'bg-[var(--tiger-primary,#2563eb)]'

export const splitterGutterDisabledClasses = 'cursor-default opacity-50 pointer-events-none'

export const splitterGutterHandleClasses =
  'absolute rounded bg-gray-400 transition-colors duration-150'

export const splitterGutterHandleHorizontalClasses =
  'w-0.5 h-6 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'

export const splitterGutterHandleVerticalClasses =
  'h-0.5 w-6 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'

// ─── Pure Functions ─────────────────────────────────────────────────

/**
 * Get container classes for the splitter
 */
export function getSplitterContainerClasses(direction: SplitDirection, className?: string): string {
  const classes = [
    splitterBaseClasses,
    direction === 'horizontal' ? splitterHorizontalClasses : splitterVerticalClasses
  ]
  if (className) classes.push(className)
  return classes.join(' ')
}

/**
 * Get gutter classes
 */
export function getSplitterGutterClasses(
  direction: SplitDirection,
  isDragging: boolean,
  disabled: boolean
): string {
  const classes = [
    splitterGutterBaseClasses,
    direction === 'horizontal' ? splitterGutterHorizontalClasses : splitterGutterVerticalClasses
  ]
  if (isDragging) classes.push(splitterGutterDraggingClasses)
  if (disabled) classes.push(splitterGutterDisabledClasses)
  return classes.join(' ')
}

/**
 * Get gutter handle indicator classes
 */
export function getSplitterGutterHandleClasses(direction: SplitDirection): string {
  return [
    splitterGutterHandleClasses,
    direction === 'horizontal'
      ? splitterGutterHandleHorizontalClasses
      : splitterGutterHandleVerticalClasses
  ].join(' ')
}

/**
 * Parse a size value. If it's a percentage string, resolve against totalSize.
 * If it's a number, use as-is. Returns pixels as number.
 */
export function parsePaneSize(size: number | string, totalSize: number): number {
  if (typeof size === 'number') return size
  const trimmed = size.trim()
  if (trimmed.endsWith('%')) {
    const pct = parseFloat(trimmed)
    if (isNaN(pct)) return 0
    return (pct / 100) * totalSize
  }
  if (trimmed.endsWith('px')) {
    const px = parseFloat(trimmed)
    return isNaN(px) ? 0 : px
  }
  const num = parseFloat(trimmed)
  return isNaN(num) ? 0 : num
}

/**
 * Calculate initial pane sizes.
 * If sizes provided, use them. Otherwise split equally.
 */
export function calculateInitialSizes(
  paneCount: number,
  totalSize: number,
  gutterSize: number,
  defaultSizes?: (number | string)[]
): number[] {
  const totalGutterSpace = (paneCount - 1) * gutterSize
  const availableSpace = totalSize - totalGutterSpace

  if (defaultSizes && defaultSizes.length === paneCount) {
    return defaultSizes.map((s) => parsePaneSize(s, availableSpace))
  }

  const equalSize = availableSpace / paneCount
  return Array.from({ length: paneCount }, () => equalSize)
}

/**
 * Clamp a pane size between min and max bounds
 */
export function clampPaneSize(size: number, min: number, max?: number): number {
  let result = Math.max(size, min)
  if (max !== undefined) {
    result = Math.min(result, max)
  }
  return result
}

/**
 * Resize two adjacent panes based on a drag delta.
 * Returns new sizes array or null if resize is invalid.
 */
export function resizePanes(
  sizes: number[],
  gutterIndex: number,
  delta: number,
  mins: number[],
  maxes: (number | undefined)[]
): number[] | null {
  if (gutterIndex < 0 || gutterIndex >= sizes.length - 1) return null

  const leftIdx = gutterIndex
  const rightIdx = gutterIndex + 1

  let newLeft = sizes[leftIdx] + delta
  let newRight = sizes[rightIdx] - delta

  // Clamp left pane
  const leftMin = mins[leftIdx] ?? 0
  const leftMax = maxes[leftIdx]
  newLeft = clampPaneSize(newLeft, leftMin, leftMax)

  // Recalculate delta after clamping left
  const actualDelta = newLeft - sizes[leftIdx]

  // Clamp right pane
  const rightMin = mins[rightIdx] ?? 0
  const rightMax = maxes[rightIdx]
  newRight = sizes[rightIdx] - actualDelta
  newRight = clampPaneSize(newRight, rightMin, rightMax)

  // Recalculate left if right was clamped
  const finalDelta = sizes[rightIdx] - newRight
  newLeft = sizes[leftIdx] + finalDelta

  const result = [...sizes]
  result[leftIdx] = newLeft
  result[rightIdx] = newRight
  return result
}

/**
 * Convert pane sizes to CSS style objects for flex sizing
 */
export function getPaneStyle(size: number, direction: SplitDirection): Record<string, string> {
  const prop = direction === 'horizontal' ? 'width' : 'height'
  return {
    [prop]: `${size}px`,
    flexShrink: '0',
    flexGrow: '0'
  }
}

/**
 * Calculate pane sizes as percentages of total available space
 */
export function sizesToPercentages(sizes: number[]): number[] {
  const total = sizes.reduce((a, b) => a + b, 0)
  if (total === 0) return sizes.map(() => 0)
  return sizes.map((s) => (s / total) * 100)
}
