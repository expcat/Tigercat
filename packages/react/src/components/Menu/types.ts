import type React from 'react'
import type {
  MenuKey,
  MenuMode,
  MenuTheme,
  MenuItem as CoreMenuItem,
  MenuProps as CoreMenuProps,
  MenuItemProps as CoreMenuItemProps,
  MenuItemGroupProps as CoreMenuItemGroupProps,
  SubMenuProps as CoreSubMenuProps
} from '@expcat/tigercat-core'

export interface MenuContextValue {
  mode: MenuMode
  theme: MenuTheme
  collapsed: boolean
  inlineIndent: number
  popupPortal: boolean
  selectedKeys: MenuKey[]
  openKeys: MenuKey[]
  dir: 'ltr' | 'rtl'
  handleSelect: (key: MenuKey) => void
  handleOpenChange: (key: MenuKey, open?: boolean) => void
  tabStopKey?: MenuKey
}

export interface SubMenuScopeValue {
  itemKey: MenuKey
  popup: boolean
  titleRef: React.RefObject<HTMLElement | null>
  close: () => void
}

export interface MenuProps
  extends CoreMenuProps, Omit<React.HTMLAttributes<HTMLElement>, 'onSelect'> {
  onSelectedKeysChange?: (selectedKeys: MenuKey[]) => void
  onOpenKeysChange?: (openKeys: MenuKey[]) => void
  onSelect?: (key: MenuKey, info: { selectedKeys: MenuKey[] }) => void
  onOpenChange?: (key: MenuKey, info: { openKeys: MenuKey[] }) => void
  onSearchChange?: (value: string) => void
  children?: React.ReactNode
}

export interface MenuItemProps
  extends CoreMenuItemProps, Omit<React.HTMLAttributes<HTMLElement>, 'onSelect'> {
  children?: React.ReactNode
  level?: number
  collapsed?: boolean
}

export interface MenuItemGroupProps extends CoreMenuItemGroupProps {
  children?: React.ReactNode
  level?: number
  collapsed?: boolean
}

export interface SubMenuProps
  extends CoreSubMenuProps, Omit<React.HTMLAttributes<HTMLElement>, 'onSelect'> {
  children?: React.ReactNode
  level?: number
  collapsed?: boolean
}

export interface MenuRootState {
  navProps: React.HTMLAttributes<HTMLElement>
  menuRef: React.RefObject<HTMLUListElement | null>
  menuClasses: string
  style?: React.CSSProperties
  listRole: 'menu' | 'menubar' | undefined
  resolvedMode: MenuMode
  mode: MenuMode
  contextValue: MenuContextValue
  searchable: boolean
  searchValue: string
  searchPlaceholder: string
  emptyText: string
  handleSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleSearchKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
  filteredItems: CoreMenuItem[]
  items?: CoreMenuItem[]
  children?: React.ReactNode
  empty: boolean
}
