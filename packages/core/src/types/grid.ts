/**
 * Grid component types and interfaces
 */

/**
 * Responsive breakpoint type
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

/**
 * Gutter size type (in px or Tailwind spacing scale)
 */
export type GutterSize = number | [number, number]

/**
 * Column span value (1-24 or responsive object)
 */
export type ColSpan = number | Partial<Record<Breakpoint, number>>

/**
 * Alignment options
 */
export type Align = 'top' | 'middle' | 'bottom' | 'stretch'

/**
 * Justify options
 */
export type Justify = 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly'

/**
 * Base Row props interface
 */
export interface RowProps {
  /**
   * Grid gutter, could be horizontal or [horizontal, vertical]
   * @default 0
   */
  gutter?: GutterSize

  /**
   * Vertical alignment of flex layout
   * @default 'top'
   */
  align?: Align

  /**
   * Horizontal arrangement of flex layout
   * @default 'start'
   */
  justify?: Justify

  /**
   * Whether to wrap
   * @default true
   */
  wrap?: boolean
}

/**
 * Base Col props interface
 */
export interface ColProps {
  /**
   * Number of cells to span, or responsive object
   * @default 24
   */
  span?: ColSpan

  /**
   * Number of cells to offset
   * @default 0
   */
  offset?: number | Partial<Record<Breakpoint, number>>

  /**
   * Number of cells to order
   */
  order?: number | Partial<Record<Breakpoint, number>>

  /**
   * Flex layout fill
   */
  flex?: string | number
}
