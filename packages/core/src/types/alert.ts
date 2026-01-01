/**
 * Alert component types and interfaces
 */

/**
 * Alert type (determines the icon and color scheme)
 */
export type AlertType = 'success' | 'warning' | 'error' | 'info'

/**
 * Alert size types
 */
export type AlertSize = 'sm' | 'md' | 'lg'

/**
 * Base alert props interface
 */
export interface AlertProps {
  /**
   * Alert type (success, warning, error, info)
   * @default 'info'
   */
  type?: AlertType
  
  /**
   * Alert size
   * @default 'md'
   */
  size?: AlertSize
  
  /**
   * Alert title (main message)
   */
  title?: string
  
  /**
   * Alert description (detailed content)
   */
  description?: string
  
  /**
   * Whether to show the type icon
   * @default true
   */
  showIcon?: boolean
  
  /**
   * Whether the alert can be closed
   * @default false
   */
  closable?: boolean
  
  /**
   * Additional CSS classes
   */
  className?: string
}
