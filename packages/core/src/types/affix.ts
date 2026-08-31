/**
 * Affix component types and interfaces
 */

import type { ScrollRootInput } from './scroll-root'

/**
 * Base Affix props (framework-agnostic)
 */
export interface AffixProps {
  /**
   * Distance from the top of the scroll root to trigger fixed positioning (px).
   * Mutually exclusive with `offsetBottom`.
   * @default 0
   */
  offsetTop?: number

  /**
   * Distance from the bottom of the scroll root to trigger fixed positioning (px).
   * When `target` is window (the default), this is the viewport bottom.
   * When set, the element affixes to the container bottom and `offsetTop` is ignored.
   */
  offsetBottom?: number

  /**
   * The scrollable container. Selector, Element, Window, or getter.
   * Defaults to `window`. Invalid selectors fall back to window.
   */
  target?: ScrollRootInput

  /**
   * Z-index of the affixed element
   * @default 10
   */
  zIndex?: number

  /**
   * Additional CSS class name
   */
  className?: string

  /**
   * Called when the affixed boolean flips.
   */
  onChange?: (affixed: boolean) => void
}
