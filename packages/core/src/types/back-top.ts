/**
 * BackTop component types and interfaces
 */

import type { ViewportOffset, ViewportPlacement } from './viewport'

/**
 * BackTop positioning mode.
 */
export type BackTopPosition = 'auto' | 'fixed' | 'sticky'

/**
 * Base BackTop props interface
 */
export interface BackTopProps {
  /**
   * Scroll height to show the BackTop button
   * @default 400
   */
  visibilityHeight?: number

  /**
   * Use immediate scroll when set to 0; positive values use native smooth scrolling
   * @default 450
   */
  duration?: number

  /**
   * Positioning strategy. Auto preserves the historical window=fixed/container=sticky behavior.
   * @default 'auto'
   */
  position?: BackTopPosition

  /**
   * Fixed viewport corner used when position is fixed.
   * @default 'bottom-right'
   */
  placement?: ViewportPlacement

  /**
   * Fixed viewport offset used when position is fixed.
   * @default 24
   */
  offset?: ViewportOffset
}
