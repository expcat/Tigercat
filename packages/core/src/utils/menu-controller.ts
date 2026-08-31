/**
 * Menu select / open / search commits.
 * Vue/React bind DOM and controlled props; they must not copy this machine.
 */

import type { MenuFilterMode, MenuItem, MenuKey, MenuMode } from '../types/menu'
import { devWarn } from './dev-warn'
import {
  filterMenuItems,
  getMenuSearchExpandKeys,
  isKeyOpen,
  isKeySelected,
  menuKeyId,
  sameMenuKey,
  uniqueMenuKeys
} from './menu-utils'

export const EMPTY_MENU_KEYS: MenuKey[] = []

export function resolveMenuMode(mode: MenuMode, collapsed: boolean): MenuMode {
  return collapsed && mode === 'inline' ? 'vertical' : mode
}

export function resolveMenuCollapsed(mode: MenuMode, collapsed: boolean | undefined): boolean {
  if (!collapsed) return false
  if (mode === 'horizontal') {
    devWarn(
      'Menu.collapsed.horizontal',
      'Menu: `collapsed` applies to vertical/inline. Horizontal ignores it.'
    )
    return false
  }
  return true
}

export function isSubmenuPopup(mode: MenuMode, collapsed: boolean): boolean {
  return mode === 'horizontal' || (mode === 'vertical' && collapsed)
}

export function nextSelectedKeys(current: readonly MenuKey[], key: MenuKey): MenuKey[] {
  if (isKeySelected(key, current)) return []
  return [key]
}

export function nextOpenKeys(options: {
  current: readonly MenuKey[]
  key: MenuKey
  multiple: boolean
  open?: boolean
}): MenuKey[] {
  const isOpen = isKeyOpen(options.key, options.current)
  const shouldOpen = options.open ?? !isOpen
  if (shouldOpen) {
    if (options.multiple) {
      return isOpen
        ? uniqueMenuKeys(options.current)
        : uniqueMenuKeys([...options.current, options.key])
    }
    return [options.key]
  }
  return uniqueMenuKeys(options.current).filter((item) => !sameMenuKey(item, options.key))
}

export function reconcileSearchOpenKeys(options: {
  openKeys: readonly MenuKey[]
  previousSearchExpandKeys: readonly MenuKey[]
  nextSearchExpandKeys: readonly MenuKey[]
}): { openKeys: MenuKey[]; searchExpandKeys: MenuKey[] } {
  const previousIds = new Set(options.previousSearchExpandKeys.map(menuKeyId))
  const userKeys = options.openKeys.filter((key) => !previousIds.has(menuKeyId(key)))
  const added = options.nextSearchExpandKeys.filter((key) => !isKeyOpen(key, userKeys))
  return {
    openKeys: uniqueMenuKeys([...userKeys, ...added]),
    searchExpandKeys: added
  }
}

export function resolveSearchFilter(options: {
  items: MenuItem[] | undefined
  query: string | undefined
  filterMode?: MenuFilterMode
}): { filtered: MenuItem[]; expandKeys: MenuKey[] } {
  const items = options.items ?? []
  const filtered = filterMenuItems(items, options.query, options.filterMode)
  return {
    filtered,
    expandKeys: getMenuSearchExpandKeys(items, options.query)
  }
}

export function warnControlledSearchOpenKeys(options: {
  controlled: boolean
  openKeys: readonly MenuKey[]
  searchExpandKeys: readonly MenuKey[]
}): void {
  if (!options.controlled || options.searchExpandKeys.length === 0) return
  const missing = options.searchExpandKeys.filter((key) => !isKeyOpen(key, options.openKeys))
  if (missing.length === 0) return
  devWarn(
    'Menu.searchOpenKeys',
    'Menu: search found nested items but `openKeys` is controlled and did not include the ancestor keys. Write back `onOpenKeysChange` / `update:openKeys` so matches stay visible.'
  )
}
