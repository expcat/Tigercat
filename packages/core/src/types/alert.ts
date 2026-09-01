/**
 * Alert component types and interfaces
 */

import type { TigerLocale } from './locale'

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
   * Locale override merged on top of ConfigProvider locale.
   */
  locale?: Partial<TigerLocale>

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
   * Auto-close duration in milliseconds.
   * Set to 0 or undefined to disable auto-close.
   * Independent of `closable`.
   */
  duration?: number

  /**
   * Accessible label for the close button (when `closable` is true).
   * Defaults to ConfigProvider locale `alert.closeAriaLabel`.
   */
  closeAriaLabel?: string

  /**
   * When `false`, the alert is not rendered. Closing never hides internally —
   * the parent unmounts or sets `open={false}`.
   */
  open?: boolean
  onOpenChange?: (open: boolean) => void

  /**
   * Whether to display as full-width banner across the page
   * @default false
   * @since 0.9.0
   */
  banner?: boolean

  /**
   * Whether to show countdown progress bar (requires `duration`)
   * @default false
   * @since 0.9.0
   */
  showCountdown?: boolean

  /**
   * Additional CSS classes
   */
  className?: string
}
