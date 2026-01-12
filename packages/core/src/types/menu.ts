/**
 * Menu component types and interfaces
 */

/**
 * Menu mode - determines the layout direction
 */
export type MenuMode = "horizontal" | "vertical" | "inline";

/**
 * Menu theme - color scheme for the menu
 */
export type MenuTheme = "light" | "dark";

export type MenuKey = string | number;

/**
 * Menu item data structure
 */
export interface MenuItem {
  /**
   * Unique key for the menu item
   */
  key: MenuKey;
  /**
   * Menu item label/title
   */
  label: string;
  /**
   * Icon for the menu item
   */
  icon?: unknown;
  /**
   * Whether the menu item is disabled
   */
  disabled?: boolean;
  /**
   * Child menu items (for submenu)
   */
  children?: MenuItem[];
  /**
   * Custom data
   */
  [key: string]: unknown;
}

/**
 * Base menu props interface
 */
export interface MenuProps {
  /**
   * Menu mode - horizontal, vertical, or inline
   * @default 'vertical'
   */
  mode?: MenuMode;
  /**
   * Menu theme - light or dark
   * @default 'light'
   */
  theme?: MenuTheme;
  /**
   * Currently selected menu item keys
   */
  selectedKeys?: MenuKey[];
  /**
   * Default selected menu item keys
   */
  defaultSelectedKeys?: MenuKey[];
  /**
   * Currently opened submenu keys (for vertical/inline mode)
   */
  openKeys?: MenuKey[];
  /**
   * Default opened submenu keys
   */
  defaultOpenKeys?: MenuKey[];
  /**
   * Whether the menu is collapsed (for vertical mode)
   * @default false
   */
  collapsed?: boolean;
  /**
   * Whether multiple submenus can be opened at once
   * @default true
   */
  multiple?: boolean;
  /**
   * Whether to allow inline indentation of submenus
   * @default true
   */
  inlineIndent?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Custom styles
   */
  style?: Record<string, string | number>;
}

/**
 * Menu item props interface
 */
export interface MenuItemProps {
  /**
   * Unique key for the menu item
   */
  itemKey: MenuKey;
  /**
   * Whether the menu item is disabled
   */
  disabled?: boolean;
  /**
   * Icon for the menu item
   */
  icon?: unknown;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * SubMenu props interface
 */
export interface SubMenuProps {
  /**
   * Unique key for the submenu
   */
  itemKey: MenuKey;
  /**
   * Submenu title
   */
  title?: string;
  /**
   * Icon for the submenu
   */
  icon?: unknown;
  /**
   * Whether the submenu is disabled
   */
  disabled?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * MenuItemGroup props interface
 */
export interface MenuItemGroupProps {
  /**
   * Group title
   */
  title?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}
