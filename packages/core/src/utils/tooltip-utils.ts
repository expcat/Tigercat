/**
 * Tooltip utility functions
 */
import { classNames } from './class-names'

/**
 * Get base tooltip container classes
 */
export function getTooltipContainerClasses(): string {
  return classNames('tiger-tooltip', 'relative', 'inline-block')
}

/**
 * Get tooltip trigger classes
 */
export function getTooltipTriggerClasses(disabled: boolean): string {
  return classNames(
    'tiger-tooltip-trigger',
    'inline-flex items-center bg-transparent p-0 border-0 font-inherit text-inherit',
    disabled ? 'cursor-not-allowed opacity-50' : undefined
  )
}

/**
 * Tooltip bubble. Fill and type read runtime tokens that tokens.css emits.
 * Light text sits on the text color so the bubble stays dark in light mode
 * and inverts with the theme.
 */
export function getTooltipContentClasses(): string {
  return classNames(
    'tiger-tooltip-content',
    'max-w-[280px]',
    'px-[var(--tiger-spacing-md)]',
    'py-[var(--tiger-spacing-sm)]',
    'text-[length:var(--tiger-font-size-sm)]',
    'text-[var(--tiger-surface)]',
    'bg-[var(--tiger-text)]',
    'rounded-[var(--tiger-radius-sm)]',
    'shadow-[var(--tiger-shadow-lg)]',
    'whitespace-normal break-words'
  )
}

/** Caret painted in the bubble color. Position comes from `getFloatingArrowStyle`. */
export function getTooltipArrowClasses(): string {
  return classNames(
    'tiger-tooltip-arrow',
    'z-10',
    'box-border',
    'rotate-45',
    'pointer-events-none',
    'bg-[var(--tiger-text)]'
  )
}
