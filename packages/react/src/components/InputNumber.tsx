import React, { useState, useCallback, useMemo, useRef, useEffect, forwardRef } from 'react'
import {
  classNames,
  getInputNumberWrapperClasses,
  getInputNumberSizeClasses,
  getInputNumberInputClasses,
  getInputNumberStepButtonClasses,
  getInputNumberSideButtonClasses,
  inputNumberControlsRightClasses,
  inputNumberUpIconPathD,
  inputNumberDownIconPathD,
  inputNumberMinusIconPathD,
  inputNumberPlusIconPathD,
  stepValue,
  isAtMin,
  isAtMax,
  formatInputNumberDisplay,
  formatInputNumberEditingDisplay,
  parseInputNumberValue,
  commitInputNumberValue,
  getInputNumberKeyboardNextValue,
  resolveInputNumberControlsLayout,
  createRafRepeatActionController,
  mergeAriaDescribedBy,
  resolveReadOnlyFlag,
  runShakeAnimation,
  SHAKE_CLASS,
  TIGER_CHROME_ATTR,
  getInputNumberLabels,
  type InputNumberProps as CoreInputNumberProps
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useTigerConfig } from './ConfigProvider'
import { useInputGroupContext } from './InputGroup'
import { useFormItemControlContext } from './FormItemContext'

export interface InputNumberProps
  extends
    CoreInputNumberProps,
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      | 'size'
      | 'value'
      | 'defaultValue'
      | 'onChange'
      | 'onFocus'
      | 'onBlur'
      | 'min'
      | 'max'
      | 'step'
      | 'readOnly'
    > {
  onChange?: (value: number | null) => void
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  className?: string
  readOnly?: boolean
  /** @internal */
  _shakeTrigger?: number
}

export const InputNumber = forwardRef<HTMLInputElement, InputNumberProps>(function InputNumber(
  {
    value: controlledValue,
    defaultValue,
    size,
    status: statusProp,
    min = -Infinity,
    max = Infinity,
    step = 1,
    precision,
    disabled = false,
    readonly: readonlyProp,
    readOnly: readOnlyProp,
    placeholder,
    name,
    id,
    keyboard = true,
    controls = true,
    controlsPosition = 'right',
    formatter,
    parser,
    autoFocus = false,
    incrementAriaLabel,
    decrementAriaLabel,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    className,
    style,
    _shakeTrigger: shakeTriggerProp,
    ...rest
  },
  ref
) {
  const inputGroup = useInputGroupContext()
  const formItemControl = useFormItemControlContext()
  const config = useTigerConfig()
  const labels = getInputNumberLabels(config.locale, {
    incrementAriaLabel,
    decrementAriaLabel
  })
  const inGroup = inputGroup != null
  const effectiveSize = size ?? inputGroup?.size ?? 'md'
  const status = statusProp ?? formItemControl?.status ?? 'default'
  const shakeTrigger = shakeTriggerProp ?? formItemControl?.shakeTrigger
  const effectiveDisabled = Boolean(disabled) || Boolean(formItemControl?.disabled)
  const isReadOnly = resolveReadOnlyFlag(readonlyProp, readOnlyProp)
  const effectiveId = id ?? formItemControl?.id
  const effectiveName = name ?? formItemControl?.name
  const formBoundValue = formItemControl?.value
  const resolvedValue =
    controlledValue !== undefined
      ? controlledValue
      : formItemControl?.name
        ? typeof formBoundValue === 'number'
          ? formBoundValue
          : null
        : undefined

  const inputRef = useRef<HTMLInputElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const mountedRef = useRef(false)
  const focusedRef = useRef(false)
  const repeatControllerRef = useRef(createRafRepeatActionController())
  const repeatValueRef = useRef<number | null>(null)
  const suppressNextClickRef = useRef(false)
  const [focused, setFocused] = useState(false)
  const [currentValue, setValue] = useControlledState<number | null>({
    value: resolvedValue,
    defaultValue: defaultValue ?? null,
    onChange
  })
  const [displayValue, setDisplayValue] = useState('')

  const setInputRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node
    if (typeof ref === 'function') ref(node)
    else if (ref) ref.current = node
  }

  const toDisplayValue = useCallback(
    (val: number | null | undefined, editing: boolean): string =>
      editing
        ? formatInputNumberEditingDisplay(val, precision)
        : formatInputNumberDisplay(val, { formatter, precision }),
    [formatter, precision]
  )

  useEffect(() => {
    focusedRef.current = focused
  }, [focused])

  useEffect(() => {
    if (!focused) setDisplayValue(toDisplayValue(currentValue, false))
  }, [currentValue, focused, toDisplayValue])

  useEffect(() => () => repeatControllerRef.current.stop(), [])

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    if (status === 'error') runShakeAnimation(wrapperRef.current)
  }, [status, shakeTrigger])

  const commit = (raw: number | null, nextFocused = focusedRef.current): number | null => {
    const { value: next, changed } = commitInputNumberValue(raw, currentValue, {
      min,
      max,
      precision
    })
    if (changed) {
      setValue(next)
      formItemControl?.onChange?.(next)
    }
    setDisplayValue(toDisplayValue(next, nextFocused))
    return next
  }

  const handleStep = (
    direction: 'up' | 'down',
    baseValue: number | null | undefined = currentValue
  ): number | null => {
    if (effectiveDisabled || isReadOnly) return baseValue ?? null
    const next = stepValue(baseValue, step, direction, min, max, precision)
    return commit(next)
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
      if (effectiveDisabled || isReadOnly) return
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

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const parsed = parseInputNumberValue(displayValue, { parser })
    commit(parsed, false)
    setFocused(false)
    formItemControl?.onBlur?.()
    onBlur?.(e)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true)
    setDisplayValue(toDisplayValue(currentValue, true))
    onFocus?.(e)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commit(parseInputNumberValue(displayValue, { parser }))
    } else {
      const next = getInputNumberKeyboardNextValue(e.key, currentValue, {
        min,
        max,
        step,
        precision,
        keyboard: keyboard && !effectiveDisabled && !isReadOnly
      })
      if (next !== undefined) {
        e.preventDefault()
        commit(next)
      }
    }
    onKeyDown?.(e)
  }

  const atMin = isAtMin(currentValue, min)
  const atMax = isAtMax(currentValue, max)
  const layout = resolveInputNumberControlsLayout(controls, controlsPosition)
  const stepDisabled = effectiveDisabled || isReadOnly

  const wrapperClasses = useMemo(
    () =>
      classNames(
        getInputNumberWrapperClasses({
          disabled: effectiveDisabled,
          inGroup,
          status
        }),
        getInputNumberSizeClasses(effectiveSize),
        className
      ),
    [effectiveDisabled, inGroup, status, effectiveSize, className]
  )

  const inputClasses = useMemo(
    () => getInputNumberInputClasses(effectiveSize, layout),
    [effectiveSize, layout]
  )

  const valueText =
    currentValue == null
      ? labels.emptyAriaValueText
      : formatter
        ? formatter(currentValue)
        : String(currentValue)

  const describedBy = mergeAriaDescribedBy(
    typeof rest['aria-describedby'] === 'string' ? rest['aria-describedby'] : undefined,
    formItemControl?.describedBy
  )

  return (
    <div
      ref={wrapperRef}
      className={wrapperClasses}
      style={style}
      {...{ [TIGER_CHROME_ATTR]: '' }}
      onAnimationEnd={() => wrapperRef.current?.classList.remove(SHAKE_CLASS)}>
      {layout === 'both' && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          aria-label={labels.decrementAriaLabel}
          className={getInputNumberSideButtonClasses('start', stepDisabled || atMin)}
          disabled={stepDisabled || atMin}
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
            className="w-4 h-4"
            aria-hidden="true">
            <path d={inputNumberMinusIconPathD} />
          </svg>
        </button>
      )}

      <input
        {...rest}
        ref={setInputRefs}
        type="text"
        inputMode="decimal"
        role="spinbutton"
        autoFocus={autoFocus}
        aria-valuemin={min === -Infinity ? undefined : min}
        aria-valuemax={max === Infinity ? undefined : max}
        aria-valuenow={currentValue ?? undefined}
        aria-valuetext={valueText}
        aria-invalid={status === 'error' ? true : undefined}
        aria-describedby={describedBy}
        className={inputClasses}
        value={displayValue}
        placeholder={placeholder}
        disabled={effectiveDisabled}
        readOnly={isReadOnly}
        name={effectiveName}
        id={effectiveId}
        onChange={handleInput}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
      />

      {layout === 'both' && (
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          aria-label={labels.incrementAriaLabel}
          className={getInputNumberSideButtonClasses('end', stepDisabled || atMax)}
          disabled={stepDisabled || atMax}
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
            className="w-4 h-4"
            aria-hidden="true">
            <path d={inputNumberPlusIconPathD} />
          </svg>
        </button>
      )}

      {layout === 'end' && (
        <div className={inputNumberControlsRightClasses}>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            aria-label={labels.incrementAriaLabel}
            className={getInputNumberStepButtonClasses('up', stepDisabled || atMax)}
            disabled={stepDisabled || atMax}
            onPointerDown={startStepRepeat('up')}
            onPointerUp={stopStepRepeat}
            onPointerLeave={stopStepRepeat}
            onPointerCancel={stopStepRepeat}
            onClick={() => handleStepClick('up')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-3 h-3"
              aria-hidden="true">
              <path d={inputNumberUpIconPathD} />
            </svg>
          </button>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            aria-label={labels.decrementAriaLabel}
            className={getInputNumberStepButtonClasses('down', stepDisabled || atMin)}
            disabled={stepDisabled || atMin}
            onPointerDown={startStepRepeat('down')}
            onPointerUp={stopStepRepeat}
            onPointerLeave={stopStepRepeat}
            onPointerCancel={stopStepRepeat}
            onClick={() => handleStepClick('down')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-3 h-3"
              aria-hidden="true">
              <path d={inputNumberDownIconPathD} />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
})

InputNumber.displayName = 'InputNumber'
