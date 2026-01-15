import React from 'react'
import {
  menuItemGroupTitleClasses,
  type MenuItemGroupProps as CoreMenuItemGroupProps
} from '@expcat/tigercat-core'
import { MenuItem } from './MenuItem'

function isComponentNamed(elementType: unknown, name: string): boolean {
  if (typeof elementType !== 'function' && typeof elementType !== 'object') return false
  const maybeFn = elementType as { displayName?: string; name?: string }
  return maybeFn.displayName === name || maybeFn.name === name
}

export interface MenuItemGroupProps extends CoreMenuItemGroupProps {
  /**
   * Group items
   */
  children?: React.ReactNode

  /**
   * Nesting level (internal use for indentation)
   */
  level?: number
}

export const MenuItemGroup: React.FC<MenuItemGroupProps> = ({
  title,
  className,
  children,
  level = 0
}) => {
  const enhancedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child

    if (child.type === MenuItem || isComponentNamed(child.type, 'SubMenu')) {
      return React.cloneElement(child as React.ReactElement<{ level?: number }>, {
        level
      })
    }

    return child
  })

  return (
    <li className="list-none">
      {title && <div className={menuItemGroupTitleClasses}>{title}</div>}
      <ul role="group" className={className}>
        {enhancedChildren}
      </ul>
    </li>
  )
}
