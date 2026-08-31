import React, { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  SHAKE_CLASS,
  applyOtpBackspace,
  applyOtpCharInput,
  applyOtpDelete,
  classNames,
  clampOtpClickIndex,
  devWarn,
  distributeOtpPaste,
  formatOtpSlotLabel,
  getInputOTPLabels,
  getOtpContainerClasses,
  getOtpErrorClasses,
  getOtpFocusIndex,
  getOtpInputMode,
  getOtpKeyIntent,
  getOtpSeparatorClasses,
  getOtpSeparatorIndices,
  getOtpSlotClasses,
  getOtpSlotTabIndex,
  isOtpComplete,
  mergeAriaDescribedBy,
  normalizeOtpValue,
  runShakeAnimation,
  sanitizeOtpInput,
  shouldDistributeOtpInput,
  type InputOTPProps as CoreInputOTPProps
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useTigerConfig } from './ConfigProvider'
import { useFormItemControlContext } from './FormItemContext'

export interface InputOTPProps
  extends
    CoreInputOTPProps,
    Omit<
      React.HTMLAttributes<HTMLDivElement>,
      'onChange' | 'onFocus' | 'onBlur' | 'defaultValue' | 'id'
    > {
  className?: string
  /** @internal */
  _shakeTrigger?: number
  onChange?: (value: string) => void
  onComplete?: (value: string) => void
  onFocus?: (event: React.FocusEvent<HTMLElement>) => void
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void
}

export const InputOTP = forwardRef<HTMLInputElement, InputOTPProps>(function InputOTP(
  {
    size = 'md',
    status: statusProp,
    errorMessage: errorMessageProp,
    _shakeTrigger: shakeTriggerProp,
    length = 6,
    value,
    defaultValue,
    type = 'numeric',
    pattern,
    masked = false,
    maskChar = '•',
    groups,
    separator = '-',
    disabled = false,
    readonly = false,
    autoFocus = false,
    name,
    id,
    ariaLabel,
    onChange,
    onComplete,
    onFocus,
    onBlur,
    className,
    style,
    ...rest
  },
  ref
) {
  const config = useTigerConfig()
  const formItemControl = useFormItemControlContext()
  const status = statusProp ?? formItemControl?.status ?? 'default'
  const errorMessage = errorMessageProp
  const shakeTrigger = shakeTriggerProp ?? formItemControl?.shakeTrigger
  const effectiveDisabled = Boolean(disabled) || Boolean(formItemControl?.disabled)
  const effectiveName = name ?? formItemControl?.name
  const formBoundValue = formItemControl?.value
  const resolvedValue =
    value !== undefined ? value : typeof formBoundValue === 'string' ? formBoundValue : undefined
  const dir = config.direction === 'rtl' ? 'rtl' : 'ltr'
  const labels = getInputOTPLabels(config.locale)
  const reactId = useId()
  const errorMsgId = `tiger-input-otp-error-${reactId}`

  const containerRef = useRef<HTMLDivElement>(null)
  const slotRefs = useRef<Array<HTMLInputElement | null>>([])
  const mountedRef = useRef(false)
  const setSlotRef = (index: number) => (node: HTMLInputElement | null) => {
    slotRefs.current[index] = node
    if (index === 0) {
      if (typeof ref === 'function') ref(node)
      else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
    }
  }

  const charOptions = useMemo(() => ({ type, pattern }), [type, pattern])
  const inputMode = getOtpInputMode(type, pattern)
  const [rawValue, setRawValue] = useControlledState<string>({
    value: resolvedValue,
    defaultValue: defaultValue ?? '',
    onChange: (next) => {
      onChange?.(next)
      formItemControl?.onChange?.(next)
    }
  })
  const currentValue = normalizeOtpValue(rawValue, length, charOptions)
  const [focusIndex, setFocusIndex] = useState(() => getOtpFocusIndex(currentValue, length))

  const separatorIndices = useMemo(() => getOtpSeparatorIndices(length, groups), [length, groups])
  if (groups && groups.length > 0 && separatorIndices.length === 0) {
    devWarn('InputOTP.groups', '[Tigercat] InputOTP: `groups` must sum to `length`; ignoring.')
  }

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    if (status === 'error') runShakeAnimation(containerRef.current)
  }, [status, shakeTrigger])

  useEffect(() => {
    if (autoFocus) {
      slotRefs.current[getOtpFocusIndex(currentValue, length)]?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- focus only on mount
  }, [])

  const focusSlot = (index: number) => {
    const next = Math.max(0, Math.min(index, length - 1))
    setFocusIndex(next)
    slotRefs.current[next]?.focus()
  }

  const displayChar = (val: string, index: number): string => {
    const char = val[index] ?? ''
    return char && masked ? maskChar : char
  }

  const emitValue = (next: string) => {
    if (next === currentValue) return
    setRawValue(next)
    if (isOtpComplete(next, length)) onComplete?.(next)
  }

  const isInteractive = !effectiveDisabled && !readonly

  const handleSlotChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isInteractive) return
    const inputType = (event.nativeEvent as InputEvent).inputType
    const sanitized = sanitizeOtpInput(event.currentTarget.value, charOptions)
    const result = applyOtpCharInput(currentValue, index, event.currentTarget.value, length, {
      ...charOptions,
      distributeFromStart: shouldDistributeOtpInput(index, inputType, sanitized.length)
    })
    event.currentTarget.value = displayChar(result.value, index)
    emitValue(result.value)
    focusSlot(result.nextIndex)
  }

  const handleSlotKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isInteractive) return
    const intent = getOtpKeyIntent(event.key, dir)
    switch (intent.type) {
      case 'backspace': {
        event.preventDefault()
        const result = applyOtpBackspace(currentValue, index)
        emitValue(result.value)
        focusSlot(result.nextIndex)
        break
      }
      case 'delete': {
        event.preventDefault()
        const result = applyOtpDelete(currentValue, index)
        emitValue(result.value)
        break
      }
      case 'move':
        event.preventDefault()
        focusSlot(index + intent.delta)
        break
      case 'home':
        event.preventDefault()
        focusSlot(0)
        break
      case 'end':
        event.preventDefault()
        focusSlot(getOtpFocusIndex(currentValue, length))
        break
      default:
        break
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    if (!isInteractive) return
    event.preventDefault()
    const result = distributeOtpPaste(event.clipboardData.getData('text'), length, charOptions)
    if (!result) return
    emitValue(result.value)
    focusSlot(result.nextIndex)
  }

  const handleSlotMouseDown = (index: number, event: React.MouseEvent<HTMLInputElement>) => {
    const next = clampOtpClickIndex(index, currentValue, length)
    if (next !== index) {
      event.preventDefault()
      focusSlot(next)
    }
  }

  const handleGroupFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!containerRef.current?.contains(event.relatedTarget as Node | null)) {
      onFocus?.(event)
    }
  }

  const handleGroupBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!containerRef.current?.contains(event.relatedTarget as Node | null)) {
      formItemControl?.onBlur?.()
      onBlur?.(event)
    }
  }

  const activeError = status === 'error' && !!errorMessage
  const slotClasses = getOtpSlotClasses(size, status, { disabled: effectiveDisabled, readonly })
  const labelledby =
    typeof rest['aria-labelledby'] === 'string' && rest['aria-labelledby'].trim()
      ? rest['aria-labelledby']
      : formItemControl?.labelId
  const describedBy = mergeAriaDescribedBy(
    mergeAriaDescribedBy(
      typeof rest['aria-describedby'] === 'string' ? rest['aria-describedby'] : undefined,
      activeError ? errorMsgId : undefined
    ),
    formItemControl?.describedBy
  )
  const currentTab = Math.min(Math.max(focusIndex, 0), length - 1)

  const slots: React.ReactNode[] = []
  for (let i = 0; i < length; i++) {
    const isTabStop = i === currentTab
    slots.push(
      <input
        key={`slot-${i}`}
        ref={setSlotRef(i)}
        className={slotClasses}
        type="text"
        inputMode={inputMode}
        autoComplete={i === 0 ? 'one-time-code' : 'off'}
        maxLength={1}
        value={displayChar(currentValue, i)}
        disabled={effectiveDisabled}
        readOnly={readonly}
        tabIndex={getOtpSlotTabIndex(i, currentTab, effectiveDisabled)}
        id={isTabStop ? (id ?? formItemControl?.id) : undefined}
        aria-label={formatOtpSlotLabel(labels.slotLabel, i + 1, length)}
        aria-invalid={status === 'error' ? true : undefined}
        aria-required={isTabStop && formItemControl?.required ? true : undefined}
        aria-describedby={isTabStop ? describedBy : undefined}
        onChange={(event) => handleSlotChange(i, event)}
        onKeyDown={(event) => handleSlotKeyDown(i, event)}
        onMouseDown={(event) => handleSlotMouseDown(i, event)}
        onFocus={(event) => event.currentTarget.select()}
      />
    )
    if (separatorIndices.includes(i) && separator) {
      slots.push(
        <span key={`separator-${i}`} aria-hidden="true" className={getOtpSeparatorClasses(size)}>
          {separator}
        </span>
      )
    }
  }

  const { onClick: restOnClick, ...groupRest } = rest

  return (
    <div className={classNames('inline-block', className)} style={style}>
      <div
        {...groupRest}
        ref={containerRef}
        role="group"
        aria-label={labelledby ? undefined : (ariaLabel ?? labels.groupLabel)}
        aria-labelledby={labelledby}
        className={getOtpContainerClasses(size)}
        onPaste={handlePaste}
        onFocus={handleGroupFocus}
        onBlur={handleGroupBlur}
        onClick={restOnClick}>
        {slots}
        {effectiveName && (
          <input
            type="hidden"
            name={effectiveName}
            value={currentValue}
            disabled={effectiveDisabled}
          />
        )}
      </div>
      {activeError && (
        <div id={errorMsgId} className={getOtpErrorClasses()} aria-live="polite">
          {errorMessage}
        </div>
      )}
    </div>
  )
})

InputOTP.displayName = 'InputOTP'

export default InputOTP
