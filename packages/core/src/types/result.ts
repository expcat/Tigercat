/**
 * Result component types and interfaces
 */

/**
 * Result status type — determines the icon and color scheme
 */
export type ResultStatus = 'success' | 'error' | 'warning' | 'info' | '404' | '403' | '500'

/**
 * Base result props interface (framework-agnostic)
 */
export interface ResultProps {
  /**
   * Result status — determines the icon and color scheme
   * @default 'info'
   */
  status?: ResultStatus

  /**
   * Title text
   */
  title?: string

  /**
   * Subtitle / description text
   */
  subTitle?: string

  /**
   * Additional CSS class name
   */
  className?: string
}
