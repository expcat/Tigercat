import React, { createContext, useContext } from 'react'
import { useControlledState } from '../hooks/useControlledState'
import { type CheckboxGroupValue, type CheckboxSize } from '@expcat/tigercat-core'

export interface CheckboxGroupContext {
  value: CheckboxGroupValue
  disabled: boolean
  size: CheckboxSize
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
  /**
   * Selected values (controlled mode)
   */
  value?: CheckboxGroupValue

  /**
   * Default selected values (uncontrolled mode)
   * @default []
   */
  defaultValue?: CheckboxGroupValue

  /**
   * Whether all checkboxes are disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Checkbox size for all checkboxes
   * @default 'md'
   */
  size?: CheckboxSize

  /**
   * Change event handler
   */
  onChange?: (value: CheckboxGroupValue) => void

  children?: React.ReactNode
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  value: controlledValue,
  defaultValue = [],
  disabled = false,
  size = 'md',
  onChange,
  children,
  className,
  ...props
}) => {
  const [value, setInternalValue, isControlled] = useControlledState(controlledValue, defaultValue)

  const updateValue = (val: CheckboxGroupValue[number], checked: boolean) => {
    if (disabled) return

    const currentValue = [...value]
    const index = currentValue.indexOf(val)

    if (checked && index === -1) {
      currentValue.push(val)
    } else if (!checked && index !== -1) {
      currentValue.splice(index, 1)
    }

    // Update internal state if uncontrolled
    if (!isControlled) {
      setInternalValue(currentValue)
    }

    onChange?.(currentValue)
  }

  const context: CheckboxGroupContext = {
    value,
    disabled,
    size,
    updateValue
  }

  return (
    <CheckboxGroupContextProvider.Provider value={context}>
      <div {...props} className={className}>
        {children}
      </div>
    </CheckboxGroupContextProvider.Provider>
  )
}
