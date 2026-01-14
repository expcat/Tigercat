/**
 * Popover component types and interfaces
 */

import type { DropdownPlacement } from './dropdown'

/**
 * Popover trigger type
 */
export type PopoverTrigger = 'click' | 'hover' | 'focus' | 'manual'

/**
 * Base popover props interface
 */
export interface PopoverProps {
  /**
   * Whether the popover is visible (controlled mode)
   */
  visible?: boolean

  /**
   * Default visibility (uncontrolled mode)
   * @default false
   */
  defaultVisible?: boolean

  /**
   * Popover title text
   */
  title?: string

  /**
   * Popover content text (can be overridden by content slot/prop)
   */
  content?: string

  /**
   * Trigger type for showing/hiding popover
   * @default 'click'
   */
  trigger?: PopoverTrigger

  /**
   * Popover placement relative to trigger
   * @default 'top'
   */
  placement?: DropdownPlacement

  /**
   * Whether the popover is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Popover width (CSS value)
   * @default 'auto'
   */
  width?: string | number

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Custom styles
   */
  style?: Record<string, string | number>
}
