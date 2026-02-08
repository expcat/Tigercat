/**
 * Popover utility functions
 */
import { classNames } from './class-names'

/** Base popover container classes */
export function getPopoverContainerClasses(): string {
  return classNames('tiger-popover', 'relative', 'inline-block')
}

/** Popover trigger classes */
export function getPopoverTriggerClasses(disabled: boolean): string {
  return classNames('tiger-popover-trigger', disabled && 'cursor-not-allowed opacity-50')
}

/** Popover content wrapper classes */
export function getPopoverContentClasses(width?: string | number): string {
  let widthClass = 'min-w-[200px]'
  if (width != null && width !== '') {
    const w = String(width)
    widthClass = /^\d+$/.test(w) ? `w-[${w}px]` : w
  }

  return classNames(
    'tiger-popover-content',
    widthClass,
    'max-w-[400px]',
    'p-3',
    'bg-[var(--tiger-surface,#ffffff)]',
    'rounded-lg',
    'shadow-lg',
    'border',
    'border-[var(--tiger-border,#e5e7eb)]'
  )
}

/** Popover title classes (static) */
export const POPOVER_TITLE_CLASSES = classNames(
  'tiger-popover-title',
  'text-sm',
  'font-semibold',
  'text-[var(--tiger-text,#111827)]',
  'mb-2',
  'border-b',
  'border-[var(--tiger-border,#e5e7eb)]',
  'pb-2'
)

/** Popover content text classes (static) */
export const POPOVER_TEXT_CLASSES = classNames(
  'tiger-popover-text',
  'text-sm',
  'text-[var(--tiger-text-muted,#374151)]'
)

/**
 * @deprecated Use POPOVER_TITLE_CLASSES instead
 */
export function getPopoverTitleClasses(): string {
  return POPOVER_TITLE_CLASSES
}

/**
 * @deprecated Use POPOVER_TEXT_CLASSES instead
 */
export function getPopoverContentTextClasses(): string {
  return POPOVER_TEXT_CLASSES
}
