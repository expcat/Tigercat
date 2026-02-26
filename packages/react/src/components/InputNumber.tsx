import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
  classNames,
  getInputNumberWrapperClasses,
  getInputNumberStatusClasses,
  getInputNumberFocusRingColor,
  getInputNumberSizeClasses,
  getInputNumberInputClasses,
  getInputNumberStepButtonClasses,
  getInputNumberSideButtonClasses,
  inputNumberControlsRightClasses,
  inputNumberUpIconPathD,
  inputNumberDownIconPathD,
  inputNumberMinusIconPathD,
  inputNumberPlusIconPathD,
  clampValue,
  stepValue,
  formatPrecision,
  isAtMin,
  isAtMax,
  type InputNumberProps as CoreInputNumberProps
} from '@expcat/tigercat-core'

export interface InputNumberProps extends CoreInputNumberProps {
  /**
   * Change handler (called with committed value)
   */
  onChange?: (value: number | null) => void

  /**
   * Focus handler
   */
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void

  /**
   * Blur handler
   */
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void

  /**
   * Additional CSS classes
   */
  className?: string
}

export const InputNumber: React.FC<InputNumberProps> = ({
  value: controlledValue,
  defaultValue,
  size = 'md',
  status = 'default',
  min = -Infinity,
  max = Infinity,
  step = 1,
  precision,
  disabled = false,
  readonly = false,
  placeholder,
  name,
  id,
  keyboard = true,
  controls = true,
  controlsPosition = 'right',
  formatter,
  parser,
  autoFocus = false,
  onChange,
  onFocus,
  onBlur,
  className
}) => {
  const isControlled = controlledValue !== undefined
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)
  const [internalValue, setInternalValue] = useState<number | null>(
    defaultValue ?? controlledValue ?? null
  )
  const [displayValue, setDisplayValue] = useState('')

  const currentValue = isControlled ? (controlledValue ?? null) : internalValue

  const toDisplayValue = useCallback(
    (val: number | null | undefined): string => {
      if (val === null || val === undefined) return ''
      if (formatter) return formatter(val)
      if (precision !== undefined) return val.toFixed(precision)
      return String(val)
    },
    [formatter, precision]
  )

  const parseValue = useCallback(
    (str: string): number | null => {
      if (str === '' || str === '-') return null
      if (parser) return parser(str)
      const num = Number(str)
      return Number.isNaN(num) ? null : num
    },
    [parser]
  )

  // Sync display value when value or focus changes
  useEffect(() => {
    if (!focused) {
      setDisplayValue(toDisplayValue(currentValue))
    }
  }, [currentValue, focused, toDisplayValue])

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const commitValue = useCallback(
    (val: number | null) => {
      let finalVal = val
      if (finalVal !== null) {
        finalVal = clampValue(finalVal, min, max)
        if (precision !== undefined) {
          finalVal = formatPrecision(finalVal, precision)
        }
      }

      if (!isControlled) {
        setInternalValue(finalVal)
      }
      onChange?.(finalVal)
      setDisplayValue(toDisplayValue(finalVal))
    },
    [min, max, precision, isControlled, onChange, toDisplayValue]
  )

  const handleStep = useCallback(
    (direction: 'up' | 'down') => {
      if (disabled || readonly) return
      const next = stepValue(currentValue, step, direction, min, max, precision)
      commitValue(next)
    },
    [currentValue, step, min, max, precision, disabled, readonly, commitValue]
  )

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value)
  }, [])

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false)
      const parsed = parseValue(displayValue)
      commitValue(parsed)
      onBlur?.(e)
    },
    [displayValue, parseValue, commitValue, onBlur]
  )

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(true)
      if (formatter && currentValue !== null) {
        setDisplayValue(String(currentValue))
      }
      onFocus?.(e)
    },
    [formatter, currentValue, onFocus]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!keyboard || disabled || readonly) return
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        handleStep('up')
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        handleStep('down')
      } else if (e.key === 'Enter') {
        const parsed = parseValue(displayValue)
        commitValue(parsed)
      }
    },
    [keyboard, disabled, readonly, handleStep, parseValue, displayValue, commitValue]
  )

  const atMin = isAtMin(currentValue, min)
  const atMax = isAtMax(currentValue, max)

  const wrapperClasses = useMemo(
    () =>
      classNames(
        getInputNumberWrapperClasses(disabled),
        getInputNumberStatusClasses(status),
        getInputNumberSizeClasses(size),
        focused && `ring-2 ${getInputNumberFocusRingColor(status)}`,
        className
      ),
    [disabled, status, size, focused, className]
  )

  const inputClasses = useMemo(
    () =>
      getInputNumberInputClasses(
        size,
        controls && controlsPosition === 'right',
        controls && controlsPosition === 'both'
      ),
    [size, controls, controlsPosition]
  )

  return (
    <div className={wrapperClasses}>
      {/* Left-side minus button (both mode) */}
      {controls && controlsPosition === 'both' && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Decrease"
          className={getInputNumberSideButtonClasses('left', disabled || atMin)}
          disabled={disabled || atMin}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleStep('down')}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4">
            <path d={inputNumberMinusIconPathD} />
          </svg>
        </button>
      )}

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        role="spinbutton"
        aria-valuemin={min === -Infinity ? undefined : min}
        aria-valuemax={max === Infinity ? undefined : max}
        aria-valuenow={currentValue ?? undefined}
        className={inputClasses}
        value={displayValue}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readonly}
        name={name}
        id={id}
        onChange={handleInput}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
      />

      {/* Right-side plus button (both mode) */}
      {controls && controlsPosition === 'both' && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Increase"
          className={getInputNumberSideButtonClasses('right', disabled || atMax)}
          disabled={disabled || atMax}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => handleStep('up')}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4">
            <path d={inputNumberPlusIconPathD} />
          </svg>
        </button>
      )}

      {/* Right-stacked controls (default right mode) */}
      {controls && controlsPosition === 'right' && (
        <div className={inputNumberControlsRightClasses}>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Increase"
            className={getInputNumberStepButtonClasses('up', disabled || atMax)}
            disabled={disabled || atMax}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleStep('up')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-3 h-3">
              <path d={inputNumberUpIconPathD} />
            </svg>
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-label="Decrease"
            className={getInputNumberStepButtonClasses('down', disabled || atMin)}
            disabled={disabled || atMin}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleStep('down')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-3 h-3">
              <path d={inputNumberDownIconPathD} />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
