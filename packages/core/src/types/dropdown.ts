/**
 * Dropdown component types and interfaces
 */

/**
 * Dropdown trigger mode - determines how the dropdown is opened
 */
export type DropdownTrigger = 'click' | 'hover'

/**
 * Dropdown placement - position relative to the trigger element
 */
export type DropdownPlacement = 
  | 'bottom-start'
  | 'bottom'
  | 'bottom-end'
  | 'top-start'
  | 'top'
  | 'top-end'
  | 'left-start'
  | 'left'
  | 'left-end'
  | 'right-start'
  | 'right'
  | 'right-end'

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
   * Dropdown placement relative to trigger
   * @default 'bottom-start'
   */
  placement?: DropdownPlacement
  /**
   * Whether the dropdown is disabled
   * @default false
   */
  disabled?: boolean
  /**
   * Whether the dropdown is visible (controlled mode)
   */
  visible?: boolean
  /**
   * Default visibility (uncontrolled mode)
   * @default false
   */
  defaultVisible?: boolean
  /**
   * Whether to close dropdown on menu item click
   * @default true
   */
  closeOnClick?: boolean
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
  style?: Record<string, string | number>
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
