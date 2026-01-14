import type { DatePickerLabels } from '../types/datepicker'

export function getDatePickerLabels(
  locale?: string,
  overrides?: Partial<DatePickerLabels>
): DatePickerLabels {
  const lc = (locale ?? '').toLowerCase()

  const base: DatePickerLabels = lc.startsWith('zh')
    ? {
        today: '今天',
        ok: '确定',
        calendar: '日历',
        toggleCalendar: '打开日历',
        clearDate: '清除日期',
        previousMonth: '上个月',
        nextMonth: '下个月'
      }
    : {
        today: 'Today',
        ok: 'OK',
        calendar: 'Calendar',
        toggleCalendar: 'Toggle calendar',
        clearDate: 'Clear date',
        previousMonth: 'Previous month',
        nextMonth: 'Next month'
      }

  return { ...base, ...(overrides ?? {}) }
}
