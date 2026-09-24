import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  classNames,
  getMenuClasses,
  getMenuListRole,
  mergeTigerLocale,
  nextOpenKeys,
  nextSelectedKeys,
  reconcileSearchOpenKeys,
  resolveDisplayedOpenKeys,
  resolveMenuCollapsed,
  resolveMenuMode,
  resolveMenuSearchQuery,
  resolveMenuTabStopKey,
  resolveSearchFilter,
  shouldShowMenuSearch,
  warnControlledSearchOpenKeys,
  type MenuKey,
  type MenuMode
} from '@expcat/tigercat-core'
import { useControlledState } from '../../hooks/useControlledState'
import { useTigerConfig } from '../ConfigProvider'
import { useSidebarContext } from '../../utils/layout-context'
import type { MenuContextValue, MenuProps, MenuRootState } from './types'
import { collectReactMenuKeys } from './render'

export function useMenuRootState(props: MenuProps): MenuRootState {
  const {
    items,
    mode = 'vertical',
    theme = 'light',
    selectedKeys: controlledSelectedKeys,
    defaultSelectedKeys = [],
    openKeys: controlledOpenKeys,
    defaultOpenKeys = [],
    collapsed: collapsedProp,
    openMultiple = true,
    inlineIndent = 24,
    popupPortal = true,
    className,
    style,
    onSelectedKeysChange,
    onOpenKeysChange,
    onSelect,
    onOpenChange,
    onSearchChange,
    searchable = false,
    searchValue: controlledSearchValue,
    defaultSearchValue = '',
    searchPlaceholder,
    emptyText,
    filterMode = 'subtree',
    children,
    ...rest
  } = props
  const config = useTigerConfig()
  const locale = useMemo(() => mergeTigerLocale(config.locale), [config.locale])
  const dir = config.direction === 'rtl' ? 'rtl' : 'ltr'
  const sidebar = useSidebarContext()
  const collapsed = resolveMenuCollapsed(mode, collapsedProp ?? sidebar?.collapsed ?? false)
  const resolvedMode: MenuMode = resolveMenuMode(mode, collapsed)

  const menuRef = useRef<HTMLUListElement | null>(null)
  const searchExpandKeysRef = useRef<MenuKey[]>([])
  const openKeysRef = useRef<MenuKey[]>([])

  const [selectedKeys, setSelectedKeys] = useControlledState<MenuKey[]>({
    value: controlledSelectedKeys,
    defaultValue: defaultSelectedKeys,
    onChange: onSelectedKeysChange
  })
  const [openKeys, setOpenKeys] = useControlledState<MenuKey[]>({
    value: controlledOpenKeys,
    defaultValue: defaultOpenKeys,
    onChange: onOpenKeysChange
  })
  openKeysRef.current = openKeys
  const [searchValue, setSearchValue] = useControlledState<string>({
    value: controlledSearchValue,
    defaultValue: defaultSearchValue,
    onChange: onSearchChange
  })

  const handleSelect = useCallback(
    (key: MenuKey) => {
      const next = nextSelectedKeys(selectedKeys, key)
      setSelectedKeys(next)
      onSelect?.(key, { selectedKeys: next })
    },
    [selectedKeys, setSelectedKeys, onSelect]
  )

  const handleOpenChange = useCallback(
    (key: MenuKey, open?: boolean) => {
      const next = nextOpenKeys({ current: openKeys, key, openMultiple, open })
      setOpenKeys(next)
      onOpenChange?.(key, { openKeys: next })
    },
    [openKeys, openMultiple, setOpenKeys, onOpenChange]
  )

  const handleSearchInput = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchValue(event.target.value)
    },
    [setSearchValue]
  )

  const showSearch = shouldShowMenuSearch(searchable, collapsed)
  const { filtered: filteredItems, expandKeys } = useMemo(
    () =>
      resolveSearchFilter({
        items,
        query: resolveMenuSearchQuery(searchable, collapsed, searchValue),
        filterMode
      }),
    [items, searchValue, filterMode, searchable, collapsed]
  )

  useEffect(() => {
    const current = openKeysRef.current
    const reconciled = reconcileSearchOpenKeys({
      openKeys: current,
      previousSearchExpandKeys: searchExpandKeysRef.current,
      nextSearchExpandKeys: expandKeys
    })
    searchExpandKeysRef.current = reconciled.searchExpandKeys
    const unchanged =
      reconciled.openKeys.length === current.length &&
      reconciled.openKeys.every((key, index) => key === current[index])
    if (!unchanged) {
      setOpenKeys(reconciled.openKeys)
    }
    warnControlledSearchOpenKeys({
      controlled: controlledOpenKeys !== undefined,
      openKeys: controlledOpenKeys ?? reconciled.openKeys,
      searchExpandKeys: reconciled.searchExpandKeys
    })
  }, [expandKeys, searchValue, setOpenKeys, controlledOpenKeys])

  const handleSearchKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'ArrowDown') return
    event.preventDefault()
    const first = menuRef.current?.querySelector<HTMLElement>('[data-tiger-menuitem="true"]')
    first?.focus()
  }, [])

  const menuClasses = useMemo(() => {
    return classNames(getMenuClasses(resolvedMode, theme, collapsed), className)
  }, [resolvedMode, theme, collapsed, className])

  const slotKeys = useMemo(() => collectReactMenuKeys(children), [children])
  const rootKeys = useMemo(() => {
    if (items && items.length > 0) {
      return items.map((item) => item.key).filter((key): key is MenuKey => key != null)
    }
    return slotKeys
  }, [items, slotKeys])
  const [tabStopKey, setTabStopKeyState] = useState<MenuKey | undefined>(undefined)
  const resolvedTabStop = resolveMenuTabStopKey({
    itemKeys: rootKeys,
    selectedKeys,
    current: tabStopKey
  })
  const setTabStopKey = useCallback((key: MenuKey) => {
    setTabStopKeyState(key)
  }, [])

  const contextValue = useMemo<MenuContextValue>(
    () => ({
      mode: resolvedMode,
      theme,
      collapsed,
      inlineIndent,
      popupPortal,
      selectedKeys,
      openKeys: resolveDisplayedOpenKeys({ openKeys, searchExpandKeys: expandKeys }),
      dir,
      handleSelect,
      handleOpenChange,
      tabStopKey: resolvedTabStop,
      setTabStopKey
    }),
    [
      resolvedMode,
      theme,
      collapsed,
      inlineIndent,
      popupPortal,
      selectedKeys,
      openKeys,
      expandKeys,
      dir,
      handleSelect,
      handleOpenChange,
      resolvedTabStop,
      setTabStopKey
    ]
  )

  const useItems = items != null
  const empty = Boolean(useItems && items.length > 0 && filteredItems.length === 0)

  const {
    id,
    role: _role,
    ...navRest
  } = rest as React.HTMLAttributes<HTMLElement> & { role?: string }

  return {
    navProps: { id, ...navRest },
    menuRef,
    menuClasses,
    style,
    listRole: getMenuListRole(resolvedMode, { isRoot: true }),
    resolvedMode,
    mode,
    contextValue,
    searchable: showSearch,
    searchValue,
    searchPlaceholder: searchPlaceholder ?? locale?.common?.searchPlaceholder ?? 'Search',
    emptyText: emptyText ?? locale?.common?.emptyText ?? 'No data',
    handleSearchInput,
    handleSearchKeyDown,
    filteredItems,
    items: useItems ? items : undefined,
    children: useItems ? undefined : children,
    displayedOpenKeys: resolveDisplayedOpenKeys({
      openKeys,
      searchExpandKeys: expandKeys
    }),
    empty
  }
}
