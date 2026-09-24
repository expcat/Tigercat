import React, { Children, createContext, useCallback, useContext, useState } from 'react'
import {
  coerceArrayFormValue,
  getChoiceGroupClasses,
  markFormItemGroupControl,
  resolveFormItemSeed,
  mergeAriaDescribedBy,
  toggleCheckboxGroupValue,
  type CheckboxGroupOption,
  type CheckboxGroupValue,
  type ChoiceGroupDirection,
  type ComponentSize,
  type InputStatus
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'
import { useFormItemControlContext } from './FormItemContext'
import { Checkbox } from './Checkbox'

export interface CheckboxGroupContext {
  value: CheckboxGroupValue
  disabled: boolean
  size: ComponentSize
  invalid: boolean
  describedBy?: string
  invalidValue?: CheckboxGroupValue[number]
  claimInvalid: (value: CheckboxGroupValue[number]) => void
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
  orientation?: ChoiceGroupDirection
  status?: InputStatus
  onChange?: (value: CheckboxGroupValue) => void
  options?: CheckboxGroupOption[]
  children?: React.ReactNode
}

const CheckboxGroupInner: React.FC<CheckboxGroupProps> = ({
  value: controlledValue,
  defaultValue = [],
  disabled = false,
  size = 'md',
  orientation = 'vertical',
  status: statusProp,
  onChange,
  options,
  children,
  className,
  ...props
}) => {
  const formItemControl = useFormItemControlContext()
  const [value, setValue] = useControlledState({
    value: resolveFormItemSeed(
      controlledValue,
      formItemControl?.name,
      formItemControl?.value,
      coerceArrayFormValue<CheckboxGroupValue[number]>
    ),
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

  const [claimedInvalid, setClaimedInvalid] = useState<CheckboxGroupValue[number] | undefined>(
    options?.[0]?.value
  )
  const claimInvalid = useCallback((optionValue: CheckboxGroupValue[number]) => {
    setClaimedInvalid((current) => current ?? optionValue)
  }, [])
  const updateValue = (val: CheckboxGroupValue[number], checked: boolean) => {
    if (effectiveDisabled) return
    const next = toggleCheckboxGroupValue(value, val, checked)
    setValue(next)
  }

  const context: CheckboxGroupContext = {
    value,
    disabled: effectiveDisabled,
    size,
    invalid: status === 'error',
    describedBy,
    invalidValue: claimedInvalid ?? options?.[0]?.value,
    claimInvalid,
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
        className={getChoiceGroupClasses({ orientation, className })}>
        {Children.count(children) > 0
          ? children
          : options?.map((option) => (
              <Checkbox key={String(option.value)} value={option.value} disabled={option.disabled}>
                {option.label}
              </Checkbox>
            ))}
      </div>
    </CheckboxGroupContextProvider.Provider>
  )
}

export const CheckboxGroup = markFormItemGroupControl(CheckboxGroupInner)
CheckboxGroup.displayName = 'CheckboxGroup'
