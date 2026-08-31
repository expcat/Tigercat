import {
  defineComponent,
  h,
  ref,
  computed,
  watch,
  onMounted,
  nextTick,
  useId,
  type PropType
} from 'vue'
import { classNames, coerceClassValue } from '@expcat/tigercat-core'
import type {
  CalendarMode,
  WeekStartsOn,
  TigerLocale,
  CalendarProps as CoreCalendarProps
} from '@expcat/tigercat-core'
import {
  calendarGridClasses,
  calendarHeaderClasses,
  calendarNavButtonClasses,
  calendarTitleClasses,
  calendarWeekdayClasses,
  chunkDaysIntoWeeks,
  chunkMonths,
  followCalendarValue,
  formatCalendarDayLabel,
  formatCalendarDayNumber,
  formatMonthYear,
  getCalendarContainerClasses,
  getCalendarDayClasses,
  getCalendarDayKeyAction,
  getCalendarLabels,
  getCalendarMonthClasses,
  getCalendarMonthKeyAction,
  getInitialCalendarView,
  getLocaleDirection,
  getMonthDays,
  getShortDayNames,
  getShortMonthNames,
  getWeekStartsOn,
  isCalendarDateDisabled,
  isCalendarMonthDisabled,
  isSameDay,
  mergeTigerLocale,
  mergeStyleValues,
  moveCalendarDayFocus,
  moveCalendarMonthFocus,
  panelDate,
  resolveCalendarRovingIso,
  resolveCalendarRovingMonth,
  selectCalendarDay,
  selectCalendarMonth,
  shiftCalendarMonth,
  shiftCalendarYear,
  toCalendarDate,
  toIsoDate
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface VueCalendarProps extends Omit<
  CoreCalendarProps,
  'value' | 'onChange' | 'onPanelChange'
> {
  modelValue?: Date | string | null
}

export type CalendarProps = VueCalendarProps

export const Calendar = defineComponent({
  name: 'TigerCalendar',
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [Date, String, null] as PropType<Date | string | null>,
      default: undefined
    },
    defaultValue: {
      type: [Date, String, null] as PropType<Date | string | null>,
      default: undefined
    },
    mode: { type: String as PropType<CalendarMode>, default: undefined },
    defaultMode: { type: String as PropType<CalendarMode>, default: 'month' },
    fullscreen: { type: Boolean, default: false },
    disabledDate: { type: Function as PropType<(date: Date) => boolean>, default: undefined },
    weekStartsOn: { type: Number as PropType<WeekStartsOn>, default: undefined },
    now: { type: Date as PropType<Date>, default: undefined },
    rangeValue: {
      type: Array as unknown as PropType<[Date | null, Date | null]>,
      default: undefined
    },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    className: { type: String, default: undefined }
  },
  emits: ['update:modelValue', 'update:mode', 'change', 'panel-change'],
  setup(props, { emit, attrs, expose }) {
    const config = useTigerConfig()
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const localeCode = computed(() => mergedLocale.value?.locale)
    const dir = computed(() => getLocaleDirection(mergedLocale.value))
    const labels = computed(() => getCalendarLabels(mergedLocale.value))
    const weekStartsOn = computed(() => props.weekStartsOn ?? getWeekStartsOn(localeCode.value))
    const weekdayNames = computed(() => getShortDayNames(localeCode.value, weekStartsOn.value))
    const monthNames = computed(() => getShortMonthNames(localeCode.value))

    const clientNow = ref<Date | null>(null)
    onMounted(() => {
      if (!props.now) clientNow.value = new Date()
    })
    const today = computed(() => props.now ?? clientNow.value)

    const innerSelected = ref<Date | null>(toCalendarDate(props.defaultValue) ?? null)
    const selected = computed(() =>
      props.modelValue !== undefined ? toCalendarDate(props.modelValue) : innerSelected.value
    )

    const innerMode = ref<CalendarMode>(props.defaultMode ?? 'month')
    const mode = computed(() => props.mode ?? innerMode.value)

    const view = ref(getInitialCalendarView(selected.value, today.value ?? props.now))
    const followedYmd = ref(selected.value ? toIsoDate(selected.value) : null)

    watch(
      () => (selected.value ? toIsoDate(selected.value) : null),
      (ymd) => {
        const next = followCalendarValue(view.value, selected.value, followedYmd.value)
        followedYmd.value = ymd
        if (next) view.value = next
      }
    )

    const days = computed(() =>
      getMonthDays(view.value.viewYear, view.value.viewMonth, weekStartsOn.value)
    )
    const weeks = computed(() => chunkDaysIntoWeeks(days.value))
    const monthRows = computed(() => chunkMonths(monthNames.value))

    function emitPanel(nextView: { viewYear: number; viewMonth: number }, nextMode: CalendarMode) {
      emit('panel-change', panelDate(nextView), nextMode)
    }

    function navigate(nextView: { viewYear: number; viewMonth: number }) {
      view.value = nextView
      emitPanel(nextView, mode.value)
    }

    function commitSelected(date: Date) {
      if (props.modelValue === undefined) innerSelected.value = date
      emit('update:modelValue', date)
      emit('change', date)
    }

    function selectDay(date: Date) {
      const result = selectCalendarDay(date, props.disabledDate)
      if (!result) return
      const next = toCalendarDate(result.iso)
      if (!next) return
      view.value = { viewYear: result.viewYear, viewMonth: result.viewMonth }
      commitSelected(next)
    }

    function selectMonth(monthIdx: number) {
      const result = selectCalendarMonth(view.value.viewYear, monthIdx, props.disabledDate)
      if (!result) return
      view.value = { viewYear: view.value.viewYear, viewMonth: monthIdx }
      if (props.mode === undefined) innerMode.value = 'month'
      emit('update:mode', 'month')
      commitSelected(result.date)
      emit('panel-change', result.date, 'month')
    }

    function toggleMode() {
      const next: CalendarMode = mode.value === 'month' ? 'year' : 'month'
      if (props.mode === undefined) innerMode.value = next
      emit('update:mode', next)
      emitPanel(view.value, next)
    }

    const dayGridEl = ref<HTMLElement | null>(null)
    const monthGridEl = ref<HTMLElement | null>(null)
    const rootEl = ref<HTMLElement | null>(null)
    const activeIso = ref<string | null>(null)
    const activeMonthIdx = ref<number | null>(null)
    const titleId = useId()

    function handleDayGridKeyDown(event: KeyboardEvent) {
      const action = getCalendarDayKeyAction(event.key, dir.value, event.altKey)
      if (action.kind === 'none') return
      event.preventDefault()
      const roving = resolveCalendarRovingIso({
        days: days.value,
        selected: selected.value,
        today: today.value,
        view: view.value,
        disabledDate: props.disabledDate,
        activeIso: activeIso.value
      })
      const currentIso = (event.target as HTMLElement).getAttribute('data-date') ?? roving
      if (!currentIso) return
      const result = moveCalendarDayFocus({
        currentIso,
        kind: action.kind,
        delta: action.delta,
        weekStartsOn: weekStartsOn.value,
        disabledDate: props.disabledDate
      })
      if (!result) return
      activeIso.value = result.iso
      if (result.viewYear !== view.value.viewYear || result.viewMonth !== view.value.viewMonth) {
        navigate({ viewYear: result.viewYear, viewMonth: result.viewMonth })
        nextTick(() => {
          dayGridEl.value
            ?.querySelector<HTMLButtonElement>(`button[data-date="${result.iso}"]`)
            ?.focus()
        })
        return
      }
      dayGridEl.value
        ?.querySelector<HTMLButtonElement>(`button[data-date="${result.iso}"]`)
        ?.focus()
    }

    function handleMonthKeyDown(event: KeyboardEvent, idx: number) {
      const action = getCalendarMonthKeyAction(event.key, dir.value)
      if (action.kind === 'none') return
      event.preventDefault()
      const next = moveCalendarMonthFocus({
        current: idx,
        kind: action.kind,
        delta: action.delta,
        viewYear: view.value.viewYear,
        disabledDate: props.disabledDate
      })
      if (next == null) return
      activeMonthIdx.value = next
      monthGridEl.value
        ?.querySelectorAll<HTMLButtonElement>('button[role="gridcell"]')
        [next]?.focus()
    }

    expose({
      focus: () => {
        const iso = resolveCalendarRovingIso({
          days: days.value,
          selected: selected.value,
          today: today.value,
          view: view.value,
          disabledDate: props.disabledDate,
          activeIso: activeIso.value
        })
        const el = iso
          ? dayGridEl.value?.querySelector<HTMLButtonElement>(`button[data-date="${iso}"]`)
          : null
        ;(el ?? rootEl.value)?.focus?.()
      }
    })

    return () => {
      const attrRecord = attrs as Record<string, unknown>
      const containerClass = classNames(
        getCalendarContainerClasses(!!props.fullscreen),
        props.className,
        coerceClassValue(attrRecord.class)
      )
      const title =
        mode.value === 'month'
          ? formatMonthYear(view.value.viewYear, view.value.viewMonth, localeCode.value)
          : `${view.value.viewYear}`
      const prevLabel =
        mode.value === 'month' ? labels.value.previousMonth : labels.value.previousYear
      const nextLabel = mode.value === 'month' ? labels.value.nextMonth : labels.value.nextYear
      const prevChar = dir.value === 'rtl' ? '\u203A' : '\u2039'
      const nextChar = dir.value === 'rtl' ? '\u2039' : '\u203A'
      const rovingDayIso = resolveCalendarRovingIso({
        days: days.value,
        selected: selected.value,
        today: today.value,
        view: view.value,
        disabledDate: props.disabledDate,
        activeIso: activeIso.value
      })
      const rovingMonthIdx = resolveCalendarRovingMonth({
        viewMonth: view.value.viewMonth,
        viewYear: view.value.viewYear,
        disabledDate: props.disabledDate,
        activeMonthIdx: activeMonthIdx.value
      })
      const rangeStart = props.rangeValue?.[0] ?? null
      const rangeEnd = props.rangeValue?.[1] ?? null

      const header = h('div', { class: calendarHeaderClasses }, [
        h(
          'button',
          {
            type: 'button',
            class: calendarNavButtonClasses,
            'aria-label': prevLabel,
            onClick: () =>
              navigate(
                mode.value === 'month'
                  ? shiftCalendarMonth(view.value, -1)
                  : shiftCalendarYear(view.value, -1)
              )
          },
          prevChar
        ),
        h(
          'button',
          {
            type: 'button',
            id: titleId,
            class: calendarTitleClasses,
            onClick: toggleMode
          },
          title
        ),
        h(
          'button',
          {
            type: 'button',
            class: calendarNavButtonClasses,
            'aria-label': nextLabel,
            onClick: () =>
              navigate(
                mode.value === 'month'
                  ? shiftCalendarMonth(view.value, 1)
                  : shiftCalendarYear(view.value, 1)
              )
          },
          nextChar
        )
      ])

      let body: ReturnType<typeof h>
      if (mode.value === 'year') {
        body = h(
          'div',
          {
            class: 'grid grid-cols-1 gap-2',
            role: 'grid',
            'aria-colcount': 3,
            'aria-labelledby': titleId,
            ref: monthGridEl
          },
          monthRows.value.map((row, ri) =>
            h(
              'div',
              { key: ri, class: 'grid grid-cols-3 gap-2', role: 'row' },
              row.map((name, ci) => {
                const i = ri * 3 + ci
                const isDisabled = isCalendarMonthDisabled(
                  view.value.viewYear,
                  i,
                  props.disabledDate
                )
                return h(
                  'button',
                  {
                    key: i,
                    type: 'button',
                    role: 'gridcell',
                    'aria-selected': view.value.viewMonth === i,
                    disabled: isDisabled,
                    tabindex: rovingMonthIdx === i && !isDisabled ? 0 : -1,
                    class: getCalendarMonthClasses({
                      isSelected: view.value.viewMonth === i,
                      isDisabled,
                      isActive: activeMonthIdx.value === i
                    }),
                    onClick: () => selectMonth(i),
                    onFocus: () => (activeMonthIdx.value = i),
                    onKeydown: (event: KeyboardEvent) => handleMonthKeyDown(event, i)
                  },
                  name
                )
              })
            )
          )
        )
      } else {
        const weekdayRow = h(
          'div',
          { class: calendarGridClasses, role: 'row' },
          weekdayNames.value.map((wd) =>
            h('div', { key: wd, class: calendarWeekdayClasses, role: 'columnheader' }, wd)
          )
        )
        const weekRows = weeks.value.map((week, wi) =>
          h(
            'div',
            { key: wi, class: calendarGridClasses, role: 'row' },
            week.map((date) => {
              const iso = toIsoDate(date)
              const isCurrentMonth = date.getMonth() === view.value.viewMonth
              const isSelected = selected.value ? isSameDay(date, selected.value) : false
              const isRangeStart = rangeStart ? isSameDay(date, rangeStart) : false
              const isRangeEnd = rangeEnd ? isSameDay(date, rangeEnd) : false
              const isInRange = Boolean(
                rangeStart &&
                rangeEnd &&
                date >= rangeStart &&
                date <= rangeEnd &&
                !isRangeStart &&
                !isRangeEnd
              )
              const isTodayDate = today.value ? isSameDay(date, today.value) : false
              const isDisabled = isCalendarDateDisabled(date, props.disabledDate)
              return h(
                'button',
                {
                  key: iso,
                  type: 'button',
                  role: 'gridcell',
                  'data-date': iso,
                  'aria-label': formatCalendarDayLabel(date, localeCode.value),
                  'aria-selected': isSelected || isRangeStart || isRangeEnd,
                  'aria-current': isTodayDate ? 'date' : undefined,
                  disabled: isDisabled,
                  tabindex: rovingDayIso === iso && !isDisabled ? 0 : -1,
                  class: getCalendarDayClasses({
                    isSelected,
                    isToday: isTodayDate,
                    isCurrentMonth,
                    isDisabled,
                    isActive: activeIso.value === iso,
                    isInRange,
                    isRangeStart,
                    isRangeEnd
                  }),
                  onClick: () => selectDay(date),
                  onFocus: () => (activeIso.value = iso)
                },
                formatCalendarDayNumber(date, localeCode.value)
              )
            })
          )
        )
        body = h(
          'div',
          {
            role: 'grid',
            'aria-rowcount': 7,
            'aria-colcount': 7,
            'aria-labelledby': titleId,
            ref: dayGridEl,
            onKeydown: handleDayGridKeyDown
          },
          [weekdayRow, ...weekRows]
        )
      }

      const { class: _class, style: attrStyle, ...restAttrs } = attrRecord
      return h(
        'div',
        {
          ...restAttrs,
          ref: rootEl,
          dir: dir.value,
          class: containerClass,
          style: mergeStyleValues(attrStyle),
          'data-tiger': 'calendar'
        },
        [header, body]
      )
    }
  }
})

export default Calendar
