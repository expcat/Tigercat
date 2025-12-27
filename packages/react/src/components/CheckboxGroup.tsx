import React, { createContext, useContext, useState } from 'react'
import { type CheckboxSize } from '@tigercat/core'

export interface CheckboxGroupContext {
  value: (string | number | boolean)[]
  disabled: boolean
  size: CheckboxSize
  updateValue: (val: string | number | boolean, checked: boolean) => void
}

const CheckboxGroupContextProvider = createContext<CheckboxGroupContext | null>(null)

export const useCheckboxGroup = () => {
  return useContext(CheckboxGroupContextProvider)
}

export interface CheckboxGroupProps {
  /**
   * Selected values (controlled mode)
   */
  value?: (string | number | boolean)[]
  
  /**
   * Default selected values (uncontrolled mode)
   * @default []
   */
  defaultValue?: (string | number | boolean)[]
  
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
  onChange?: (value: (string | number | boolean)[]) => void
  
  /**
   * Checkbox group content
   */
  children?: React.ReactNode
  
  /**
   * Additional CSS classes
   */
  className?: string
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  value: controlledValue,
  defaultValue = [],
  disabled = false,
  size = 'md',
  onChange,
  children,
  className,
}) => {
  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState<(string | number | boolean)[]>(defaultValue)
  
  // Determine if controlled or uncontrolled
  const isControlled = controlledValue !== undefined
  
  // Current selected values
  const value = isControlled ? controlledValue : internalValue
  
  const updateValue = (val: string | number | boolean, checked: boolean) => {
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
    updateValue,
  }
  
  return (
    <CheckboxGroupContextProvider.Provider value={context}>
      <div className={className}>{children}</div>
    </CheckboxGroupContextProvider.Provider>
  )
}
