import React, { useRef, useState } from 'react'
import { getRadioGroupClasses } from '@expcat/tigercat-core'
import { type RadioGroupProps as CoreRadioGroupProps, type RadioSize } from '@expcat/tigercat-core'

export interface RadioGroupProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'children' | 'defaultValue'>,
    CoreRadioGroupProps {
  /**
   * Change event handler
   */
  onChange?: (value: string | number) => void

  /**
   * Radio group children (Radio components)
   */
  children?: React.ReactNode

  /**
   * Additional CSS classes
   */
  className?: string
}

interface RadioGroupContextValue {
  value?: string | number
  name: string
  disabled: boolean
  size: RadioSize
  onChange?: (value: string | number) => void
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(null)

export const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  defaultValue,
  name,
  disabled = false,
  size = 'md',
  onChange,
  children,
  className,
  ...props
}) => {
  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState<string | number | undefined>(defaultValue)

  // Determine if controlled or uncontrolled
  const isControlled = value !== undefined

  // Current value - use prop value if controlled, otherwise use internal state
  const currentValue = isControlled ? value : internalValue

  const generatedNameRef = useRef(
    `tiger-radio-group-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
  )

  const groupName = name || generatedNameRef.current

  const handleChange = (newValue: string | number) => {
    if (disabled) return

    if (!isControlled) {
      setInternalValue(newValue)
    }

    onChange?.(newValue)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return

    if (
      event.key !== 'ArrowDown' &&
      event.key !== 'ArrowRight' &&
      event.key !== 'ArrowUp' &&
      event.key !== 'ArrowLeft'
    ) {
      return
    }

    const target = event.target as HTMLElement
    const currentInput = target.closest('input[type="radio"]') as HTMLInputElement | null
    if (!currentInput) return

    const container = event.currentTarget
    const inputs = Array.from(
      container.querySelectorAll('input[type="radio"]')
    ) as HTMLInputElement[]
    const enabledInputs = inputs.filter((input) => !input.disabled)
    if (enabledInputs.length === 0) return

    const currentIndex = enabledInputs.indexOf(currentInput)
    if (currentIndex === -1) return

    event.preventDefault()

    const direction = event.key === 'ArrowDown' || event.key === 'ArrowRight' ? 1 : -1
    const nextIndex = (currentIndex + direction + enabledInputs.length) % enabledInputs.length

    const nextInput = enabledInputs[nextIndex]
    nextInput.focus()
    nextInput.click()
  }

  const contextValue: RadioGroupContextValue = {
    value: currentValue,
    name: groupName,
    disabled,
    size,
    onChange: handleChange
  }

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div
        className={getRadioGroupClasses({
          className,
          hasCustomClass: !!className
        })}
        role="radiogroup"
        onKeyDown={handleKeyDown}
        {...props}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  )
}

// Export context for use in Radio component
export { RadioGroupContext }
