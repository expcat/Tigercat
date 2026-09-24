/**
 * Splitter component utilities
 * Shared styles and helpers for Splitter components
 */

import type { SplitDirection } from '../types/splitter'
import { RESIZE_KEYBOARD_STEP, getResizeKeyboardDelta } from './resizable-utils'

// ─── Style Constants ────────────────────────────────────────────────

export const splitterBaseClasses = 'relative flex w-full h-full min-w-0 min-h-0'

export const splitterHorizontalClasses = 'flex-row'

export const splitterVerticalClasses = 'flex-col'

export const splitterPaneBaseClasses = 'tiger-splitter-pane relative overflow-auto min-w-0 min-h-0'

export const splitterGutterBaseClasses =
  'relative flex-shrink-0 bg-[var(--tiger-border)] tiger-motion-aware transition-colors duration-150 hover:bg-[var(--tiger-primary)] z-10 touch-none outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tiger-focus-ring)]'

export const splitterGutterHorizontalClasses =
  "cursor-col-resize w-[var(--tiger-splitter-gutter)] h-full before:absolute before:content-[''] before:inset-block-0 before:w-6 before:start-1/2 before:-translate-x-1/2"

export const splitterGutterVerticalClasses =
  "cursor-row-resize h-[var(--tiger-splitter-gutter)] w-full before:absolute before:content-[''] before:inset-inline-0 before:h-6 before:top-1/2 before:-translate-y-1/2"

export const splitterGutterDraggingClasses = 'bg-[var(--tiger-primary)]'

export const splitterGutterDisabledClasses = 'cursor-default opacity-50 pointer-events-none'

export const splitterGutterHandleClasses =
  'absolute rounded bg-[var(--tiger-text-secondary)] tiger-motion-aware transition-colors duration-150 pointer-events-none'

export const splitterGutterHandleHorizontalClasses =
  'w-0.5 h-6 top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2'

export const splitterGutterHandleVerticalClasses =
  'h-0.5 w-6 top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2'

export const SPLITTER_GUTTER_HIT_SIZE = 24

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
 * Per-instance CSS vars for visible gutter thickness.
 * `gutterSize` is the public prop (default 4); not a theme color.
 */
export function getSplitterGutterCssVars(gutterSize = 4): {
  '--tiger-splitter-gutter': string
} {
  return {
    '--tiger-splitter-gutter': `${gutterSize}px`
  }
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

export function isPercentagePaneSize(size: number | string): boolean {
  return typeof size === 'string' && size.trim().endsWith('%')
}

/**
 * Stable identity for a `sizes` prop. Same values, new array → same key.
 */
export function serializePaneSizes(sizes?: (number | string)[] | null): string | undefined {
  if (sizes == null) return undefined
  return sizes.map((size) => String(size)).join('\0')
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
  const totalGutterSpace = Math.max(0, paneCount - 1) * gutterSize
  const availableSpace = totalSize - totalGutterSpace

  if (defaultSizes && defaultSizes.length === paneCount) {
    return defaultSizes.map((s) => parsePaneSize(s, availableSpace))
  }

  const equalSize = paneCount > 0 ? availableSpace / paneCount : 0
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
 * Convert user `sizes` (and equal-split) into ratios that sum to 1.
 * Extra children beyond `sizes.length` share the remaining space equally.
 */
export function paneInputsToRatios(
  paneCount: number,
  sizes?: (number | string)[],
  available = 0
): number[] {
  if (paneCount <= 0) return []
  const equal = 1 / paneCount
  if (!sizes || sizes.length === 0) {
    return Array.from({ length: paneCount }, () => equal)
  }

  const weights = Array.from({ length: paneCount }, (_, index) => {
    if (index >= sizes.length) return -1
    const size = sizes[index]
    if (isPercentagePaneSize(size)) return parsePaneSize(size, 1)
    return Math.max(0, parsePaneSize(size, available))
  })

  const known = weights.filter((weight) => weight >= 0)
  const knownSum = known.reduce((sum, weight) => sum + weight, 0)
  const missing = paneCount - known.length
  const fill = missing > 0 ? (known.length ? knownSum / known.length : 1 / paneCount) : 0

  if (missing > 0) {
    for (let index = 0; index < weights.length; index++) {
      if (weights[index] < 0) weights[index] = fill
    }
  }

  const sum = weights.reduce((total, weight) => total + Math.max(0, weight), 0)
  if (sum <= 0) return Array.from({ length: paneCount }, () => equal)
  return weights.map((weight) => Math.max(0, weight) / sum)
}

export function alignPaneRatios(ratios: number[], paneCount: number): number[] {
  if (paneCount <= 0) return []
  if (ratios.length === paneCount) {
    const sum = ratios.reduce((total, ratio) => total + ratio, 0)
    if (sum <= 0) return Array.from({ length: paneCount }, () => 1 / paneCount)
    return ratios.map((ratio) => ratio / sum)
  }
  if (ratios.length > paneCount) {
    const kept = ratios.slice(0, paneCount)
    const sum = kept.reduce((total, ratio) => total + ratio, 0) || 1
    return kept.map((ratio) => ratio / sum)
  }
  const extra = paneCount - ratios.length
  const avg = ratios.length
    ? ratios.reduce((total, ratio) => total + ratio, 0) / ratios.length
    : 1 / paneCount
  const next = [...ratios, ...Array.from({ length: extra }, () => avg)]
  const sum = next.reduce((total, ratio) => total + ratio, 0) || 1
  return next.map((ratio) => ratio / sum)
}

/**
 * Turn stored ratios into pixels that fill `containerSize - gutters`.
 * If every pane's min cannot fit, scale proportionally and ignore min.
 */
export function layoutPanePixels(
  ratios: number[],
  containerSize: number,
  gutterSize: number,
  min = 0,
  max?: number
): number[] {
  const paneCount = ratios.length
  if (paneCount === 0) return []
  const available = containerSize - Math.max(0, paneCount - 1) * gutterSize
  if (available <= 0) return Array.from({ length: paneCount }, () => 0)

  const sumRatios = ratios.reduce((total, ratio) => total + ratio, 0) || 1
  let pixels = ratios.map((ratio) => (ratio / sumRatios) * available)

  const floor = Math.max(0, min)
  if (floor * paneCount >= available) {
    return pixels
  }

  const clampOne = (value: number): number => {
    let next = Math.max(value, floor)
    if (max !== undefined) next = Math.min(next, max)
    return next
  }

  pixels = pixels.map(clampOne)

  for (let pass = 0; pass < paneCount + 2; pass++) {
    const extra = available - pixels.reduce((total, value) => total + value, 0)
    if (Math.abs(extra) < 0.01) break
    const flexible: number[] = []
    for (let index = 0; index < paneCount; index++) {
      if (extra > 0) {
        if (max === undefined || pixels[index] < max) flexible.push(index)
      } else if (pixels[index] > floor) {
        flexible.push(index)
      }
    }
    if (flexible.length === 0) break
    const each = extra / flexible.length
    for (const index of flexible) {
      pixels[index] = clampOne(pixels[index] + each)
    }
  }

  return pixels
}

export interface SplitterRatioState {
  ratios: number[]
  sizesKey: string | undefined
}

/**
 * Update stored ratios when the `sizes` *values* or pane count change.
 * A new array with the same values does not reset a drag.
 * Dropping `sizes` keeps the last ratios.
 */
export function reconcileSplitterRatios(
  state: SplitterRatioState,
  paneCount: number,
  sizes: (number | string)[] | undefined,
  available = 0
): SplitterRatioState {
  const sizesKey = serializePaneSizes(sizes)
  if (paneCount <= 0) return { ratios: [], sizesKey }

  const sizesChanged = sizesKey !== state.sizesKey
  const countChanged = state.ratios.length !== paneCount

  if (sizesKey !== undefined && sizesChanged) {
    return { ratios: paneInputsToRatios(paneCount, sizes, available), sizesKey }
  }

  if (countChanged) {
    return { ratios: alignPaneRatios(state.ratios, paneCount), sizesKey }
  }

  if (sizesKey === state.sizesKey) return state
  return { ratios: state.ratios, sizesKey }
}

/**
 * Parse initial pane sizes (px numbers or `'30%'` / `'200px'` strings).
 * When `containerSize` is 0 or negative:
 * - numeric / px sizes resolve as pixels and are *not* independently clamped to min
 * - percentage strings and equal-split return null until a real measure exists
 */
export function resolveInitialPaneSizes(
  paneCount: number,
  containerSize: number,
  gutterSize: number,
  sizes?: (number | string)[],
  min = 0,
  max?: number
): number[] | null {
  if (paneCount <= 0) return null
  const bounds = normalizeSplitterBounds(paneCount, min, max)
  const boxes = layoutDeclaredPanes(
    sizes,
    paneCount,
    containerSize,
    gutterSize,
    bounds.mins,
    bounds.maxes
  )
  if (boxes.some((box) => box.pixels == null)) return null
  return boxes.map((box) => box.pixels ?? 0)
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

  const leftMin = mins[leftIdx] ?? 0
  const leftMax = maxes[leftIdx]
  newLeft = clampPaneSize(newLeft, leftMin, leftMax)

  const actualDelta = newLeft - sizes[leftIdx]

  const rightMin = mins[rightIdx] ?? 0
  const rightMax = maxes[rightIdx]
  newRight = sizes[rightIdx] - actualDelta
  newRight = clampPaneSize(newRight, rightMin, rightMax)

  const finalDelta = sizes[rightIdx] - newRight
  newLeft = sizes[leftIdx] + finalDelta

  const result = [...sizes]
  result[leftIdx] = newLeft
  result[rightIdx] = newRight
  return result
}

export type SplitterPaneKind = 'fixed' | 'percent' | 'flex'

export interface SplitterPaneBox {
  kind: SplitterPaneKind
  /** Resolved pixels. Null before the container is measured for percent and flex panes. */
  pixels: number | null
  /** Same percentage the pane will use after measure (`30%`). */
  flexBasis?: string
  flexGrow: number
}

export function classifySplitterSize(
  size: number | string | undefined
): { kind: SplitterPaneKind; amount: number } {
  if (size === undefined) return { kind: 'flex', amount: 1 }
  if (typeof size === 'number') {
    if (!Number.isFinite(size)) return { kind: 'flex', amount: 1 }
    return { kind: 'fixed', amount: Math.max(0, size) }
  }
  const trimmed = size.trim()
  if (trimmed.endsWith('%')) {
    const pct = Number.parseFloat(trimmed)
    if (!Number.isFinite(pct) || pct < 0) return { kind: 'flex', amount: 1 }
    return { kind: 'percent', amount: pct }
  }
  const px = Number.parseFloat(trimmed)
  if (!Number.isFinite(px)) return { kind: 'flex', amount: 1 }
  return { kind: 'fixed', amount: Math.max(0, px) }
}

export function normalizeSplitterBounds(
  paneCount: number,
  min?: number | number[],
  max?: number | number[]
): { mins: number[]; maxes: Array<number | undefined> } {
  const mins = Array.from({ length: paneCount }, (_, index) => {
    const raw = Array.isArray(min) ? min[index] : min
    return raw != null && Number.isFinite(raw) ? Math.max(0, raw) : 0
  })
  const maxes = Array.from({ length: paneCount }, (_, index) => {
    const raw = Array.isArray(max) ? max[index] : max
    return raw != null && Number.isFinite(raw) ? Math.max(0, raw) : undefined
  })
  return { mins, maxes }
}

function scaleToAvailable(values: number[], available: number): number[] {
  const sum = values.reduce((total, value) => total + value, 0)
  if (sum <= 0) {
    const each = values.length > 0 ? available / values.length : 0
    return values.map(() => each)
  }
  return values.map((value) => (value / sum) * available)
}

/**
 * Fixed pixels stay pixels. Percentages are a share of the free space
 * (container minus gutters). Leftover space goes only to panes with no size.
 * Before measure, fixed panes keep the declared pixel value and percentages
 * keep the same percent basis they use after measure.
 */
export function layoutDeclaredPanes(
  sizes: Array<number | string | undefined> | undefined,
  paneCount: number,
  containerSize: number,
  gutterSize: number,
  mins: number[] = [],
  maxes: Array<number | undefined> = []
): SplitterPaneBox[] {
  if (paneCount <= 0) return []
  const specs = Array.from({ length: paneCount }, (_, index) => classifySplitterSize(sizes?.[index]))
  if (!(containerSize > 0)) {
    return specs.map((spec) => {
      if (spec.kind === 'fixed') {
        return { kind: spec.kind, pixels: spec.amount, flexGrow: 0 }
      }
      if (spec.kind === 'percent') {
        return {
          kind: spec.kind,
          pixels: null,
          flexBasis: `${spec.amount}%`,
          flexGrow: 0
        }
      }
      return { kind: 'flex', pixels: null, flexGrow: spec.amount }
    })
  }

  const available = containerSize - Math.max(0, paneCount - 1) * gutterSize
  if (available <= 0) {
    return specs.map((spec) => ({ kind: spec.kind, pixels: 0, flexGrow: 0 }))
  }

  const paneMins = specs.map((_, index) => mins[index] ?? 0)
  const minSum = paneMins.reduce((total, value) => total + value, 0)
  if (minSum > available) {
    const scaled = scaleToAvailable(paneMins, available)
    return specs.map((spec, index) => ({ kind: spec.kind, pixels: scaled[index] ?? 0, flexGrow: 0 }))
  }

  const desired = specs.map((spec) => {
    if (spec.kind === 'fixed') return spec.amount
    if (spec.kind === 'percent') return (spec.amount / 100) * available
    return null
  })
  const flexIndexes = specs
    .map((spec, index) => (spec.kind === 'flex' ? index : -1))
    .filter((index) => index >= 0)
  const fixedSum = desired.reduce<number>((total, value) => total + (value ?? 0), 0)

  let pixels: number[]
  if (flexIndexes.length === 0) {
    pixels =
      fixedSum > available + 0.01
        ? scaleToAvailable(
            desired.map((value) => value ?? 0),
            available
          )
        : desired.map((value) => value ?? 0)
  } else if (fixedSum > available) {
    pixels = desired.map((value) => (value == null ? 0 : (value / fixedSum) * available))
  } else {
    const leftover = available - fixedSum
    const weight =
      flexIndexes.reduce((total, index) => total + specs[index].amount, 0) || flexIndexes.length
    pixels = desired.map((value, index) => {
      if (value != null) return value
      return leftover * (specs[index].amount / weight)
    })
  }

  pixels = pixels.map((value, index) => clampPaneSize(value, paneMins[index] ?? 0, maxes[index]))
  const overflow = pixels.reduce((total, value) => total + value, 0) - available
  if (overflow > 0.5) {
    const adjustable = pixels.map((value, index) => Math.max(0, value - (paneMins[index] ?? 0)))
    const room = adjustable.reduce((total, value) => total + value, 0)
    if (room > 0) {
      pixels = pixels.map((value, index) => value - overflow * (adjustable[index] / room))
    } else {
      pixels = scaleToAvailable(pixels, available)
    }
  }

  return specs.map((spec, index) => ({
    kind: spec.kind,
    pixels: pixels[index] ?? 0,
    flexGrow: 0
  }))
}

export function getPaneStyle(box: SplitterPaneBox, direction: SplitDirection): Record<string, string> {
  const prop = direction === 'horizontal' ? 'width' : 'height'
  if (box.pixels != null) {
    return {
      [prop]: `${box.pixels}px`,
      flexGrow: '0',
      flexShrink: '0',
      flexBasis: 'auto',
      minWidth: '0',
      minHeight: '0'
    }
  }
  if (box.flexBasis) {
    return {
      flexGrow: '0',
      flexShrink: '1',
      flexBasis: box.flexBasis,
      minWidth: '0',
      minHeight: '0'
    }
  }
  return {
    flexGrow: String(box.flexGrow || 1),
    flexShrink: '1',
    flexBasis: '0px',
    minWidth: '0',
    minHeight: '0'
  }
}

export function resolveSplitterSeparatorKey(
  key: string,
  direction: SplitDirection,
  rtl: boolean,
  step: number = RESIZE_KEYBOARD_STEP
): { type: 'delta'; delta: number } | { type: 'edge'; edge: 'start' | 'end' } | null {
  if (key === 'Home') return { type: 'edge', edge: 'start' }
  if (key === 'End') return { type: 'edge', edge: 'end' }
  const delta = getSplitterKeyboardDelta(key, direction, rtl, step)
  if (delta == null) return null
  return { type: 'delta', delta }
}

/** Home / End move the leading pane to its own min or max. */
export function jumpSplitterGutter(
  sizes: number[],
  gutterIndex: number,
  edge: 'start' | 'end',
  mins: number[],
  maxes: Array<number | undefined>
): number[] | null {
  if (gutterIndex < 0 || gutterIndex >= sizes.length - 1) return null
  const left = gutterIndex
  const right = gutterIndex + 1
  const pair = sizes[left] + sizes[right]
  const leftMin = mins[left] ?? 0
  const rightMin = mins[right] ?? 0
  const leftMax = maxes[left]
  let newLeft =
    edge === 'start' ? leftMin : (leftMax ?? Math.max(leftMin, pair - rightMin))
  newLeft = clampPaneSize(newLeft, leftMin, leftMax)
  let newRight = clampPaneSize(pair - newLeft, rightMin, maxes[right])
  newLeft = clampPaneSize(pair - newRight, leftMin, leftMax)
  const result = [...sizes]
  result[left] = newLeft
  result[right] = pair - newLeft
  return result
}

/**
 * Calculate pane sizes as percentages of total available space
 */
export function sizesToPercentages(sizes: number[]): number[] {
  const total = sizes.reduce((a, b) => a + b, 0)
  if (total === 0) return sizes.map(() => 0)
  return sizes.map((s) => (s / total) * 100)
}

export function panePixelsToRatios(sizes: number[]): number[] {
  const percentages = sizesToPercentages(sizes)
  if (percentages.every((value) => value === 0)) {
    const count = sizes.length
    return count > 0 ? Array.from({ length: count }, () => 1 / count) : []
  }
  return percentages.map((value) => value / 100)
}

export function isSplitterRtl(dir?: string): boolean {
  return dir === 'rtl'
}

/**
 * Pointer delta along the splitter axis, flipped in RTL so the gutter
 * follows the pointer.
 */
export function getSplitterPointerDelta(
  direction: SplitDirection,
  startX: number,
  startY: number,
  currentX: number,
  currentY: number,
  rtl: boolean
): number {
  if (direction === 'vertical') return currentY - startY
  const physical = currentX - startX
  return rtl ? -physical : physical
}

/**
 * Keyboard delta in the same logical space as {@link getSplitterPointerDelta}.
 * Reuses {@link getResizeKeyboardDelta} / {@link RESIZE_KEYBOARD_STEP}.
 */
export function getSplitterKeyboardDelta(
  key: string,
  direction: SplitDirection,
  rtl: boolean,
  step: number = RESIZE_KEYBOARD_STEP
): number | null {
  const pointer = getResizeKeyboardDelta(key, step)
  if (!pointer) return null
  if (direction === 'horizontal') {
    if (pointer.deltaX === 0) return null
    return rtl ? -pointer.deltaX : pointer.deltaX
  }
  if (pointer.deltaY === 0) return null
  return pointer.deltaY
}

export function measureSplitterContainer(
  element: HTMLElement | null | undefined,
  direction: SplitDirection
): number {
  if (!element) return 0
  return direction === 'horizontal' ? element.clientWidth : element.clientHeight
}

export function formatSplitterGutterLabel(template: string, index: number): string {
  return template.replace(/\{index\}/g, String(index + 1))
}

export function getSplitterGutterValueNow(pixels: number[], gutterIndex: number): number {
  const left = pixels[gutterIndex] ?? 0
  const right = pixels[gutterIndex + 1] ?? 0
  const total = left + right
  if (total <= 0) return 0
  return Math.round((left / total) * 100)
}
