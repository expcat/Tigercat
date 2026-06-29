import type React from 'react'
import type {
  MenuMode,
  MenuTheme,
  MenuItem as CoreMenuItem,
  MenuProps as CoreMenuProps,
  MenuItemProps as CoreMenuItemProps,
  MenuItemGroupProps as CoreMenuItemGroupProps,
  SubMenuProps as CoreSubMenuProps
} from '@expcat/tigercat-core'

// Menu context interface
export interface MenuContextValue {
  mode: MenuMode
  theme: MenuTheme
  collapsed: boolean
  inlineIndent: number
  popupPortal: boolean
  selectedKeys: (string | number)[]
  openKeys: (string | number)[]
  handleSelect: (key: string | number) => void
  handleOpenChange: (key: string | number) => void
}

export interface MenuProps extends CoreMenuProps {
  /**
   * Controlled selected keys change handler
   */
  onSelectedKeysChange?: (selectedKeys: (string | number)[]) => void

  /**
   * Controlled open keys change handler
   */
  onOpenKeysChange?: (openKeys: (string | number)[]) => void

  /**
   * Menu item click event handler
   */
  onSelect?: (key: string | number, info: { selectedKeys: (string | number)[] }) => void

  /**
   * Submenu open/close event handler
   */
  onOpenChange?: (key: string | number, info: { openKeys: (string | number)[] }) => void

  /**
   * Search value change handler
   */
  onSearchChange?: (value: string) => void

  /**
   * Menu content
   */
  children?: React.ReactNode
}

export interface MenuItemProps extends CoreMenuItemProps {
  /**
   * Menu item content
   */
  children?: React.ReactNode

  /**
   * Nesting level (internal use for indentation)
   */
  level?: number

  /**
   * Internal override for collapsed rendering (used by SubMenu popup)
   */
  collapsed?: boolean
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

  /**
   * Internal override for collapsed rendering (used by SubMenu popup)
   */
  collapsed?: boolean
}

export interface SubMenuProps extends CoreSubMenuProps {
  /**
   * Submenu content
   */
  children?: React.ReactNode

  /**
   * Nesting level (internal use for indentation)
   */
  level?: number

  /**
   * Internal override for collapsed rendering (used by SubMenu popup)
   */
  collapsed?: boolean
}

/**
 * Internal state produced by {@link useMenuRootState} and consumed by the
 * `Menu.tsx` wrapper. Mirrors the `Table/` paradigm (state hook returns an
 * immutable context object; the wrapper owns the top-level JSX).
 */
export interface MenuRootState {
  menuRef: React.RefObject<HTMLUListElement | null>
  menuClasses: string
  style?: React.CSSProperties
  resolvedMode: MenuMode
  mode: MenuMode
  contextValue: MenuContextValue
  searchable: boolean
  searchValue: string
  searchPlaceholder: string
  emptyText: string
  handleSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void
  filteredItems: CoreMenuItem[]
  items?: CoreMenuItem[]
  children?: React.ReactNode
}
