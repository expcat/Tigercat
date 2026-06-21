import React, { useCallback } from 'react'
import {
  classNames,
  getMenuItemClasses,
  getMenuItemIndent,
  isKeySelected,
  menuItemIconClasses,
  menuCollapsedIconClasses,
  moveFocusInMenu,
  focusMenuEdge,
  getMenuNavigationKeys
} from '@expcat/tigercat-core'
import { useMenuContext } from './context'
import type { MenuItemProps } from './types'

export const MenuItem: React.FC<MenuItemProps> = ({
  itemKey,
  disabled = false,
  icon,
  className,
  children,
  level = 0,
  collapsed: collapsedOverride
}) => {
  const menuContext = useMenuContext()

  if (!menuContext) {
    console.warn('MenuItem must be used within Menu component')
  }

  const isSelected = !!menuContext && isKeySelected(itemKey, menuContext.selectedKeys)

  const effectiveCollapsed = collapsedOverride ?? (menuContext ? menuContext.collapsed : false)

  const itemClasses = classNames(
    menuContext
      ? getMenuItemClasses(isSelected, disabled, menuContext.theme, effectiveCollapsed)
      : 'flex items-center px-4 py-2 cursor-pointer transition-colors duration-200',
    className
  )

  const indentStyle: React.CSSProperties =
    menuContext && menuContext.mode === 'inline' && level > 0
      ? getMenuItemIndent(level, menuContext.inlineIndent)
      : {}

  const handleClick = useCallback(() => {
    if (!disabled && menuContext) {
      menuContext.handleSelect(itemKey)
    }
  }, [disabled, menuContext, itemKey])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (!menuContext) return
      const current = event.currentTarget
      const rootMenu = current.closest('ul[role="menu"]') as HTMLElement | null
      const isRoot = rootMenu?.dataset.tigerMenuRoot === 'true'
      const { nextKey, prevKey } = getMenuNavigationKeys(menuContext.mode, isRoot)

      if (event.key === nextKey) {
        event.preventDefault()
        moveFocusInMenu(current, 1)
        return
      }

      if (event.key === prevKey) {
        event.preventDefault()
        moveFocusInMenu(current, -1)
        return
      }

      if (event.key === 'Home') {
        event.preventDefault()
        focusMenuEdge(current, 'start')
        return
      }

      if (event.key === 'End') {
        event.preventDefault()
        focusMenuEdge(current, 'end')
        return
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        handleClick()
      }
    },
    [menuContext, handleClick]
  )

  const renderIcon = () => {
    if (!icon) return null

    const iconClasses = effectiveCollapsed ? menuCollapsedIconClasses : menuItemIconClasses
    if (typeof icon === 'string') {
      return <span className={iconClasses} dangerouslySetInnerHTML={{ __html: icon }} />
    }

    return <span className={iconClasses}>{icon as React.ReactNode}</span>
  }

  const renderLabel = () => {
    if (!effectiveCollapsed) return <span className="flex-1">{children}</span>
    if (!icon) {
      const text = String(children || '')
      // First-letter fallback is aria-hidden; the sr-only full label below
      // keeps the accessible name complete.
      return (
        <>
          <span className="flex-1 text-center" aria-hidden="true">
            {text.charAt(0).toUpperCase()}
          </span>
          <span className="sr-only">{children}</span>
        </>
      )
    }
    // Keep the full label in the DOM for screen readers
    return <span className="sr-only">{children}</span>
  }

  return (
    <li role="none">
      <button
        type="button"
        className={itemClasses}
        style={indentStyle}
        role="menuitem"
        data-tiger-menuitem="true"
        data-tiger-selected={isSelected ? 'true' : 'false'}
        aria-current={isSelected ? 'page' : undefined}
        aria-disabled={disabled ? 'true' : undefined}
        disabled={disabled}
        tabIndex={-1}
        onClick={handleClick}
        onKeyDown={handleKeyDown}>
        {renderIcon()}
        {renderLabel()}
      </button>
    </li>
  )
}
