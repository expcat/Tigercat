import { classNames } from './class-names'
import type { SegmentedSize } from '../types/segmented'

export interface SegmentedIndicatorStyle {
  left: string
  width: string
  transform: string
  opacity: string
}

export interface SegmentedContainerStyle {
  gridTemplateColumns: string
}

/* ------------------------------------------------------------------ */
/*  Style constants                                                    */
/* ------------------------------------------------------------------ */

export function getSegmentedContainerClasses(size: SegmentedSize, block: boolean): string {
  const sizeClasses: Record<SegmentedSize, string> = {
    sm: 'p-0.5 text-xs',
    md: 'p-1 text-sm',
    lg: 'p-1 text-base'
  }

  return classNames(
    'relative inline-grid overflow-hidden rounded-[var(--tiger-radius-md,0.5rem)]',
    'bg-[var(--tiger-segmented-bg,var(--tiger-fill,#f3f4f6))]',
    sizeClasses[size],
    block ? 'w-full' : ''
  )
}

export function getSegmentedContainerStyle(optionCount: number): SegmentedContainerStyle {
  return {
    gridTemplateColumns: `repeat(${Math.max(1, optionCount)}, minmax(0, 1fr))`
  }
}

export function getSegmentedIndicatorClasses(size: SegmentedSize): string {
  const insetClasses: Record<SegmentedSize, string> = {
    sm: 'top-0.5 bottom-0.5',
    md: 'top-1 bottom-1',
    lg: 'top-1 bottom-1'
  }

  return classNames(
    'pointer-events-none absolute z-0 rounded-[var(--tiger-radius-md,0.5rem)]',
    'bg-[var(--tiger-segmented-active-bg,var(--tiger-surface,#ffffff))] shadow-sm',
    'transition-transform duration-200 ease-out will-change-transform',
    insetClasses[size]
  )
}

export function getSegmentedIndicatorStyle(
  selectedIndex: number,
  optionCount: number,
  size: SegmentedSize
): SegmentedIndicatorStyle {
  const horizontalInset: Record<SegmentedSize, string> = {
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.25rem'
  }
  const safeOptionCount = Math.max(1, optionCount)
  const safeSelectedIndex = Math.min(Math.max(0, selectedIndex), safeOptionCount - 1)
  const inset = horizontalInset[size]

  return {
    left: inset,
    width: `calc((100% - (${inset} * 2)) / ${safeOptionCount})`,
    transform: `translateX(${safeSelectedIndex * 100}%)`,
    opacity: selectedIndex >= 0 && optionCount > 0 ? '1' : '0'
  }
}

export function getSegmentedOptionClasses(
  size: SegmentedSize,
  isSelected: boolean,
  isDisabled: boolean
): string {
  const sizePad: Record<SegmentedSize, string> = {
    sm: 'px-2 py-0.5',
    md: 'px-3 py-1',
    lg: 'px-4 py-1.5'
  }

  return classNames(
    'relative z-10 inline-flex items-center justify-center rounded-[var(--tiger-radius-md,0.5rem)] font-medium transition-colors duration-200 whitespace-nowrap',
    sizePad[size],
    isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    isSelected
      ? 'text-[var(--tiger-segmented-active-text,var(--tiger-text,#111827))]'
      : isDisabled
        ? 'text-[var(--tiger-segmented-text,var(--tiger-text-muted,#6b7280))]'
        : 'text-[var(--tiger-segmented-text,var(--tiger-text-muted,#6b7280))] hover:text-[var(--tiger-segmented-text-hover,var(--tiger-text,#111827))]'
  )
}
