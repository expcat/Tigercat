import { classNames } from './class-names'
import type { SegmentedSize } from '../types/segmented'

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
    'inline-flex rounded-lg',
    'bg-[var(--tiger-segmented-bg,var(--tiger-fill,#f3f4f6))]',
    sizeClasses[size],
    block ? 'w-full' : ''
  )
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
    'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
    sizePad[size],
    isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
    isSelected
      ? 'bg-[var(--tiger-segmented-active-bg,var(--tiger-surface,#ffffff))] text-[var(--tiger-segmented-active-text,var(--tiger-text,#111827))] shadow-sm'
      : isDisabled
        ? 'text-[var(--tiger-segmented-text,var(--tiger-text-muted,#6b7280))]'
        : 'text-[var(--tiger-segmented-text,var(--tiger-text-muted,#6b7280))] hover:text-[var(--tiger-segmented-text-hover,var(--tiger-text,#111827))]'
  )
}
