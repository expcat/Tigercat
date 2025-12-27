/**
 * Text component types and interfaces
 */

/**
 * Text tag types - semantic HTML elements for text
 */
export type TextTag = 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'strong' | 'em' | 'small'

/**
 * Text size types
 */
export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'

/**
 * Text weight types
 */
export type TextWeight = 'thin' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black'

/**
 * Text alignment types
 */
export type TextAlign = 'left' | 'center' | 'right' | 'justify'

/**
 * Text color types
 */
export type TextColor = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'muted'

/**
 * Base text props interface
 */
export interface TextProps {
  /**
   * HTML tag to render
   * @default 'p'
   */
  tag?: TextTag
  
  /**
   * Text size
   * @default 'base'
   */
  size?: TextSize
  
  /**
   * Text weight
   * @default 'normal'
   */
  weight?: TextWeight
  
  /**
   * Text alignment
   */
  align?: TextAlign
  
  /**
   * Text color
   * @default 'default'
   */
  color?: TextColor
  
  /**
   * Whether to truncate text with ellipsis
   * @default false
   */
  truncate?: boolean
  
  /**
   * Whether text should be italic
   * @default false
   */
  italic?: boolean
  
  /**
   * Whether text should have underline
   * @default false
   */
  underline?: boolean
  
  /**
   * Whether text should have line-through
   * @default false
   */
  lineThrough?: boolean
}
