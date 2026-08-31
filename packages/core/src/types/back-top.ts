/**
 * BackTop component types and interfaces
 */

import type { ScrollRootInput } from './scroll-root'
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
   * Scroll height to show the BackTop button.
   * Non-finite values fall back to 400.
   * @default 400
   */
  visibilityHeight?: number

  /**
   * Scroll container. Selector, Element, Window, or getter.
   * Defaults to `window`.
   */
  target?: ScrollRootInput

  /**
   * 0 (or any non-positive finite number) uses instant scroll.
   * Any positive number uses the browser's native smooth scroll.
   * Duration is not milliseconds.
   * @default 'smooth'
   */
  duration?: number

  /**
   * Positioning strategy. `auto` and `fixed` both pin to the viewport
   * using `placement` / `offset`. `sticky` is for placing the button
   * inside the scroll container.
   * @default 'auto'
   */
  position?: BackTopPosition

  /**
   * Viewport corner used when position is auto or fixed.
   * @default 'bottom-right'
   */
  placement?: ViewportPlacement

  /**
   * Viewport offset used when position is auto or fixed.
   * @default 24
   */
  offset?: ViewportOffset
}
