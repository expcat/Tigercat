import { classNames } from './class-names'
import type { ComponentSize } from '../types/base'

export interface SegmentedIndicatorStyle {
  insetInlineStart: string
  width: string
  opacity: string
}

export interface SegmentedContainerStyle {
  gridTemplateColumns: string
}

export function getSegmentedContainerClasses(size: ComponentSize, block: boolean): string {
  const sizeClasses: Record<ComponentSize, string> = {
    sm: 'p-0.5 text-xs',
    md: 'p-1 text-sm',
    lg: 'p-1 text-base'
  }

  return classNames(
    'relative inline-grid rounded-[var(--tiger-radius-md)]',
    'bg-[var(--tiger-surface-muted)]',
    sizeClasses[size],
    block ? 'w-full' : ''
  )
}

export function getSegmentedContainerStyle(optionCount: number): SegmentedContainerStyle {
  return {
    gridTemplateColumns: `repeat(${Math.max(1, optionCount)}, minmax(0, 1fr))`
  }
}

export function getSegmentedIndicatorClasses(size: ComponentSize): string {
  const insetClasses: Record<ComponentSize, string> = {
    sm: 'top-0.5 bottom-0.5',
    md: 'top-1 bottom-1',
    lg: 'top-1 bottom-1'
  }

  return classNames(
    'pointer-events-none absolute z-0 rounded-[var(--tiger-radius-md)]',
    'bg-[var(--tiger-surface-raised)] shadow-sm',
    'tiger-motion-aware transition-[inset-inline-start,width] duration-[var(--tiger-motion-duration-base)] ease-[var(--tiger-motion-ease-standard)]',
    insetClasses[size]
  )
}

export function getSegmentedTrackClasses(): string {
  return 'pointer-events-none absolute inset-0 overflow-hidden rounded-[var(--tiger-radius-md)]'
}

export function getSegmentedIndicatorStyle(
  selectedIndex: number,
  optionCount: number,
  size: ComponentSize
): SegmentedIndicatorStyle {
  const horizontalInset: Record<ComponentSize, string> = {
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.25rem'
  }
  const safeOptionCount = Math.max(1, optionCount)
  const safeSelectedIndex = Math.min(Math.max(0, selectedIndex), safeOptionCount - 1)
  const inset = horizontalInset[size]

  return {
    insetInlineStart: `calc(${inset} + ${safeSelectedIndex} * ((100% - (${inset} * 2)) / ${safeOptionCount}))`,
    width: `calc((100% - (${inset} * 2)) / ${safeOptionCount})`,
    opacity: selectedIndex >= 0 && optionCount > 0 ? '1' : '0'
  }
}

export function getSegmentedOptionClasses(
  size: ComponentSize,
  isSelected: boolean,
  isDisabled: boolean
): string {
  const sizePad: Record<ComponentSize, string> = {
    sm: 'px-2 py-0.5',
    md: 'px-3 py-1',
    lg: 'px-4 py-1.5'
  }

  return classNames(
    'relative z-10 inline-flex items-center justify-center gap-1 rounded-[var(--tiger-radius-md)] font-medium transition-colors duration-200 whitespace-nowrap',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'focus-visible:ring-[var(--tiger-focus-ring)]/40',
    sizePad[size],
    isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    isSelected
      ? 'text-[var(--tiger-text)]'
      : isDisabled
        ? 'text-[var(--tiger-text-secondary)]'
        : 'text-[var(--tiger-text-secondary)] hover:text-[var(--tiger-text)]'
  )
}

/**
 * Tab stop is the selected option when it is enabled, otherwise the first
 * enabled option. `-1` when every option is disabled.
 */
export function getSegmentedRovingIndex(
  selectedIndex: number,
  enabledIndexes: readonly number[]
): number {
  if (enabledIndexes.length === 0) return -1
  if (enabledIndexes.includes(selectedIndex)) return selectedIndex
  return enabledIndexes[0]
}

export function getSegmentedKeyboardTarget(
  key: string,
  index: number,
  enabledIndexes: number[],
  rtl: boolean
): number | null {
  if (enabledIndexes.length === 0) return null
  const pos = enabledIndexes.indexOf(index)
  const at = pos < 0 ? 0 : pos
  const last = enabledIndexes.length - 1
  const next = () => enabledIndexes[(at + 1) % enabledIndexes.length]
  const prev = () => enabledIndexes[(at - 1 + enabledIndexes.length) % enabledIndexes.length]

  switch (key) {
    case 'ArrowRight':
      return rtl ? prev() : next()
    case 'ArrowLeft':
      return rtl ? next() : prev()
    case 'ArrowDown':
      return next()
    case 'ArrowUp':
      return prev()
    case 'Home':
      return enabledIndexes[0]
    case 'End':
      return enabledIndexes[last]
    default:
      return null
  }
}
