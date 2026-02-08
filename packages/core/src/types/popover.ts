/**
 * Popover component types and interfaces
 */

import type { FloatingPlacement } from '../utils/floating'

/**
 * Popover trigger type
 */
export type PopoverTrigger = 'click' | 'hover' | 'focus' | 'manual'

/**
 * Base popover props interface
 */
export interface PopoverProps {
  /** Whether the popover is visible (controlled mode) */
  visible?: boolean

  /**
   * Default visibility (uncontrolled mode)
   * @default false
   */
  defaultVisible?: boolean

  /** Popover title text */
  title?: string

  /** Popover content text (can be overridden by content slot/prop) */
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
  placement?: FloatingPlacement

  /**
   * Whether the popover is disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Popover width (pixel number or Tailwind class)
   */
  width?: string | number

  /**
   * Offset distance from trigger (in pixels)
   * @default 8
   */
  offset?: number

  /** Additional CSS classes */
  className?: string

  /** Custom styles */
  style?: Record<string, string | number>
}
