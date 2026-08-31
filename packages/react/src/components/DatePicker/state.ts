import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  SHAKE_CLASS,
  TIGER_CHROME_ATTR,
  coerceDatePickerRange,
  coerceDatePickerSingle,
  commitDatePickerDay,
  commitDatePickerToday,
  emptyDatePickerValue,
  formatDatePickerDisplay,
  formDatePickerValue,
  getDatePickerLabels,
  getDatePickerLocaleCode,
  getInputFieldClasses,
  getInputWrapperClasses,
  getLocaleDirection,
  getWeekStartsOn,
  isDatePickerValueEmpty,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  parseDatePickerShortcut,
  parseTypedDatePickerValue,
  resolveDatePickerDisabled,
  resolveInputTrailingLayout,
  resolveReadOnlyFlag,
  runShakeAnimation,
  toCalendarDate,
  type DateFormat,
  type DatePickerShortcut,
  type InputStatus
} from '@expcat/tigercat-core'
import { useControlledState } from '../../hooks/useControlledState'
import { useTigerConfig } from '../ConfigProvider'
import { useInputGroupContext } from '../InputGroup'
import { useFormItemControlContext } from '../FormItemContext'
import { isRangeDatePicker, type DatePickerProps, type DatePickerRangeResolvedValue } from './types'

export function useDatePickerController(props: DatePickerProps) {
  const isRangeMode = isRangeDatePicker(props)
  const {
    size = 'md',
    disabled = false,
    readonly: readonlyProp,
    required = false,
    clearable = true,
    format = 'yyyy-MM-dd' as DateFormat,
    open,
    defaultOpen = false,
    onOpenChange,
    status: statusProp,
    name,
    id,
    locale,
    labels: labelsOverride,
    className,
    onClear,
    onBlur
  } = props

  const isReadOnly = resolveReadOnlyFlag(readonlyProp, (props as { readOnly?: boolean }).readOnly)
  const config = useTigerConfig()
  const inputGroup = useInputGroupContext()
  const formItemControl = useFormItemControlContext()
  const inGroup = inputGroup != null
  const effectiveSize = size ?? inputGroup?.size ?? 'md'
  const effectiveDisabled = Boolean(disabled || formItemControl?.disabled)
  const status: InputStatus = statusProp ?? formItemControl?.status ?? 'default'
  const shakeTrigger = formItemControl?.shakeTrigger
  const effectiveId = id ?? formItemControl?.id
  const effectiveName = name ?? formItemControl?.name
  const describedBy = mergeAriaDescribedBy(
    typeof props['aria-describedby'] === 'string' ? props['aria-describedby'] : undefined,
    formItemControl?.describedBy
  )
  const labelledby =
    typeof props['aria-labelledby'] === 'string' && props['aria-labelledby'].trim()
      ? props['aria-labelledby']
      : formItemControl?.labelId
  const ariaLabel =
    typeof props['aria-label'] === 'string' && props['aria-label'].trim()
      ? props['aria-label']
      : undefined

  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const localeCode = getDatePickerLocaleCode(mergedLocale)
  const labels = useMemo(
    () => getDatePickerLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )
  const weekStartsOn = props.weekStartsOn ?? getWeekStartsOn(localeCode)
  const dir = getLocaleDirection(mergedLocale)

  const parsedValue = useMemo(() => {
    if (isRangeMode) {
      if (props.value === undefined) {
        return coerceDatePickerRange(formItemControl?.value) as DatePickerRangeResolvedValue
      }
      return coerceDatePickerRange(props.value)
    }
    if (props.value === undefined) {
      return coerceDatePickerSingle(formItemControl?.value)
    }
    return coerceDatePickerSingle(props.value)
  }, [formItemControl?.value, isRangeMode, props.value])

  const parsedDefault = useMemo(
    () =>
      isRangeMode
        ? coerceDatePickerRange(props.defaultValue)
        : coerceDatePickerSingle(props.defaultValue),
    [isRangeMode, props.defaultValue]
  )

  const [committed, setCommitted] = useControlledState<Date | null | DatePickerRangeResolvedValue>({
    value:
      props.value !== undefined || formItemControl?.value !== undefined ? parsedValue : undefined,
    defaultValue: parsedDefault ?? emptyDatePickerValue(isRangeMode),
    onChange: (next) => {
      if (isRangeMode) {
        ;(props.onChange as ((value: DatePickerRangeResolvedValue) => void) | undefined)?.(
          next as DatePickerRangeResolvedValue
        )
      } else {
        ;(props.onChange as ((value: Date | null) => void) | undefined)?.(next as Date | null)
      }
      formItemControl?.onChange?.(formDatePickerValue(isRangeMode, next, null))
    }
  })

  const [isOpen, setOpen] = useControlledState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange
  })

  const [previewRange, setPreviewRange] = useState<DatePickerRangeResolvedValue | null>(null)
  const [draftText, setDraftText] = useState<string | null>(null)

  const displaySource = isRangeMode ? (previewRange ?? committed) : committed
  const displayValue =
    draftText ?? formatDatePickerDisplay(isRangeMode, displaySource, format, localeCode)
  const placeholder =
    props.placeholder ?? (isRangeMode ? labels.rangePlaceholder : labels.placeholder)

  const minDate = useMemo(() => toCalendarDate(props.minDate ?? null), [props.minDate])
  const maxDate = useMemo(() => toCalendarDate(props.maxDate ?? null), [props.maxDate])
  const now = props.now

  const calendarValue = isRangeMode
    ? (previewRange?.[0] ?? (committed as DatePickerRangeResolvedValue)[0] ?? null)
    : (committed as Date | null)
  const rangeHighlight = isRangeMode
    ? (previewRange ?? (committed as DatePickerRangeResolvedValue))
    : undefined
  const rangeSelectingEnd = Boolean(
    isRangeMode && previewRange && previewRange[0] && !previewRange[1]
  )

  const isDateDisabled = useCallback(
    (date: Date) =>
      resolveDatePickerDisabled(date, {
        minDate,
        maxDate,
        disabledDate: props.disabledDate,
        rangeStart: previewRange?.[0] ?? null,
        rangeSelectingEnd
      }),
    [minDate, maxDate, previewRange, props.disabledDate, rangeSelectingEnd]
  )

  const showClear = Boolean(
    clearable &&
    !effectiveDisabled &&
    !isReadOnly &&
    !isDatePickerValueEmpty(isRangeMode, committed)
  )
  const trailing = resolveInputTrailingLayout({
    clearable,
    disabled: effectiveDisabled,
    readOnly: isReadOnly,
    valueLength: showClear ? 1 : 0,
    hasCustomSuffix: true
  })

  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const inputWrapperRef = useRef<HTMLDivElement>(null)
  const instanceId = useId()
  const panelId = `tiger-datepicker-panel-${instanceId}`

  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    if (status === 'error') runShakeAnimation(rootRef.current)
  }, [status, shakeTrigger])

  const setOpenSafe = useCallback(
    (next: boolean) => {
      if (effectiveDisabled || isReadOnly) return
      setOpen(next)
      if (!next) setPreviewRange(null)
    },
    [effectiveDisabled, isReadOnly, setOpen]
  )

  const commit = useCallback(
    (
      next: Date | null | DatePickerRangeResolvedValue,
      preview: DatePickerRangeResolvedValue | null
    ) => {
      setCommitted(next)
      setPreviewRange(preview)
      setDraftText(null)
    },
    [setCommitted]
  )

  const selectDay = useCallback(
    (date: Date) => {
      const result = commitDatePickerDay({
        range: isRangeMode,
        picked: date,
        committed,
        preview: previewRange
      })
      commit(result.nextCommitted, result.nextPreview)
      if (result.close) setOpenSafe(false)
    },
    [commit, committed, isRangeMode, previewRange, setOpenSafe]
  )

  const selectToday = useCallback(() => {
    const today = now ?? new Date()
    if (isDateDisabled(today)) return
    const result = commitDatePickerToday(isRangeMode, today)
    commit(result.nextCommitted, null)
    if (result.close) setOpenSafe(false)
  }, [commit, isDateDisabled, isRangeMode, now, setOpenSafe])

  const applyShortcut = useCallback(
    (shortcut: DatePickerShortcut) => {
      const parsed = parseDatePickerShortcut(shortcut, isRangeMode)
      if (parsed == null) return
      commit(parsed, null)
      if (!isRangeMode) setOpenSafe(false)
    },
    [commit, isRangeMode, setOpenSafe]
  )

  const clearValue = useCallback(() => {
    commit(emptyDatePickerValue(isRangeMode), null)
    onClear?.()
    inputRef.current?.focus()
  }, [commit, isRangeMode, onClear])

  const confirmOpen = useCallback(() => {
    setOpenSafe(false)
  }, [setOpenSafe])

  const parseDraft = useCallback(() => {
    if (draftText == null) return
    const parsed = parseTypedDatePickerValue(draftText, format, isRangeMode)
    if (isRangeMode) {
      const tuple = (parsed as DatePickerRangeResolvedValue | null) ?? [null, null]
      commit(tuple, null)
    } else {
      commit((parsed as Date | null) ?? null, null)
    }
  }, [commit, draftText, format, isRangeMode])

  const handleFocusOut = (event: React.FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget as Node | null
    if (
      (rootRef.current && next && rootRef.current.contains(next)) ||
      (panelRef.current && next && panelRef.current.contains(next))
    ) {
      return
    }
    parseDraft()
    formItemControl?.onBlur?.()
    onBlur?.(event)
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (effectiveDisabled || isReadOnly) return
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpenSafe(true)
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      if (isOpen) {
        parseDraft()
        return
      }
      if (draftText != null) parseDraft()
      else setOpenSafe(true)
    }
  }

  const inputClasses = getInputFieldClasses({
    size: effectiveSize,
    status,
    hasSuffix: trailing.hasSuffix,
    hasDualSuffix: trailing.hasDualSuffix
  })
  const wrapperClasses = getInputWrapperClasses(status, { inGroup })

  return {
    rootRef,
    inputRef,
    panelRef,
    inputWrapperRef,
    isOpen,
    setOpenSafe,
    isRangeMode,
    labels,
    mergedLocale,
    localeCode,
    weekStartsOn,
    dir,
    format,
    displayValue,
    placeholder,
    effectiveDisabled,
    isReadOnly,
    required: required || Boolean(formItemControl?.required),
    effectiveId,
    effectiveName,
    describedBy,
    labelledby,
    ariaLabel,
    status,
    panelId,
    calendarValue,
    rangeHighlight,
    isDateDisabled,
    now,
    showClear,
    trailing,
    inputClasses,
    wrapperClasses,
    chromeAttr: TIGER_CHROME_ATTR,
    shakeClass: SHAKE_CLASS,
    className,
    size: effectiveSize,
    shortcuts: props.shortcuts,
    selectDay,
    selectToday,
    applyShortcut,
    clearValue,
    confirmOpen,
    handleFocusOut,
    handleInputKeyDown,
    onDraftChange: (text: string) => setDraftText(text),
    parseDraft,
    placement: props.placement ?? 'bottom-start',
    offset: props.offset ?? 4,
    dropdownClassName: props.dropdownClassName,
    getPopupContainer: props.getPopupContainer
  }
}
