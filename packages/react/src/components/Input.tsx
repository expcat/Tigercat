import React, { useState, useEffect, useRef } from 'react';
import {
  classNames,
  getInputClasses,
  type InputProps as CoreInputProps,
} from '@tigercat/core';

export interface InputProps
  extends CoreInputProps,
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      | 'size'
      | 'type'
      | 'value'
      | 'defaultValue'
      | 'onInput'
      | 'onChange'
      | 'onFocus'
      | 'onBlur'
      | 'readOnly'
    > {
  /**
   * Input event handler
   */
  onInput?: (event: React.FormEvent<HTMLInputElement>) => void;

  /**
   * Change event handler
   */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;

  /**
   * Focus event handler
   */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;

  /**
   * Blur event handler
   */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;

  /**
   * Additional CSS classes
   */
  className?: string;
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
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalValue, setInternalValue] = useState<string | number>(
    defaultValue ?? ''
  );

  // Determine if the component is controlled - simple comparison, no need to memoize
  const isControlled = value !== undefined;
  const inputValue = isControlled ? value : internalValue;

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const getNextValue = (target: HTMLInputElement): string | number => {
    if (type === 'number') {
      return Number.isNaN(target.valueAsNumber)
        ? target.value
        : target.valueAsNumber;
    }
    return target.value;
  };

  const handleInput = (event: React.FormEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalValue(getNextValue(event.currentTarget));
    }
    onInput?.(event);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalValue(getNextValue(event.currentTarget));
    }
    onChange?.(event);
  };

  const inputClasses = classNames(getInputClasses(size), className);

  return (
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
  );
};
