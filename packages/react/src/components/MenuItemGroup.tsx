import React from 'react'
import { menuItemGroupTitleClasses, type MenuItemGroupProps as CoreMenuItemGroupProps } from '@tigercat/core'

export interface MenuItemGroupProps extends CoreMenuItemGroupProps {
  /**
   * Group items
   */
  children?: React.ReactNode
}

export const MenuItemGroup: React.FC<MenuItemGroupProps> = ({
  title,
  className,
  children,
}) => {
  return (
    <li className="list-none">
      {title && (
        <div className={menuItemGroupTitleClasses}>{title}</div>
      )}
      <ul role="group" className={className}>
        {children}
      </ul>
    </li>
  )
}
