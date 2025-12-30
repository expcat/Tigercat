import React, { useContext, useCallback, useMemo } from 'react'
import { classNames, getRadioColorClasses, type RadioProps as CoreRadioProps } from '@tigercat/core'
import { RadioGroupContext } from './RadioGroup'

export interface RadioProps extends Omit<CoreRadioProps, 'checked'> {
  /**
   * Change event handler
   */
  onChange?: (value: string | number) => void
  
  /**
   * Radio label content
   */
  children?: React.ReactNode
  
  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Whether the radio is checked (controlled mode)
   */
  checked?: boolean
}

const sizeClasses = {
  sm: {
    radio: 'w-4 h-4',
    dot: 'w-1.5 h-1.5',
    label: 'text-sm',
  },
  md: {
    radio: 'w-5 h-5',
    dot: 'w-2 h-2',
    label: 'text-base',
  },
  lg: {
    radio: 'w-6 h-6',
    dot: 'w-2.5 h-2.5',
    label: 'text-lg',
  },
} as const

export const Radio: React.FC<RadioProps> = ({
  value,
  size = 'md',
  disabled = false,
  name,
  checked,
  onChange,
  children,
  className,
  ...props
}) => {
  const groupContext = useContext(RadioGroupContext)

  // Determine actual values (props override group values) - simple logical operations, no need to memoize
  const actualSize = size || groupContext?.size || 'md'
  const actualDisabled = disabled || groupContext?.disabled || false
  const actualName = name || groupContext?.name || ''
  
  const isChecked = useMemo(() => {
    if (checked !== undefined) return checked
    if (groupContext?.value !== undefined) return groupContext.value === value
    return false
  }, [checked, groupContext?.value, value])

  const colors = getRadioColorClasses() // Static object, no need to memoize

  const radioClasses = useMemo(() => classNames(
    'relative inline-flex items-center justify-center rounded-full border-2 cursor-pointer transition-all',
    sizeClasses[actualSize].radio,
    isChecked ? colors.borderChecked : colors.border,
    isChecked ? colors.bgChecked : colors.bg,
    actualDisabled && colors.disabled,
    actualDisabled && 'cursor-not-allowed',
    !actualDisabled && 'hover:border-[var(--tiger-primary,#2563eb)]',
  ), [actualSize, isChecked, actualDisabled, colors])

  const dotClasses = useMemo(() => classNames(
    'rounded-full transition-all',
    sizeClasses[actualSize].dot,
    colors.innerDot,
    isChecked ? 'scale-100' : 'scale-0',
  ), [actualSize, isChecked, colors.innerDot])

  const labelClasses = useMemo(() => classNames(
    'ml-2 cursor-pointer select-none',
    sizeClasses[actualSize].label,
    actualDisabled ? colors.textDisabled : 'text-gray-900',
    actualDisabled && 'cursor-not-allowed',
  ), [actualSize, actualDisabled, colors.textDisabled])

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (actualDisabled) {
      event.preventDefault()
      return
    }

    const newChecked = event.target.checked
    if (newChecked) {
      onChange?.(value)
      groupContext?.onChange?.(value)
    }
  }, [actualDisabled, value, onChange, groupContext])

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLLabelElement>) => {
    if (actualDisabled) return
    
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      const input = event.currentTarget.querySelector('input[type="radio"]') as HTMLInputElement
      if (input && !input.checked) {
        input.click()
      }
    }
  }, [actualDisabled])

  const wrapperClasses = useMemo(() => classNames('inline-flex items-center', className), [className])

  return (
    <label
      className={wrapperClasses}
      tabIndex={actualDisabled ? -1 : 0}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {/* Hidden native radio input */}
      <input
        type="radio"
        className="sr-only"
        name={actualName}
        value={value}
        checked={isChecked}
        disabled={actualDisabled}
        onChange={handleChange}
      />
      
      {/* Custom radio visual */}
      <span className={radioClasses} aria-hidden="true">
        <span className={dotClasses} />
      </span>
      
      {/* Label content */}
      {children && <span className={labelClasses}>{children}</span>}
    </label>
  )
}
