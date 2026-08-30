import React from 'react'
import {
  type SwitchProps as CoreSwitchProps,
  getSwitchClasses,
  getSwitchThumbClasses
} from '@expcat/tigercat-core'
import { useControlledState } from '../hooks/useControlledState'

export interface SwitchProps
  extends
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'children' | 'defaultChecked'>,
    CoreSwitchProps {
  /**
   * Default checked state (uncontrolled mode)
   */
  defaultChecked?: boolean
  /**
   * Change event handler
   */
  onChange?: (checked: boolean) => void
}

export const Switch: React.FC<SwitchProps> = ({
  checked: checkedProp,
  defaultChecked,
  disabled = false,
  size = 'md',
  onChange,
  className,
  onClick,
  onKeyDown,
  tabIndex,
  ...props
}) => {
  const [checked, setChecked] = useControlledState({
    value: checkedProp,
    defaultValue: defaultChecked ?? false,
    onChange
  })

  const switchClasses = getSwitchClasses(size, checked, disabled, className)

  const thumbClasses = getSwitchThumbClasses(size, checked)

  const toggle = () => {
    if (disabled) return
    setChecked(!checked)
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event)
    if (event.defaultPrevented) return
    toggle()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented) return
    if (disabled) return

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      toggle()
    }
  }

  return (
    <button
      {...props}
      type="button"
      role="switch"
      aria-checked={checked}
      className={switchClasses}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : tabIndex}>
      <span className={thumbClasses} aria-hidden="true" />
    </button>
  )
}
