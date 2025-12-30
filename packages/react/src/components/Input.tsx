import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { classNames, getInputClasses, type InputProps as CoreInputProps } from '@tigercat/core'

export interface InputProps extends CoreInputProps {
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
}

export const Input: React.FC<InputProps> = ({
  size = 'md',
  type = 'text',
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
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [internalValue, setInternalValue] = useState<string | number>(defaultValue ?? '')
  
  // Determine if the component is controlled - simple comparison, no need to memoize
  const isControlled = value !== undefined
  const inputValue = isControlled ? value : internalValue

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  /**
   * Helper to extract the correct value from input target.
   * For number inputs, returns the numeric value if valid (using Number.isNaN to properly handle 0),
   * otherwise returns the string value to preserve user input for invalid numbers.
   */
  const getInputValue = useCallback((target: HTMLInputElement): string | number => {
    return type === 'number' ? (Number.isNaN(target.valueAsNumber) ? target.value : target.valueAsNumber) : target.value
  }, [type])

  const handleInput = useCallback((event: React.FormEvent<HTMLInputElement>) => {
    const target = event.target as HTMLInputElement
    const newValue = getInputValue(target)
    
    if (!isControlled) {
      setInternalValue(newValue)
    }
    
    onInput?.(event)
  }, [isControlled, getInputValue, onInput])

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const target = event.target
    const newValue = getInputValue(target)
    
    if (!isControlled) {
      setInternalValue(newValue)
    }
    
    onChange?.(event)
  }, [isControlled, getInputValue, onChange])

  const inputClasses = useMemo(() => classNames(getInputClasses(size), className), [size, className])

  return (
    <input
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
      onInput={handleInput}
      onChange={handleChange}
      onFocus={onFocus}
      onBlur={onBlur}
      {...props}
    />
  )
}
