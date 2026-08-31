import React, { useEffect, useRef, useState, forwardRef } from 'react'
import type { StepperProps as CoreStepperProps, InputStatus } from '@expcat/tigercat-core'
import {
  stepperBaseClasses,
  getStepperInputClasses,
  getStepperButtonClasses,
  minusPathD,
  plusPathD,
  stepperIconViewBox,
  clampStepperValue,
  classNames,
  createRafRepeatActionController,
  stepValue,
  isAtMin,
  isAtMax,
  formatInputNumberEditingDisplay,
  parseInputNumberValue,
  commitInputNumberValue,
  getInputNumberKeyboardNextValue,
  mergeAriaDescribedBy,
  runShakeAnimation,
  getStepperLabels
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useFormItemControlContext } from './FormItemContext'
import { useTigerConfig } from './ConfigProvider'

export interface StepperProps
  extends
    CoreStepperProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'defaultValue' | 'value' | 'onBlur'> {
  value?: number
  defaultValue?: number
  onChange?: (value: number) => void
  onBlur?: React.FocusEventHandler<HTMLInputElement>
}

export const Stepper = forwardRef<HTMLInputElement, StepperProps>(function Stepper(
  {
    value,
    defaultValue,
    min = Number.NEGATIVE_INFINITY,
    max = Number.POSITIVE_INFINITY,
    step = 1,
    disabled = false,
    size = 'md',
    precision,
    className,
    incrementAriaLabel,
    decrementAriaLabel,
    status: statusProp,
    onChange,
    id,
    onBlur,
    ...rest
  },
  ref
) {
  const formItemControl = useFormItemControlContext()
  const config = useTigerConfig()
  const labels = getStepperLabels(config.locale, {
    incrementAriaLabel,
    decrementAriaLabel
  })
  const effectiveDisabled = Boolean(disabled || formItemControl?.disabled)
  const status: InputStatus = statusProp ?? formItemControl?.status ?? 'default'
  const shakeTrigger = formItemControl?.shakeTrigger
  const effectiveId = id ?? formItemControl?.id
  const describedBy = mergeAriaDescribedBy(
    typeof rest['aria-describedby'] === 'string' ? rest['aria-describedby'] : undefined,
    formItemControl?.describedBy
  )
  const labelledby =
    typeof rest['aria-labelledby'] === 'string' && rest['aria-labelledby'].trim()
      ? rest['aria-labelledby']
      : formItemControl?.labelId
  const groupLabel =
    typeof rest['aria-label'] === 'string' && rest['aria-label'].trim()
      ? rest['aria-label']
      : labelledby
        ? undefined
        : labels.ariaLabel

  const [currentValue, setCurrentValue] = useControlledState({
    value,
    defaultValue: defaultValue ?? 0,
    onChange: (next) => {
      onChange?.(next)
      formItemControl?.onChange?.(next)
    }
  })
  const [focused, setFocused] = useState(false)
  const [displayValue, setDisplayValue] = useState(
    formatInputNumberEditingDisplay(defaultValue ?? value ?? 0, precision)
  )
  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const repeatControllerRef = useRef(createRafRepeatActionController())
  const repeatValueRef = useRef(currentValue)
  const suppressNextClickRef = useRef(false)

  const setInputRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  useEffect(() => () => repeatControllerRef.current.stop(), [])

  useEffect(() => {
    if (!focused) {
      setDisplayValue(formatInputNumberEditingDisplay(currentValue, precision))
    }
  }, [currentValue, focused, precision])

  useEffect(() => {
    if (status === 'error') runShakeAnimation(rootRef.current)
  }, [status, shakeTrigger])

  const commit = (raw: number | null): number => {
    const { value: next, changed } = commitInputNumberValue(raw, currentValue, {
      min,
      max,
      precision
    })
    const clamped = clampStepperValue(next ?? currentValue, min, max, precision, step)
    if (changed || clamped !== currentValue) {
      setCurrentValue(clamped)
    }
    setDisplayValue(formatInputNumberEditingDisplay(clamped, precision))
    return clamped
  }

  const handleStep = (direction: 'up' | 'down', baseValue: number = currentValue): number => {
    if (effectiveDisabled) return baseValue
    const next = stepValue(baseValue, step, direction, min, max, precision)
    if (next === baseValue) return baseValue
    setCurrentValue(next)
    setDisplayValue(formatInputNumberEditingDisplay(next, precision))
    return next
  }

  const handleStepClick = (direction: 'up' | 'down') => {
    if (suppressNextClickRef.current) {
      suppressNextClickRef.current = false
      return
    }
    handleStep(direction)
  }

  const focusInput = () => {
    inputRef.current?.focus()
  }

  const startStepRepeat = (direction: 'up' | 'down') => {
    return (event: React.PointerEvent<HTMLButtonElement>) => {
      event.preventDefault()
      if (effectiveDisabled) return
      if (direction === 'down' && isAtMin(currentValue, min)) return
      if (direction === 'up' && isAtMax(currentValue, max)) return
      suppressNextClickRef.current = true
      repeatValueRef.current = currentValue
      repeatControllerRef.current.start(() => {
        const baseValue = repeatValueRef.current
        const nextValue = handleStep(direction, baseValue)
        repeatValueRef.current = nextValue
        if (nextValue === baseValue) repeatControllerRef.current.stop()
      })
      focusInput()
    }
  }

  const stopStepRepeat = () => {
    repeatControllerRef.current.stop()
  }

  const atMin = isAtMin(currentValue, min)
  const atMax = isAtMax(currentValue, max)
  const {
    'aria-label': _ariaLabel,
    'aria-labelledby': _ariaLabelledby,
    'aria-describedby': _ariaDescribedby,
    ...groupRest
  } = rest

  const icon = (d: string) => (
    <svg className="w-4 h-4" viewBox={stepperIconViewBox} fill="currentColor" aria-hidden="true">
      <path d={d} fillRule="evenodd" clipRule="evenodd" />
    </svg>
  )

  return (
    <div
      {...groupRest}
      ref={rootRef}
      className={classNames(stepperBaseClasses, className)}
      role="group"
      aria-label={groupLabel}
      aria-labelledby={labelledby}>
      <button
        type="button"
        className={getStepperButtonClasses(size, effectiveDisabled || atMin, 'start')}
        disabled={effectiveDisabled || atMin}
        tabIndex={-1}
        aria-label={labels.decrementAriaLabel}
        onPointerDown={startStepRepeat('down')}
        onPointerUp={stopStepRepeat}
        onPointerLeave={stopStepRepeat}
        onPointerCancel={stopStepRepeat}
        onClick={() => handleStepClick('down')}>
        {icon(minusPathD)}
      </button>
      <input
        ref={setInputRefs}
        type="text"
        inputMode="decimal"
        role="spinbutton"
        className={getStepperInputClasses(size, effectiveDisabled, status)}
        value={focused ? displayValue : formatInputNumberEditingDisplay(currentValue, precision)}
        disabled={effectiveDisabled}
        id={effectiveId}
        aria-label={labels.valueAriaLabel}
        aria-valuenow={currentValue}
        aria-valuemin={Number.isFinite(min) ? min : undefined}
        aria-valuemax={Number.isFinite(max) ? max : undefined}
        aria-valuetext={
          Number.isFinite(currentValue) ? String(currentValue) : labels.valueAriaLabel
        }
        aria-invalid={status === 'error' ? true : undefined}
        aria-describedby={describedBy}
        onFocus={() => {
          setFocused(true)
          setDisplayValue(formatInputNumberEditingDisplay(currentValue, precision))
        }}
        onBlur={(event) => {
          const parsed = parseInputNumberValue(displayValue)
          commit(parsed)
          setFocused(false)
          formItemControl?.onBlur?.()
          onBlur?.(event)
        }}
        onChange={(e) => {
          setDisplayValue(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commit(parseInputNumberValue(displayValue))
            return
          }
          const next = getInputNumberKeyboardNextValue(e.key, currentValue, {
            min,
            max,
            step,
            precision
          })
          if (next === undefined) return
          e.preventDefault()
          if (next === currentValue) return
          setCurrentValue(next)
          setDisplayValue(formatInputNumberEditingDisplay(next, precision))
        }}
      />
      <button
        type="button"
        className={getStepperButtonClasses(size, effectiveDisabled || atMax, 'end')}
        disabled={effectiveDisabled || atMax}
        tabIndex={-1}
        aria-label={labels.incrementAriaLabel}
        onPointerDown={startStepRepeat('up')}
        onPointerUp={stopStepRepeat}
        onPointerLeave={stopStepRepeat}
        onPointerCancel={stopStepRepeat}
        onClick={() => handleStepClick('up')}>
        {icon(plusPathD)}
      </button>
    </div>
  )
})

Stepper.displayName = 'Stepper'
