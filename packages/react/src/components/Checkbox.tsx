import React, { useEffect, useRef } from 'react'
import {
  classNames,
  getCheckboxClasses,
  getCheckboxLabelClasses,
  type CheckboxSize
} from '@expcat/tigercat-core'
import { useCheckboxGroup } from './CheckboxGroup'
import { useControlledState } from '../hooks/useControlledState'

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'size' | 'onChange' | 'checked' | 'defaultChecked' | 'value'
> {
  /**
   * Checkbox checked state (controlled mode)
   */
  checked?: boolean

  /**
   * Default checked state (uncontrolled mode)
   * @default false
   */
  defaultChecked?: boolean

  /**
   * Checkbox value (for use in checkbox groups)
   */
  value?: string | number | boolean

  /**
   * Checkbox size
   * @default 'md'
   */
  size?: CheckboxSize

  /**
   * Whether the checkbox is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Whether the checkbox is in indeterminate state
   * @default false
   */
  indeterminate?: boolean

  /**
   * Change event handler
   */
  onChange?: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void

  /**
   * Checkbox label content
   */
  children?: React.ReactNode

  /**
   * Additional CSS classes
   */
  className?: string
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked: controlledChecked,
  defaultChecked = false,
  value,
  size: propSize,
  disabled: propDisabled,
  indeterminate = false,
  onChange,
  children,
  className,
  ...props
}) => {
  // Get group context if inside CheckboxGroup
  const groupContext = useCheckboxGroup()

  const [checkedState, setChecked] = useControlledState(controlledChecked, defaultChecked, onChange)

  // Determine effective size and disabled state - simple logical operations
  const effectiveSize = propSize || groupContext?.size || 'md'
  const effectiveDisabled = propDisabled || groupContext?.disabled || false

  const checked =
    groupContext && value !== undefined ? groupContext.value.includes(value) : checkedState

  // Ref for checkbox input element
  const checkboxRef = useRef<HTMLInputElement>(null)

  // Handle indeterminate state
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (effectiveDisabled) return

    const newValue = event.target.checked

    // If in a group, update group value
    if (groupContext && value !== undefined) {
      groupContext.updateValue(value, newValue)
    } else {
      setChecked(newValue, event)
    }
  }

  const checkboxClasses = getCheckboxClasses(effectiveSize, effectiveDisabled)

  const inputProps = {
    ref: checkboxRef,
    type: 'checkbox' as const,
    checked,
    disabled: effectiveDisabled,
    value: typeof value === 'boolean' ? String(value) : (value as string | number | undefined),
    onChange: handleChange,
    ...props
  }

  // If there's no label content, return just the checkbox
  if (!children) {
    return <input {...inputProps} className={classNames(checkboxClasses, className)} />
  }

  // Return label with checkbox and content
  const labelClasses = classNames(
    getCheckboxLabelClasses(effectiveSize, effectiveDisabled),
    className
  )

  return (
    <label className={labelClasses}>
      <input {...inputProps} className={checkboxClasses} />
      <span className="ml-2">{children}</span>
    </label>
  )
}
