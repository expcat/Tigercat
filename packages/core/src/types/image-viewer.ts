/**
 * ImageViewer component types and interfaces
 * @since 0.9.0
 */

import type { ImageViewerBaseProps } from './image'

/**
 * Base ImageViewer props interface
 */
export interface ImageViewerProps extends ImageViewerBaseProps {
  /**
   * Whether to enable zoom controls
   * @default true
   */
  zoomable?: boolean

  /**
   * Whether to enable rotation controls
   * @default true
   */
  rotatable?: boolean

  /**
   * Whether to show navigation arrows
   * @default true
   */
  showNav?: boolean

  /**
   * Whether to show image counter (e.g. "1 / 5")
   * @default true
   */
  showCounter?: boolean

  /**
   * Minimum zoom scale
   * @default 0.5
   */
  minZoom?: number

  /**
   * Maximum zoom scale
   * @default 3
   */
  maxZoom?: number

  /**
   * Additional CSS classes
   */
  className?: string
}
