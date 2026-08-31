/**
 * Popover utility functions
 */
import { classNames } from './class-names'

/** Base popover container classes */
export function getPopoverContainerClasses(): string {
  return classNames('tiger-popover', 'relative', 'inline-block')
}

/** Popover trigger classes (self-rendered `<button type="button">`) */
export function getPopoverTriggerClasses(disabled: boolean): string {
  return classNames(
    'tiger-popover-trigger',
    'inline-flex items-center bg-transparent p-0 border-0 font-inherit text-inherit',
    disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
  )
}

/** Popover content wrapper classes. Pixel `width` is applied as inline style. */
export function getPopoverContentClasses(hasCustomWidth = false): string {
  return classNames(
    'tiger-popover-content',
    hasCustomWidth ? undefined : 'min-w-[200px]',
    hasCustomWidth ? undefined : 'max-w-[var(--tiger-component-popover-max-width,400px)]',
    'p-[var(--tiger-component-popover-padding,0.75rem)]',
    'bg-[var(--tiger-surface,#ffffff)]',
    'rounded-[var(--tiger-component-popover-border-radius,var(--tiger-radius-lg,0.75rem))]',
    'shadow-[var(--tiger-component-popover-shadow,var(--tw-shadow,0_10px_15px_-3px_rgb(0_0_0_/_0.1)))]',
    'border',
    'border-[var(--tiger-border,#e5e7eb)]'
  )
}

export function getPopoverContentStyle(
  width?: number | string
): Record<string, string> | undefined {
  if (width == null || width === '') return undefined
  const pixels = typeof width === 'number' ? width : Number(width)
  if (!Number.isFinite(pixels) || pixels <= 0) return undefined
  return { width: `${pixels}px`, maxWidth: `${pixels}px` }
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
