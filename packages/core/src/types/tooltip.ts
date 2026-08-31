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
   * Trigger type. Default hover is co-joined with focus and click so keyboard
   * and touch can open the tooltip.
   * @default 'hover'
   */
  trigger?: TooltipTrigger
}
