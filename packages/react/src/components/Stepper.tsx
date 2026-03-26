import React from 'react'
import type { StepperProps as CoreStepperProps } from '@expcat/tigercat-core'
import {
  stepperBaseClasses,
  getStepperInputClasses,
  getStepperButtonClasses,
  minusPathD,
  plusPathD,
  stepperIconViewBox,
  clampStepperValue,
  classNames
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
  function setValue(v: number) {
    const clamped = clampStepperValue(v, min, max, precision)
    onChange?.(clamped)
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
        onClick={() => setValue(value - step)}>
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
        onClick={() => setValue(value + step)}>
        {icon(plusPathD)}
      </button>
    </div>
  )
}
