/**
 * DatePicker styling utilities
 */

import type { DatePickerSize } from '../types/datepicker'
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
export function getDatePickerInputClasses(size: DatePickerSize = 'md', disabled = false): string {
  const baseClasses = [
    'w-full',
    'rounded-md',
    'border',
    'border-gray-300',
    'bg-white',
    'text-gray-900',
    'placeholder-gray-400',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-[var(--tiger-primary,#2563eb)]',
    'focus:border-transparent',
    'transition-colors',
    'pr-16' // Space for clear + calendar buttons
  ]

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  }

  const disabledClasses = disabled
    ? ['bg-gray-100', 'cursor-not-allowed', 'text-gray-500']
    : ['cursor-pointer']

  return classNames(...baseClasses, sizeClasses[size], ...disabledClasses)
}

/**
 * Icon button classes
 */
export function getDatePickerIconButtonClasses(size: DatePickerSize = 'md'): string {
  const baseClasses = [
    'absolute',
    'right-0',
    'top-0',
    'bottom-0',
    'flex',
    'items-center',
    'justify-center',
    'text-gray-400',
    'hover:text-gray-600',
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
  'bg-white',
  'border',
  'border-gray-300',
  'rounded-lg',
  'shadow-lg',
  'p-4',
  'w-80'
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
  'rounded-md',
  'hover:bg-gray-100',
  'transition-colors',
  'text-gray-600',
  'hover:text-gray-900',
  'focus:outline-none',
  'focus:ring-2',
  'focus:ring-[var(--tiger-primary,#2563eb)]'
)

/**
 * Calendar month/year display classes
 */
export const datePickerMonthYearClasses = classNames('text-base', 'font-semibold', 'text-gray-900')

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
  'text-gray-500',
  'py-2'
)

/**
 * Get day cell classes
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
  const baseClasses = [
    'w-10',
    'h-10',
    'flex',
    'items-center',
    'justify-center',
    'rounded-md',
    'text-sm',
    'transition-colors'
  ]

  const interactionClasses = isDisabled
    ? ['cursor-not-allowed', 'text-gray-300']
    : ['cursor-pointer', 'hover:bg-gray-100']

  const monthClasses = isCurrentMonth ? ['text-gray-900'] : ['text-gray-400']

  const stateClasses = []
  if (isInRange && !isDisabled && !isSelected) {
    stateClasses.push('bg-[var(--tiger-outline-bg-hover,#eff6ff)]')
  }

  if (isSelected || isRangeStart || isRangeEnd) {
    stateClasses.push(
      'bg-[var(--tiger-primary,#2563eb)]',
      'text-white',
      'hover:bg-[var(--tiger-primary-hover,#1d4ed8)]',
      'font-semibold'
    )
  } else if (isToday) {
    stateClasses.push('border', 'border-[var(--tiger-primary,#2563eb)]', 'font-semibold')
  }

  return classNames(...baseClasses, ...interactionClasses, ...monthClasses, ...stateClasses)
}

/**
 * Clear button classes
 */
export const datePickerClearButtonClasses = classNames(
  'absolute',
  'right-10',
  'top-1/2',
  '-translate-y-1/2',
  'text-gray-400',
  'hover:text-gray-600',
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
  'border-gray-200',
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
  'border-gray-300',
  'hover:border-gray-400',
  'bg-white',
  'hover:bg-gray-50',
  'text-gray-700',
  'focus:outline-none',
  'focus:ring-2',
  'focus:ring-[var(--tiger-primary,#2563eb)]',
  'focus:ring-offset-1',
  'transition-colors',
  'duration-150'
)
