/**
 * Tooltip component types and interfaces
 */

import type { FloatingPlacement } from '../utils/floating'

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
  placement?: FloatingPlacement

  /**
   * Whether the tooltip is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Offset distance from trigger (in pixels)
   * @default 8
   */
  offset?: number

  /**
   * Additional CSS classes
   */
  className?: string
}
