/**
 * ImageViewer component types and interfaces
 * @since 0.9.0
 */

/**
 * Base ImageViewer props interface
 */
export interface ImageViewerProps {
  /**
   * Array of image URLs to display
   */
  images: string[]

  /**
   * Whether the viewer is visible
   * @default false
   */
  open?: boolean

  /**
   * Current image index
   * @default 0
   */
  currentIndex?: number

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
   * Whether to close on mask/backdrop click
   * @default true
   */
  maskClosable?: boolean

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
