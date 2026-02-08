/**
 * Dropdown component types and interfaces
 */

import type { FloatingPlacement } from '../utils/floating'

/**
 * Dropdown trigger mode - determines how the dropdown is opened
 */
export type DropdownTrigger = 'click' | 'hover'

/**
 * @deprecated Use `FloatingPlacement` from floating utils instead.
 * Kept for backward compatibility with popover/tooltip/popconfirm types.
 */
export type DropdownPlacement = FloatingPlacement

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
   * Whether to show the dropdown arrow/chevron indicator
   * @default true
   */
  showArrow?: boolean
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
