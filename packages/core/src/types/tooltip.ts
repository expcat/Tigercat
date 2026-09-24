/**
 * Tooltip component types and interfaces
 */

import type { BaseFloatingPopupProps, FloatingTrigger } from './floating-popup'

/**
 * Tooltip trigger type
 */
export type TooltipTrigger = FloatingTrigger

/**
 * Base tooltip props interface
 */
export interface TooltipProps extends BaseFloatingPopupProps {
  /**
   * Tooltip content. Interactive descendants are not allowed (`role="tooltip"`).
   */
  content?: string

  /**
   * Trigger type. Hover listens to the pointer and to focus. A click opens
   * and stays; it does not close the tooltip.
   * @default 'hover'
   */
  trigger?: TooltipTrigger
}
