import React, { useEffect, useId, useMemo, useRef } from 'react'
import {
  applyOtpBackspace,
  applyOtpCharInput,
  applyOtpDelete,
  classNames,
  devWarn,
  distributeOtpPaste,
  formatOtpSlotLabel,
  getInputOTPLabels,
  getOtpContainerClasses,
  getOtpErrorClasses,
  getOtpSeparatorClasses,
  getOtpSeparatorIndices,
  getOtpSlotClasses,
  injectShakeStyle,
  isOtpComplete,
  normalizeOtpValue,
  SHAKE_CLASS,
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
  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Internal shake trigger counter (used by FormItem)
   * @internal
   */
  _shakeTrigger?: number

  /**
   * Change event handler, called with the joined value
   */
  onChange?: (value: string) => void

  /**
   * Called when every slot is filled, with the complete value
   */
  onComplete?: (value: string) => void

  /**
   * Focus event handler (fires when focus enters the group)
   */
  onFocus?: (event: React.FocusEvent<HTMLDivElement>) => void

  /**
   * Blur event handler (fires when focus leaves the group)
   */
  onBlur?: (event: React.FocusEvent<HTMLDivElement>) => void
}

export const InputOTP: React.FC<InputOTPProps> = ({
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
}) => {
  injectShakeStyle()
  const config = useTigerConfig()
  const formItemControl = useFormItemControlContext()
  const status = statusProp ?? formItemControl?.status ?? 'default'
  const errorMessage = errorMessageProp ?? formItemControl?.errorMessage
  const shakeTrigger = shakeTriggerProp ?? formItemControl?.shakeTrigger

  const labels = getInputOTPLabels(config.locale)
  const reactId = useId()
  const errorMsgId = `tiger-input-otp-error-${reactId}`

  const containerRef = useRef<HTMLDivElement>(null)
  const slotRefs = useRef<Array<HTMLInputElement | null>>([])

  const charOptions = useMemo(() => ({ type, pattern }), [type, pattern])
  const [rawValue, setRawValue] = useControlledState<string>(value, defaultValue ?? '', onChange)
  const currentValue = normalizeOtpValue(rawValue, length, charOptions)

  const separatorIndices = useMemo(
    () => getOtpSeparatorIndices(length, groups),
    [length, groups]
  )
  if (groups && groups.length > 0 && separatorIndices.length === 0) {
    devWarn('InputOTP.groups', '[Tigercat] InputOTP: `groups` must sum to `length`; ignoring.')
  }

  useEffect(() => {
    if (status === 'error' && containerRef.current) {
      const el = containerRef.current
      el.classList.remove(SHAKE_CLASS)
      void el.offsetWidth // force reflow to restart animation
      el.classList.add(SHAKE_CLASS)
    }
  }, [status, shakeTrigger])

  useEffect(() => {
    if (autoFocus) {
      slotRefs.current[Math.min(currentValue.length, length - 1)]?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- focus only on mount
  }, [])

  const focusSlot = (index: number) => {
    slotRefs.current[Math.max(0, Math.min(index, length - 1))]?.focus()
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

  const isInteractive = !disabled && !readonly

  const handleSlotChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isInteractive) return
    const result = applyOtpCharInput(currentValue, index, event.currentTarget.value, length, charOptions)
    // Keep the DOM in sync even when the value is rejected or the parent
    // ignores the change (React only patches on state changes)
    event.currentTarget.value = displayChar(result.value, index)
    emitValue(result.value)
    focusSlot(result.nextIndex)
  }

  const handleSlotKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isInteractive) return
    switch (event.key) {
      case 'Backspace': {
        event.preventDefault()
        const result = applyOtpBackspace(currentValue, index)
        emitValue(result.value)
        focusSlot(result.nextIndex)
        break
      }
      case 'Delete': {
        event.preventDefault()
        const result = applyOtpDelete(currentValue, index)
        emitValue(result.value)
        break
      }
      case 'ArrowLeft':
        event.preventDefault()
        focusSlot(index - 1)
        break
      case 'ArrowRight':
        event.preventDefault()
        focusSlot(index + 1)
        break
      case 'Home':
        event.preventDefault()
        focusSlot(0)
        break
      case 'End':
        event.preventDefault()
        focusSlot(Math.min(currentValue.length, length - 1))
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

  const handleSlotFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    // Select the slot content so the next keystroke overwrites it
    event.currentTarget.select()
  }

  const handleGroupFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!containerRef.current?.contains(event.relatedTarget as Node | null)) {
      onFocus?.(event)
    }
  }

  const handleGroupBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (!containerRef.current?.contains(event.relatedTarget as Node | null)) {
      onBlur?.(event)
    }
  }

  const activeError = status === 'error' && !!errorMessage
  const slotClasses = getOtpSlotClasses(size, status, { disabled, readonly })

  const slots: React.ReactNode[] = []
  for (let i = 0; i < length; i++) {
    slots.push(
      <input
        key={`slot-${i}`}
        ref={(el) => {
          slotRefs.current[i] = el
        }}
        className={slotClasses}
        type="text"
        inputMode={type === 'numeric' ? 'numeric' : undefined}
        autoComplete={i === 0 ? 'one-time-code' : 'off'}
        value={displayChar(currentValue, i)}
        disabled={disabled}
        readOnly={readonly}
        aria-label={formatOtpSlotLabel(labels.slotLabel, i + 1, length)}
        {...(status === 'error' ? { 'aria-invalid': true as const } : {})}
        onChange={(event) => handleSlotChange(i, event)}
        onKeyDown={(event) => handleSlotKeyDown(i, event)}
        onFocus={handleSlotFocus}
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

  return (
    <div className={classNames('inline-block', className)} style={style}>
      <div
        {...rest}
        ref={containerRef}
        id={id}
        role="group"
        aria-label={ariaLabel ?? labels.groupLabel}
        {...(activeError ? { 'aria-describedby': errorMsgId } : {})}
        className={getOtpContainerClasses(size)}
        onPaste={handlePaste}
        onFocus={handleGroupFocus}
        onBlur={handleGroupBlur}>
        {slots}
        {name && <input type="hidden" name={name} value={currentValue} />}
      </div>
      {activeError && (
        <div id={errorMsgId} className={getOtpErrorClasses()}>
          {errorMessage}
        </div>
      )}
    </div>
  )
}

export default InputOTP
