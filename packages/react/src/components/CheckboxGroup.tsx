import React, { createContext, useContext } from 'react'
import {
  getChoiceGroupClasses,
  markFormItemGroupControl,
  mergeAriaDescribedBy,
  toggleCheckboxGroupValue,
  type CheckboxGroupValue,
  type ChoiceGroupDirection,
  type ComponentSize,
  type InputStatus
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useFormItemControlContext } from './FormItemContext'

export interface CheckboxGroupContext {
  value: CheckboxGroupValue
  disabled: boolean
  size: ComponentSize
  updateValue: (val: CheckboxGroupValue[number], checked: boolean) => void
}

const CheckboxGroupContextProvider = createContext<CheckboxGroupContext | null>(null)

export const useCheckboxGroup = () => {
  return useContext(CheckboxGroupContextProvider)
}

export interface CheckboxGroupProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  'onChange' | 'defaultValue'
> {
  value?: CheckboxGroupValue
  defaultValue?: CheckboxGroupValue
  disabled?: boolean
  size?: ComponentSize
  direction?: ChoiceGroupDirection
  status?: InputStatus
  onChange?: (value: CheckboxGroupValue) => void
  children?: React.ReactNode
}

const CheckboxGroupInner: React.FC<CheckboxGroupProps> = ({
  value: controlledValue,
  defaultValue = [],
  disabled = false,
  size = 'md',
  direction = 'vertical',
  status: statusProp,
  onChange,
  children,
  className,
  ...props
}) => {
  const formItemControl = useFormItemControlContext()
  const [value, setValue] = useControlledState({
    value: controlledValue,
    defaultValue,
    onChange: (next) => {
      onChange?.(next)
      formItemControl?.onChange?.(next)
    }
  })
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

  const updateValue = (val: CheckboxGroupValue[number], checked: boolean) => {
    if (effectiveDisabled) return
    const next = toggleCheckboxGroupValue(value, val, checked)
    setValue(next)
  }

  const context: CheckboxGroupContext = {
    value,
    disabled: effectiveDisabled,
    size,
    updateValue
  }

  return (
    <CheckboxGroupContextProvider.Provider value={context}>
      <div
        {...props}
        role="group"
        aria-labelledby={labelledby}
        aria-describedby={describedBy}
        aria-disabled={effectiveDisabled || undefined}
        aria-invalid={status === 'error' ? true : props['aria-invalid']}
        className={getChoiceGroupClasses({ direction, className })}>
        {children}
      </div>
    </CheckboxGroupContextProvider.Provider>
  )
}

export const CheckboxGroup = markFormItemGroupControl(CheckboxGroupInner)
CheckboxGroup.displayName = 'CheckboxGroup'
