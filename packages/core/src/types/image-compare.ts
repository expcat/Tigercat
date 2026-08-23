/**
 * ImageCompare component types and interfaces
 *
 * Before/after comparison slider. Reuses {@link ImageFit} from the Image
 * family so object-fit stays aligned with Image / ImagePreview.
 */

import type { ImageFit } from './image'

/**
 * Comparison axis. `horizontal` clips the before image from the left;
 * `vertical` clips it from the top.
 */
export type ImageCompareOrientation = 'horizontal' | 'vertical'

/**
 * Default handle position as a percentage of the before image that is visible
 */
export const DEFAULT_IMAGE_COMPARE_POSITION = 50

/**
 * Default keyboard / pointer snap increment, in percentage points
 */
export const DEFAULT_IMAGE_COMPARE_STEP = 1

/**
 * Default comparison axis
 */
export const DEFAULT_IMAGE_COMPARE_ORIENTATION: ImageCompareOrientation = 'horizontal'

/**
 * Default object-fit, matching {@link import('./image').ImageProps}
 */
export const DEFAULT_IMAGE_COMPARE_FIT: ImageFit = 'cover'

/**
 * Default accessible name for the comparison handle
 */
export const DEFAULT_IMAGE_COMPARE_ARIA_LABEL = 'Image comparison'

/**
 * Base ImageCompare props interface (framework-agnostic)
 */
export interface ImageCompareProps {
  /**
   * Before (starting) image URL. Vue `before` slot / React `before` node
   * take precedence when provided.
   */
  beforeSrc?: string

  /**
   * After (ending) image URL. Vue `after` slot / React `after` node
   * take precedence when provided.
   */
  afterSrc?: string

  /**
   * Alternative text for the before image
   * @default ''
   */
  beforeAlt?: string

  /**
   * Alternative text for the after image
   * @default ''
   */
  afterAlt?: string

  /**
   * Object-fit applied to the before/after `<img>` elements
   * @default 'cover'
   */
  fit?: ImageFit

  /**
   * Handle position as a percentage of the before image that is visible
   * (controlled mode)
   */
  position?: number

  /**
   * Initial handle position (uncontrolled mode)
   * @default 50
   */
  defaultPosition?: number

  /**
   * Comparison axis
   * @default 'horizontal'
   */
  orientation?: ImageCompareOrientation

  /**
   * Keyboard and pointer snap increment, in percentage points
   * @default 1
   */
  step?: number

  /**
   * Whether pointer and keyboard adjustment are disabled
   * @default false
   */
  disabled?: boolean

  /**
   * Root width (CSS value). A number is treated as pixels.
   */
  width?: number | string

  /**
   * Root height (CSS value). A number is treated as pixels.
   */
  height?: number | string

  /**
   * Accessible name for the comparison handle
   * @default 'Image comparison'
   */
  ariaLabel?: string

  /**
   * Additional CSS classes on the root
   */
  className?: string

  /**
   * Inline styles on the root
   */
  style?: Record<string, unknown>
}
