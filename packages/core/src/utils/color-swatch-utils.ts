import { classNames } from './class-names'
import type {
  ColorSwatchGroup,
  ColorSwatchNormalizedGroup,
  ColorSwatchNormalizedOption,
  ColorSwatchOptionInput
} from '../types/color-swatch'
import type { ComponentSize } from '../types/base'
import { parseColorParts } from './color-picker-utils'

export const COLOR_SWATCH_CHECK_PATH = 'M5 10.5 8 13.5 15 6.5'

export const defaultColorSwatchPalette: ColorSwatchGroup[] = [
  {
    colors: ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#14b8a6', '#0ea5e9']
  },
  {
    colors: ['#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#64748b']
  }
]

export function createDefaultColorSwatchGroups(
  primaryLabel: string,
  accentLabel: string
): ColorSwatchGroup[] {
  return [
    { label: primaryLabel, colors: defaultColorSwatchPalette[0].colors },
    { label: accentLabel, colors: defaultColorSwatchPalette[1].colors }
  ]
}

export const colorSwatchBaseClasses = classNames(
  'inline-flex flex-col gap-3 rounded-[var(--tiger-radius-md,0.5rem)]',
  'text-[var(--tiger-text,#111827)]'
)

export const colorSwatchGroupClasses = 'flex flex-col gap-2'

export const colorSwatchGroupLabelClasses =
  'text-xs font-medium text-[var(--tiger-text-muted,#6b7280)]'

export const colorSwatchGridClasses = 'grid gap-2'

const colorSwatchSizeClasses: Record<ComponentSize, string> = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10'
}

export function getColorSwatchButtonClasses(
  size: ComponentSize,
  selected: boolean,
  disabled: boolean
): string {
  return classNames(
    'relative inline-flex shrink-0 items-center justify-center rounded-[var(--tiger-radius-md,0.5rem)] border',
    'tiger-motion-aware [transition:var(--tiger-transition-base,border-color_150ms_ease,box-shadow_150ms_ease,transform_150ms_ease)]',
    'border-[var(--tiger-border,#d1d5db)]',
    'outline-none focus-visible:ring-2 focus-visible:ring-inset',
    'focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]',
    colorSwatchSizeClasses[size],
    selected
      ? 'ring-2 ring-inset ring-[var(--tiger-primary,#2563eb)]'
      : 'motion-safe:hover:scale-105 hover:border-[var(--tiger-primary,#2563eb)]',
    disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer'
  )
}

export type ColorSwatchCheckTone = 'light' | 'dark'

export function getColorSwatchCheckTone(color: string): ColorSwatchCheckTone {
  const parts = parseColorParts(color)
  if (!parts) return 'light'
  const r = parts.r / 255
  const g = parts.g / 255
  const b = parts.b / 255
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
  return luminance > 0.4 ? 'dark' : 'light'
}

export function getColorSwatchCheckClasses(
  size: ComponentSize,
  tone: ColorSwatchCheckTone = 'light'
): string {
  return classNames(
    'pointer-events-none',
    tone === 'light'
      ? 'text-white [filter:drop-shadow(0_0_1px_rgb(0_0_0_/_0.85))]'
      : 'text-[var(--tiger-text,#111827)] [filter:drop-shadow(0_0_1px_rgb(255_255_255_/_0.9))]',
    size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
  )
}

export function normalizeColorSwatchGroups(
  groups?: ColorSwatchGroup[],
  colors?: ColorSwatchOptionInput[],
  fallbackGroups?: ColorSwatchGroup[]
): ColorSwatchNormalizedGroup[] {
  const sourceGroups =
    groups && groups.length > 0
      ? groups
      : colors
        ? [{ colors }]
        : (fallbackGroups ?? createDefaultColorSwatchGroups('Primary', 'Accent'))

  return sourceGroups.map((group, groupIndex) => ({
    label: group.label,
    colors: group.colors.map((color, index) => normalizeColorSwatchOption(color, groupIndex, index))
  }))
}

export function flattenColorSwatchGroups(
  groups: ColorSwatchNormalizedGroup[]
): ColorSwatchNormalizedOption[] {
  return groups.flatMap((group) => group.colors)
}

export function normalizeColorSwatchValue(value: string): string {
  return value.trim().toLowerCase()
}

export function isColorSwatchSelected(value: string, selectedValue?: string): boolean {
  return (
    selectedValue !== undefined &&
    selectedValue !== '' &&
    normalizeColorSwatchValue(value) === normalizeColorSwatchValue(selectedValue)
  )
}

export function getColorSwatchOptionKey(option: ColorSwatchNormalizedOption): string {
  return `${option.groupIndex}-${option.index}-${option.value}`
}

export function getNextColorSwatchIndex(
  groups: ColorSwatchNormalizedGroup[],
  currentIndex: number,
  key: string,
  columns: number,
  dir: 'ltr' | 'rtl' = 'ltr'
): number {
  const options = flattenColorSwatchGroups(groups)
  if (options.length === 0 || options.every((option) => option.disabled)) return -1

  if (key === 'Home') return findEnabledColorSwatchIndex(options, 0, 1, true)
  if (key === 'End') return findEnabledColorSwatchIndex(options, options.length - 1, -1, true)

  const safeIndex =
    currentIndex >= 0 ? currentIndex : findEnabledColorSwatchIndex(options, 0, 1, true)
  if (safeIndex < 0) return -1

  if (key === 'ArrowRight' || key === 'ArrowLeft') {
    const forward = dir === 'rtl' ? key === 'ArrowLeft' : key === 'ArrowRight'
    return stepFlatWrap(options, safeIndex, forward ? 1 : -1)
  }

  if (key === 'ArrowDown' || key === 'ArrowUp') {
    return stepGroupGrid(groups, options, safeIndex, columns, key === 'ArrowDown' ? 1 : -1)
  }

  return safeIndex
}

function normalizeColorSwatchOption(
  color: ColorSwatchOptionInput,
  groupIndex: number,
  index: number
): ColorSwatchNormalizedOption {
  return typeof color === 'string'
    ? { value: color, label: color, groupIndex, index }
    : { ...color, label: color.label ?? color.value, groupIndex, index }
}

function findEnabledColorSwatchIndex(
  options: ColorSwatchNormalizedOption[],
  startIndex: number,
  direction: 1 | -1,
  wrap: boolean
): number {
  if (options.length === 0) return -1
  let index = Math.min(Math.max(startIndex, 0), options.length - 1)
  for (let i = 0; i < options.length; i++) {
    if (!options[index].disabled) return index
    index += direction
    if (index < 0 || index >= options.length) {
      if (!wrap) return -1
      index = direction === 1 ? 0 : options.length - 1
    }
  }
  return -1
}

function stepFlatWrap(
  options: ColorSwatchNormalizedOption[],
  current: number,
  direction: 1 | -1
): number {
  let index = current
  for (let i = 0; i < options.length; i++) {
    index = (index + direction + options.length) % options.length
    if (!options[index].disabled) return index
  }
  return current
}

function stepGroupGrid(
  groups: ColorSwatchNormalizedGroup[],
  options: ColorSwatchNormalizedOption[],
  currentIndex: number,
  columns: number,
  rowDelta: 1 | -1
): number {
  const current = options[currentIndex]
  if (!current) return currentIndex
  const cols = Math.max(1, columns)
  const group = groups[current.groupIndex]
  if (!group) return currentIndex

  const local = current.index
  const col = local % cols
  const nextLocal = local + rowDelta * cols

  if (nextLocal >= 0 && nextLocal < group.colors.length) {
    const candidate = group.colors[nextLocal]
    const flat = options.findIndex(
      (option) => option.groupIndex === candidate.groupIndex && option.index === candidate.index
    )
    if (flat >= 0 && !options[flat].disabled) return flat
    return findEnabledColorSwatchIndex(options, flat, rowDelta, false) >= 0
      ? findEnabledInGroupColumn(
          groups,
          options,
          current.groupIndex,
          col,
          cols,
          rowDelta,
          nextLocal
        )
      : stepAcrossGroups(groups, options, current.groupIndex, col, cols, rowDelta)
  }

  return stepAcrossGroups(groups, options, current.groupIndex, col, cols, rowDelta)
}

function findEnabledInGroupColumn(
  groups: ColorSwatchNormalizedGroup[],
  options: ColorSwatchNormalizedOption[],
  groupIndex: number,
  col: number,
  cols: number,
  rowDelta: 1 | -1,
  startLocal: number
): number {
  const group = groups[groupIndex]
  if (!group) return -1
  let local = startLocal
  while (local >= 0 && local < group.colors.length) {
    const option = group.colors[local]
    if (option && option.index % cols === col && !option.disabled) {
      return options.findIndex(
        (item) => item.groupIndex === option.groupIndex && item.index === option.index
      )
    }
    local += rowDelta * cols
  }
  return -1
}

function stepAcrossGroups(
  groups: ColorSwatchNormalizedGroup[],
  options: ColorSwatchNormalizedOption[],
  groupIndex: number,
  col: number,
  cols: number,
  rowDelta: 1 | -1
): number {
  const count = groups.length
  if (count === 0) return -1
  for (let step = 1; step <= count; step++) {
    const nextGroupIndex = (groupIndex + rowDelta * step + count) % count
    const group = groups[nextGroupIndex]
    if (!group || group.colors.length === 0) continue
    const startLocal =
      rowDelta === 1 ? col : col + Math.floor((group.colors.length - 1) / cols) * cols
    const found = findEnabledInGroupColumn(
      groups,
      options,
      nextGroupIndex,
      col,
      cols,
      rowDelta,
      Math.min(Math.max(startLocal, 0), group.colors.length - 1)
    )
    if (found >= 0) return found
    const fallbackStart = rowDelta === 1 ? 0 : group.colors.length - 1
    const fallback = findEnabledColorSwatchIndex(group.colors, fallbackStart, rowDelta, false)
    if (fallback >= 0) {
      const option = group.colors[fallback]
      return options.findIndex(
        (item) => item.groupIndex === option.groupIndex && item.index === option.index
      )
    }
  }
  return options.findIndex((option) => !option.disabled)
}
