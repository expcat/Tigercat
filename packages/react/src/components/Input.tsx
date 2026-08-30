import React, { useState, useEffect, useRef, useCallback, useId } from 'react'
import {
  classNames,
  getInputFieldClasses,
  getInputWrapperClasses,
  getInputAffixClasses,
  getInputErrorClasses,
  getInputClearButtonClasses,
  getInputPasswordToggleClasses,
  getInputCountClasses,
  parseInputValue,
  injectShakeStyle,
  SHAKE_CLASS,
  type InputProps as CoreInputProps
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useInputGroupContext } from './InputGroup'
import { useFormItemControlContext } from './FormItemContext'

export interface InputProps
  extends
    CoreInputProps,
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      | 'size'
      | 'type'
      | 'value'
      | 'defaultValue'
      | 'autoComplete'
      | 'onInput'
      | 'onChange'
      | 'onFocus'
      | 'onBlur'
      | 'readOnly'
      | 'prefix'
    > {
  /**
   * Input event handler
   */
  onInput?: (event: React.FormEvent<HTMLInputElement>) => void

  /**
   * Change event handler
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void

  /**
   * Focus event handler
   */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void

  /**
   * Blur event handler
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void

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
   * Prefix content
   */
  prefix?: React.ReactNode

  /**
   * Suffix content
   */
  suffix?: React.ReactNode

  /**
   * Clear event handler
   * @since 0.5.0
   */
  onClear?: () => void
}

export const Input: React.FC<InputProps> = ({
  size,
  type = 'text',
  status: statusProp,
  errorMessage: errorMessageProp,
  _shakeTrigger: shakeTriggerProp,
  prefix,
  suffix,
  value,
  defaultValue,
  placeholder = '',
  disabled = false,
  readonly = false,
  required = false,
  maxLength,
  minLength,
  name,
  id,
  autoComplete,
  autoFocus = false,
  clearable = false,
  showPassword = false,
  showCount = false,
  onInput,
  onChange,
  onFocus,
  onBlur,
  onClear,
  className,
  style,
  ...props
}) => {
  injectShakeStyle()
  const inputGroup = useInputGroupContext()
  const formItemControl = useFormItemControlContext()
  const effectiveSize = size ?? inputGroup?.size ?? 'md'
  const status = statusProp ?? formItemControl?.status ?? 'default'
  const errorMessage = errorMessageProp ?? formItemControl?.errorMessage
  const shakeTrigger = shakeTriggerProp ?? formItemControl?.shakeTrigger

  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const reactId = useId()
  const errorMsgId = `tiger-input-error-${reactId}`
  const [inputValue, setInputValue] = useControlledState<string | number>({
    value,
    defaultValue: defaultValue ?? ''
  })
  const [passwordVisible, setPasswordVisible] = useState(false)

  // Trigger shake animation via direct DOM manipulation for reliable re-trigger
  useEffect(() => {
    if (status === 'error' && wrapperRef.current) {
      const el = wrapperRef.current
      el.classList.remove(SHAKE_CLASS)
      void el.offsetWidth // force reflow to restart animation
      el.classList.add(SHAKE_CLASS)
    }
  }, [status, shakeTrigger])

  const handleAnimationEnd = useCallback(() => {
    wrapperRef.current?.classList.remove(SHAKE_CLASS)
  }, [])

  const currentValStr = String(inputValue)

  const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
    setInputValue(parseInputValue(event.currentTarget, type))
    onInput?.(event)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(parseInputValue(event.currentTarget, type))
    onChange?.(event)
  }

  const handleClear = () => {
    setInputValue('')
    onClear?.()
    inputRef.current?.focus()
  }

  const togglePasswordVisibility = () => {
    setPasswordVisible((v) => !v)
  }

  const hasPrefix = !!prefix
  const hasSuffix = !!suffix || clearable || showPassword
  const activeError = status === 'error' && !!errorMessage
  const showClear = clearable && !disabled && !readonly && currentValStr.length > 0
  const showPasswordToggle = showPassword && type === 'password' && !disabled

  const effectiveType =
    showPassword && type === 'password' ? (passwordVisible ? 'text' : 'password') : type

  const inputClasses = getInputFieldClasses({
    size: effectiveSize,
    status,
    hasPrefix,
    hasSuffix
  })

  const renderSuffix = () => {
    if (showClear) {
      return (
        <button
          type="button"
          className={getInputClearButtonClasses(effectiveSize)}
          onClick={handleClear}
          aria-label="Clear input"
          tabIndex={-1}>
          ✕
        </button>
      )
    }
    if (showPasswordToggle) {
      return (
        <button
          type="button"
          className={getInputPasswordToggleClasses(effectiveSize)}
          onClick={togglePasswordVisibility}
          aria-label={passwordVisible ? 'Hide password' : 'Show password'}
          tabIndex={-1}>
          {passwordVisible ? '🙈' : '👁'}
        </button>
      )
    }
    if (suffix) {
      return <div className={getInputAffixClasses('suffix', effectiveSize)}>{suffix}</div>
    }
    return null
  }

  const wrapperNode = (
    <div
      ref={wrapperRef}
      className={classNames(getInputWrapperClasses(status), className)}
      style={style}
      onAnimationEnd={handleAnimationEnd}>
      {hasPrefix && <div className={getInputAffixClasses('prefix', effectiveSize)}>{prefix}</div>}
      <input
        {...props}
        ref={inputRef}
        className={inputClasses}
        type={effectiveType}
        value={inputValue}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readonly}
        required={required}
        maxLength={maxLength}
        minLength={minLength}
        name={name}
        id={id}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        {...(status === 'error' ? { 'aria-invalid': true as const } : {})}
        {...(activeError ? { 'aria-describedby': errorMsgId } : {})}
        onInput={handleInput}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {renderSuffix()}
    </div>
  )

  // Extras sit below the chrome: error first, then count.
  const extras: React.ReactNode[] = []
  if (activeError) {
    extras.push(
      <div
        key="error"
        id={errorMsgId}
        className={getInputErrorClasses(effectiveSize)}
        aria-live="polite">
        {errorMessage}
      </div>
    )
  }
  if (showCount) {
    const count = currentValStr.length
    const isOver = maxLength !== undefined && count > maxLength
    const countText = maxLength !== undefined ? `${count} / ${maxLength}` : `${count}`
    extras.push(
      <div key="count" className={getInputCountClasses(isOver)}>
        {countText}
      </div>
    )
  }

  if (extras.length === 0) {
    return wrapperNode
  }

  return (
    <div className="w-full">
      {wrapperNode}
      {extras}
    </div>
  )
}
