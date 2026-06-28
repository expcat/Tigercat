/**
 * TimePicker component utilities
 *
 * Consolidated file including:
 * - Labels / i18n
 * - Style class generators
 */

import type { TimePickerLabels } from '../types/timepicker'
import type { TigerLocale } from '../types/locale'
import {
  formatIntlNumber,
  getIntlPluralCategory,
  DEFAULT_TIME_PICKER_LABELS,
  ZH_CN_TIME_PICKER_LABELS
} from './locale-utils'
import { findFirstEnabledIndex, findLastEnabledIndex, findNextEnabledIndex } from './picker-utils'

// ============================================================================
// Labels / i18n
// ============================================================================

// EN/ZH baselines live in locale-utils (single source of truth shared with
// the rest of the locale system); this file only adds the extra languages.
const EN_LABELS = DEFAULT_TIME_PICKER_LABELS
const ZH_LABELS = ZH_CN_TIME_PICKER_LABELS

const TIME_PICKER_LABELS_BY_LANGUAGE: Record<string, TimePickerLabels> = {
  en: EN_LABELS,
  zh: ZH_LABELS,
  es: {
    hour: 'Hora',
    minute: 'Min',
    second: 'Seg',
    now: 'Ahora',
    ok: 'Aceptar',
    start: 'Inicio',
    end: 'Fin',
    clear: 'Borrar hora',
    toggle: 'Abrir selector de hora',
    dialog: 'Selector de hora',
    selectTime: 'Seleccionar hora',
    selectTimeRange: 'Seleccionar rango de horas'
  },
  fr: {
    hour: 'Heure',
    minute: 'Min',
    second: 'Sec',
    now: 'Maintenant',
    ok: 'OK',
    start: 'Début',
    end: 'Fin',
    clear: 'Effacer l’heure',
    toggle: 'Ouvrir le sélecteur d’heure',
    dialog: 'Sélecteur d’heure',
    selectTime: 'Sélectionner une heure',
    selectTimeRange: 'Sélectionner une plage horaire'
  },
  de: {
    hour: 'Stunde',
    minute: 'Min',
    second: 'Sek',
    now: 'Jetzt',
    ok: 'OK',
    start: 'Start',
    end: 'Ende',
    clear: 'Zeit löschen',
    toggle: 'Zeitauswahl öffnen',
    dialog: 'Zeitauswahl',
    selectTime: 'Zeit auswählen',
    selectTimeRange: 'Zeitbereich auswählen'
  },
  pt: {
    hour: 'Hora',
    minute: 'Min',
    second: 'Seg',
    now: 'Agora',
    ok: 'OK',
    start: 'Início',
    end: 'Fim',
    clear: 'Limpar hora',
    toggle: 'Abrir seletor de hora',
    dialog: 'Seletor de hora',
    selectTime: 'Selecionar hora',
    selectTimeRange: 'Selecionar intervalo de horas'
  },
  ar: {
    hour: 'ساعة',
    minute: 'دقيقة',
    second: 'ثانية',
    now: 'الآن',
    ok: 'موافق',
    start: 'البداية',
    end: 'النهاية',
    clear: 'مسح الوقت',
    toggle: 'فتح منتقي الوقت',
    dialog: 'منتقي الوقت',
    selectTime: 'اختر الوقت',
    selectTimeRange: 'اختر نطاق الوقت'
  }
}

type TimePickerLocaleInput = string | Partial<TigerLocale>

function getTimePickerLocaleCode(locale?: TimePickerLocaleInput): string | undefined {
  return typeof locale === 'string' ? locale : locale?.locale
}

function isZhLocale(locale?: TimePickerLocaleInput): boolean {
  return (getTimePickerLocaleCode(locale) ?? '').toLowerCase().startsWith('zh')
}

export function getTimePickerLabels(
  locale?: TimePickerLocaleInput,
  overrides?: Partial<TimePickerLabels>
): TimePickerLabels {
  const localeCode = getTimePickerLocaleCode(locale)
  const language = (localeCode ?? '').split('-')[0]?.toLowerCase()
  const base = language ? (TIME_PICKER_LABELS_BY_LANGUAGE[language] ?? EN_LABELS) : EN_LABELS
  const localeLabels = typeof locale === 'string' ? undefined : locale?.timePicker
  return { ...base, ...(localeLabels ?? {}), ...(overrides ?? {}) }
}

export type TimePickerOptionUnit = 'hour' | 'minute' | 'second'

function pluralizeEn(value: number, singular: string): string {
  return getIntlPluralCategory(value, 'en') === 'one' ? singular : `${singular}s`
}

export function getTimePickerOptionAriaLabel(
  value: number,
  unit: TimePickerOptionUnit,
  locale?: TimePickerLocaleInput,
  labelOverrides?: Partial<TimePickerLabels>
): string {
  const labels = getTimePickerLabels(locale, labelOverrides)
  const localeCode = getTimePickerLocaleCode(locale)
  const unitLabel =
    unit === 'hour' ? labels.hour : unit === 'minute' ? labels.minute : labels.second

  // Chinese: no space between value and unit
  if (isZhLocale(locale)) return `${formatIntlNumber(value, localeCode)}${unitLabel}`

  // English pluralization when locale is explicitly English or using default EN labels
  const lc = (localeCode ?? '').toLowerCase()
  if (lc.startsWith('en') || (!lc && !labelOverrides)) {
    return `${formatIntlNumber(value, localeCode)} ${pluralizeEn(value, unit)}`
  }

  return `${formatIntlNumber(value, localeCode)} ${unitLabel}`
}

// ============================================================================
// Keyboard focus
// ============================================================================

/** A focusable column within the TimePicker panel. */
export type TimePickerFocusUnit = 'hour' | 'minute' | 'second' | 'period'

/** Roving-focus direction within a TimePicker column. */
export type TimePickerFocusAction = 'prev' | 'next' | 'first' | 'last'

/**
 * Move keyboard focus within a TimePicker column. Shared by the Vue and React
 * TimePicker components so the roving-focus mechanics live in one place
 * (mirrors `moveFocusInMenu` for menus).
 *
 * Focus moves among the enabled `button[data-tiger-timepicker-unit="<unit>"]`
 * options inside `panel`, starting from the currently focused option (or the
 * selected one), and clamps at the column ends. SSR-safe: only invoked from
 * keyboard handlers, and DOM access is scoped to the supplied `panel`.
 */
export function focusTimePickerOption(
  panel: HTMLElement | null,
  unit: TimePickerFocusUnit,
  action: TimePickerFocusAction
): void {
  if (!panel) return

  const nodes = Array.from(
    panel.querySelectorAll<HTMLButtonElement>(`button[data-tiger-timepicker-unit="${unit}"]`)
  ).filter((button) => !button.disabled)
  if (nodes.length === 0) return

  const active = panel.ownerDocument.activeElement as HTMLButtonElement | null
  const activeIndex = active ? nodes.indexOf(active) : -1
  const selectedIndex = nodes.findIndex((button) => button.getAttribute('aria-selected') === 'true')
  const baseIndex = activeIndex >= 0 ? activeIndex : Math.max(0, selectedIndex)

  let nextIndex = baseIndex
  switch (action) {
    case 'prev':
      nextIndex = findNextEnabledIndex(nodes, baseIndex, -1)
      break
    case 'next':
      nextIndex = findNextEnabledIndex(nodes, baseIndex, 1)
      break
    case 'first':
      nextIndex = findFirstEnabledIndex(nodes)
      break
    case 'last':
      nextIndex = findLastEnabledIndex(nodes)
      break
  }

  nodes[nextIndex]?.focus()
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
    'w-full rounded-[var(--tiger-radius-md,0.5rem)] border border-gray-300',
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
  'absolute z-10 mt-1 bg-white border border-gray-200 rounded-[var(--tiger-radius-md,0.5rem)] shadow-lg',
  'w-max max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:z-50 max-sm:mt-0 max-sm:w-auto max-sm:rounded-t-[var(--tiger-radius-lg,0.75rem)] max-sm:rounded-b-none max-sm:p-4 max-sm:shadow-2xl max-sm:pb-[calc(1rem+env(safe-area-inset-bottom))]'
].join(' ')

/**
 * Dropdown panel content classes
 */
export const timePickerPanelContentClasses = 'flex divide-x divide-gray-200'

export const timePickerDesktopPanelContentClasses = 'max-sm:hidden flex divide-x divide-gray-200'

export const timePickerMobileWheelClasses = 'sm:hidden grid grid-cols-3 gap-2'

export const timePickerMobileWheelSelectClasses = [
  'w-full rounded-[var(--tiger-radius-md,0.5rem)] border border-gray-300 bg-white px-3 py-3',
  'text-center text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)]'
].join(' ')

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
