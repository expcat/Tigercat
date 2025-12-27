/**
 * Link component types and interfaces
 */

/**
 * Link variant types
 */
export type LinkVariant = 'primary' | 'secondary' | 'default'

/**
 * Link size types
 */
export type LinkSize = 'sm' | 'md' | 'lg'

/**
 * Base link props interface
 */
export interface LinkProps {
  /**
   * Link variant style
   * @default 'primary'
   */
  variant?: LinkVariant
  
  /**
   * Link size
   * @default 'md'
   */
  size?: LinkSize
  
  /**
   * Whether the link is disabled
   * @default false
   */
  disabled?: boolean
  
  /**
   * The URL to navigate to
   */
  href?: string
  
  /**
   * Where to open the linked document
   * @default undefined
   */
  target?: '_blank' | '_self' | '_parent' | '_top'
  
  /**
   * Relationship between current document and linked document
   * Automatically set to 'noopener noreferrer' when target="_blank"
   */
  rel?: string
  
  /**
   * Whether to show underline
   * @default true
   */
  underline?: boolean
}
