import React, { useEffect, useRef } from 'react'
import type { StepperProps as CoreStepperProps } from '@expcat/tigercat-core'
import {
  stepperBaseClasses,
  getStepperInputClasses,
  getStepperButtonClasses,
  minusPathD,
  plusPathD,
  stepperIconViewBox,
  clampStepperValue,
  classNames,
  createRafRepeatActionController
} from '@expcat/tigercat-core'

export interface StepperProps extends CoreStepperProps {
  /** Controlled value */
  value?: number
  /** Called when value changes */
  onChange?: (value: number) => void
}

export const Stepper: React.FC<StepperProps> = ({
  value = 0,
  min = -Infinity,
  max = Infinity,
  step = 1,
  disabled = false,
  size = 'md',
  precision,
  className,
  onChange
}) => {
  const repeatControllerRef = useRef(createRafRepeatActionController())
  const repeatValueRef = useRef(value)
  const suppressNextClickRef = useRef(false)

  useEffect(() => () => repeatControllerRef.current.stop(), [])

  function setValue(v: number): number {
    const clamped = clampStepperValue(v, min, max, precision)
    onChange?.(clamped)
    return clamped
  }

  function stepBy(direction: 'up' | 'down', baseValue: number = value): number {
    return setValue(direction === 'up' ? baseValue + step : baseValue - step)
  }

  function handleStepClick(direction: 'up' | 'down') {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false
      return
    }

    stepBy(direction)
  }

  function startStepRepeat(direction: 'up' | 'down') {
    return (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault()
      if (disabled) return
      if (direction === 'down' && value <= min) return
      if (direction === 'up' && value >= max) return

      suppressNextClickRef.current = true
      repeatValueRef.current = value
      repeatControllerRef.current.start(() => {
        const baseValue = repeatValueRef.current
        const nextValue = stepBy(direction, baseValue)
        repeatValueRef.current = nextValue

        if (nextValue === baseValue) {
          repeatControllerRef.current.stop()
        }
      })
    }
  }

  function stopStepRepeat() {
    repeatControllerRef.current.stop()
  }

  const atMin = value <= min
  const atMax = value >= max

  const icon = (d: string) => (
    <svg className="w-4 h-4" viewBox={stepperIconViewBox} fill="currentColor">
      <path d={d} fillRule="evenodd" clipRule="evenodd" />
    </svg>
  )

  return (
    <div className={classNames(stepperBaseClasses, className)} role="group" aria-label="Stepper">
      <button
        type="button"
        className={getStepperButtonClasses(size, disabled || atMin, 'left')}
        disabled={disabled || atMin}
        aria-label="Decrease"
        onPointerDown={startStepRepeat('down')}
        onPointerUp={stopStepRepeat}
        onPointerLeave={stopStepRepeat}
        onPointerCancel={stopStepRepeat}
        onClick={() => handleStepClick('down')}>
        {icon(minusPathD)}
      </button>
      <input
        type="text"
        className={getStepperInputClasses(size)}
        value={precision !== undefined ? value.toFixed(precision) : String(value)}
        disabled={disabled}
        aria-label="Value"
        onChange={(e) => {
          const val = Number(e.target.value)
          if (!Number.isNaN(val)) setValue(val)
        }}
      />
      <button
        type="button"
        className={getStepperButtonClasses(size, disabled || atMax, 'right')}
        disabled={disabled || atMax}
        aria-label="Increase"
        onPointerDown={startStepRepeat('up')}
        onPointerUp={stopStepRepeat}
        onPointerLeave={stopStepRepeat}
        onPointerCancel={stopStepRepeat}
        onClick={() => handleStepClick('up')}>
        {icon(plusPathD)}
      </button>
    </div>
  )
}
