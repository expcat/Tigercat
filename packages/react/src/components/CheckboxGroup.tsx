import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
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
  
  // Determine if controlled or uncontrolled - simple comparison, no need to memoize
  const isControlled = controlledValue !== undefined
  
  // Current selected values - don't use nullish coalescing here to allow proper controlled/uncontrolled switching
  const value = isControlled ? controlledValue! : internalValue
  
  const updateValue = useCallback((val: string | number | boolean, checked: boolean) => {
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
  }, [disabled, value, isControlled, onChange])
  
  const context: CheckboxGroupContext = useMemo(() => ({
    value,
    disabled,
    size,
    updateValue,
  }), [value, disabled, size, updateValue])
  
  return (
    <CheckboxGroupContextProvider.Provider value={context}>
      <div className={className}>{children}</div>
    </CheckboxGroupContextProvider.Provider>
  )
}
