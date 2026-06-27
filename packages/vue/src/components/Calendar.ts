import { defineComponent, h, ref, computed, nextTick, PropType } from 'vue'
import { classNames, coerceClassValue } from '@expcat/tigercat-core'
import type {
  CalendarMode,
  TigerLocale,
  CalendarProps as CoreCalendarProps
} from '@expcat/tigercat-core'
import {
  getCalendarContainerClasses,
  calendarHeaderClasses,
  calendarNavButtonClasses,
  calendarTitleClasses,
  calendarWeekdayClasses,
  getCalendarDayClasses,
  getCalendarMonthClasses,
  isSameDay,
  getMonthDays,
  getShortDayNames,
  getShortMonthNames,
  formatMonthYear,
  formatDate,
  parseDate,
  addDays,
  getCalendarLabels,
  mergeTigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

/**
 * Vue Calendar props. Reuses the shared core props except `value`/callbacks —
 * Vue binds the selected date with `v-model` (`modelValue`) and emits `change` /
 * `panel-change` instead of `onChange` / `onPanelChange`.
 */
export interface VueCalendarProps extends Omit<
  CoreCalendarProps,
  'value' | 'onChange' | 'onPanelChange'
> {
  modelValue?: Date
}

export const Calendar = defineComponent({
  name: 'TigerCalendar',
  inheritAttrs: false,
  props: {
    modelValue: { type: Date as PropType<Date>, default: undefined },
    mode: { type: String as PropType<CalendarMode>, default: 'month' },
    fullscreen: { type: Boolean, default: false },
    disabledDate: { type: Function as PropType<(date: Date) => boolean>, default: undefined },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    className: { type: String, default: undefined }
  },
  emits: ['update:modelValue', 'change', 'panel-change'],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const localeCode = computed(() => mergedLocale.value?.locale)
    const labels = computed(() => getCalendarLabels(mergedLocale.value))
    const weekdayNames = computed(() => getShortDayNames(localeCode.value))
    const monthNames = computed(() => getShortMonthNames(localeCode.value))
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
      emit('panel-change', new Date(viewYear.value, viewMonth.value, 1), props.mode)
    }

    function nextMonth() {
      if (viewMonth.value === 11) {
        viewMonth.value = 0
        viewYear.value++
      } else {
        viewMonth.value++
      }
      emit('panel-change', new Date(viewYear.value, viewMonth.value, 1), props.mode)
    }

    function prevYear() {
      viewYear.value--
      emit('panel-change', new Date(viewYear.value, viewMonth.value, 1), props.mode)
    }

    function nextYear() {
      viewYear.value++
      emit('panel-change', new Date(viewYear.value, viewMonth.value, 1), props.mode)
    }

    function selectDay(date: Date) {
      if (props.disabledDate?.(date)) return
      emit('update:modelValue', date)
      emit('change', date)
    }

    function selectMonth(monthIdx: number) {
      viewMonth.value = monthIdx
      emit('panel-change', new Date(viewYear.value, monthIdx, 1), props.mode)
    }

    // ----- Keyboard navigation (roving focus stays in the framework layer) -----
    const dayGridEl = ref<HTMLElement | null>(null)
    const monthGridEl = ref<HTMLElement | null>(null)
    const activeIso = ref<string | null>(null)
    const activeMonthIdx = ref<number | null>(null)

    const toIso = (d: Date) => formatDate(d, 'yyyy-MM-dd')

    function getDefaultDayIso(): string {
      const v = props.modelValue
      if (v && v.getFullYear() === viewYear.value && v.getMonth() === viewMonth.value)
        return toIso(v)
      if (today.getFullYear() === viewYear.value && today.getMonth() === viewMonth.value)
        return toIso(today)
      return toIso(new Date(viewYear.value, viewMonth.value, 1))
    }

    function navigate(y: number, m: number) {
      viewYear.value = y
      viewMonth.value = m
      emit('panel-change', new Date(y, m, 1), props.mode)
    }

    function focusDayIso(iso: string): boolean {
      const el = dayGridEl.value?.querySelector<HTMLButtonElement>(`button[data-date="${iso}"]`)
      if (el && !el.disabled) {
        el.focus()
        activeIso.value = iso
        return true
      }
      return false
    }

    function moveDayFocus(deltaDays: number) {
      const activeEl = document.activeElement as HTMLElement | null
      const currentIso =
        activeEl?.getAttribute('data-date') ?? activeIso.value ?? getDefaultDayIso()
      const base = parseDate(currentIso)
      if (!base) return
      let candidate = addDays(base, deltaDays)
      for (let attempts = 0; attempts < 42; attempts++) {
        const iso = toIso(candidate)
        const el = dayGridEl.value?.querySelector<HTMLButtonElement>(`button[data-date="${iso}"]`)
        if (el && !el.disabled) {
          el.focus()
          activeIso.value = iso
          return
        }
        if (!el) {
          activeIso.value = iso
          navigate(candidate.getFullYear(), candidate.getMonth())
          nextTick(() => {
            dayGridEl.value?.querySelector<HTMLButtonElement>(`button[data-date="${iso}"]`)?.focus()
          })
          return
        }
        candidate = addDays(candidate, deltaDays)
      }
    }

    function handleDayGridKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          moveDayFocus(-1)
          break
        case 'ArrowRight':
          e.preventDefault()
          moveDayFocus(1)
          break
        case 'ArrowUp':
          e.preventDefault()
          moveDayFocus(-7)
          break
        case 'ArrowDown':
          e.preventDefault()
          moveDayFocus(7)
          break
        case 'Home':
          e.preventDefault()
          focusDayIso(toIso(new Date(viewYear.value, viewMonth.value, 1)))
          break
        case 'End':
          e.preventDefault()
          focusDayIso(toIso(new Date(viewYear.value, viewMonth.value + 1, 0)))
          break
        case 'Enter':
        case ' ': {
          const activeEl = document.activeElement as HTMLElement | null
          const iso = activeEl?.getAttribute('data-date')
          if (iso) {
            e.preventDefault()
            const d = parseDate(iso)
            if (d) selectDay(d)
          }
          break
        }
        default:
          break
      }
    }

    function focusMonthIdx(idx: number) {
      const els = monthGridEl.value?.querySelectorAll<HTMLButtonElement>('button[role="gridcell"]')
      els?.[idx]?.focus()
      activeMonthIdx.value = idx
    }

    function handleMonthKeyDown(e: KeyboardEvent, idx: number) {
      let target = idx
      switch (e.key) {
        case 'ArrowRight':
          target = Math.min(11, idx + 1)
          break
        case 'ArrowLeft':
          target = Math.max(0, idx - 1)
          break
        case 'ArrowDown':
          target = Math.min(11, idx + 3)
          break
        case 'ArrowUp':
          target = Math.max(0, idx - 3)
          break
        case 'Home':
          target = 0
          break
        case 'End':
          target = 11
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          selectMonth(idx)
          return
        default:
          return
      }
      e.preventDefault()
      focusMonthIdx(target)
    }

    return () => {
      const containerClass = classNames(
        getCalendarContainerClasses(!!props.fullscreen),
        props.className,
        coerceClassValue((attrs as Record<string, unknown>).class)
      )

      const header = h('div', { class: calendarHeaderClasses }, [
        h(
          'button',
          {
            type: 'button',
            class: calendarNavButtonClasses,
            'aria-label':
              props.mode === 'month' ? labels.value.previousMonth : labels.value.previousYear,
            onClick: props.mode === 'month' ? prevMonth : prevYear
          },
          '\u2039'
        ),
        h(
          'span',
          { class: calendarTitleClasses },
          props.mode === 'month'
            ? formatMonthYear(viewYear.value, viewMonth.value, localeCode.value)
            : `${viewYear.value}`
        ),
        h(
          'button',
          {
            type: 'button',
            class: calendarNavButtonClasses,
            'aria-label': props.mode === 'month' ? labels.value.nextMonth : labels.value.nextYear,
            onClick: props.mode === 'month' ? nextMonth : nextYear
          },
          '\u203A'
        )
      ])

      const rovingDayIso = activeIso.value ?? getDefaultDayIso()
      const rovingMonthIdx = activeMonthIdx.value ?? viewMonth.value

      let body: ReturnType<typeof h>
      if (props.mode === 'year') {
        const monthRows: string[][] = []
        for (let i = 0; i < monthNames.value.length; i += 3)
          monthRows.push(monthNames.value.slice(i, i + 3))
        body = h(
          'div',
          { class: 'grid grid-cols-1 gap-2', role: 'grid', ref: monthGridEl },
          monthRows.map((row, ri) =>
            h(
              'div',
              { key: ri, class: 'grid grid-cols-3 gap-2', role: 'row' },
              row.map((m, ci) => {
                const i = ri * 3 + ci
                return h(
                  'button',
                  {
                    key: i,
                    type: 'button',
                    role: 'gridcell',
                    'aria-selected': viewMonth.value === i,
                    tabindex: rovingMonthIdx === i ? 0 : -1,
                    class: getCalendarMonthClasses(viewMonth.value === i),
                    onClick: () => selectMonth(i),
                    onFocus: () => (activeMonthIdx.value = i),
                    onKeydown: (e: KeyboardEvent) => handleMonthKeyDown(e, i)
                  },
                  m
                )
              })
            )
          )
        )
      } else {
        const weekdayRow = h(
          'div',
          { class: 'grid grid-cols-7', role: 'row' },
          weekdayNames.value.map((wd) =>
            h('div', { key: wd, class: calendarWeekdayClasses, role: 'columnheader' }, wd)
          )
        )
        const weeks: Date[][] = []
        for (let i = 0; i < days.value.length; i += 7) weeks.push(days.value.slice(i, i + 7))
        const weekRows = weeks.map((week, wi) =>
          h(
            'div',
            { key: wi, class: 'grid grid-cols-7', role: 'row', onKeydown: handleDayGridKeyDown },
            week.map((date) => {
              const isCurrentMonth = date.getMonth() === viewMonth.value
              const isSelected = props.modelValue ? isSameDay(date, props.modelValue) : false
              const isTodayDate = isSameDay(date, today)
              const isDisabled = !!props.disabledDate?.(date)
              const iso = toIso(date)
              return h(
                'button',
                {
                  key: iso,
                  type: 'button',
                  role: 'gridcell',
                  'data-date': iso,
                  'aria-label': iso,
                  'aria-selected': isSelected,
                  'aria-current': isTodayDate ? 'date' : undefined,
                  disabled: isDisabled,
                  tabindex: rovingDayIso === iso && !isDisabled ? 0 : -1,
                  class: classNames(
                    getCalendarDayClasses(isSelected, isTodayDate, isCurrentMonth, isDisabled),
                    'justify-self-center my-0.5'
                  ),
                  onClick: () => selectDay(date),
                  onFocus: () => (activeIso.value = iso)
                },
                date.getDate()
              )
            })
          )
        )
        body = h('div', { role: 'grid', 'aria-rowcount': 7, 'aria-colcount': 7, ref: dayGridEl }, [
          weekdayRow,
          ...weekRows
        ])
      }

      return h('div', { ...attrs, class: containerClass, role: 'group' }, [header, body])
    }
  }
})

export default Calendar
