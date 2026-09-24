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
   * Width as a positive pixel number or one CSS length (`20rem`, `50%`).
   * Invalid values keep the default max-width.
   */
  width?: number | string

  /**
   * Accessible name when there is no title. The body is the description,
   * not a second copy of the name.
   */
  ariaLabel?: string

  /** Custom styles */
  style?: Record<string, string | number>
}
