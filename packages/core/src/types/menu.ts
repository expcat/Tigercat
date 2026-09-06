/**
 * Menu component types and interfaces
 */

/**
 * Menu mode - determines the layout direction
 */
export type MenuMode = 'horizontal' | 'vertical' | 'inline'

/**
 * Menu theme - color scheme for the menu
 */
export type MenuTheme = 'light' | 'dark'

export type MenuKey = string | number

/**
 * Filter behavior when a parent label matches the query.
 * `subtree` keeps the item a submenu and retains its children.
 * `match-only` keeps only matching descendants.
 */
export type MenuFilterMode = 'subtree' | 'match-only'

export type MenuItemType = 'item' | 'group' | 'divider'

/**
 * Menu item data structure. Slot/children usage is still supported.
 * Unknown fields are not forwarded — use `type`, `href`, and `title` instead
 * of an index signature.
 */
export interface MenuItem {
  /**
   * Unique key for an item or submenu. Optional on group/divider nodes.
   */
  key?: MenuKey
  /**
   * Discriminator. Omit (or `item`) for a leaf or submenu; `group` and
   * `divider` match the slot components.
   */
  type?: MenuItemType
  /**
   * Menu item label / submenu title.
   */
  label?: string
  /**
   * Group title when `type="group"`.
   */
  title?: string
  /**
   * Icon node or a registered icon name. HTML strings are ignored.
   */
  icon?: unknown
  /**
   * Whether the menu item is disabled
   */
  disabled?: boolean
  /**
   * Navigate with an `<a>` instead of a button.
   */
  href?: string
  /**
   * Child menu items (submenu or group).
   */
  children?: MenuItem[]
}

/**
 * Backend-style dynamic menu node. Maps onto {@link MenuItem} via
 * `menuSchemaToMenuItems`; extra fields (`path`, `permission`, `hideInMenu`)
 * stay on the schema and are not added to `MenuItem`.
 */
export interface MenuSchemaNode {
  /**
   * Stable node id. Copied onto `MenuItem.key`.
   */
  key: string
  /**
   * Display label. Group nodes also map this to `MenuItem.title`.
   */
  label?: string
  /**
   * Registered icon name. Kept as a string for the Icon registry; not a
   * framework node.
   */
  icon?: string
  /**
   * Internal route path. Used as `MenuItem.href` when `href` is omitted.
   */
  path?: string
  /**
   * External or explicit link. Wins over `path` when both are set.
   */
  href?: string
  /**
   * Required permission code, or codes that must all pass.
   * Omitted / empty means unrestricted.
   */
  permission?: string | string[]
  /**
   * Discriminator. Same values as {@link MenuItemType}.
   */
  type?: MenuItemType
  /**
   * When true, omit this node from menu output and promote visible children.
   */
  hideInMenu?: boolean
  /**
   * Nested schema nodes (submenu or group).
   */
  children?: MenuSchemaNode[]
}

/**
 * A backend-style menu tree (array of {@link MenuSchemaNode}).
 */
export type MenuSchema = MenuSchemaNode[]

/**
 * Base menu props interface
 */
export interface MenuProps {
  /**
   * Data-driven menu items. Slot/children based usage is still supported.
   */
  items?: MenuItem[]

  /**
   * Menu mode - horizontal, vertical, or inline
   * @default 'vertical'
   */
  mode?: MenuMode
  /**
   * Menu theme - light or dark
   * @default 'light'
   */
  theme?: MenuTheme
  /**
   * Currently selected menu item keys.
   * Selection is always single-key: the array is empty or length 1.
   */
  selectedKeys?: MenuKey[]
  /**
   * Default selected menu item keys
   */
  defaultSelectedKeys?: MenuKey[]
  /**
   * Currently opened submenu keys (inline, vertical, and popup).
   */
  openKeys?: MenuKey[]
  /**
   * Default opened submenu keys
   */
  defaultOpenKeys?: MenuKey[]
  /**
   * Collapse vertical/inline menus to icons (or first letter) and popup submenus.
   * Horizontal menus ignore this and `devWarn`.
   * With `mode="inline"`, collapsed menus switch to vertical popup submenus.
   * @default false
   */
  collapsed?: boolean
  /**
   * Whether multiple **submenus** can be opened at once.
   * Does not change item selection (always single-select).
   * @default true
   */
  multiple?: boolean
  /**
   * Inline indentation for submenu items
   * @default 24
   */
  inlineIndent?: number
  /**
   * Whether popup submenus are rendered through a portal.
   * @default true
   */
  popupPortal?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Custom styles
   */
  style?: Record<string, string | number>

  /**
   * Whether to render a built-in search field for filtering data-driven `items`.
   * `'auto'` shows the field only while the menu is expanded. Collapsed menus
   * always hide the field so a 64px sider is not squeezed.
   * @default false
   */
  searchable?: boolean | 'auto'

  /**
   * Controlled search value used to filter data-driven `items`.
   */
  searchValue?: string

  /**
   * Default search value for uncontrolled searchable menus.
   */
  defaultSearchValue?: string

  /**
   * Search input placeholder. Falls back to `locale.common.searchPlaceholder`.
   */
  searchPlaceholder?: string

  /**
   * Empty text shown when `items` are filtered to no results.
   * Falls back to `locale.common.emptyText`.
   */
  emptyText?: string

  /**
   * How a matching parent node treats unmatched children.
   * @default 'subtree'
   */
  filterMode?: MenuFilterMode
}

/**
 * Menu item props interface
 */
export interface MenuItemProps {
  /**
   * Unique key for the menu item
   */
  itemKey: MenuKey
  /**
   * Whether the menu item is disabled
   */
  disabled?: boolean
  /**
   * Icon for the menu item (node or registered icon name)
   */
  icon?: unknown
  /**
   * Render an `<a>` with this href. `aria-current="page"` only applies to links.
   */
  href?: string
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * SubMenu props interface
 */
export interface SubMenuProps {
  /**
   * Unique key for the submenu
   */
  itemKey: MenuKey
  /**
   * Submenu title
   */
  title?: string
  /**
   * Icon for the submenu (node or registered icon name)
   */
  icon?: unknown
  /**
   * Whether the submenu is disabled
   */
  disabled?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * MenuItemGroup props interface
 */
export interface MenuItemGroupProps {
  /**
   * Group title
   */
  title?: string
  /**
   * Additional CSS classes
   */
  className?: string
}
