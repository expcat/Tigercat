import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef
} from 'react'
import {
  classNames,
  getMenuClasses,
  getMenuItemClasses,
  getMenuItemIndent,
  getSubMenuTitleClasses,
  getSubMenuExpandIconClasses,
  getSubmenuPopupZIndex,
  filterMenuItems,
  isKeySelected,
  isKeyOpen,
  menuItemIconClasses,
  menuItemGroupTitleClasses,
  menuSearchFieldClasses,
  menuSearchEmptyClasses,
  menuSearchInputClasses,
  submenuContentHorizontalClasses,
  submenuContentHorizontalNestedClasses,
  submenuContentPopupClasses,
  submenuContentVerticalClasses,
  submenuContentInlineClasses,
  submenuHeightTransitionClasses,
  getInitialSubmenuHeightTransitionStyle,
  createSubmenuHeightTransitionController,
  moveFocusInMenu,
  focusMenuEdge,
  focusFirstChildItem,
  replaceKeys,
  toggleKey,
  initRovingTabIndex,
  type SubmenuHeightTransitionController,
  type MenuMode,
  type MenuTheme,
  type MenuItem as CoreMenuItem,
  type MenuProps as CoreMenuProps,
  type MenuItemProps as CoreMenuItemProps,
  type MenuItemGroupProps as CoreMenuItemGroupProps,
  type SubMenuProps as CoreSubMenuProps
} from '@expcat/tigercat-core'

// Menu context interface
export interface MenuContextValue {
  mode: MenuMode
  theme: MenuTheme
  collapsed: boolean
  inlineIndent: number
  selectedKeys: (string | number)[]
  openKeys: (string | number)[]
  handleSelect: (key: string | number) => void
  handleOpenChange: (key: string | number) => void
}

// Create menu context
const MenuContext = createContext<MenuContextValue | null>(null)

// Hook to use menu context
export function useMenuContext(): MenuContextValue | null {
  return useContext(MenuContext)
}

export interface MenuProps extends CoreMenuProps {
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
  onSearch?: (value: string) => void

  /**
   * Menu content
   */
  children?: React.ReactNode
}

export const Menu: React.FC<MenuProps> = ({
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
  className,
  style,
  onSelect,
  onOpenChange,
  onSearch,
  searchable = false,
  searchValue: controlledSearchValue,
  defaultSearchValue = '',
  searchPlaceholder = 'Search menu',
  emptyText = 'No menu items found',
  children
}) => {
  const menuRef = useRef<HTMLUListElement | null>(null)

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
    return classNames(getMenuClasses(mode, theme, collapsed), className)
  }, [mode, theme, collapsed, className])

  // Context value
  const contextValue = useMemo<MenuContextValue>(
    () => ({
      mode,
      theme,
      collapsed,
      inlineIndent,
      selectedKeys,
      openKeys,
      handleSelect,
      handleOpenChange
    }),
    [mode, theme, collapsed, inlineIndent, selectedKeys, openKeys, handleSelect, handleOpenChange]
  )

  const filteredItems = useMemo(
    () => filterMenuItems(items ?? [], searchValue),
    [items, searchValue]
  )

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

  const dataChildren = filteredItems.map(renderDataItem)
  const hasSlotChildren = React.Children.count(children) > 0
  const emptyChild =
    items && items.length > 0 && dataChildren.length === 0 && !hasSlotChildren ? (
      <li role="none">
        <div className={menuSearchEmptyClasses}>{emptyText}</div>
      </li>
    ) : null

  useEffect(() => {
    if (menuRef.current) initRovingTabIndex(menuRef.current)
  }, [mode, collapsed, selectedKeys, openKeys, filteredItems])

  return (
    <MenuContext.Provider value={contextValue}>
      <ul
        ref={menuRef}
        className={menuClasses}
        style={style}
        role="menu"
        data-tiger-menu-root="true"
        data-tiger-menu-mode={mode}>
        {searchable && (
          <li role="none" className={menuSearchFieldClasses}>
            <input
              type="search"
              value={searchValue}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className={menuSearchInputClasses}
              onChange={handleSearchInput}
            />
          </li>
        )}
        {dataChildren}
        {children}
        {emptyChild}
      </ul>
    </MenuContext.Provider>
  )
}

// --- MenuItem (child component) ---

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

      const isHorizontalRoot = isRoot && menuContext.mode === 'horizontal'
      const nextKey = isHorizontalRoot ? 'ArrowRight' : 'ArrowDown'
      const prevKey = isHorizontalRoot ? 'ArrowLeft' : 'ArrowUp'

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

    if (typeof icon === 'string') {
      return <span className={menuItemIconClasses} dangerouslySetInnerHTML={{ __html: icon }} />
    }

    return <span className={menuItemIconClasses}>{icon as React.ReactNode}</span>
  }

  const renderLabel = () => {
    if (!effectiveCollapsed) return <span className="flex-1">{children}</span>
    if (!icon) {
      const text = String(children || '')
      return <span className="flex-1 text-center">{text.charAt(0).toUpperCase()}</span>
    }
    return null
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

// --- MenuItemGroup (child component) ---

function isComponentNamed(elementType: unknown, name: string): boolean {
  if (typeof elementType !== 'function' && typeof elementType !== 'object') return false
  const maybeFn = elementType as { displayName?: string; name?: string }
  return maybeFn.displayName === name || maybeFn.name === name
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
}

export const MenuItemGroup: React.FC<MenuItemGroupProps> = ({
  title,
  className,
  children,
  level = 0
}) => {
  const enhancedChildren = React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child

    if (child.type === MenuItem || isComponentNamed(child.type, 'SubMenu')) {
      return React.cloneElement(child as React.ReactElement<{ level?: number }>, {
        level
      })
    }

    return child
  })

  return (
    <li className="list-none">
      {title && <div className={menuItemGroupTitleClasses}>{title}</div>}
      <ul role="group" className={className}>
        {enhancedChildren}
      </ul>
    </li>
  )
}

// --- SubMenu (child component) ---

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

const ExpandIcon: React.FC<{ expanded: boolean }> = ({ expanded }) => (
  <svg
    className={getSubMenuExpandIconClasses(expanded)}
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="currentColor">
    <path d="M6 9L1.5 4.5L2.205 3.795L6 7.59L9.795 3.795L10.5 4.5L6 9Z" />
  </svg>
)

export const SubMenu: React.FC<SubMenuProps> = ({
  itemKey,
  title = '',
  icon,
  disabled = false,
  className,
  level = 0,
  children,
  collapsed: collapsedOverride
}) => {
  const menuContext = useMenuContext()

  if (!menuContext) {
    console.warn('SubMenu must be used within Menu component')
  }

  const [isHovered, setIsHovered] = useState(false)
  const [isOpenByKeyboard, setIsOpenByKeyboard] = useState(false)
  const submenuContentRef = useRef<HTMLDivElement | null>(null)
  const heightTransitionRef = useRef<SubmenuHeightTransitionController | null>(null)

  const effectiveCollapsed = collapsedOverride ?? (menuContext ? menuContext.collapsed : false)

  const isPopup =
    !!menuContext &&
    (menuContext.mode === 'horizontal' || (menuContext.mode === 'vertical' && effectiveCollapsed))

  const isOpen = !!menuContext && isKeyOpen(itemKey, menuContext.openKeys)

  const isExpanded = isPopup ? isHovered || isOpenByKeyboard : isOpen

  const isInlineOrVertical = menuContext?.mode !== 'horizontal' && !isPopup
  const [hasRenderedInline, setHasRenderedInline] = useState(() =>
    isInlineOrVertical ? isExpanded : false
  )

  useEffect(() => {
    if (!isInlineOrVertical || !isExpanded || hasRenderedInline) return
    setHasRenderedInline(true)
  }, [hasRenderedInline, isExpanded, isInlineOrVertical])

  const disposeHeightTransition = useCallback(() => {
    heightTransitionRef.current?.dispose()
    heightTransitionRef.current = null
  }, [])

  useEffect(() => disposeHeightTransition, [disposeHeightTransition])

  useLayoutEffect(() => {
    if (!isInlineOrVertical || !hasRenderedInline || !submenuContentRef.current) {
      disposeHeightTransition()
      return
    }

    if (!heightTransitionRef.current) {
      heightTransitionRef.current = createSubmenuHeightTransitionController(
        submenuContentRef.current,
        { expanded: isExpanded }
      )
      return
    }

    heightTransitionRef.current.update(isExpanded)
  }, [disposeHeightTransition, hasRenderedInline, isExpanded, isInlineOrVertical])

  const titleClasses = useMemo(() => {
    if (!menuContext) return ''
    return classNames(getSubMenuTitleClasses(menuContext.theme, disabled), className)
  }, [menuContext, disabled, className])

  const contentClasses = useMemo(() => {
    if (!menuContext) return ''
    if (menuContext.mode === 'horizontal') {
      return level === 0 ? submenuContentHorizontalClasses : submenuContentHorizontalNestedClasses
    }
    if (isPopup) return submenuContentPopupClasses
    if (menuContext.mode === 'inline') return submenuContentInlineClasses
    return submenuContentVerticalClasses
  }, [menuContext, isPopup, level])

  const handleTitleClick = useCallback(() => {
    if (!menuContext || disabled) return

    if (menuContext.mode === 'horizontal') return

    if (isPopup) {
      setIsOpenByKeyboard((prev) => !prev)
      setIsHovered(true)
      return
    }

    setHasRenderedInline(true)
    menuContext.handleOpenChange(itemKey)
  }, [disabled, menuContext, itemKey, isPopup])

  // Handle mouse enter for horizontal mode
  const handleMouseEnter = useCallback(() => {
    if (menuContext?.mode === 'horizontal' || isPopup) setIsHovered(true)
  }, [menuContext, isPopup])

  // Handle mouse leave for horizontal mode
  const handleMouseLeave = useCallback(() => {
    if (menuContext?.mode === 'horizontal' || isPopup) {
      setIsHovered(false)
      setIsOpenByKeyboard(false)
    }
  }, [menuContext, isPopup])

  const openInline = useCallback(
    (titleEl: HTMLButtonElement) => {
      if (!menuContext) return
      setHasRenderedInline(true)
      menuContext.handleOpenChange(itemKey)
      setTimeout(() => focusFirstChildItem(titleEl), 0)
    },
    [menuContext, itemKey]
  )

  const handleTitleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (!menuContext || disabled) return

      const current = event.currentTarget
      const rootMenu = current.closest('ul[role="menu"]') as HTMLElement | null
      const isRoot = rootMenu?.dataset.tigerMenuRoot === 'true'
      const isHorizontalRoot = isRoot && menuContext.mode === 'horizontal'

      const nextKey = isHorizontalRoot ? 'ArrowRight' : 'ArrowDown'
      const prevKey = isHorizontalRoot ? 'ArrowLeft' : 'ArrowUp'

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

      if (event.key === 'Escape' || event.key === 'ArrowLeft') {
        if (menuContext.mode === 'horizontal' || isPopup) {
          event.preventDefault()
          setIsOpenByKeyboard(false)
          setIsHovered(false)
          return
        }

        if (isOpen) {
          event.preventDefault()
          menuContext.handleOpenChange(itemKey)
        }
        return
      }

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        if (menuContext.mode === 'horizontal' || isPopup) {
          setIsOpenByKeyboard(true)
          return
        }
        openInline(current)
        return
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        if (menuContext.mode === 'horizontal' || isPopup) {
          event.preventDefault()
          setIsOpenByKeyboard(true)
          return
        }

        if (!isOpen) {
          event.preventDefault()
          openInline(current)
        }
      }
    },
    [menuContext, disabled, isOpen, isPopup, itemKey, openInline]
  )

  const indentStyle =
    !menuContext || menuContext.mode === 'horizontal' || level === 0
      ? {}
      : getMenuItemIndent(level, menuContext.inlineIndent)

  if (!menuContext) return null

  const renderIcon = () => {
    if (!icon) return null

    if (typeof icon === 'string') {
      return <span className={menuItemIconClasses} dangerouslySetInnerHTML={{ __html: icon }} />
    }

    return <span className={menuItemIconClasses}>{icon as React.ReactNode}</span>
  }

  const renderTitle = () => {
    if (!effectiveCollapsed) {
      return (
        <>
          {renderIcon()}
          <span className="flex-1">{title}</span>
          {menuContext.mode !== 'horizontal' && !isPopup && <ExpandIcon expanded={isExpanded} />}
        </>
      )
    } else if (!icon) {
      // Show first letter when collapsed without icon
      return <span className="flex-1 text-center">{title.charAt(0).toUpperCase()}</span>
    } else {
      return renderIcon()
    }
  }

  const renderContent = () => {
    const nextLevel = level + 1
    const enhancedChildren = React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return child

      if (child.type === MenuItem || child.type === SubMenu || child.type === MenuItemGroup) {
        return React.cloneElement(
          child as React.ReactElement<{ level?: number; collapsed?: boolean }>,
          {
            level: nextLevel
          }
        )
      }

      return child
    })

    const popupZIndex = isPopup ? getSubmenuPopupZIndex(level) : {}

    if (isPopup) {
      return (
        <ul
          className={contentClasses}
          style={{ display: isExpanded ? 'block' : 'none', ...popupZIndex }}
          role="menu"
          aria-hidden={isExpanded ? undefined : 'true'}>
          {enhancedChildren}
        </ul>
      )
    }

    if (!hasRenderedInline) return null

    const isHidden = !isExpanded

    return (
      <div
        ref={submenuContentRef}
        className={submenuHeightTransitionClasses}
        style={
          heightTransitionRef.current
            ? undefined
            : getInitialSubmenuHeightTransitionStyle(isExpanded)
        }
        aria-hidden={isHidden ? 'true' : undefined}
        data-tiger-menu-hidden={isHidden ? 'true' : undefined}
        data-tiger-submenu-motion="height">
        <ul className={contentClasses} role="menu">
          {enhancedChildren}
        </ul>
      </div>
    )
  }

  return (
    <li
      className={isPopup ? 'relative' : ''}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="none">
      <button
        type="button"
        className={titleClasses}
        style={indentStyle}
        onClick={handleTitleClick}
        onKeyDown={handleTitleKeyDown}
        role="menuitem"
        data-tiger-menuitem="true"
        aria-expanded={isExpanded ? 'true' : 'false'}
        aria-haspopup="true"
        aria-disabled={disabled ? 'true' : undefined}
        disabled={disabled}
        tabIndex={-1}>
        {renderTitle()}
      </button>
      {renderContent()}
    </li>
  )
}
