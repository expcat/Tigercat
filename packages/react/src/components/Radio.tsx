import React, { useContext, useMemo, useState } from 'react'
import {
  classNames,
  getRadioDotClasses,
  getRadioLabelClasses,
  getRadioVisualClasses,
  defaultRadioColors,
  radioRootBaseClasses,
  type RadioProps as CoreRadioProps
} from '@expcat/tigercat-core'
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

  const radioClasses = useMemo(
    () =>
      getRadioVisualClasses({
        size: actualSize,
        checked: isChecked,
        disabled: actualDisabled,
        colors: defaultRadioColors
      }),
    [actualSize, isChecked, actualDisabled]
  )

  const dotClasses = useMemo(
    () =>
      getRadioDotClasses({
        size: actualSize,
        checked: isChecked,
        colors: defaultRadioColors
      }),
    [actualSize, isChecked]
  )

  const labelClasses = useMemo(
    () =>
      getRadioLabelClasses({
        size: actualSize,
        disabled: actualDisabled,
        colors: defaultRadioColors
      }),
    [actualSize, actualDisabled]
  )

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
    <label className={classNames(radioRootBaseClasses, className)} style={style}>
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
