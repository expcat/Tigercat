/**
 * Popover component types and interfaces
 */

import type { BaseFloatingPopupProps, FloatingTrigger } from './floating-popup'

/**
 * Popover trigger type
 */
export type PopoverTrigger = FloatingTrigger

/**
 * Base popover props interface
 */
export interface PopoverProps extends BaseFloatingPopupProps {
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
   * Popover width in pixels. Custom width drops the default max-width cap.
   */
  width?: number | string

  /** Custom styles */
  style?: Record<string, string | number>
}
