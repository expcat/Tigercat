import { ref, computed, Ref, watch, nextTick } from 'vue'
import {
  parseDate,
  formatDate,
  getCalendarDays,
  getShortDayNames,
  isDateInRange,
  normalizeDate
} from '@expcat/tigercat-core'

export interface UseDateNavigationOptions {
  /** Initial date to focus on (typically selected date) */
  initialDate?: Ref<Date | null>
  /** Minimum selectable date */
  minDate?: Ref<Date | null>
  /** Maximum selectable date */
  maxDate?: Ref<Date | null>
  /** Calendar container ref for DOM queries */
  calendarRef: Ref<HTMLElement | null>
  /** Locale for day names */
  locale?: Ref<string | undefined>
  /** Callback when calendar should close */
  onClose?: () => void
}

export interface UseDateNavigationReturn {
  /** Current viewing month (0-11) */
  viewingMonth: Ref<number>
  /** Current viewing year */
  viewingYear: Ref<number>
  /** ISO string of currently active/focused date */
  activeDateIso: Ref<string | null>
  /** Calendar days for current view */
  calendarDays: Ref<(Date | null)[]>
  /** Short day names for header */
  dayNames: Ref<string[]>
  /** Formatted month/year display */
  monthYearDisplay: Ref<string>
  /** Navigate to previous month */
  previousMonth: () => void
  /** Navigate to next month */
  nextMonth: () => void
  /** Set viewing to specific date */
  setViewingDate: (date: Date) => void
  /** Move focus by delta days (handles month transitions) */
  moveFocus: (deltaDays: number) => Promise<void>
  /** Handle keyboard navigation */
  handleCalendarKeyDown: (event: KeyboardEvent) => Promise<void>
  /** Focus a specific date button */
  focusDateButtonByIso: (iso: string) => boolean
  /** Get preferred ISO to focus when opening */
  getPreferredFocusIso: () => string | null
  /** Check if a date is disabled */
  isDateDisabled: (date: Date | null) => boolean
  /** Check if date is in current viewing month */
  isCurrentMonth: (date: Date | null) => boolean
}

export function useDateNavigation(options: UseDateNavigationOptions): UseDateNavigationReturn {
  const { initialDate, minDate, maxDate, calendarRef, locale, onClose } = options

  const now = new Date()
  const baseDate = initialDate?.value ?? now

  const viewingMonth = ref(baseDate.getMonth())
  const viewingYear = ref(baseDate.getFullYear())
  const activeDateIso = ref<string | null>(null)
  const pendingFocusIso = ref<string | null>(null)

  // Sync viewing month when initial date changes
  watch(
    () => initialDate?.value,
    (newDate) => {
      if (newDate) {
        viewingMonth.value = newDate.getMonth()
        viewingYear.value = newDate.getFullYear()
      }
    }
  )

  const calendarDays = computed(() => getCalendarDays(viewingYear.value, viewingMonth.value))

  const dayNames = computed(() => getShortDayNames(locale?.value))

  const monthYearDisplay = computed(() => {
    const date = new Date(viewingYear.value, viewingMonth.value, 1)
    return date.toLocaleDateString(locale?.value ?? 'en-US', {
      year: 'numeric',
      month: 'long'
    })
  })

  const addDays = (date: Date, days: number): Date => {
    const next = new Date(date)
    next.setDate(next.getDate() + days)
    return next
  }

  const isDateDisabled = (date: Date | null): boolean => {
    if (!date) return true
    return !isDateInRange(date, minDate?.value ?? null, maxDate?.value ?? null)
  }

  const isCurrentMonth = (date: Date | null): boolean => {
    if (!date) return false
    return date.getMonth() === viewingMonth.value
  }

  const focusDateButtonByIso = (iso: string): boolean => {
    const button = calendarRef.value?.querySelector(
      `button[data-date="${iso}"]`
    ) as HTMLButtonElement | null

    if (!button || button.disabled) return false
    button.focus()
    activeDateIso.value = iso
    return true
  }

  const getFirstEnabledIsoInView = (): string | null => {
    for (const date of calendarDays.value) {
      if (!date) continue
      const iso = formatDate(date, 'yyyy-MM-dd')
      if (!isDateDisabled(date)) return iso
    }
    return null
  }

  const getPreferredFocusIso = (): string | null => {
    if (initialDate?.value) {
      return formatDate(initialDate.value, 'yyyy-MM-dd')
    }

    const today = normalizeDate(new Date())
    if (isDateInRange(today, minDate?.value ?? null, maxDate?.value ?? null)) {
      return formatDate(today, 'yyyy-MM-dd')
    }

    return getFirstEnabledIsoInView()
  }

  const previousMonth = () => {
    if (viewingMonth.value === 0) {
      viewingMonth.value = 11
      viewingYear.value--
    } else {
      viewingMonth.value--
    }
  }

  const nextMonth = () => {
    if (viewingMonth.value === 11) {
      viewingMonth.value = 0
      viewingYear.value++
    } else {
      viewingMonth.value++
    }
  }

  const setViewingDate = (date: Date) => {
    viewingMonth.value = date.getMonth()
    viewingYear.value = date.getFullYear()
  }

  const moveFocus = async (deltaDays: number) => {
    const activeEl = document.activeElement as HTMLElement | null
    const currentIso = activeEl?.getAttribute('data-date') ?? activeDateIso.value ?? null

    const baseIso = currentIso ?? getPreferredFocusIso()
    if (!baseIso) return

    const baseDate = parseDate(baseIso)
    if (!baseDate) return

    let candidate = addDays(baseDate, deltaDays)
    for (let attempts = 0; attempts < 42; attempts++) {
      const iso = formatDate(candidate, 'yyyy-MM-dd')
      const el = calendarRef.value?.querySelector(
        `button[data-date="${iso}"]`
      ) as HTMLButtonElement | null

      if (el && !el.disabled) {
        el.focus()
        activeDateIso.value = iso
        return
      }

      if (!el) {
        pendingFocusIso.value = iso
        viewingYear.value = candidate.getFullYear()
        viewingMonth.value = candidate.getMonth()
        activeDateIso.value = iso
        await nextTick()
        if (pendingFocusIso.value) {
          const nextIso = pendingFocusIso.value
          pendingFocusIso.value = null
          if (focusDateButtonByIso(nextIso)) return
        }
        const fallback = getFirstEnabledIsoInView()
        if (fallback) focusDateButtonByIso(fallback)
        return
      }

      candidate = addDays(candidate, deltaDays)
    }
  }

  const handleCalendarKeyDown = async (event: KeyboardEvent) => {
    switch (event.key) {
      case 'Escape': {
        event.preventDefault()
        onClose?.()
        return
      }
      case 'ArrowRight': {
        event.preventDefault()
        await moveFocus(1)
        return
      }
      case 'ArrowLeft': {
        event.preventDefault()
        await moveFocus(-1)
        return
      }
      case 'ArrowDown': {
        event.preventDefault()
        await moveFocus(7)
        return
      }
      case 'ArrowUp': {
        event.preventDefault()
        await moveFocus(-7)
        return
      }
      case 'Enter':
      case ' ': {
        const activeEl = document.activeElement as HTMLButtonElement | null
        if (activeEl?.tagName === 'BUTTON' && activeEl.dataset.date) {
          event.preventDefault()
          if (!activeEl.disabled) activeEl.click()
        }
        return
      }
    }
  }

  return {
    viewingMonth,
    viewingYear,
    activeDateIso,
    calendarDays,
    dayNames,
    monthYearDisplay,
    previousMonth,
    nextMonth,
    setViewingDate,
    moveFocus,
    handleCalendarKeyDown,
    focusDateButtonByIso,
    getPreferredFocusIso,
    isDateDisabled,
    isCurrentMonth
  }
}
