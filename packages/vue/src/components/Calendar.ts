import { defineComponent, h, ref, computed, PropType } from 'vue'
import { classNames, coerceClassValue } from '@expcat/tigercat-core'
import type { CalendarMode } from '@expcat/tigercat-core'
import {
  getCalendarContainerClasses,
  calendarHeaderClasses,
  calendarNavButtonClasses,
  calendarTitleClasses,
  calendarWeekdayClasses,
  getCalendarDayClasses,
  getCalendarMonthClasses,
  WEEKDAYS,
  MONTHS,
  isSameDay,
  getMonthDays
} from '@expcat/tigercat-core'

export interface VueCalendarProps {
  modelValue?: Date
  mode?: CalendarMode
  fullscreen?: boolean
  disabledDate?: (date: Date) => boolean
}

export const Calendar = defineComponent({
  name: 'TigerCalendar',
  props: {
    modelValue: { type: Date as PropType<Date>, default: undefined },
    mode: { type: String as PropType<CalendarMode>, default: 'month' },
    fullscreen: { type: Boolean, default: false },
    disabledDate: { type: Function as PropType<(date: Date) => boolean>, default: undefined }
  },
  emits: ['update:modelValue', 'change', 'panelChange'],
  setup(props, { emit, attrs }) {
    const today = new Date()
    const viewYear = ref(props.modelValue?.getFullYear() ?? today.getFullYear())
    const viewMonth = ref(props.modelValue?.getMonth() ?? today.getMonth())

    const days = computed(() => getMonthDays(viewYear.value, viewMonth.value))

    function prevMonth() {
      if (viewMonth.value === 0) {
        viewMonth.value = 11
        viewYear.value--
      } else {
        viewMonth.value--
      }
      emit('panelChange', new Date(viewYear.value, viewMonth.value, 1), props.mode)
    }

    function nextMonth() {
      if (viewMonth.value === 11) {
        viewMonth.value = 0
        viewYear.value++
      } else {
        viewMonth.value++
      }
      emit('panelChange', new Date(viewYear.value, viewMonth.value, 1), props.mode)
    }

    function prevYear() {
      viewYear.value--
      emit('panelChange', new Date(viewYear.value, viewMonth.value, 1), props.mode)
    }

    function nextYear() {
      viewYear.value++
      emit('panelChange', new Date(viewYear.value, viewMonth.value, 1), props.mode)
    }

    function selectDay(date: Date) {
      if (props.disabledDate?.(date)) return
      emit('update:modelValue', date)
      emit('change', date)
    }

    function selectMonth(monthIdx: number) {
      viewMonth.value = monthIdx
      emit('panelChange', new Date(viewYear.value, monthIdx, 1), props.mode)
    }

    return () => {
      const containerClass = classNames(
        getCalendarContainerClasses(!!props.fullscreen),
        coerceClassValue(attrs.class)
      )

      const header = h('div', { class: calendarHeaderClasses }, [
        h(
          'button',
          {
            type: 'button',
            class: calendarNavButtonClasses,
            'aria-label': props.mode === 'month' ? 'Previous month' : 'Previous year',
            onClick: props.mode === 'month' ? prevMonth : prevYear
          },
          '\u2039'
        ),
        h(
          'span',
          { class: calendarTitleClasses },
          props.mode === 'month'
            ? `${MONTHS[viewMonth.value]} ${viewYear.value}`
            : `${viewYear.value}`
        ),
        h(
          'button',
          {
            type: 'button',
            class: calendarNavButtonClasses,
            'aria-label': props.mode === 'month' ? 'Next month' : 'Next year',
            onClick: props.mode === 'month' ? nextMonth : nextYear
          },
          '\u203A'
        )
      ])

      let body: ReturnType<typeof h>
      if (props.mode === 'year') {
        body = h(
          'div',
          { class: 'grid grid-cols-3 gap-2' },
          MONTHS.map((m, i) =>
            h(
              'div',
              {
                key: i,
                class: getCalendarMonthClasses(viewMonth.value === i),
                onClick: () => selectMonth(i)
              },
              m
            )
          )
        )
      } else {
        const weekdayRow = h(
          'div',
          { class: 'grid grid-cols-7' },
          WEEKDAYS.map((wd) => h('div', { key: wd, class: calendarWeekdayClasses }, wd))
        )
        const dayGrid = h(
          'div',
          { class: 'grid grid-cols-7' },
          days.value.map((date, i) => {
            const isCurrentMonth = date.getMonth() === viewMonth.value
            const isSelected = props.modelValue ? isSameDay(date, props.modelValue) : false
            const isTodayDate = isSameDay(date, today)
            const isDisabled = !!props.disabledDate?.(date)
            return h(
              'div',
              {
                key: i,
                class: 'flex items-center justify-center py-0.5'
              },
              [
                h(
                  'div',
                  {
                    class: getCalendarDayClasses(
                      isSelected,
                      isTodayDate,
                      isCurrentMonth,
                      isDisabled
                    ),
                    onClick: () => selectDay(date)
                  },
                  date.getDate()
                )
              ]
            )
          })
        )
        body = h('div', {}, [weekdayRow, dayGrid])
      }

      return h('div', { class: containerClass, role: 'group' }, [header, body])
    }
  }
})

export default Calendar
