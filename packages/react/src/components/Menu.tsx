import React from 'react'
import {
  menuSearchFieldClasses,
  menuSearchInputClasses,
  menuSearchEmptyClasses,
  type MenuItem as CoreMenuItem
} from '@expcat/tigercat-core'
import { MenuContext, useMenuContext } from './Menu/context'
import { useMenuRootState } from './Menu/state'
import { MenuItem } from './Menu/menu-item'
import { SubMenu } from './Menu/submenu'
import { MenuItemGroup } from './Menu/menu-item-group'
import type { MenuProps } from './Menu/types'

export { useMenuContext } from './Menu/context'
export { MenuItem } from './Menu/menu-item'
export { SubMenu } from './Menu/submenu'
export { MenuItemGroup } from './Menu/menu-item-group'
export type {
  MenuProps,
  MenuItemProps,
  SubMenuProps,
  MenuItemGroupProps,
  MenuContextValue
} from './Menu/types'

export const Menu: React.FC<MenuProps> = (props) => {
  const ctx = useMenuRootState(props)

  function renderDataItem(item: CoreMenuItem): React.ReactNode {
    if (item.children && item.children.length > 0) {
      return (
        <SubMenu
          key={item.key}
          itemKey={item.key}
          title={item.label}
          icon={item.icon}
          disabled={item.disabled}>
          {item.children.map(renderDataItem)}
        </SubMenu>
      )
    }

    return (
      <MenuItem key={item.key} itemKey={item.key} icon={item.icon} disabled={item.disabled}>
        {item.label}
      </MenuItem>
    )
  }

  const dataChildren = ctx.filteredItems.map(renderDataItem)
  const hasSlotChildren = React.Children.count(ctx.children) > 0
  const emptyChild =
    ctx.items && ctx.items.length > 0 && dataChildren.length === 0 && !hasSlotChildren ? (
      <li role="none">
        <div className={menuSearchEmptyClasses}>{ctx.emptyText}</div>
      </li>
    ) : null

  return (
    <MenuContext.Provider value={ctx.contextValue}>
      <ul
        ref={ctx.menuRef}
        className={ctx.menuClasses}
        style={ctx.style}
        role="menu"
        data-tiger-menu-root="true"
        data-tiger-menu-mode={ctx.resolvedMode}
        data-tiger-menu-requested-mode={ctx.mode}>
        {ctx.searchable && (
          <li role="none" className={menuSearchFieldClasses}>
            <input
              type="search"
              value={ctx.searchValue}
              placeholder={ctx.searchPlaceholder}
              aria-label={ctx.searchPlaceholder}
              className={menuSearchInputClasses}
              onChange={ctx.handleSearchInput}
            />
          </li>
        )}
        {dataChildren}
        {ctx.children}
        {emptyChild}
      </ul>
    </MenuContext.Provider>
  )
}
