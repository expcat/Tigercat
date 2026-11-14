import type { DatePickerLocalePreset } from '../../../types/datepicker'

export const EN_US_DATEPICKER_LOCALE: DatePickerLocalePreset = {
  locale: 'en-US',
  labels: {
    invalidDateText: 'Enter a valid date.',
    unavailableDateText: 'That date is not available.',
    missingStartText: 'Choose a start date.',
    missingEndText: 'Choose an end date.',
    placeholder: 'Select date',
    rangePlaceholder: 'Select date range',
    today: 'Today',
    ok: 'OK',
    calendar: 'Calendar',
    toggleCalendar: 'Toggle calendar',
    clearDate: 'Clear date',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    year: 'Year',
    month: 'Month',
    day: 'Day',
    start: 'Start',
    end: 'End'
  }
}

export const enUSDatePickerLocale = EN_US_DATEPICKER_LOCALE

export default EN_US_DATEPICKER_LOCALE
