import React, { useState, useEffect, useRef, useCallback, useId } from 'react'
import {
  classNames,
  getInputClasses,
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
  size = 'md',
  type = 'text',
  status = 'default',
  errorMessage,
  _shakeTrigger,
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

  const wrapperRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const reactId = useId()
  const errorMsgId = `tiger-input-error-${reactId}`
  const [internalValue, setInternalValue] = useState<string | number>(defaultValue ?? '')
  const [passwordVisible, setPasswordVisible] = useState(false)

  // Trigger shake animation via direct DOM manipulation for reliable re-trigger
  useEffect(() => {
    if (status === 'error' && wrapperRef.current) {
      const el = wrapperRef.current
      el.classList.remove(SHAKE_CLASS)
      void el.offsetWidth // force reflow to restart animation
      el.classList.add(SHAKE_CLASS)
    }
  }, [status, _shakeTrigger])

  const handleAnimationEnd = useCallback(() => {
    wrapperRef.current?.classList.remove(SHAKE_CLASS)
  }, [])

  // Determine if the component is controlled
  const isControlled = value !== undefined
  const inputValue = isControlled ? value : internalValue
  const currentValStr = String(inputValue)

  const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalValue(parseInputValue(event.currentTarget, type))
    }
    onInput?.(event)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalValue(parseInputValue(event.currentTarget, type))
    }
    onChange?.(event)
  }

  const handleClear = () => {
    if (!isControlled) {
      setInternalValue('')
    }
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

  const inputClasses = getInputClasses({
    size,
    status,
    hasPrefix,
    hasSuffix
  })

  const renderSuffix = () => {
    if (activeError) {
      return (
        <div id={errorMsgId} className={getInputErrorClasses(size)}>
          {errorMessage}
        </div>
      )
    }
    if (showClear) {
      return (
        <button
          type="button"
          className={getInputClearButtonClasses(size)}
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
          className={getInputPasswordToggleClasses(size)}
          onClick={togglePasswordVisibility}
          aria-label={passwordVisible ? 'Hide password' : 'Show password'}
          tabIndex={-1}>
          {passwordVisible ? '🙈' : '👁'}
        </button>
      )
    }
    if (suffix) {
      return <div className={getInputAffixClasses('suffix', size)}>{suffix}</div>
    }
    return null
  }

  const wrapperNode = (
    <div
      ref={wrapperRef}
      className={classNames(getInputWrapperClasses(), className)}
      style={style}
      onAnimationEnd={handleAnimationEnd}>
      {hasPrefix && <div className={getInputAffixClasses('prefix', size)}>{prefix}</div>}
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

  if (showCount) {
    const count = currentValStr.length
    const isOver = maxLength !== undefined && count > maxLength
    const countText = maxLength !== undefined ? `${count} / ${maxLength}` : `${count}`
    return (
      <div>
        {wrapperNode}
        <div className={getInputCountClasses(isOver)}>{countText}</div>
      </div>
    )
  }

  return wrapperNode
}
