import React, { useContext } from 'react'
import {
  classNames,
  getDropdownItemClasses,
  type DropdownItemProps as CoreDropdownItemProps,
} from '@tigercat/core'
import { DropdownContext } from './Dropdown'

export interface DropdownItemProps extends CoreDropdownItemProps {
  /**
   * Click event handler
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  
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
}) => {
  // Get dropdown context
  const context = useContext(DropdownContext)

  // Handle click
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
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
  const itemClasses = classNames(
    getDropdownItemClasses(disabled, divided),
    className
  )

  return (
    <div
      className={itemClasses}
      role="menuitem"
      aria-disabled={disabled}
      onClick={handleClick}
    >
      {children}
    </div>
  )
}
