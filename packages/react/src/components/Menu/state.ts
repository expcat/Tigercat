import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  classNames,
  getMenuClasses,
  filterMenuItems,
  replaceKeys,
  toggleKey,
  initRovingTabIndex,
  type MenuMode
} from '@expcat/tigercat-core'
import type { MenuProps, MenuRootState, MenuContextValue } from './types'

export function useMenuRootState(props: MenuProps): MenuRootState {
  const {
    items,
    mode = 'vertical',
    theme = 'light',
    selectedKeys: controlledSelectedKeys,
    defaultSelectedKeys = [],
    openKeys: controlledOpenKeys,
    defaultOpenKeys = [],
    collapsed = false,
    multiple = true,
    inlineIndent = 24,
    popupPortal = false,
    className,
    style,
    onSelect,
    onOpenChange,
    onSearch,
    searchable = false,
    searchValue: controlledSearchValue,
    defaultSearchValue = '',
    searchPlaceholder = 'Search menu',
    emptyText = 'No menu items found'
  } = props
  const children = props.children

  const menuRef = useRef<HTMLUListElement | null>(null)
  const resolvedMode: MenuMode = collapsed && mode === 'inline' ? 'vertical' : mode

  // Internal state for uncontrolled mode
  const [internalSelectedKeys, setInternalSelectedKeys] =
    useState<(string | number)[]>(defaultSelectedKeys)
  const [internalOpenKeys, setInternalOpenKeys] = useState<(string | number)[]>(defaultOpenKeys)
  const [internalSearchValue, setInternalSearchValue] = useState(defaultSearchValue)

  // Use controlled or uncontrolled state
  const selectedKeys =
    controlledSelectedKeys !== undefined ? controlledSelectedKeys : internalSelectedKeys
  const openKeys = controlledOpenKeys !== undefined ? controlledOpenKeys : internalOpenKeys
  const searchValue =
    controlledSearchValue !== undefined ? controlledSearchValue : internalSearchValue

  // Handle menu item selection
  const handleSelect = useCallback(
    (key: string | number) => {
      const newSelectedKeys = replaceKeys(key, selectedKeys)

      // Update internal state if uncontrolled
      if (controlledSelectedKeys === undefined) {
        setInternalSelectedKeys(newSelectedKeys)
      }

      // Call event handler
      onSelect?.(key, { selectedKeys: newSelectedKeys })
    },
    [controlledSelectedKeys, selectedKeys, onSelect]
  )

  // Handle submenu open/close
  const handleOpenChange = useCallback(
    (key: string | number) => {
      const toggled = toggleKey(key, openKeys)
      const newOpenKeys = multiple ? toggled : toggled.includes(key) ? [key] : []

      // Update internal state if uncontrolled
      if (controlledOpenKeys === undefined) {
        setInternalOpenKeys(newOpenKeys)
      }

      // Call event handler
      onOpenChange?.(key, { openKeys: newOpenKeys })
    },
    [openKeys, multiple, controlledOpenKeys, onOpenChange]
  )

  const handleSearchInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value

      if (controlledSearchValue === undefined) {
        setInternalSearchValue(value)
      }

      onSearch?.(value)
    },
    [controlledSearchValue, onSearch]
  )

  // Menu classes
  const menuClasses = useMemo(() => {
    return classNames(getMenuClasses(resolvedMode, theme, collapsed), className)
  }, [resolvedMode, theme, collapsed, className])

  // Context value
  const contextValue = useMemo<MenuContextValue>(
    () => ({
      mode: resolvedMode,
      theme,
      collapsed,
      inlineIndent,
      popupPortal,
      selectedKeys,
      openKeys,
      handleSelect,
      handleOpenChange
    }),
    [
      resolvedMode,
      theme,
      collapsed,
      inlineIndent,
      popupPortal,
      selectedKeys,
      openKeys,
      handleSelect,
      handleOpenChange
    ]
  )

  const filteredItems = useMemo(
    () => filterMenuItems(items ?? [], searchValue),
    [items, searchValue]
  )

  useEffect(() => {
    if (menuRef.current) initRovingTabIndex(menuRef.current)
  }, [resolvedMode, collapsed, selectedKeys, openKeys, filteredItems])

  return {
    menuRef,
    menuClasses,
    style,
    resolvedMode,
    mode,
    contextValue,
    searchable,
    searchValue,
    searchPlaceholder,
    emptyText,
    handleSearchInput,
    filteredItems,
    items,
    children
  }
}
