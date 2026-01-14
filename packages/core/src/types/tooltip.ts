/**
 * Tooltip component types and interfaces
 */

import type { DropdownPlacement } from './dropdown'

/**
 * Tooltip trigger type
 */
export type TooltipTrigger = 'hover' | 'focus' | 'click' | 'manual'

/**
 * Base tooltip props interface
 */
export interface TooltipProps {
  /**
   * Whether the tooltip is visible (controlled mode)
   */
  visible?: boolean

  /**
   * Default visibility (uncontrolled mode)
   * @default false
   */
  defaultVisible?: boolean

  /**
   * Tooltip content text
   */
  content?: string

  /**
   * Trigger type for showing/hiding tooltip
   * @default 'hover'
   */
  trigger?: TooltipTrigger

  /**
   * Tooltip placement relative to trigger
   * @default 'top'
   */
  placement?: DropdownPlacement

  /**
   * Whether the tooltip is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Custom styles
   */
  style?: Record<string, string | number>
}
