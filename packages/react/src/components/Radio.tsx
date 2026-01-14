import React, { useContext, useState } from 'react'
import {
  classNames,
  getRadioDotClasses,
  getRadioLabelClasses,
  getRadioColorClasses,
  getRadioVisualClasses,
  type RadioProps as CoreRadioProps
} from '@tigercat/core'
import { RadioGroupContext } from './RadioGroup'

export interface RadioProps
  extends
    Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      'type' | 'size' | 'onChange' | 'checked' | 'defaultChecked' | 'value'
    >,
    CoreRadioProps {
  /**
   * Change event handler
   */
  onChange?: (value: string | number) => void

  /**
   * Radio label content
   */
  children?: React.ReactNode

  /**
   * Additional CSS classes (applied to root element)
   */
  className?: string
}

export const Radio: React.FC<RadioProps> = ({
  value,
  size,
  disabled,
  name,
  checked,
  defaultChecked = false,
  onChange,
  children,
  className,
  style,
  ...props
}) => {
  const groupContext = useContext(RadioGroupContext)

  const [internalChecked, setInternalChecked] = useState(defaultChecked)

  const isCheckedControlled = checked !== undefined
  const isInGroup = !!groupContext

  const actualSize = size || groupContext?.size || 'md'
  const actualDisabled = disabled !== undefined ? disabled : groupContext?.disabled || false
  const actualName = name || groupContext?.name || ''

  const isChecked =
    checked !== undefined
      ? checked
      : groupContext?.value !== undefined
        ? groupContext.value === value
        : internalChecked

  const colors = getRadioColorClasses()
  const radioClasses = getRadioVisualClasses({
    size: actualSize,
    checked: isChecked,
    disabled: actualDisabled,
    colors
  })

  const dotClasses = getRadioDotClasses({
    size: actualSize,
    checked: isChecked,
    colors
  })

  const labelClasses = getRadioLabelClasses({
    size: actualSize,
    disabled: actualDisabled,
    colors
  })

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (actualDisabled) {
      event.preventDefault()
      return
    }

    const newChecked = event.target.checked
    if (!newChecked) return

    if (!isCheckedControlled && !isInGroup) {
      setInternalChecked(true)
    }

    onChange?.(value)
    groupContext?.onChange?.(value)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    props.onKeyDown?.(event)
    if (event.defaultPrevented) return
    if (actualDisabled) return

    if (event.key === 'Enter') {
      event.preventDefault()
      const input = event.currentTarget
      if (!input.checked) input.click()
    }
  }

  return (
    <label className={classNames('inline-flex items-center', className)} style={style}>
      {/* Hidden native radio input */}
      <input
        type="radio"
        className="sr-only peer"
        {...props}
        name={actualName}
        value={value}
        checked={isChecked}
        disabled={actualDisabled}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
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
