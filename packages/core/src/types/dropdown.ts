/**
 * Dropdown component types and interfaces
 */

/**
 * Dropdown trigger mode - determines how the dropdown is opened
 */
export type DropdownTrigger = 'click' | 'hover'

/**
 * Base dropdown props interface
 */
export interface DropdownProps {
  /**
   * Trigger mode - click or hover
   * @default 'hover'
   */
  trigger?: DropdownTrigger
  /**
   * Whether the dropdown is disabled
   * @default false
   */
  disabled?: boolean
  /**
   * Whether the dropdown is open (controlled mode)
   */
  open?: boolean
  /**
   * Default open state (uncontrolled mode)
   * @default false
   */
  defaultOpen?: boolean
  /**
   * Whether to close dropdown on menu item click
   * @default true
   */
  closeOnClick?: boolean
  /**
   * Whether to show the dropdown arrow/chevron indicator
   * @default true
   */
  showArrow?: boolean
  /**
   * Render the menu into document.body (portal/Teleport) so it is not
   * clipped or covered by overflow/sticky ancestors (e.g. fixed table columns).
   * Set to false to render in place with the legacy DOM structure.
   * @default true
   */
  portal?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Custom styles
   */
  style?: Record<string, unknown>
}

/**
 * Dropdown menu props interface
 */
export interface DropdownMenuProps {
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Custom styles
   */
  style?: Record<string, unknown>
}

/**
 * Dropdown item props interface
 */
export interface DropdownItemProps {
  /**
   * Unique key for the dropdown item
   */
  key?: string | number
  /**
   * Whether the item is disabled
   * @default false
   */
  disabled?: boolean
  /**
   * Whether the item is divided from previous item
   * @default false
   */
  divided?: boolean
  /**
   * Icon for the dropdown item
   */
  icon?: unknown
  /**
   * Additional CSS classes
   */
  className?: string
}
