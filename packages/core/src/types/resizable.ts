/**
 * Resizable component types and interfaces
 */

/**
 * Resize handle position
 */
export type ResizeHandlePosition =
  | 'top'
  | 'right'
  | 'bottom'
  | 'left'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'

/**
 * Resize constraint axis
 */
export type ResizeAxis = 'horizontal' | 'vertical' | 'both'

/**
 * Base Resizable props interface
 */
export interface ResizableProps {
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
   * Constraint axis
   * @default 'both'
   */
  axis?: ResizeAxis
  /**
   * Whether resizing is disabled
   * @default false
   */
  disabled?: boolean
  /**
   * Whether to maintain aspect ratio
   * @default false
   */
  lockAspectRatio?: boolean
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Custom styles
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
