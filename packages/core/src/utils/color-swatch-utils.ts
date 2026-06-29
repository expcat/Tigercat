import { classNames } from './class-names'
import type {
  ColorSwatchGroup,
  ColorSwatchNormalizedGroup,
  ColorSwatchNormalizedOption,
  ColorSwatchOptionInput
} from '../types/color-swatch'
import type { ComponentSize } from '../types/base'

export const defaultColorSwatchGroups: ColorSwatchGroup[] = [
  {
    label: 'Primary',
    colors: ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#14b8a6', '#0ea5e9']
  },
  {
    label: 'Accent',
    colors: ['#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#ec4899', '#64748b']
  }
]

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
    'relative inline-flex shrink-0 items-center justify-center rounded-[var(--tiger-radius-md,0.5rem)] border transition-all outline-none',
    'border-[var(--tiger-colorswatch-border,var(--tiger-border,#d1d5db))]',
    'focus-visible:ring-2 focus-visible:ring-[var(--tiger-colorswatch-ring,var(--tiger-primary,#2563eb))] focus-visible:ring-offset-2',
    colorSwatchSizeClasses[size],
    selected
      ? 'ring-2 ring-[var(--tiger-colorswatch-selected,var(--tiger-primary,#2563eb))] ring-offset-2'
      : 'hover:scale-105 hover:border-[var(--tiger-colorswatch-border-hover,var(--tiger-primary,#2563eb))]',
    disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer'
  )
}

export function getColorSwatchCheckClasses(size: ComponentSize): string {
  return classNames(
    'pointer-events-none rounded-full bg-white/90 text-[var(--tiger-primary,#2563eb)] shadow-sm',
    size === 'sm' ? 'h-3 w-3 text-[8px]' : size === 'md' ? 'h-4 w-4 text-[10px]' : 'h-5 w-5 text-xs'
  )
}

export function normalizeColorSwatchGroups(
  groups?: ColorSwatchGroup[],
  colors?: ColorSwatchOptionInput[]
): ColorSwatchNormalizedGroup[] {
  const sourceGroups =
    groups && groups.length > 0 ? groups : colors ? [{ colors }] : defaultColorSwatchGroups

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
    normalizeColorSwatchValue(value) === normalizeColorSwatchValue(selectedValue)
  )
}

export function getColorSwatchOptionKey(option: ColorSwatchNormalizedOption): string {
  return `${option.groupIndex}-${option.index}-${option.value}`
}

export function getNextColorSwatchIndex(
  options: ColorSwatchNormalizedOption[],
  currentIndex: number,
  key: string,
  columns: number
): number {
  if (options.length === 0 || options.every((option) => option.disabled)) return -1

  if (key === 'Home') return findEnabledColorSwatchIndex(options, 0, 1)
  if (key === 'End') return findEnabledColorSwatchIndex(options, options.length - 1, -1)

  const safeIndex = currentIndex >= 0 ? currentIndex : findEnabledColorSwatchIndex(options, 0, 1)
  const step = getColorSwatchNavigationStep(key, columns)
  if (step === 0) return safeIndex

  return findEnabledColorSwatchIndex(options, safeIndex + step, step > 0 ? 1 : -1)
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

function getColorSwatchNavigationStep(key: string, columns: number): number {
  if (key === 'ArrowRight') return 1
  if (key === 'ArrowLeft') return -1
  if (key === 'ArrowDown') return Math.max(1, columns)
  if (key === 'ArrowUp') return -Math.max(1, columns)
  return 0
}

function findEnabledColorSwatchIndex(
  options: ColorSwatchNormalizedOption[],
  startIndex: number,
  direction: 1 | -1
): number {
  let index = Math.min(Math.max(startIndex, 0), options.length - 1)

  while (index >= 0 && index < options.length) {
    if (!options[index].disabled) return index
    index += direction
  }

  return -1
}
