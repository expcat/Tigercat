import { classNames } from './class-names'

/* ------------------------------------------------------------------ */
/*  Style constants                                                    */
/* ------------------------------------------------------------------ */

export function getCalendarContainerClasses(fullscreen: boolean): string {
  return classNames(
    'bg-[var(--tiger-calendar-bg,var(--tiger-surface,#ffffff))]',
    'border border-[var(--tiger-calendar-border,var(--tiger-border,#d1d5db))]',
    fullscreen ? 'w-full p-4' : 'w-72 p-3',
    'rounded-[var(--tiger-radius-md,0.5rem)]'
  )
}

export const calendarHeaderClasses = classNames('flex items-center justify-between mb-3')

export const calendarNavButtonClasses = classNames(
  'inline-flex items-center justify-center w-7 h-7 rounded transition-colors',
  'text-[var(--tiger-calendar-nav,var(--tiger-text-muted,#6b7280))]',
  'hover:bg-[var(--tiger-calendar-nav-hover-bg,var(--tiger-fill-hover,#e5e7eb))]',
  'cursor-pointer'
)

export const calendarTitleClasses = classNames(
  'text-sm font-semibold',
  'text-[var(--tiger-calendar-title,var(--tiger-text,#111827))]'
)

export const calendarWeekdayClasses = classNames(
  'text-xs font-medium text-center py-1',
  'text-[var(--tiger-calendar-weekday,var(--tiger-text-muted,#6b7280))]'
)

export function getCalendarDayClasses(
  isSelected: boolean,
  isToday: boolean,
  isCurrentMonth: boolean,
  isDisabled: boolean
): string {
  return classNames(
    'inline-flex items-center justify-center w-8 h-8 rounded-full text-sm transition-colors',
    isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
    isSelected
      ? 'bg-[var(--tiger-calendar-selected-bg,var(--tiger-primary,#2563eb))] text-white'
      : isToday
        ? 'bg-[var(--tiger-calendar-today-bg,var(--tiger-primary,#2563eb))]/10 text-[var(--tiger-calendar-today-text,var(--tiger-primary,#2563eb))]'
        : isCurrentMonth
          ? 'text-[var(--tiger-calendar-day,var(--tiger-text,#111827))] hover:bg-[var(--tiger-calendar-day-hover,var(--tiger-fill-hover,#e5e7eb))]'
          : 'text-[var(--tiger-calendar-day-outside,var(--tiger-text-muted,#9ca3af))]'
  )
}

export function getCalendarMonthClasses(isSelected: boolean): string {
  return classNames(
    'inline-flex items-center justify-center rounded-[var(--tiger-radius-md,0.5rem)] py-2 px-3 text-sm transition-colors cursor-pointer',
    isSelected
      ? 'bg-[var(--tiger-calendar-selected-bg,var(--tiger-primary,#2563eb))] text-white'
      : 'text-[var(--tiger-calendar-day,var(--tiger-text,#111827))] hover:bg-[var(--tiger-calendar-day-hover,var(--tiger-fill-hover,#e5e7eb))]'
  )
}

/* ------------------------------------------------------------------ */
/*  Date helpers                                                       */
/* ------------------------------------------------------------------ */

export const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

export function getMonthDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1)
  const startOffset = firstDay.getDay() // 0=Sun

  const days: Date[] = []

  // Previous month fill
  for (let i = startOffset - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i))
  }

  // Current month
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(year, month, d))
  }

  // Next month fill to 42 cells (6 rows)
  while (days.length < 42) {
    const last = days[days.length - 1]
    days.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1))
  }

  return days
}
