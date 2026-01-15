import React from 'react'
import {
  classNames,
  getDropdownMenuClasses,
  type DropdownMenuProps as CoreDropdownMenuProps
} from '@expcat/tigercat-core'

export interface DropdownMenuProps
  extends
    Omit<CoreDropdownMenuProps, 'style'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  style?: React.CSSProperties

  /**
   * Menu content
   */
  children?: React.ReactNode
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  className,
  style,
  children,
  role,
  ...divProps
}) => {
  const menuClasses = classNames(getDropdownMenuClasses(), className)

  return (
    <div className={menuClasses} style={style} role={role ?? 'menu'} {...divProps}>
      {children}
    </div>
  )
}
