import React, { useMemo, useCallback } from 'react'
import {
  classNames,
  getMenuItemClasses,
  isKeySelected,
  menuItemIconClasses,
  type MenuItemProps as CoreMenuItemProps,
} from '@tigercat/core'
import { useMenuContext } from './Menu'

export interface MenuItemProps extends CoreMenuItemProps {
  /**
   * Menu item content
   */
  children?: React.ReactNode
}

export const MenuItem: React.FC<MenuItemProps> = ({
  key: itemKey,
  disabled = false,
  icon,
  className,
  children,
}) => {
  // Get menu context
  const menuContext = useMenuContext()

  if (!menuContext) {
    console.warn('MenuItem must be used within Menu component')
  }

  // Check if this item is selected
  const isSelected = useMemo(() => {
    if (!menuContext || itemKey === undefined) return false
    return isKeySelected(itemKey, menuContext.selectedKeys)
  }, [menuContext, itemKey])

  // Menu item classes
  const itemClasses = useMemo(() => {
    if (!menuContext) {
      return classNames(
        'flex items-center px-4 py-2 cursor-pointer transition-colors duration-200',
        className
      )
    }

    return classNames(
      getMenuItemClasses(
        isSelected,
        disabled,
        menuContext.theme,
        menuContext.collapsed
      ),
      className
    )
  }, [menuContext, isSelected, disabled, className])

  // Handle click
  const handleClick = useCallback(() => {
    if (!disabled && menuContext && itemKey !== undefined) {
      menuContext.handleSelect(itemKey)
    }
  }, [disabled, menuContext, itemKey])

  // Render icon
  const renderIcon = () => {
    if (!icon) return null
    
    if (typeof icon === 'string') {
      return (
        <span
          className={menuItemIconClasses}
          dangerouslySetInnerHTML={{ __html: icon }}
        />
      )
    }
    
    return <span className={menuItemIconClasses}>{icon as React.ReactNode}</span>
  }

  // Render label
  const renderLabel = () => {
    if (!menuContext?.collapsed) {
      return <span className="flex-1">{children}</span>
    } else if (!icon) {
      // Show first letter when collapsed without icon
      const text = String(children || '')
      return <span className="flex-1 text-center">{text.charAt(0).toUpperCase()}</span>
    }
    return null
  }

  return (
    <li
      className={itemClasses}
      role="menuitem"
      aria-disabled={disabled ? 'true' : undefined}
      onClick={handleClick}
    >
      {renderIcon()}
      {renderLabel()}
    </li>
  )
}
