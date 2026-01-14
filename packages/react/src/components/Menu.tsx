import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  classNames,
  getMenuClasses,
  type MenuMode,
  type MenuTheme,
  type MenuProps as CoreMenuProps,
} from '@tigercat/core';

// Menu context interface
export interface MenuContextValue {
  mode: MenuMode;
  theme: MenuTheme;
  collapsed: boolean;
  inlineIndent: number;
  selectedKeys: (string | number)[];
  openKeys: (string | number)[];
  handleSelect: (key: string | number) => void;
  handleOpenChange: (key: string | number) => void;
}

// Create menu context
const MenuContext = createContext<MenuContextValue | null>(null);

// Hook to use menu context
export function useMenuContext(): MenuContextValue | null {
  return useContext(MenuContext);
}

export interface MenuProps extends CoreMenuProps {
  /**
   * Menu item click event handler
   */
  onSelect?: (
    key: string | number,
    info: { selectedKeys: (string | number)[] }
  ) => void;

  /**
   * Submenu open/close event handler
   */
  onOpenChange?: (
    key: string | number,
    info: { openKeys: (string | number)[] }
  ) => void;

  /**
   * Menu content
   */
  children?: React.ReactNode;
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
  const menuRef = useRef<HTMLUListElement | null>(null);

  // Internal state for uncontrolled mode
  const [internalSelectedKeys, setInternalSelectedKeys] =
    useState<(string | number)[]>(defaultSelectedKeys);
  const [internalOpenKeys, setInternalOpenKeys] =
    useState<(string | number)[]>(defaultOpenKeys);

  // Use controlled or uncontrolled state
  const selectedKeys =
    controlledSelectedKeys !== undefined
      ? controlledSelectedKeys
      : internalSelectedKeys;
  const openKeys =
    controlledOpenKeys !== undefined ? controlledOpenKeys : internalOpenKeys;

  // Handle menu item selection
  const handleSelect = useCallback(
    (key: string | number) => {
      const newSelectedKeys = [key];

      // Update internal state if uncontrolled
      if (controlledSelectedKeys === undefined) {
        setInternalSelectedKeys(newSelectedKeys);
      }

      // Call event handler
      onSelect?.(key, { selectedKeys: newSelectedKeys });
    },
    [controlledSelectedKeys, onSelect]
  );

  // Handle submenu open/close
  const handleOpenChange = useCallback(
    (key: string | number) => {
      const isOpen = openKeys.includes(key);
      let newOpenKeys: (string | number)[];

      if (isOpen) {
        // Close submenu
        newOpenKeys = openKeys.filter((k) => k !== key);
      } else {
        // Open submenu
        if (multiple) {
          newOpenKeys = [...openKeys, key];
        } else {
          newOpenKeys = [key];
        }
      }

      // Update internal state if uncontrolled
      if (controlledOpenKeys === undefined) {
        setInternalOpenKeys(newOpenKeys);
      }

      // Call event handler
      onOpenChange?.(key, { openKeys: newOpenKeys });
    },
    [openKeys, multiple, controlledOpenKeys, onOpenChange]
  );

  // Menu classes
  const menuClasses = useMemo(() => {
    return classNames(getMenuClasses(mode, theme, collapsed), className);
  }, [mode, theme, collapsed, className]);

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
      handleOpenChange,
    }),
    [
      mode,
      theme,
      collapsed,
      inlineIndent,
      selectedKeys,
      openKeys,
      handleSelect,
      handleOpenChange,
    ]
  );

  useEffect(() => {
    const root = menuRef.current;
    if (!root) return;

    const items = Array.from(
      root.querySelectorAll<HTMLButtonElement>(
        'button[data-tiger-menuitem="true"]'
      )
    ).filter(
      (el) => !el.disabled && !el.closest('[data-tiger-menu-hidden="true"]')
    );

    if (items.length === 0) return;

    const hasActive = items.some((el) => el.tabIndex === 0);
    if (hasActive) return;

    const selected = items.find((el) => el.dataset.tigerSelected === 'true');
    const active = selected ?? items[0];
    items.forEach((el) => {
      el.tabIndex = el === active ? 0 : -1;
    });
  }, [mode, collapsed, selectedKeys, openKeys]);

  return (
    <MenuContext.Provider value={contextValue}>
      <ul
        ref={menuRef}
        className={menuClasses}
        style={style}
        role="menu"
        data-tiger-menu-root="true"
        data-tiger-menu-mode={mode}>
        {children}
      </ul>
    </MenuContext.Provider>
  );
};
