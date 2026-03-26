/**
 * Watermark component types and interfaces
 */

/**
 * Watermark font configuration
 */
export interface WatermarkFont {
  /** Font size in pixels @default 16 */
  fontSize?: number
  /** Font family @default 'sans-serif' */
  fontFamily?: string
  /** Font weight @default 'normal' */
  fontWeight?: 'normal' | 'bold' | 'lighter' | number
  /** Font color @default 'rgba(0,0,0,0.15)' */
  color?: string
}

/**
 * Base Watermark props (framework-agnostic)
 */
export interface WatermarkProps {
  /**
   * Watermark text content. Array means multi-line.
   */
  content?: string | string[]

  /**
   * Image URL to use as watermark (takes priority over content)
   */
  image?: string

  /**
   * Watermark width in px
   * @default 120
   */
  width?: number

  /**
   * Watermark height in px
   * @default 64
   */
  height?: number

  /**
   * Rotation angle in degrees
   * @default -22
   */
  rotate?: number

  /**
   * Z-index of the watermark layer
   * @default 9
   */
  zIndex?: number

  /**
   * Horizontal gap between watermarks in px
   * @default 100
   */
  gapX?: number

  /**
   * Vertical gap between watermarks in px
   * @default 100
   */
  gapY?: number

  /**
   * X-axis offset in px
   * @default 0
   */
  offsetX?: number

  /**
   * Y-axis offset in px
   * @default 0
   */
  offsetY?: number

  /**
   * Font configuration
   */
  font?: WatermarkFont

  /**
   * Additional CSS class name
   */
  className?: string
}
