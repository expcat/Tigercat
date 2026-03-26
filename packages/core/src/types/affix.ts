/**
 * Affix component types and interfaces
 */

/**
 * Base Affix props (framework-agnostic)
 */
export interface AffixProps {
  /**
   * Distance from the top of the viewport to trigger fixed positioning (px)
   * Mutually exclusive with `offsetBottom`.
   * @default 0
   */
  offsetTop?: number

  /**
   * Distance from the bottom of the viewport to trigger fixed positioning (px)
   * When set, the element affixes to the bottom.
   */
  offsetBottom?: number

  /**
   * The scrollable container. Defaults to `window`.
   * CSS selector string.
   */
  target?: string

  /**
   * Z-index of the affixed element
   * @default 10
   */
  zIndex?: number

  /**
   * Additional CSS class name
   */
  className?: string
}
