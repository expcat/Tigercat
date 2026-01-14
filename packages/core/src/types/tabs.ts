/**
 * Tabs component types and interfaces
 */

/**
 * Tab type - determines the style of the tabs
 */
export type TabType = 'line' | 'card' | 'editable-card'

/**
 * Tab position - determines where the tabs are positioned
 */
export type TabPosition = 'top' | 'bottom' | 'left' | 'right'

/**
 * Tab size - determines the size of the tabs
 */
export type TabSize = 'small' | 'medium' | 'large'

/**
 * Base tabs props interface
 */
export interface TabsProps {
  /**
   * Currently active tab key
   */
  activeKey?: string | number
  /**
   * Default active tab key (for uncontrolled mode)
   */
  defaultActiveKey?: string | number
  /**
   * Tab type - line, card, or editable-card
   * @default 'line'
   */
  type?: TabType
  /**
   * Tab position - top, bottom, left, or right
   * @default 'top'
   */
  tabPosition?: TabPosition
  /**
   * Tab size - small, medium, or large
   * @default 'medium'
   */
  size?: TabSize
  /**
   * Whether tabs can be closed (only works with editable-card type)
   * @default false
   */
  closable?: boolean
  /**
   * Whether tabs are centered
   * @default false
   */
  centered?: boolean
  /**
   * Whether to destroy inactive tab panes
   * @default false
   */
  destroyInactiveTabPane?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Custom styles
   */
  style?: Record<string, string | number>
}

/**
 * Tab pane props interface
 */
export interface TabPaneProps {
  /**
   * Unique key for the tab pane (required)
   */
  tabKey: string | number
  /**
   * Tab label/title
   */
  label: string
  /**
   * Whether the tab is disabled
   * @default false
   */
  disabled?: boolean
  /**
   * Whether the tab can be closed (overrides parent closable)
   */
  closable?: boolean
  /**
   * Icon for the tab
   */
  icon?: unknown
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Custom styles
   */
  style?: Record<string, string | number>
}

/**
 * Tab change event info
 */
export interface TabChangeInfo {
  /**
   * The key of the newly activated tab
   */
  activeKey: string | number
}

/**
 * Tab edit event info
 */
export interface TabEditInfo {
  /**
   * The key of the tab being edited
   */
  targetKey?: string | number
  /**
   * The action being performed (add or remove)
   */
  action: 'add' | 'remove'
}
