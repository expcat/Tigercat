import React from 'react'
import {
  classNames,
  getDropdownMenuClasses,
  type DropdownMenuProps as CoreDropdownMenuProps,
} from '@tigercat/core'

export interface DropdownMenuProps extends CoreDropdownMenuProps {
  /**
   * Menu content
   */
  children?: React.ReactNode
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  className,
  style,
  children,
}) => {
  const menuClasses = classNames(
    getDropdownMenuClasses(),
    className
  )

  return (
    <div className={menuClasses} style={style} role="menu">
      {children}
    </div>
  )
}
