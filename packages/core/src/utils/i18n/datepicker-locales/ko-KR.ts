import type { DatePickerLocalePreset } from '../../../types/datepicker'

export const KO_KR_DATEPICKER_LOCALE: DatePickerLocalePreset = {
  locale: 'ko-KR',
  labels: {
    invalidDateText: '올바른 날짜를 입력하세요.',
    unavailableDateText: '선택할 수 없는 날짜입니다.',
    missingStartText: '시작 날짜를 선택하세요.',
    missingEndText: '종료 날짜를 선택하세요.',
    placeholder: '날짜 선택',
    rangePlaceholder: '기간 선택',
    today: '오늘',
    ok: '확인',
    calendar: '달력',
    toggleCalendar: '달력 열기',
    clearDate: '날짜 지우기',
    previousMonth: '이전 달',
    nextMonth: '다음 달',
    year: '연도',
    month: '월',
    day: '일',
    start: '시작',
    end: '종료'
  }
}

export const koKRDatePickerLocale = KO_KR_DATEPICKER_LOCALE

export default KO_KR_DATEPICKER_LOCALE
