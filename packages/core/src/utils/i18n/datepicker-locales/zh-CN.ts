import type { DatePickerLocalePreset } from '../../../types/datepicker'

export const ZH_CN_DATEPICKER_LOCALE: DatePickerLocalePreset = {
  locale: 'zh-CN',
  labels: {
    invalidDateText: '请输入有效日期。',
    unavailableDateText: '该日期不可用。',
    missingStartText: '请选择开始日期。',
    missingEndText: '请选择结束日期。',
    placeholder: '请选择日期',
    rangePlaceholder: '请选择日期范围',
    today: '今天',
    ok: '确定',
    calendar: '日历',
    toggleCalendar: '打开日历',
    clearDate: '清除日期',
    previousMonth: '上个月',
    nextMonth: '下个月',
    year: '年份',
    month: '月份',
    day: '日期',
    start: '开始',
    end: '结束'
  }
}

export const zhCNDatePickerLocale = ZH_CN_DATEPICKER_LOCALE

export default ZH_CN_DATEPICKER_LOCALE
