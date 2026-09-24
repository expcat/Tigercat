import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  SHAKE_CLASS,
  TIGER_CHROME_ATTR,
  adjacentTimePickerColumn,
  applyTimePickerColumn,
  applyTimePickerRangeColumn,
  buildTimePickerColumns,
  coerceTimePickerRange,
  coerceTimePickerSingle,
  commitTimePickerNow,
  commitTimePickerOk,
  emptyTimePickerValue,
  focusTimePickerOption,
  formatTime,
  formatTimePickerDisplay,
  formTimePickerValue,
  getInputFieldClasses,
  getInputWrapperClasses,
  getLocaleDirection,
  getTimePeriodLabels,
  getTimePickerLabels,
  isSameTimePickerValue,
  isTimePickerValueEmpty,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  resolveInputTrailingLayout,
  resolveTypedTimePickerCommit,
  runShakeAnimation,
  serializeTimePickerValue,
  seedTimePickerDraft,
  visibleTimePickerColumns,
  type InputStatus,
  type TimeFormat,
  type TimePickerConstraints,
  type TimePickerDraft,
  type TimePickerFocusUnit,
  type TimePickerRangeTuple
} from '@expcat/tigercat-core'
import { useControlledState } from '../../hooks/useControlledState'
import { useTigerConfig } from '../tiger-config'
import { useInputGroupContext } from '../InputGroup'
import { useFormItemControlContext } from '../FormItemContext'
import { isRangeTimePicker, type TimePickerProps } from './types'

export function useTimePickerController(props: TimePickerProps) {
  const isRangeMode = isRangeTimePicker(props)
  const {
    size = 'md',
    disabled = false,
    readOnly = false,
    required = false,
    clearable = true,
    format = '24' as TimeFormat,
    showSeconds = false,
    hourStep = 1,
    minuteStep = 1,
    secondStep = 1,
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
  const localeCode = mergedLocale?.locale
  const labels = useMemo(
    () => getTimePickerLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )
  const periodLabels = useMemo(() => getTimePeriodLabels(localeCode), [localeCode])
  const dir = getLocaleDirection(mergedLocale)

  const parsedValue = useMemo(() => {
    if (isRangeMode) {
      if (props.value === undefined) {
        return coerceTimePickerRange(formItemControl?.value, showSeconds)
      }
      return coerceTimePickerRange(props.value, showSeconds)
    }
    if (props.value === undefined) {
      return coerceTimePickerSingle(formItemControl?.value, showSeconds)
    }
    return coerceTimePickerSingle(props.value, showSeconds)
  }, [formItemControl?.value, isRangeMode, props.value, showSeconds])

  const parsedDefault = useMemo(
    () =>
      isRangeMode
        ? coerceTimePickerRange(props.defaultValue, showSeconds)
        : coerceTimePickerSingle(props.defaultValue, showSeconds),
    [isRangeMode, props.defaultValue, showSeconds]
  )

  const [committed, setCommitted] = useControlledState<string | null | TimePickerRangeTuple>({
    value:
      props.value !== undefined || formItemControl?.value !== undefined ? parsedValue : undefined,
    defaultValue: parsedDefault ?? emptyTimePickerValue(isRangeMode),
    onChange: (next) => {
      if (isRangeMode) {
        ;(props.onChange as ((value: TimePickerRangeTuple | null) => void) | undefined)?.(
          next as TimePickerRangeTuple | null
        )
      } else {
        ;(props.onChange as ((value: string | null) => void) | undefined)?.(next as string | null)
      }
      formItemControl?.onChange?.(formTimePickerValue(isRangeMode, next))
    }
  })

  const [isOpen, setOpen] = useControlledState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange
  })

  const [draft, setDraft] = useState<TimePickerDraft>(() =>
    seedTimePickerDraft(isRangeMode ? null : (parsedDefault as string | null), format)
  )
  const [draftRange, setDraftRange] = useState<TimePickerRangeTuple | null>(
    isRangeMode ? (parsedDefault as TimePickerRangeTuple | null) : null
  )
  const [activePart, setActivePart] = useState<'start' | 'end'>('start')
  const [draftText, setDraftText] = useState<string | null>(null)
  const [validationMessage, setValidationMessage] = useState<string | null>(null)

  const constraints: TimePickerConstraints = useMemo(
    () => ({
      minTime: props.minTime,
      maxTime: props.maxTime,
      disabledTime: props.disabledTime,
      hourStep,
      minuteStep,
      secondStep,
      format,
      showSeconds
    }),
    [
      format,
      hourStep,
      minuteStep,
      props.disabledTime,
      props.maxTime,
      props.minTime,
      secondStep,
      showSeconds
    ]
  )

  const displaySource = isOpen
    ? isRangeMode
      ? draftRange
      : draft.parts
        ? formatTime(draft.parts.hours, draft.parts.minutes, draft.parts.seconds, showSeconds)
        : null
    : committed
  const displayValue =
    draftText ??
    formatTimePickerDisplay(isRangeMode, displaySource, format, showSeconds, localeCode)
  const placeholder =
    props.placeholder ?? (isRangeMode ? labels.selectTimeRange : labels.selectTime)

  const showClear = Boolean(
    clearable &&
    !effectiveDisabled &&
    !isReadOnly &&
    !isTimePickerValueEmpty(isRangeMode, committed)
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
  const panelId = `tiger-timepicker-panel-${instanceId}`

  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    if (status === 'error') runShakeAnimation(rootRef.current)
  }, [status, shakeTrigger])

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

  const seedPanel = useCallback(
    (value: string | null | TimePickerRangeTuple, part: 'start' | 'end') => {
      if (isRangeMode) {
        const tuple = (value as TimePickerRangeTuple | null) ?? null
        setDraftRange(tuple)
        const active = tuple?.[part === 'start' ? 0 : 1] ?? null
        setDraft(seedTimePickerDraft(active, format))
        return
      }
      setDraft(seedTimePickerDraft(value as string | null, format))
    },
    [format, isRangeMode]
  )

  const setOpenSafe = useCallback(
    (next: boolean) => {
      if (effectiveDisabled || isReadOnly) return
      setOpen(next)
      if (!next) setDraftText(null)
    },
    [effectiveDisabled, isReadOnly, setOpen]
  )

  useEffect(() => {
    if (!isOpen) return
    setActivePart('start')
    seedPanel(committed, 'start')
    // Seed from the committed value only when the panel opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const writeCommitted = useCallback(
    (next: string | null | TimePickerRangeTuple) => {
      const same = isSameTimePickerValue(isRangeMode, committed, next)
      clearError()
      setDraftText(null)
      if (same) return
      setCommitted(next)
    },
    [clearError, committed, isRangeMode, setCommitted]
  )

  const confirmDraft = useCallback(() => {
    if (draftText != null) {
      const typed = resolveTypedTimePickerCommit(draftText, constraints, isRangeMode, periodLabels)
      if (!typed.ok) {
        reportError(typed.reason)
        return
      }
      writeCommitted(typed.value)
      setOpenSafe(false)
      return
    }
    const result = commitTimePickerOk({
      range: isRangeMode,
      draft,
      draftRange,
      constraints
    })
    if ('error' in result) {
      reportError(result.error)
      return
    }
    writeCommitted(result.nextCommitted)
    if (result.close) setOpenSafe(false)
  }, [
    constraints,
    draft,
    draftRange,
    draftText,
    isRangeMode,
    periodLabels,
    reportError,
    setOpenSafe,
    writeCommitted
  ])

  const selectColumn = useCallback(
    (unit: TimePickerFocusUnit, option: number | 'AM' | 'PM') => {
      if (isRangeMode) {
        const next = applyTimePickerRangeColumn({
          draftRange,
          activePart,
          column: unit,
          option,
          constraints
        })
        setDraftRange(next.nextRange)
        setActivePart(next.nextActivePart)
        const active = next.nextRange?.[next.nextActivePart === 'start' ? 0 : 1] ?? null
        setDraft(seedTimePickerDraft(active, format))
        return
      }
      setDraft(applyTimePickerColumn(draft, unit, option, constraints))
    },
    [activePart, constraints, draft, draftRange, format, isRangeMode]
  )

  const selectNow = useCallback(() => {
    const result = commitTimePickerNow(isRangeMode, props.now ?? new Date(), constraints)
    if ('error' in result) {
      reportError(result.error)
      return
    }
    writeCommitted(result.nextCommitted)
    seedPanel(result.nextCommitted, 'start')
    if (result.close) setOpenSafe(false)
  }, [constraints, isRangeMode, props.now, reportError, seedPanel, setOpenSafe, writeCommitted])

  const clearValue = useCallback(() => {
    writeCommitted(emptyTimePickerValue(isRangeMode))
    onClear?.()
    inputRef.current?.focus()
  }, [isRangeMode, onClear, writeCommitted])

  const parseDraftInput = useCallback(() => {
    if (draftText == null) return
    const result = resolveTypedTimePickerCommit(draftText, constraints, isRangeMode, periodLabels)
    if (!result.ok) {
      reportError(result.reason)
      return
    }
    writeCommitted(result.value)
  }, [constraints, draftText, isRangeMode, periodLabels, reportError, writeCommitted])

  const handleFocusOut = (event: React.FocusEvent<HTMLElement>) => {
    const next = event.relatedTarget as Node | null
    if (
      (rootRef.current && next && rootRef.current.contains(next)) ||
      (panelRef.current && next && panelRef.current.contains(next))
    ) {
      return
    }
    parseDraftInput()
    formItemControl?.onBlur?.()
    onBlur?.(event)
  }

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (effectiveDisabled || isReadOnly) return
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      if (event.key === 'Enter' && draftText != null) {
        event.preventDefault()
        parseDraftInput()
        return
      }
      if (event.key === 'Enter' && isOpen) {
        event.preventDefault()
        confirmDraft()
        return
      }
      event.preventDefault()
      setOpenSafe(true)
    }
  }

  const handlePanelKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    const unit = (event.target as HTMLElement).getAttribute(
      'data-tiger-timepicker-unit'
    ) as TimePickerFocusUnit | null
    if (!unit) return
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusTimePickerOption(panelRef.current, unit, 'prev')
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusTimePickerOption(panelRef.current, unit, 'next')
      return
    }
    if (event.key === 'Home') {
      event.preventDefault()
      focusTimePickerOption(panelRef.current, unit, 'first')
      return
    }
    if (event.key === 'End') {
      event.preventDefault()
      focusTimePickerOption(panelRef.current, unit, 'last')
      return
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      const next = adjacentTimePickerColumn(
        unit,
        visibleTimePickerColumns(format, showSeconds),
        dir,
        event.key
      )
      if (next) focusTimePickerOption(panelRef.current, next, 'first')
    }
  }

  const switchPart = useCallback(
    (part: 'start' | 'end') => {
      setActivePart(part)
      const active = draftRange?.[part === 'start' ? 0 : 1] ?? null
      setDraft(seedTimePickerDraft(active, format))
    },
    [draftRange, format]
  )

  const columns = useMemo(
    () =>
      buildTimePickerColumns({
        instanceId: panelId,
        draft,
        constraints,
        labels,
        periodLabels
      }),
    [constraints, draft, labels, panelId, periodLabels]
  )

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
    periodLabels,
    mergedLocale,
    localeCode,
    dir,
    format,
    showSeconds,
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
    nativeValue: serializeTimePickerValue(isRangeMode, committed),
    labelledby,
    ariaLabel,
    status,
    panelId,
    showClear,
    trailing,
    inputClasses,
    wrapperClasses,
    chromeAttr: TIGER_CHROME_ATTR,
    shakeClass: SHAKE_CLASS,
    className,
    size: effectiveSize,
    columns,
    activePart,
    switchPart,
    selectColumn,
    selectNow,
    confirmDraft,
    clearValue,
    handleFocusOut,
    handleInputKeyDown,
    handlePanelKeyDown,
    onDraftChange: (text: string) => setDraftText(text),
    parseDraftInput,
    placement: props.placement ?? 'bottom-start',
    offset: props.offset ?? 4,
    dropdownClassName: props.dropdownClassName,
    getPopupContainer: props.getPopupContainer
  }
}
