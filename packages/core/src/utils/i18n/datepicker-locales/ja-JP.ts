import type { DatePickerLocalePreset } from '../../../types/datepicker'

export const JA_JP_DATEPICKER_LOCALE: DatePickerLocalePreset = {
  locale: 'ja-JP',
  labels: {
    invalidDateText: '有効な日付を入力してください。',
    unavailableDateText: 'その日付は選択できません。',
    missingStartText: '開始日を選択してください。',
    missingEndText: '終了日を選択してください。',
    placeholder: '日付を選択',
    rangePlaceholder: '期間を選択',
    today: '今日',
    ok: 'OK',
    calendar: 'カレンダー',
    toggleCalendar: 'カレンダーを開く',
    clearDate: '日付をクリア',
    previousMonth: '前の月',
    nextMonth: '次の月',
    year: '年',
    month: '月',
    day: '日',
    start: '開始',
    end: '終了'
  }
}

export const jaJPDatePickerLocale = JA_JP_DATEPICKER_LOCALE

export default JA_JP_DATEPICKER_LOCALE
