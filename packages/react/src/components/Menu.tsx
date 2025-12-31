import React, { createContext, useContext, useState, useMemo, useCallback } from 'react'
import {
  classNames,
  getMenuClasses,
  type MenuMode,
  type MenuTheme,
  type MenuProps as CoreMenuProps,
} from '@tigercat/core'

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
   * Menu content
   */
  children?: React.ReactNode
}

export const Menu: React.FC<MenuProps> = ({
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
  children,
}) => {
  // Internal state for uncontrolled mode
  const [internalSelectedKeys, setInternalSelectedKeys] = useState<(string | number)[]>(defaultSelectedKeys)
  const [internalOpenKeys, setInternalOpenKeys] = useState<(string | number)[]>(defaultOpenKeys)

  // Use controlled or uncontrolled state
  const selectedKeys = controlledSelectedKeys !== undefined ? controlledSelectedKeys : internalSelectedKeys
  const openKeys = controlledOpenKeys !== undefined ? controlledOpenKeys : internalOpenKeys

  // Handle menu item selection
  const handleSelect = useCallback((key: string | number) => {
    const newSelectedKeys = [key]
    
    // Update internal state if uncontrolled
    if (controlledSelectedKeys === undefined) {
      setInternalSelectedKeys(newSelectedKeys)
    }
    
    // Call event handler
    onSelect?.(key, { selectedKeys: newSelectedKeys })
  }, [controlledSelectedKeys, onSelect])

  // Handle submenu open/close
  const handleOpenChange = useCallback((key: string | number) => {
    const isOpen = openKeys.includes(key)
    let newOpenKeys: (string | number)[]
    
    if (isOpen) {
      // Close submenu
      newOpenKeys = openKeys.filter(k => k !== key)
    } else {
      // Open submenu
      if (multiple) {
        newOpenKeys = [...openKeys, key]
      } else {
        newOpenKeys = [key]
      }
    }
    
    // Update internal state if uncontrolled
    if (controlledOpenKeys === undefined) {
      setInternalOpenKeys(newOpenKeys)
    }
    
    // Call event handler
    onOpenChange?.(key, { openKeys: newOpenKeys })
  }, [openKeys, multiple, controlledOpenKeys, onOpenChange])

  // Menu classes
  const menuClasses = useMemo(() => {
    return classNames(
      getMenuClasses(mode, theme, collapsed),
      className
    )
  }, [mode, theme, collapsed, className])

  // Context value
  const contextValue = useMemo<MenuContextValue>(() => ({
    mode,
    theme,
    collapsed,
    inlineIndent,
    selectedKeys,
    openKeys,
    handleSelect,
    handleOpenChange,
  }), [mode, theme, collapsed, inlineIndent, selectedKeys, openKeys, handleSelect, handleOpenChange])

  return (
    <MenuContext.Provider value={contextValue}>
      <ul className={menuClasses} style={style} role="menu">
        {children}
      </ul>
    </MenuContext.Provider>
  )
}
