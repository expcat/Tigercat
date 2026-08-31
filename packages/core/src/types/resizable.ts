/**
 * Resizable component types and interfaces
 */

/**
 * Resize handle position
 */
export type ResizeHandlePosition =
  'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

/**
 * Resize constraint axis
 */
export type ResizeAxis = 'horizontal' | 'vertical' | 'both'

/**
 * Which axis drives an aspect-ratio lock
 */
export type AspectRatioPrimary = 'width' | 'height' | 'auto'

/**
 * Base Resizable props interface
 */
export interface ResizableProps {
  /**
   * Controlled width in pixels. Omit to stay uncontrolled.
   * Dropping `width` keeps the last size instead of snapping back to defaultWidth.
   */
  width?: number
  /**
   * Controlled height in pixels. Omit to stay uncontrolled.
   */
  height?: number
  /**
   * Default width in pixels
   */
  defaultWidth?: number
  /**
   * Default height in pixels
   */
  defaultHeight?: number
  /**
   * Minimum width in pixels
   * @default 0
   */
  minWidth?: number
  /**
   * Minimum height in pixels
   * @default 0
   */
  minHeight?: number
  /**
   * Maximum width in pixels
   */
  maxWidth?: number
  /**
   * Maximum height in pixels
   */
  maxHeight?: number
  /**
   * Which handles to show
   * @default ['right', 'bottom', 'bottom-right']
   */
  handles?: ResizeHandlePosition[]
  /**
   * Constraint axis. Handles that cannot move this axis are not rendered.
   * @default 'both'
   */
  axis?: ResizeAxis
  /**
   * Whether resizing is disabled
   * @default false
   */
  disabled?: boolean
  /**
   * Whether to maintain aspect ratio.
   * Edge handles follow that axis; corners follow the larger pointer delta.
   * @default false
   */
  lockAspectRatio?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Custom styles. Width/height written by the component win over `style.width` / `style.height`.
   */
  style?: Record<string, string | number>
}

/**
 * Resize event data
 */
export interface ResizeEvent {
  width: number
  height: number
  handle: ResizeHandlePosition
  deltaX: number
  deltaY: number
}
