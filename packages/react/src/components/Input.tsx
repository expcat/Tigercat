import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  classNames,
  getInputClasses,
  getInputWrapperClasses,
  getInputAffixClasses,
  getInputErrorClasses,
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
  onInput,
  onChange,
  onFocus,
  onBlur,
  className,
  style,
  ...props
}) => {
  injectShakeStyle()

  const wrapperRef = useRef<HTMLDivElement>(null)
  const [internalValue, setInternalValue] = useState<string | number>(defaultValue ?? '')

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

  const hasPrefix = !!prefix
  const hasSuffix = !!suffix
  const activeError = status === 'error' && !!errorMessage

  const inputClasses = getInputClasses({
    size,
    status,
    hasPrefix,
    hasSuffix
  })

  return (
    <div
      ref={wrapperRef}
      className={classNames(getInputWrapperClasses(), className)}
      style={style}
      onAnimationEnd={handleAnimationEnd}>
      {hasPrefix && <div className={getInputAffixClasses('prefix', size)}>{prefix}</div>}
      <input
        {...props}
        className={inputClasses}
        type={type}
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
        onInput={handleInput}
        onChange={handleChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {activeError ? (
        <div className={getInputErrorClasses(size)}>{errorMessage}</div>
      ) : (
        hasSuffix && <div className={getInputAffixClasses('suffix', size)}>{suffix}</div>
      )}
    </div>
  )
}
