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
    'max-w-[var(--tiger-component-tooltip-max-width,280px)]',
    'px-[var(--tiger-component-tooltip-padding-x,8px)]',
    'py-[var(--tiger-component-tooltip-padding-y,4px)]',
    'text-[length:var(--tiger-component-tooltip-font-size,14px)]',
    'text-[var(--tiger-component-tooltip-text-color,#ffffff)]',
    'bg-[var(--tiger-component-tooltip-bg,#262626)]',
    'rounded-[var(--tiger-component-tooltip-border-radius,var(--tiger-radius-sm,0.375rem))]',
    'shadow-[var(--tiger-component-tooltip-shadow,var(--tw-shadow,0_10px_15px_-3px_rgb(0_0_0_/_0.1)))]',
    'whitespace-normal break-words'
  )
}
