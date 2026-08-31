import React, { useCallback, useId, useMemo } from 'react'
import {
  collectRadioGroupInputs,
  getChoiceGroupClasses,
  getElementTextDirection,
  getRadioGroupKeyboardNextIndex,
  markFormItemGroupControl,
  mergeAriaDescribedBy,
  type ChoiceGroupDirection,
  type ComponentSize,
  type InputStatus,
  type RadioGroupProps as CoreRadioGroupProps
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useFormItemControlContext } from './FormItemContext'

export interface RadioGroupProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'children' | 'defaultValue'>,
    CoreRadioGroupProps {
  onChange?: (value: string | number) => void
  children?: React.ReactNode
  className?: string
  direction?: ChoiceGroupDirection
}

interface RadioGroupContextValue {
  value?: string | number
  name: string
  disabled: boolean
  size: ComponentSize
  onChange: (value: string | number) => void
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null)

const RadioGroupInner: React.FC<RadioGroupProps> = ({
  value,
  defaultValue,
  name,
  disabled = false,
  size = 'md',
  direction = 'vertical',
  status: statusProp,
  onChange,
  children,
  className,
  onKeyDown,
  ...props
}) => {
  const formItemControl = useFormItemControlContext()
  const [currentValue, setValue] = useControlledState({
    value,
    defaultValue,
    onChange: (next) => {
      onChange?.(next)
      formItemControl?.onChange?.(next)
    }
  })
  const reactId = useId()
  const groupName = name || `tiger-radio-${reactId}`
  const effectiveDisabled = Boolean(disabled || formItemControl?.disabled)
  const status: InputStatus = statusProp ?? formItemControl?.status ?? 'default'
  const labelledby =
    typeof props['aria-labelledby'] === 'string' && props['aria-labelledby'].trim()
      ? props['aria-labelledby'].trim()
      : formItemControl?.labelId
  const describedBy = mergeAriaDescribedBy(
    typeof props['aria-describedby'] === 'string' ? props['aria-describedby'] : undefined,
    formItemControl?.describedBy
  )
  const role = 'radiogroup'

  const handleChange = useCallback(
    (newValue: string | number) => {
      if (effectiveDisabled) return
      setValue(newValue)
    },
    [effectiveDisabled, setValue]
  )

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || effectiveDisabled) return

    const target = event.target as HTMLElement
    const currentInput = target.closest('input[type="radio"]') as HTMLInputElement | null
    if (!currentInput) return

    const container = event.currentTarget
    const enabledInputs = collectRadioGroupInputs(container).filter((input) => !input.disabled)
    if (enabledInputs.length === 0) return

    const currentIndex = enabledInputs.indexOf(currentInput)
    if (currentIndex === -1) return

    const rtl = getElementTextDirection(container) === 'rtl'
    const nextIndex = getRadioGroupKeyboardNextIndex(
      event.key,
      currentIndex,
      enabledInputs.length,
      rtl
    )
    if (nextIndex === null) return

    event.preventDefault()
    const nextInput = enabledInputs[nextIndex]
    nextInput.focus()
    nextInput.click()
  }

  const contextValue = useMemo<RadioGroupContextValue>(
    () => ({
      value: currentValue,
      name: groupName,
      disabled: effectiveDisabled,
      size,
      onChange: handleChange
    }),
    [currentValue, groupName, effectiveDisabled, size, handleChange]
  )

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div
        {...props}
        className={getChoiceGroupClasses({ direction, className })}
        role={role}
        aria-labelledby={labelledby}
        aria-describedby={describedBy}
        aria-invalid={status === 'error' ? true : props['aria-invalid']}
        aria-disabled={effectiveDisabled || undefined}
        onKeyDown={handleKeyDown}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

export const RadioGroup = markFormItemGroupControl(RadioGroupInner)
RadioGroup.displayName = 'RadioGroup'

export { RadioGroupContext }
