import type { DatePickerLocalePreset } from '../../../types/datepicker'

export const ZH_TW_DATEPICKER_LOCALE: DatePickerLocalePreset = {
  locale: 'zh-TW',
  labels: {
    invalidDateText: '請輸入有效日期。',
    unavailableDateText: '該日期無法使用。',
    missingStartText: '請選擇開始日期。',
    missingEndText: '請選擇結束日期。',
    placeholder: '請選擇日期',
    rangePlaceholder: '請選擇日期範圍',
    today: '今天',
    ok: '確定',
    calendar: '日曆',
    toggleCalendar: '開啟日曆',
    clearDate: '清除日期',
    previousMonth: '上個月',
    nextMonth: '下個月',
    year: '年份',
    month: '月份',
    day: '日期',
    start: '開始',
    end: '結束'
  }
}

export const zhTWDatePickerLocale = ZH_TW_DATEPICKER_LOCALE

export default ZH_TW_DATEPICKER_LOCALE
