import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  SHAKE_CLASS,
  TIGER_CHROME_ATTR,
  acceptDatePickerCandidate,
  coerceDatePickerRange,
  coerceDatePickerSingle,
  commitDatePickerDay,
  commitDatePickerToday,
  confirmDatePicker,
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
  isSameDatePickerValue,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  parseDatePickerShortcut,
  resolveDatePickerDisabled,
  resolveInputTrailingLayout,
  resolveTypedDatePickerCommit,
  runShakeAnimation,
  serializeDatePickerValue,
  toCalendarDate,
  type DateFormat,
  type DatePickerShortcut,
  type InputStatus
} from '@expcat/tigercat-core'
import { useControlledState } from '../../hooks/useControlledState'
import { useTigerConfig } from '../tiger-config'
import { useInputGroupContext } from '../InputGroup'
import { useFormItemControlContext } from '../FormItemContext'
import { isRangeDatePicker, type DatePickerProps, type DatePickerRangeResolvedValue } from './types'

export function useDatePickerController(props: DatePickerProps) {
  const isRangeMode = isRangeDatePicker(props)
  const {
    size = 'md',
    disabled = false,
    readOnly = false,
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

  const isReadOnly = readOnly === true
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
        return coerceDatePickerRange(formItemControl?.value)
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
      formItemControl?.onChange?.(formDatePickerValue(isRangeMode, next))
    }
  })

  const [isOpen, setOpen] = useControlledState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange
  })

  const [previewRange, setPreviewRange] = useState<DatePickerRangeResolvedValue | null>(null)
  const [draftText, setDraftText] = useState<string | null>(null)
  const [validationMessage, setValidationMessage] = useState<string | null>(null)

  const displaySource = isRangeMode ? (previewRange ?? committed) : committed
  const displayValue =
    draftText ?? formatDatePickerDisplay(isRangeMode, displaySource, format, localeCode)
  const placeholder =
    props.placeholder ?? (isRangeMode ? labels.rangePlaceholder : labels.placeholder)

  const minDate = useMemo(() => toCalendarDate(props.minDate ?? null), [props.minDate])
  const maxDate = useMemo(() => toCalendarDate(props.maxDate ?? null), [props.maxDate])
  const now = props.now

  const calendarValue = isRangeMode
    ? (previewRange?.[0] ?? (Array.isArray(committed) ? committed[0] : null) ?? null)
    : (committed as Date | null)
  const rangeHighlight = isRangeMode
    ? (previewRange ?? (Array.isArray(committed) ? committed : undefined))
    : undefined
  const bounds = useMemo(
    () => ({
      minDate,
      maxDate,
      disabledDate: props.disabledDate
    }),
    [maxDate, minDate, props.disabledDate]
  )

  const isDateDisabled = useCallback(
    (date: Date) => resolveDatePickerDisabled(date, bounds),
    [bounds]
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

  const reportError = useCallback(
    (reason: string) => {
      setValidationMessage(reason)
      formItemControl?.setError?.(reason)
    },
    [formItemControl]
  )

  const clearError = useCallback(() => {
    setValidationMessage(null)
    formItemControl?.setError?.(null)
  }, [formItemControl])

  const writeCommitted = useCallback(
    (next: Date | null | DatePickerRangeResolvedValue) => {
      const same = isSameDatePickerValue(isRangeMode, committed, next)
      clearError()
      setDraftText(null)
      if (same) return
      setCommitted(next)
    },
    [clearError, committed, isRangeMode, setCommitted]
  )

  const selectDay = useCallback(
    (date: Date) => {
      const result = commitDatePickerDay({
        range: isRangeMode,
        picked: date,
        committed,
        preview: previewRange,
        bounds
      })
      if (result.error) {
        reportError(result.error)
        return
      }
      if (result.commit) writeCommitted(result.nextCommitted)
      else clearError()
      setPreviewRange(result.nextPreview)
      setDraftText(null)
      if (result.close) setOpenSafe(false)
    },
    [
      bounds,
      clearError,
      committed,
      isRangeMode,
      previewRange,
      reportError,
      setOpenSafe,
      writeCommitted
    ]
  )

  const selectToday = useCallback(() => {
    if (!now) return
    const result = commitDatePickerToday(isRangeMode, now, bounds)
    if ('error' in result) return
    writeCommitted(result.nextCommitted)
    setPreviewRange(null)
    if (result.close) setOpenSafe(false)
  }, [bounds, isRangeMode, now, setOpenSafe, writeCommitted])

  const applyShortcut = useCallback(
    (shortcut: DatePickerShortcut) => {
      const parsed = parseDatePickerShortcut(shortcut, isRangeMode)
      if (parsed == null) return
      const accepted = acceptDatePickerCandidate(isRangeMode, parsed, bounds)
      if (!accepted.ok) {
        reportError(accepted.reason)
        return
      }
      writeCommitted(accepted.value)
      setPreviewRange(null)
      if (!isRangeMode) setOpenSafe(false)
    },
    [bounds, isRangeMode, reportError, setOpenSafe, writeCommitted]
  )

  const clearValue = useCallback(() => {
    writeCommitted(emptyDatePickerValue(isRangeMode))
    setPreviewRange(null)
    onClear?.()
    inputRef.current?.focus()
  }, [isRangeMode, onClear, writeCommitted])

  const confirmOpen = useCallback(() => {
    if (draftText != null) {
      const typed = resolveTypedDatePickerCommit(draftText, format, isRangeMode, localeCode, bounds)
      if (!typed.ok) {
        reportError(typed.reason)
        return
      }
      writeCommitted(typed.value)
      setPreviewRange(null)
      setOpenSafe(false)
      return
    }
    const result = confirmDatePicker({
      preview: previewRange,
      committed,
      bounds
    })
    if (!result.close) {
      if (result.error) reportError(result.error)
      setPreviewRange(result.nextPreview)
      return
    }
    writeCommitted(result.nextCommitted)
    setPreviewRange(null)
    setOpenSafe(false)
  }, [
    bounds,
    committed,
    draftText,
    format,
    isRangeMode,
    localeCode,
    previewRange,
    reportError,
    setOpenSafe,
    writeCommitted
  ])

  const parseDraft = useCallback(() => {
    if (draftText == null) return
    const result = resolveTypedDatePickerCommit(draftText, format, isRangeMode, localeCode, bounds)
    if (!result.ok) {
      reportError(result.reason)
      return
    }
    writeCommitted(result.value)
  }, [bounds, draftText, format, isRangeMode, localeCode, reportError, writeCommitted])

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
    describedBy: validationMessage
      ? mergeAriaDescribedBy(describedBy, `${panelId}-status`)
      : describedBy,
    validationMessage,
    validationId: `${panelId}-status`,
    nativeValue: serializeDatePickerValue(isRangeMode, committed),
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
