import React, { useCallback, useMemo } from 'react'
import { 
  classNames,
  type SwitchProps as CoreSwitchProps,
  getSwitchClasses,
  getSwitchThumbClasses
} from '@tigercat/core'

export interface SwitchProps extends CoreSwitchProps {
  /**
   * Change event handler
   */
  onChange?: (checked: boolean) => void

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * ARIA label for accessibility
   */
  'aria-label'?: string
}

export const Switch: React.FC<SwitchProps> = ({
  checked = false,
  disabled = false,
  size = 'md',
  onChange,
  className,
  'aria-label': ariaLabel,
  ...props
}) => {
  const switchClasses = useMemo(() => classNames(
    getSwitchClasses(size, checked, disabled),
    className
  ), [size, checked, disabled, className])

  const thumbClasses = useMemo(() => getSwitchThumbClasses(size, checked), [size, checked])

  const handleClick = useCallback(() => {
    if (!disabled && onChange) {
      onChange(!checked)
    }
  }, [disabled, checked, onChange])

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!disabled && (event.key === ' ' || event.key === 'Enter')) {
      event.preventDefault()
      onChange?.(!checked)
    }
  }, [disabled, checked, onChange])

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      className={switchClasses}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled ? -1 : 0}
      {...props}
    >
      <span className={thumbClasses} aria-hidden="true" />
    </button>
  )
}
