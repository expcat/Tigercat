import React from 'react'
import {
  getMenuItemKind,
  menuSearchEmptyClasses,
  menuSearchFieldClasses,
  menuSearchInputClasses,
  type MenuItem as CoreMenuItem
} from '@expcat/tigercat-core'
import { MenuContext } from './Menu/context'
import { useMenuRootState } from './Menu/state'
import { MenuItem } from './Menu/menu-item'
import { MenuItemGroup } from './Menu/menu-item-group'
import { SubMenu } from './Menu/submenu'
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

function renderDataItem(item: CoreMenuItem): React.ReactNode {
  const kind = getMenuItemKind(item)
  if (kind === 'divider') {
    return (
      <li
        key={item.key ?? `divider-${item.label}`}
        role="separator"
        className="my-1 border-t border-[var(--tiger-border,#e5e7eb)]"
      />
    )
  }
  if (kind === 'group') {
    return (
      <MenuItemGroup key={item.key ?? item.title} title={item.title ?? item.label}>
        {(item.children ?? []).map(renderDataItem)}
      </MenuItemGroup>
    )
  }
  if (kind === 'submenu') {
    return (
      <SubMenu
        key={item.key}
        itemKey={item.key ?? item.label ?? ''}
        title={item.label ?? item.title}
        icon={item.icon}
        disabled={item.disabled}>
        {(item.children ?? []).map(renderDataItem)}
      </SubMenu>
    )
  }
  return (
    <MenuItem
      key={item.key}
      itemKey={item.key ?? item.label ?? ''}
      icon={item.icon}
      disabled={item.disabled}
      href={item.href}>
      {item.label}
    </MenuItem>
  )
}

export const Menu: React.FC<MenuProps> = (props) => {
  const ctx = useMenuRootState(props)
  const dataChildren = ctx.filteredItems.map(renderDataItem)

  return (
    <MenuContext.Provider value={ctx.contextValue}>
      <nav
        {...ctx.navProps}
        className={ctx.menuClasses}
        style={ctx.style}
        data-tiger-menu=""
        data-tiger-menu-mode={ctx.resolvedMode}
        data-tiger-menu-requested-mode={ctx.mode}>
        {ctx.searchable && (
          <div className={menuSearchFieldClasses}>
            <input
              type="search"
              value={ctx.searchValue}
              placeholder={ctx.searchPlaceholder}
              aria-label={ctx.searchPlaceholder}
              className={menuSearchInputClasses}
              onChange={ctx.handleSearchInput}
              onKeyDown={ctx.handleSearchKeyDown}
            />
          </div>
        )}
        {ctx.empty ? <div className={menuSearchEmptyClasses}>{ctx.emptyText}</div> : null}
        <ul
          ref={ctx.menuRef}
          role={ctx.listRole}
          data-tiger-menu-root="true"
          data-tiger-menu-list=""
          data-tiger-menu-mode={ctx.resolvedMode}>
          {dataChildren}
          {ctx.children}
        </ul>
      </nav>
    </MenuContext.Provider>
  )
}
