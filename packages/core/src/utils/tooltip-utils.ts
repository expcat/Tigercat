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
 * Get tooltip content classes
 */
export function getTooltipContentClasses(): string {
  return classNames(
    'tiger-tooltip-content',
    'max-w-[var(--tiger-component-tooltip-max-width)]',
    'px-[var(--tiger-component-tooltip-padding-x)]',
    'py-[var(--tiger-component-tooltip-padding-y)]',
    'text-[length:var(--tiger-component-tooltip-font-size)]',
    'text-[var(--tiger-component-tooltip-text-color)]',
    'bg-[var(--tiger-component-tooltip-bg)]',
    'rounded-[var(--tiger-component-tooltip-border-radius)]',
    'shadow-[var(--tiger-component-tooltip-shadow)]',
    'whitespace-normal break-words'
  )
}
