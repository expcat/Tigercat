import { classNames } from './class-names'
import { getCalendarDays } from './date-utils'
import type { WeekStartsOn } from '../types/calendar'

const FOCUS_RING =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]/40'

export function getCalendarContainerClasses(fullscreen: boolean): string {
  return classNames(
    'bg-[var(--tiger-surface,#ffffff)]',
    'border border-[var(--tiger-border,#d1d5db)]',
    fullscreen ? 'w-full p-4' : 'w-72 p-3',
    'rounded-[var(--tiger-radius-md,0.5rem)]'
  )
}

export const calendarHeaderClasses = classNames('flex items-center justify-between mb-3')

export const calendarNavButtonClasses = classNames(
  'inline-flex items-center justify-center w-7 h-7 rounded-[var(--tiger-radius-md,0.5rem)]',
  'tiger-motion-aware [transition:var(--tiger-transition-base,color_150ms_ease)]',
  'text-[var(--tiger-text-muted,#6b7280)]',
  'hover:bg-[var(--tiger-fill-hover,#e5e7eb)]',
  'cursor-pointer',
  FOCUS_RING
)

export const calendarTitleClasses = classNames(
  'text-sm font-semibold',
  'text-[var(--tiger-text,#111827)]',
  'rounded-[var(--tiger-radius-md,0.5rem)] px-2 py-1',
  'hover:bg-[var(--tiger-fill-hover,#e5e7eb)]',
  FOCUS_RING
)

export const calendarWeekdayClasses = classNames(
  'text-xs font-medium text-center py-1',
  'text-[var(--tiger-text-muted,#6b7280)]'
)

export const calendarGridClasses = 'grid grid-cols-7'

export interface CalendarDayClassState {
  isSelected: boolean
  isToday: boolean
  isCurrentMonth: boolean
  isDisabled: boolean
  isActive?: boolean
  isInRange?: boolean
  isRangeStart?: boolean
  isRangeEnd?: boolean
}

export function getCalendarDayClasses(state: CalendarDayClassState): string {
  const {
    isSelected,
    isToday,
    isCurrentMonth,
    isDisabled,
    isActive,
    isInRange,
    isRangeStart,
    isRangeEnd
  } = state
  const selected = isSelected || isRangeStart || isRangeEnd
  return classNames(
    'inline-flex items-center justify-center w-8 h-8 rounded-full text-sm',
    'tiger-motion-aware [transition:var(--tiger-transition-base,color_150ms_ease)]',
    'justify-self-center my-0.5',
    FOCUS_RING,
    isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
    selected
      ? 'bg-[var(--tiger-primary,#2563eb)] text-[var(--tiger-primary-foreground,#ffffff)]'
      : isToday
        ? 'bg-[color-mix(in_srgb,var(--tiger-primary,#2563eb)_10%,transparent)] text-[var(--tiger-primary,#2563eb)]'
        : isCurrentMonth
          ? 'text-[var(--tiger-text,#111827)] hover:bg-[var(--tiger-fill-hover,#e5e7eb)]'
          : 'text-[var(--tiger-text-muted,#9ca3af)]',
    !selected && isInRange && 'bg-[var(--tiger-outline-bg-hover,#eff6ff)]',
    isActive && !selected && 'ring-1 ring-inset ring-[var(--tiger-primary,#2563eb)]'
  )
}

export function getCalendarMonthClasses(state: {
  isSelected: boolean
  isDisabled?: boolean
  isActive?: boolean
}): string {
  return classNames(
    'inline-flex items-center justify-center rounded-[var(--tiger-radius-md,0.5rem)] py-2 px-3 text-sm',
    'tiger-motion-aware [transition:var(--tiger-transition-base,color_150ms_ease)]',
    FOCUS_RING,
    state.isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
    state.isSelected
      ? 'bg-[var(--tiger-primary,#2563eb)] text-[var(--tiger-primary-foreground,#ffffff)]'
      : 'text-[var(--tiger-text,#111827)] hover:bg-[var(--tiger-fill-hover,#e5e7eb)]',
    state.isActive && !state.isSelected && 'ring-1 ring-inset ring-[var(--tiger-primary,#2563eb)]'
  )
}

/** True when every calendar day of `year`/`month` (0-indexed) is disabled. */
export function isCalendarMonthDisabled(
  year: number,
  month: number,
  disabledDate?: (date: Date) => boolean
): boolean {
  if (!disabledDate) return false
  const lastDay = new Date(year, month + 1, 0).getDate()
  for (let day = 1; day <= lastDay; day++) {
    if (!disabledDate(new Date(year, month, day))) return false
  }
  return true
}

export function getMonthDays(year: number, month: number, weekStartsOn: WeekStartsOn = 0): Date[] {
  return getCalendarDays(year, month, weekStartsOn)
}
