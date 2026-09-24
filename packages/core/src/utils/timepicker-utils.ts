/**
 * TimePicker labels, keyboard focus, and panel styles.
 * Trigger chrome reuses Input helpers.
 */

import type { TimePickerLabels } from '../types/timepicker'
import type { TigerLocale } from '../types/locale'
import { classNames } from './class-names'
import { enUS } from './i18n/locales/en-US'
import { resolveLocaleSection } from './locale-utils'

import { findFirstEnabledIndex, findLastEnabledIndex, findNextEnabledIndex } from './picker-utils'

type TimePickerLocaleInput = string | Partial<TigerLocale>

export function getTimePickerLabels(
  locale?: TimePickerLocaleInput,
  overrides?: Partial<TimePickerLabels>
): TimePickerLabels {
  const localeObject = typeof locale === 'string' ? undefined : locale
  return resolveLocaleSection(
    (enUS.timePicker ?? {}) as TimePickerLabels,
    localeObject?.timePicker,
    overrides
  )
}

export type TimePickerOptionUnit = 'hour' | 'minute' | 'second'

export function getTimePickerOptionAriaLabel(
  value: number,
  unit: TimePickerOptionUnit,
  locale?: TimePickerLocaleInput,
  labelOverrides?: Partial<TimePickerLabels>
): string {
  const labels = getTimePickerLabels(locale, labelOverrides)
  const unitLabel =
    unit === 'hour' ? labels.hour : unit === 'minute' ? labels.minute : labels.second
  return `${String(value).padStart(2, '0')} ${unitLabel}`
}

/** A focusable column within the TimePicker panel. */
export type TimePickerFocusUnit = 'hour' | 'minute' | 'second' | 'period'

/** Roving-focus direction within a TimePicker column. */
export type TimePickerFocusAction = 'prev' | 'next' | 'first' | 'last'

/**
 * Move keyboard focus within a TimePicker column among enabled
 * `[data-tiger-timepicker-unit]` options.
 */
export function focusTimePickerOption(
  panel: HTMLElement | null,
  unit: TimePickerFocusUnit,
  action: TimePickerFocusAction
): void {
  if (!panel) return

  const isDisabled = (node: HTMLElement) =>
    node.getAttribute('aria-disabled') === 'true' || (node as HTMLButtonElement).disabled
  const nodes = Array.from(
    panel.querySelectorAll<HTMLElement>(`[data-tiger-timepicker-unit="${unit}"]`)
  ).filter((node) => !isDisabled(node))
  if (nodes.length === 0) return

  const active = panel.ownerDocument.activeElement as HTMLElement | null
  const activeIndex = active ? nodes.indexOf(active) : -1
  const selectedIndex = nodes.findIndex((node) => node.getAttribute('aria-selected') === 'true')
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

export const timePickerBaseClasses = 'relative inline-block w-full'

export const timePickerPanelClasses = classNames(
  'bg-[var(--tiger-surface)]',
  'text-[var(--tiger-text)]',
  'border border-[var(--tiger-border)]',
  'rounded-[var(--tiger-radius-md)]',
  'shadow-[var(--tiger-shadow-md)]',
  'w-max',
  'max-sm:w-auto max-sm:rounded-t-[var(--tiger-radius-lg)] max-sm:rounded-b-none',
  'max-sm:p-4 max-sm:pb-[calc(1rem+env(safe-area-inset-bottom))]'
)

export const timePickerDesktopColumnsClasses = classNames(
  'hidden sm:flex divide-x divide-[var(--tiger-border)] rtl:divide-x-reverse'
)

export function getTimePickerMobileSelectRowClasses(count: 2 | 3 | 4): string {
  return classNames(
    'grid gap-2 sm:hidden',
    count === 2 ? 'grid-cols-2' : count === 4 ? 'grid-cols-4' : 'grid-cols-3'
  )
}

export const timePickerMobileSelectClasses = classNames(
  'w-full rounded-[var(--tiger-radius-md)]',
  'border border-[var(--tiger-border)]',
  'bg-[var(--tiger-surface)] px-3 py-3',
  'text-center text-base text-[var(--tiger-text)]',
  'focus:outline-none',
  'focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring)]/40',
  'tiger-motion-aware [transition:var(--tiger-transition-base)]'
)

export const timePickerRangeHeaderClasses = classNames(
  'px-3 py-2 border-b border-[var(--tiger-border)]',
  'bg-[var(--tiger-surface-muted)]',
  'flex items-center gap-2'
)

export function getTimePickerRangeTabButtonClasses(isActive: boolean): string {
  return classNames(
    'px-3 py-1 text-xs font-medium',
    'rounded-[var(--tiger-radius-md)]',
    'border border-[var(--tiger-border)]',
    'focus:outline-none',
    'focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring)]/40',
    'tiger-motion-aware [transition:var(--tiger-transition-base)]',
    isActive
      ? 'bg-[var(--tiger-primary)] text-[var(--tiger-primary-foreground)] border-transparent'
      : 'bg-[var(--tiger-surface)] text-[var(--tiger-text)] hover:bg-[var(--tiger-surface-muted)]'
  )
}

export const timePickerColumnClasses = 'flex flex-col overflow-hidden shrink-0 w-16'

export const timePickerColumnHeaderClasses = classNames(
  'px-2 py-1 text-xs font-semibold text-[var(--tiger-text-secondary)] text-center',
  'bg-[var(--tiger-surface-muted)] border-b border-[var(--tiger-border)]'
)

export const timePickerColumnListClasses = 'overflow-y-auto max-h-48'

export function getTimePickerItemClasses(isSelected: boolean, isDisabled: boolean): string {
  return classNames(
    'w-full px-3 py-1.5 text-sm text-center',
    'focus:outline-none',
    'focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tiger-focus-ring)]/40',
    'tiger-motion-aware [transition:var(--tiger-transition-base)]',
    isDisabled
      ? 'text-[var(--tiger-text-secondary)] opacity-50 cursor-not-allowed'
      : isSelected
        ? 'bg-[var(--tiger-primary)] text-[var(--tiger-primary-foreground)] font-medium focus:bg-[var(--tiger-primary)] focus:text-[var(--tiger-primary-foreground)]'
        : 'text-[var(--tiger-text)] hover:bg-[var(--tiger-surface-muted)] focus:bg-[var(--tiger-surface-muted)] cursor-pointer'
  )
}

export function getTimePickerPeriodButtonClasses(isSelected: boolean): string {
  return getTimePickerItemClasses(isSelected, false)
}

export const timePickerFooterClasses = classNames(
  'px-3 py-2 border-t border-[var(--tiger-border)]',
  'flex items-center justify-between gap-2'
)

export const timePickerFooterButtonClasses = classNames(
  'px-3 py-1 text-xs font-medium',
  'rounded-[var(--tiger-radius-md)]',
  'border border-[var(--tiger-border)]',
  'bg-[var(--tiger-surface)]',
  'text-[var(--tiger-text)]',
  'hover:bg-[var(--tiger-surface-muted)]',
  'focus:outline-none',
  'focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring)]/40',
  'tiger-motion-aware [transition:var(--tiger-transition-base)]'
)
