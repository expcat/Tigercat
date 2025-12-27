/**
 * Divider component types and interfaces
 */

/**
 * Divider orientation types
 */
export type DividerOrientation = 'horizontal' | 'vertical'

/**
 * Divider line style types
 */
export type DividerLineStyle = 'solid' | 'dashed' | 'dotted'

/**
 * Divider spacing types (margin around the divider)
 */
export type DividerSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Base divider props interface
 */
export interface DividerProps {
  /**
   * Orientation of the divider
   * @default 'horizontal'
   */
  orientation?: DividerOrientation
  
  /**
   * Line style of the divider
   * @default 'solid'
   */
  lineStyle?: DividerLineStyle
  
  /**
   * Spacing (margin) around the divider
   * @default 'md'
   */
  spacing?: DividerSpacing
  
  /**
   * Custom color for the divider
   * Can be a CSS color value or CSS variable
   * @default undefined (uses default border color)
   */
  color?: string
  
  /**
   * Custom thickness of the divider line
   * @default undefined (uses default 1px for horizontal, 1px for vertical)
   */
  thickness?: string
}
