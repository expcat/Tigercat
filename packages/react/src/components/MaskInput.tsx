import React, { useEffect, useId, useLayoutEffect, useMemo, useRef } from 'react'
import {
  applyMaskInput,
  classNames,
  formatMaskValue,
  getInputClasses,
  getInputClearButtonClasses,
  getInputErrorClasses,
  getInputWrapperClasses,
  injectShakeStyle,
  parseMask,
  SHAKE_CLASS,
  type MaskInputChangeDetail,
  type MaskInputProps as CoreMaskInputProps
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useFormItemControlContext } from './FormItemContext'

export interface MaskInputProps
  extends
    CoreMaskInputProps,
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      | 'size'
      | 'value'
      | 'defaultValue'
      | 'autoComplete'
      | 'onChange'
      | 'onInput'
      | 'onFocus'
      | 'onBlur'
      | 'readOnly'
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
   * Change event handler, called with the raw (unmasked) value and detail
   */
  onChange?: (value: string, detail: MaskInputChangeDetail) => void

  /**
   * Called when every token slot is filled
   */
  onComplete?: (value: string, maskedValue: string) => void

  /**
   * Focus event handler
   */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void

  /**
   * Blur event handler
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void

  /**
   * Clear event handler
   */
  onClear?: () => void
}

export const MaskInput: React.FC<MaskInputProps> = ({
  size,
  status: statusProp,
  errorMessage: errorMessageProp,
  _shakeTrigger: shakeTriggerProp,
  mask,
  tokens,
  value,
  defaultValue,
  placeholder = '',
  disabled = false,
  readonly = false,
  clearable = false,
  name,
  id,
  autoComplete,
  autoFocus = false,
  onChange,
  onComplete,
  onFocus,
  onBlur,
  onClear,
  className,
  style,
  ...rest
}) => {
  injectShakeStyle()
  const formItemControl = useFormItemControlContext()
  const effectiveSize = size ?? 'md'
  const status = statusProp ?? formItemControl?.status ?? 'default'
  const errorMessage = errorMessageProp ?? formItemControl?.errorMessage
  const shakeTrigger = shakeTriggerProp ?? formItemControl?.shakeTrigger

  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const isComposing = useRef(false)
  const pendingCaret = useRef<number | null>(null)
  const reactId = useId()
  const errorMsgId = `tiger-mask-input-error-${reactId}`

  const spec = useMemo(() => parseMask(mask, tokens), [mask, tokens])
  const [rawValue, setRawValue] = useControlledState<string>(value, defaultValue ?? '')
  const formatted = useMemo(() => formatMaskValue(rawValue, spec), [rawValue, spec])
  const maskedValue = formatted.maskedValue

  useEffect(() => {
    if (status === 'error' && wrapperRef.current) {
      const el = wrapperRef.current
      el.classList.remove(SHAKE_CLASS)
      void el.offsetWidth // force reflow to restart animation
      el.classList.add(SHAKE_CLASS)
    }
  }, [status, shakeTrigger])

  // Restore the caret after the derived value re-renders
  useLayoutEffect(() => {
    if (pendingCaret.current !== null && inputRef.current) {
      const caret = pendingCaret.current
      inputRef.current.setSelectionRange(caret, caret)
      pendingCaret.current = null
    }
  })

  const commit = (raw: string, detail: MaskInputChangeDetail, previousMasked: string) => {
    setRawValue(raw)
    onChange?.(raw, detail)
    if (detail.completed && !formatMaskValue(previousMasked, spec).completed) {
      onComplete?.(raw, detail.maskedValue)
    }
  }

  const applyValue = (inputValue: string, caret: number) => {
    const previousMasked = maskedValue
    const result = applyMaskInput(inputValue, caret, spec, previousMasked)
    // Keep the DOM in sync even when React skips the patch (value unchanged)
    if (inputRef.current) inputRef.current.value = result.maskedValue
    pendingCaret.current = result.caret
    commit(
      result.rawValue,
      { maskedValue: result.maskedValue, completed: result.completed },
      previousMasked
    )
  }

  const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
    if (isComposing.current) return // defer until compositionend
    const target = event.currentTarget
    applyValue(target.value, target.selectionStart ?? target.value.length)
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled || readonly) return
    event.preventDefault()
    const input = event.currentTarget
    const text = event.clipboardData.getData('text')
    const start = input.selectionStart ?? input.value.length
    const end = input.selectionEnd ?? input.value.length
    applyValue(input.value.slice(0, start) + text + input.value.slice(end), start + text.length)
  }

  const handleCompositionStart = () => {
    isComposing.current = true
  }

  const handleCompositionEnd = (event: React.CompositionEvent<HTMLInputElement>) => {
    isComposing.current = false
    const target = event.currentTarget
    applyValue(target.value, target.selectionStart ?? target.value.length)
  }

  const handleClear = () => {
    setRawValue('')
    onChange?.('', { maskedValue: '', completed: false })
    onClear?.()
    inputRef.current?.focus()
  }

  const hasSuffix = clearable
  const activeError = status === 'error' && !!errorMessage
  const showClear = clearable && !disabled && !readonly && rawValue.length > 0

  const inputClasses = getInputClasses({
    size: effectiveSize,
    status,
    hasPrefix: false,
    hasSuffix
  })

  return (
    <div
      ref={wrapperRef}
      className={classNames(getInputWrapperClasses(), className)}
      style={style}>
      <input
        {...rest}
        ref={inputRef}
        className={inputClasses}
        type="text"
        value={maskedValue}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readonly}
        name={name}
        id={id}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        {...(status === 'error' ? { 'aria-invalid': true as const } : {})}
        {...(activeError ? { 'aria-describedby': errorMsgId } : {})}
        onInput={handleInput}
        onChange={() => {}}
        onPaste={handlePaste}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {activeError ? (
        <div id={errorMsgId} className={getInputErrorClasses(effectiveSize)}>
          {errorMessage}
        </div>
      ) : (
        showClear && (
          <button
            type="button"
            className={getInputClearButtonClasses(effectiveSize)}
            onClick={handleClear}
            aria-label="Clear input"
            tabIndex={-1}>
            ✕
          </button>
        )
      )}
    </div>
  )
}

export default MaskInput
