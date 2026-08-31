import React, { useCallback } from 'react'
import {
  classNames,
  focusMenuEdge,
  getMenuItemClasses,
  getMenuItemIndent,
  getMenuNavigationKeys,
  isKeySelected,
  isMenuRoving,
  moveFocusInMenu,
  sameMenuKey,
  shouldIndentMenuItem
} from '@expcat/tigercat-core'
import { useMenuContext, useSubMenuScope, warnMissingMenuContext } from './context'
import { getReactMenuPlainText, renderCollapsedLabel, renderMenuIcon } from './render'
import type { MenuItemProps } from './types'

export const MenuItem: React.FC<MenuItemProps> = ({
  itemKey,
  disabled = false,
  icon,
  href,
  className,
  children,
  level = 0,
  collapsed: collapsedOverride,
  ...rest
}) => {
  const menuContext = useMenuContext()
  const submenuScope = useSubMenuScope()

  if (!menuContext) {
    warnMissingMenuContext('MenuItem')
  }

  const isSelected = !!menuContext && isKeySelected(itemKey, menuContext.selectedKeys)
  const effectiveCollapsed = collapsedOverride ?? (menuContext ? menuContext.collapsed : false)
  const inPopup = Boolean(submenuScope?.popup)
  const usesMenuRole = inPopup || menuContext?.mode === 'horizontal'
  const roving = Boolean(
    menuContext &&
    isMenuRoving(menuContext.mode, {
      popup: inPopup,
      isRoot: !submenuScope
    })
  )
  const isTabStop =
    !disabled &&
    (!roving ||
      (menuContext?.tabStopKey != null && sameMenuKey(itemKey, menuContext.tabStopKey)) ||
      (inPopup && false))

  const itemClasses = classNames(
    menuContext
      ? getMenuItemClasses(isSelected, disabled, menuContext.theme, effectiveCollapsed)
      : 'flex items-center px-4 py-2 cursor-pointer transition-colors duration-200',
    className
  )

  const indentStyle: React.CSSProperties =
    menuContext && shouldIndentMenuItem(menuContext.mode, level)
      ? getMenuItemIndent(level, menuContext.inlineIndent)
      : {}

  const handleClick = useCallback(() => {
    if (!disabled && menuContext) {
      menuContext.handleSelect(itemKey)
    }
  }, [disabled, menuContext, itemKey])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (!menuContext) return
      const current = event.currentTarget
      const rootMenu = current.closest('[data-tiger-menu-root="true"]') as HTMLElement | null
      const isRoot = Boolean(rootMenu && current.closest('[data-tiger-menu-list]') === rootMenu)
      const { nextKey, prevKey, closeKey } = getMenuNavigationKeys(
        menuContext.mode,
        isRoot,
        menuContext.dir
      )

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

      if ((event.key === 'Escape' || event.key === closeKey) && submenuScope) {
        event.preventDefault()
        submenuScope.close()
        submenuScope.titleRef.current?.focus()
      }
    },
    [menuContext, submenuScope]
  )

  const label = getReactMenuPlainText(children)
  const content = (
    <>
      {renderMenuIcon(icon, effectiveCollapsed)}
      {effectiveCollapsed ? (
        renderCollapsedLabel(label, icon)
      ) : (
        <span className="flex-1">{children}</span>
      )}
    </>
  )

  const shared = {
    className: itemClasses,
    style: indentStyle,
    'data-tiger-menuitem': 'true' as const,
    'data-tiger-selected': isSelected ? 'true' : 'false',
    'aria-disabled': disabled ? true : undefined,
    tabIndex: disabled ? -1 : roving ? (isTabStop ? 0 : -1) : 0,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    ...rest
  }

  const role = usesMenuRole ? ('menuitem' as const) : undefined
  const wrapperRole = usesMenuRole ? ('none' as const) : undefined

  if (href) {
    return (
      <li role={wrapperRole}>
        <a
          {...shared}
          href={disabled ? undefined : href}
          role={role}
          aria-current={isSelected ? 'page' : undefined}
          aria-disabled={disabled ? true : undefined}>
          {content}
        </a>
      </li>
    )
  }

  return (
    <li role={wrapperRole}>
      <button {...shared} type="button" role={role} disabled={disabled}>
        {content}
      </button>
    </li>
  )
}

MenuItem.displayName = 'MenuItem'
