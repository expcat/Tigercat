/**
 * Popover utility functions
 */
import { classNames } from './class-names'

/**
 * Get base popover container classes
 */
export function getPopoverContainerClasses(): string {
  return classNames(
    'tiger-popover',
    'relative',
    'inline-block'
  )
}

/**
 * Get popover trigger classes
 */
export function getPopoverTriggerClasses(disabled: boolean): string {
  return classNames(
    'tiger-popover-trigger',
    disabled && 'cursor-not-allowed opacity-50'
  )
}

/**
 * Get popover content wrapper classes
 */
export function getPopoverContentClasses(width?: string | number): string {
  let widthClass = 'min-w-[200px]'
  
  if (width) {
    if (typeof width === 'number') {
      widthClass = `w-[${width}px]`
    } else if (width.match(/^\d+$/)) {
      widthClass = `w-[${width}px]`
    } else {
      widthClass = width
    }
  }
  
  return classNames(
    'tiger-popover-content',
    widthClass,
    'max-w-[400px]',
    'p-3',
    'bg-white',
    'rounded-lg',
    'shadow-lg',
    'border',
    'border-gray-200',
    'dark:bg-gray-800',
    'dark:border-gray-700'
  )
}

/**
 * Get popover title classes
 */
export function getPopoverTitleClasses(): string {
  return classNames(
    'tiger-popover-title',
    'text-sm',
    'font-semibold',
    'text-gray-900',
    'dark:text-gray-100',
    'mb-2',
    'border-b',
    'border-gray-200',
    'dark:border-gray-700',
    'pb-2'
  )
}

/**
 * Get popover content text classes
 */
export function getPopoverContentTextClasses(): string {
  return classNames(
    'tiger-popover-text',
    'text-sm',
    'text-gray-700',
    'dark:text-gray-300'
  )
}
