/**
 * Popover utility functions
 */
import { classNames } from './class-names'
import { getOverlayPanelClasses } from './overlay-panel'

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
    getOverlayPanelClasses(),
    hasCustomWidth ? undefined : 'min-w-[200px] max-w-[20rem]'
  )
}

const CSS_LENGTH =
  /^(?:0|[+-]?(?:\d+|\d*\.\d+)(?:px|rem|em|%|vw|vh|dvh|dvw|svh|svw|lvh|lvw|ch|ex|cap|lh|rlh|cqw|cqh|cqi|cqb|vmin|vmax|cm|mm|in|pt|pc))$/i

export interface PopoverWidthResolution {
  /** Present when the value is a finite positive pixel count or one CSS length. */
  width?: string
  invalid: boolean
}

/**
 * One width: a positive pixel number, or one CSS length written as `width`.
 * Anything else is invalid and the default max-width stays.
 */
export function resolvePopoverWidth(width?: number | string): PopoverWidthResolution {
  if (width == null || width === '') return { invalid: false }
  if (typeof width === 'number') {
    if (!Number.isFinite(width) || width <= 0) return { invalid: true }
    return { width: `${width}px`, invalid: false }
  }
  const trimmed = width.trim()
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const pixels = Number(trimmed)
    if (!Number.isFinite(pixels) || pixels <= 0) return { invalid: true }
    return { width: `${pixels}px`, invalid: false }
  }
  if (CSS_LENGTH.test(trimmed)) return { width: trimmed, invalid: false }
  return { invalid: true }
}

export function getPopoverContentStyle(
  width?: number | string
): Record<string, string> | undefined {
  const resolved = resolvePopoverWidth(width)
  if (!resolved.width) return undefined
  return { width: resolved.width }
}

/** Popover title classes (static) */
export const POPOVER_TITLE_CLASSES = classNames(
  'tiger-popover-title',
  'text-sm',
  'font-semibold',
  'text-[var(--tiger-text)]',
  'mb-2',
  'border-b',
  'border-[var(--tiger-border)]',
  'pb-2'
)

/** Popover content text classes (static) */
export const POPOVER_TEXT_CLASSES = classNames(
  'tiger-popover-text',
  'text-sm',
  'text-[var(--tiger-text-secondary)]'
)
