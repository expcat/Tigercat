/**
 * TimePicker component utilities
 *
 * Consolidated file including:
 * - Icon exports (from common-icons)
 * - Labels / i18n
 * - Style class generators
 */

import type { TimePickerLabels } from '../types/timepicker'
import { clockSolidIcon20PathD, closeSolidIcon20PathD } from './common-icons'

// ============================================================================
// Icons (re-exports for backward compatibility)
// ============================================================================

/**
 * Clock icon path
 */
export const ClockIconPath = clockSolidIcon20PathD

/**
 * Close/Clear icon path
 */
export const TimePickerCloseIconPath = closeSolidIcon20PathD

// ============================================================================
// Labels / i18n
// ============================================================================

const ZH_LABELS: TimePickerLabels = {
  hour: '时',
  minute: '分',
  second: '秒',
  now: '现在',
  ok: '确定',
  start: '开始',
  end: '结束',
  clear: '清除时间',
  toggle: '打开时间选择器',
  dialog: '时间选择器',
  selectTime: '请选择时间',
  selectTimeRange: '请选择时间范围'
}

const EN_LABELS: TimePickerLabels = {
  hour: 'Hour',
  minute: 'Min',
  second: 'Sec',
  now: 'Now',
  ok: 'OK',
  start: 'Start',
  end: 'End',
  clear: 'Clear time',
  toggle: 'Toggle time picker',
  dialog: 'Time picker',
  selectTime: 'Select time',
  selectTimeRange: 'Select time range'
}

function isZhLocale(locale?: string): boolean {
  return (locale ?? '').toLowerCase().startsWith('zh')
}

export function getTimePickerLabels(
  locale?: string,
  overrides?: Partial<TimePickerLabels>
): TimePickerLabels {
  const base = isZhLocale(locale) ? ZH_LABELS : EN_LABELS
  return { ...base, ...(overrides ?? {}) }
}

export type TimePickerOptionUnit = 'hour' | 'minute' | 'second'

function pluralizeEn(value: number, singular: string): string {
  return value === 1 ? singular : `${singular}s`
}

export function getTimePickerOptionAriaLabel(
  value: number,
  unit: TimePickerOptionUnit,
  locale?: string,
  labelOverrides?: Partial<TimePickerLabels>
): string {
  const labels = getTimePickerLabels(locale, labelOverrides)
  const unitLabel =
    unit === 'hour' ? labels.hour : unit === 'minute' ? labels.minute : labels.second

  // Chinese: no space between value and unit
  if (isZhLocale(locale)) return `${value}${unitLabel}`

  // English pluralization when locale is explicitly English or using default EN labels
  const lc = (locale ?? '').toLowerCase()
  if (lc.startsWith('en') || (!lc && !labelOverrides)) {
    return `${value} ${pluralizeEn(value, unit)}`
  }

  return `${value} ${unitLabel}`
}

// ============================================================================
// Styles
// ============================================================================

/**
 * Base container classes for TimePicker
 */
export const timePickerBaseClasses = 'relative inline-block w-full max-w-xs'

/**
 * Input wrapper classes
 */
export const timePickerInputWrapperClasses = 'relative flex items-center'

/**
 * Get input field classes based on size and state
 */
export function getTimePickerInputClasses(size: 'sm' | 'md' | 'lg', disabled: boolean): string {
  const baseClasses = [
    'w-full rounded-md border border-gray-300',
    'focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)] focus:border-transparent',
    'transition-colors duration-200',
    'pr-16' // Space for clear + clock buttons
  ]

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-3 text-lg'
  }

  const stateClasses = disabled
    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
    : 'bg-white text-gray-900 cursor-pointer hover:border-gray-400'

  return [...baseClasses, sizeClasses[size], stateClasses].join(' ')
}

/**
 * Get icon button classes based on size
 */
export function getTimePickerIconButtonClasses(size: 'sm' | 'md' | 'lg'): string {
  const baseClasses = [
    'absolute right-1 flex items-center justify-center',
    'text-gray-400 hover:text-gray-600',
    'focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)] focus:ring-offset-1',
    'rounded transition-colors duration-200',
    'disabled:cursor-not-allowed disabled:opacity-50'
  ]

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }

  return [...baseClasses, sizeClasses[size]].join(' ')
}

/**
 * Clear button classes
 */
export const timePickerClearButtonClasses = [
  'absolute right-10 flex items-center justify-center',
  'w-6 h-6 text-gray-400 hover:text-gray-600',
  'focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)] focus:ring-offset-1',
  'rounded transition-colors duration-200'
].join(' ')

/**
 * Dropdown panel classes
 */
export const timePickerPanelClasses = [
  'absolute z-10 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg',
  'w-max'
].join(' ')

/**
 * Dropdown panel content classes
 */
export const timePickerPanelContentClasses = 'flex divide-x divide-gray-200'

/**
 * Range mode header classes
 */
export const timePickerRangeHeaderClasses = [
  'px-3 py-2 border-b border-gray-200 bg-gray-50',
  'flex items-center gap-2'
].join(' ')

/**
 * Range mode tab button classes
 */
export function getTimePickerRangeTabButtonClasses(isActive: boolean): string {
  const baseClasses = [
    'px-3 py-1 text-xs font-medium rounded',
    'border border-gray-300',
    'focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)] focus:ring-offset-1',
    'transition-colors duration-150'
  ]

  if (isActive) {
    return [...baseClasses, 'bg-[var(--tiger-primary,#2563eb)] text-white border-transparent'].join(
      ' '
    )
  }

  return [...baseClasses, 'bg-white hover:bg-gray-50 text-gray-700'].join(' ')
}

/**
 * Column container classes
 */
export const timePickerColumnClasses = 'flex flex-col overflow-hidden shrink-0 w-16'

/**
 * Column header classes
 */
export const timePickerColumnHeaderClasses = [
  'px-2 py-1 text-xs font-semibold text-gray-500 text-center',
  'bg-gray-50 border-b border-gray-200'
].join(' ')

/**
 * Column list classes
 */
export const timePickerColumnListClasses = [
  'overflow-y-auto max-h-48 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'
].join(' ')

/**
 * Get time item button classes
 */
export function getTimePickerItemClasses(isSelected: boolean, isDisabled: boolean): string {
  const baseClasses = [
    'w-full px-3 py-1.5 text-sm text-center',
    'hover:bg-gray-100 focus:outline-none focus:bg-gray-100',
    'transition-colors duration-150',
    'cursor-pointer'
  ]

  if (isDisabled) {
    return [...baseClasses, 'text-gray-300 cursor-not-allowed hover:bg-transparent'].join(' ')
  }

  if (isSelected) {
    return [
      ...baseClasses,
      'bg-[var(--tiger-primary,#2563eb)] text-white',
      'hover:bg-[var(--tiger-primary-hover,#1d4ed8)]',
      'font-medium'
    ].join(' ')
  }

  return [...baseClasses, 'text-gray-700'].join(' ')
}

/**
 * Period (AM/PM) button classes
 */
export function getTimePickerPeriodButtonClasses(isSelected: boolean): string {
  const baseClasses = [
    'w-full px-3 py-2 text-sm font-medium text-center',
    'hover:bg-gray-100 focus:outline-none focus:bg-gray-100',
    'transition-colors duration-150',
    'cursor-pointer'
  ]

  if (isSelected) {
    return [
      ...baseClasses,
      'bg-[var(--tiger-primary,#2563eb)] text-white',
      'hover:bg-[var(--tiger-primary-hover,#1d4ed8)]'
    ].join(' ')
  }

  return [...baseClasses, 'text-gray-700'].join(' ')
}

/**
 * Footer classes
 */
export const timePickerFooterClasses = [
  'px-3 py-2 border-t border-gray-200',
  'flex items-center justify-between gap-2'
].join(' ')

/**
 * Footer button classes
 */
export const timePickerFooterButtonClasses = [
  'px-3 py-1 text-xs font-medium rounded',
  'border border-gray-300 hover:border-gray-400',
  'bg-white hover:bg-gray-50',
  'text-gray-700',
  'focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)] focus:ring-offset-1',
  'transition-colors duration-150'
].join(' ')
