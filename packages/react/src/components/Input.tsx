import React, { useState, useEffect, useRef } from 'react'
import {
  classNames,
  getInputClasses,
  getInputWrapperClasses,
  getInputAffixClasses,
  getInputErrorClasses,
  injectShakeStyle,
  SHAKE_CLASS,
  type InputProps as CoreInputProps,
  type InputStatus
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
   * Validation status
   */
  status?: InputStatus

  /**
   * Error message to display
   */
  errorMessage?: string

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
  const [isShaking, setIsShaking] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const [internalValue, setInternalValue] = useState<string | number>(defaultValue ?? '')

  useEffect(() => {
    if (status === 'error') {
      setIsShaking(true)
    }
  }, [status, _shakeTrigger])

  const handleAnimationEnd = () => {
    setIsShaking(false)
  }

  // Determine if the component is controlled - simple comparison, no need to memoize
  const isControlled = value !== undefined
  const inputValue = isControlled ? value : internalValue

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const getNextValue = (target: HTMLInputElement): string | number => {
    if (type === 'number') {
      return Number.isNaN(target.valueAsNumber) ? target.value : target.valueAsNumber
    }
    return target.value
  }

  const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalValue(getNextValue(event.currentTarget))
    }
    onInput?.(event)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalValue(getNextValue(event.currentTarget))
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
      className={classNames(getInputWrapperClasses(), className, isShaking && SHAKE_CLASS)}
      style={style}
      onAnimationEnd={handleAnimationEnd}>
      {hasPrefix && <div className={getInputAffixClasses('prefix', size)}>{prefix}</div>}
      <input
        {...props}
        ref={inputRef}
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
