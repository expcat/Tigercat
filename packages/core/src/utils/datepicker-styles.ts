/**
 * DatePicker styling utilities
 */

import type { ComponentSize } from '../types/base'
import { classNames } from './class-names'

/**
 * Base classes for DatePicker container
 */
export const datePickerBaseClasses = 'relative inline-block w-full'

/**
 * Base classes for DatePicker input wrapper
 */
export const datePickerInputWrapperClasses = 'relative w-full'

/**
 * Get input classes based on size
 */
export function getDatePickerInputClasses(
  size: ComponentSize = 'md',
  disabled = false,
  showClear = false
): string {
  const baseClasses = [
    'w-full',
    'rounded-[var(--tiger-radius-md,0.5rem)]',
    'border',
    'border-[var(--tiger-border,#d1d5db)]',
    'bg-[var(--tiger-surface,#ffffff)]',
    'text-[var(--tiger-text,#111827)]',
    'placeholder:text-[var(--tiger-text-muted,#9ca3af)]',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-[var(--tiger-primary,#2563eb)]',
    'focus:border-transparent',
    'transition-colors'
  ]

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  }

  // Reserve space for the calendar button (right-0 + px per size + w-5 icon),
  // plus the clear button (right-10, 24px wide) only when it is visible
  const rightPaddingClasses = showClear
    ? 'pr-16'
    : { sm: 'pr-10', md: 'pr-12', lg: 'pr-14' }[size]

  const disabledClasses = disabled
    ? [
        'bg-[var(--tiger-surface-muted,#f3f4f6)]',
        'cursor-not-allowed',
        'text-[var(--tiger-text-muted,#6b7280)]'
      ]
    : ['cursor-pointer']

  return classNames(...baseClasses, sizeClasses[size], rightPaddingClasses, ...disabledClasses)
}

/**
 * Icon button classes
 */
export function getDatePickerIconButtonClasses(size: ComponentSize = 'md'): string {
  const baseClasses = [
    'absolute',
    'right-0',
    'top-0',
    'bottom-0',
    'flex',
    'items-center',
    'justify-center',
    'text-[var(--tiger-text-muted,#9ca3af)]',
    'hover:text-[var(--tiger-text,#111827)]',
    'transition-colors'
  ]

  const sizeClasses = {
    sm: 'px-2',
    md: 'px-3',
    lg: 'px-4'
  }

  return classNames(...baseClasses, sizeClasses[size])
}

/**
 * Base classes for calendar dropdown
 */
export const datePickerCalendarClasses = classNames(
  'absolute',
  'z-50',
  'mt-1',
  'bg-[var(--tiger-surface,#ffffff)]',
  'border',
  'border-[var(--tiger-border,#d1d5db)]',
  'rounded-[var(--tiger-radius-md,0.5rem)]',
  'shadow-lg',
  'p-4',
  'w-80',
  'max-sm:hidden'
)

export const datePickerMobileWheelClasses = classNames(
  'sm:hidden',
  'fixed',
  'inset-x-0',
  'bottom-0',
  'z-50',
  'rounded-t-[var(--tiger-radius-lg,0.75rem)]',
  'border',
  'border-[var(--tiger-border,#e5e7eb)]',
  'bg-[var(--tiger-surface,#ffffff)]',
  'p-4',
  'shadow-2xl',
  'pb-[calc(1rem+env(safe-area-inset-bottom))]'
)

export const datePickerMobileWheelGridClasses = classNames('grid', 'grid-cols-3', 'gap-2')

export const datePickerMobileWheelSelectClasses = classNames(
  'w-full',
  'rounded-[var(--tiger-radius-md,0.5rem)]',
  'border',
  'border-[var(--tiger-border,#d1d5db)]',
  'bg-[var(--tiger-surface,#ffffff)]',
  'px-3',
  'py-3',
  'text-center',
  'text-base',
  'text-[var(--tiger-text,#111827)]',
  'focus:outline-none',
  'focus:ring-2',
  'focus:ring-[var(--tiger-primary,#2563eb)]'
)

/**
 * Calendar header classes
 */
export const datePickerCalendarHeaderClasses = classNames(
  'flex',
  'items-center',
  'justify-between',
  'mb-4'
)

/**
 * Calendar navigation button classes
 */
export const datePickerNavButtonClasses = classNames(
  'p-2',
  'rounded-[var(--tiger-radius-md,0.5rem)]',
  'hover:bg-[var(--tiger-surface-muted,#f3f4f6)]',
  'transition-colors',
  'text-[var(--tiger-text-muted,#4b5563)]',
  'hover:text-[var(--tiger-text,#111827)]',
  'focus:outline-none',
  'focus:ring-2',
  'focus:ring-[var(--tiger-primary,#2563eb)]'
)

/**
 * Calendar month/year display classes
 */
export const datePickerMonthYearClasses = classNames(
  'text-base',
  'font-semibold',
  'text-[var(--tiger-text,#111827)]'
)

/**
 * Calendar grid classes
 */
export const datePickerCalendarGridClasses = classNames('grid', 'grid-cols-7', 'gap-1')

/**
 * Day name header classes
 */
export const datePickerDayNameClasses = classNames(
  'text-center',
  'text-xs',
  'font-medium',
  'text-[var(--tiger-text-muted,#6b7280)]',
  'py-2'
)

/**
 * Get day cell classes.
 * Uses early returns to avoid conflicting Tailwind classes
 * (e.g. text-gray-900 + text-white, hover:bg-gray-100 + hover:bg-primary).
 */
export function getDatePickerDayCellClasses(
  isCurrentMonth: boolean,
  isSelected: boolean,
  isToday: boolean,
  isDisabled: boolean,
  isInRange = false,
  isRangeStart = false,
  isRangeEnd = false
): string {
  const base =
    'w-10 h-10 flex items-center justify-center rounded-[var(--tiger-radius-md,0.5rem)] text-sm transition-colors'

  if (isDisabled) {
    return classNames(
      base,
      'cursor-not-allowed text-[var(--tiger-text-muted,#9ca3af)] opacity-50'
    )
  }

  if (isSelected || isRangeStart || isRangeEnd) {
    return classNames(
      base,
      'cursor-pointer',
      'bg-[var(--tiger-primary,#2563eb)] text-white',
      'hover:bg-[var(--tiger-primary-hover,#1d4ed8)] font-semibold'
    )
  }

  const color = isCurrentMonth
    ? 'text-[var(--tiger-text,#111827)]'
    : 'text-[var(--tiger-text-muted,#9ca3af)]'
  const range = isInRange ? 'bg-[var(--tiger-outline-bg-hover,#eff6ff)]' : ''
  const today = isToday ? 'border border-[var(--tiger-primary,#2563eb)] font-semibold' : ''

  return classNames(
    base,
    'cursor-pointer hover:bg-[var(--tiger-surface-muted,#f3f4f6)]',
    color,
    range,
    today
  )
}

/**
 * Clear button classes
 */
export const datePickerClearButtonClasses = classNames(
  'absolute',
  'right-10',
  'top-1/2',
  '-translate-y-1/2',
  'text-[var(--tiger-text-muted,#9ca3af)]',
  'hover:text-[var(--tiger-text,#111827)]',
  'transition-colors',
  'p-1'
)

/**
 * Footer classes (used in range mode)
 */
export const datePickerFooterClasses = classNames(
  'mt-3',
  'pt-3',
  'border-t',
  'border-[var(--tiger-border,#e5e7eb)]',
  'flex',
  'items-center',
  'justify-between',
  'gap-2'
)

/**
 * Footer button classes
 */
export const datePickerFooterButtonClasses = classNames(
  'px-3',
  'py-1',
  'text-xs',
  'font-medium',
  'rounded',
  'border',
  'border-[var(--tiger-border,#d1d5db)]',
  'hover:border-[var(--tiger-text-muted,#9ca3af)]',
  'bg-[var(--tiger-surface,#ffffff)]',
  'hover:bg-[var(--tiger-surface-muted,#f9fafb)]',
  'text-[var(--tiger-text,#374151)]',
  'focus:outline-none',
  'focus:ring-2',
  'focus:ring-[var(--tiger-primary,#2563eb)]',
  'focus:ring-offset-1',
  'focus:ring-offset-[var(--tiger-surface,#ffffff)]',
  'transition-colors',
  'duration-150'
)
