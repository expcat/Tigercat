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
  createRafRepeatActionController,
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
  const repeatControllerRef = useRef(createRafRepeatActionController())
  const repeatValueRef = useRef<number | null>(null)
  const suppressNextClickRef = useRef(false)
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

  const parseValue = (str: string): number | null => {
    if (str === '' || str === '-') return null
    if (parser) return parser(str)
    const num = Number(str)
    return Number.isNaN(num) ? null : num
  }

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

  useEffect(() => () => repeatControllerRef.current.stop(), [])

  const commitValue = (val: number | null) => {
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
  }

  const handleStep = (
    direction: 'up' | 'down',
    baseValue: number | null | undefined = currentValue
  ): number | null => {
    if (disabled || readonly) return baseValue ?? null
    const next = stepValue(baseValue, step, direction, min, max, precision)
    commitValue(next)
    return next
  }

  const handleStepClick = (direction: 'up' | 'down') => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false
      return
    }

    handleStep(direction)
  }

  const startStepRepeat = (direction: 'up' | 'down') => {
    return (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault()
      if (disabled || readonly) return
      if (direction === 'down' && isAtMin(currentValue, min)) return
      if (direction === 'up' && isAtMax(currentValue, max)) return

      suppressNextClickRef.current = true
      repeatValueRef.current = currentValue
      repeatControllerRef.current.start(() => {
        const baseValue = repeatValueRef.current
        const nextValue = handleStep(direction, baseValue)
        repeatValueRef.current = nextValue

        if (nextValue === baseValue) {
          repeatControllerRef.current.stop()
        }
      })
    }
  }

  const stopStepRepeat = () => {
    repeatControllerRef.current.stop()
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false)
    const parsed = parseValue(displayValue)
    commitValue(parsed)
    onBlur?.(e)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true)
    if (formatter && currentValue !== null) {
      setDisplayValue(String(currentValue))
    }
    onFocus?.(e)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
  }

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
          onPointerDown={startStepRepeat('down')}
          onPointerUp={stopStepRepeat}
          onPointerLeave={stopStepRepeat}
          onPointerCancel={stopStepRepeat}
          onClick={() => handleStepClick('down')}>
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
          onPointerDown={startStepRepeat('up')}
          onPointerUp={stopStepRepeat}
          onPointerLeave={stopStepRepeat}
          onPointerCancel={stopStepRepeat}
          onClick={() => handleStepClick('up')}>
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
            onPointerDown={startStepRepeat('up')}
            onPointerUp={stopStepRepeat}
            onPointerLeave={stopStepRepeat}
            onPointerCancel={stopStepRepeat}
            onClick={() => handleStepClick('up')}>
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
            onPointerDown={startStepRepeat('down')}
            onPointerUp={stopStepRepeat}
            onPointerLeave={stopStepRepeat}
            onPointerCancel={stopStepRepeat}
            onClick={() => handleStepClick('down')}>
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
