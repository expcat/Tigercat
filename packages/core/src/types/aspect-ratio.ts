/**
 * AspectRatio component types and interfaces
 */

/**
 * Desired width-to-height ratio.
 *
 * Accepts a positive number (1.5) or a fraction string ('16/9', '16 / 9',
 * '1.5/2'). Invalid values fall back to the default ratio.
 */
export type AspectRatioValue = number | string

/**
 * Inline style patch applied to the AspectRatio root element.
 */
export interface AspectRatioStyle {
  aspectRatio?: string
}

/**
 * Base AspectRatio props interface
 */
export interface AspectRatioProps {
  /**
   * Width-to-height ratio
   * @default '16/9'
   */
  ratio?: AspectRatioValue

  /**
   * Additional CSS class name for the root element
   */
  className?: string

  /**
   * Additional CSS class name for the absolutely positioned content wrapper
   */
  contentClassName?: string
}
