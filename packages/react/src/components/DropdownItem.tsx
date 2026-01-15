import React, { useContext } from 'react'
import {
  classNames,
  getDropdownItemClasses,
  type DropdownItemProps as CoreDropdownItemProps
} from '@expcat/tigercat-core'
import { DropdownContext } from './Dropdown'

export interface DropdownItemProps
  extends
    Omit<CoreDropdownItemProps, 'className'>,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'disabled'> {
  className?: string

  /**
   * Click event handler
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void

  /**
   * Item content
   */
  children?: React.ReactNode
}

export const DropdownItem: React.FC<DropdownItemProps> = ({
  disabled = false,
  divided = false,
  className,
  onClick,
  children,
  ...buttonProps
}) => {
  // Get dropdown context
  const context = useContext(DropdownContext)

  // Handle click
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      event.preventDefault()
      return
    }

    onClick?.(event)

    // Notify dropdown to close if closeOnClick is true
    if (context?.closeOnClick) {
      context.handleItemClick()
    }
  }

  // Item classes
  const itemClasses = classNames(getDropdownItemClasses(disabled, divided), className)

  return (
    <button
      type="button"
      className={itemClasses}
      role="menuitem"
      aria-disabled={disabled}
      disabled={disabled}
      onClick={handleClick}
      {...buttonProps}>
      {children}
    </button>
  )
}
