/**
 * Popconfirm component types and interfaces
 */

import type { BaseFloatingPopupProps } from './floating-popup'

/**
 * Popconfirm icon type
 */
export type PopconfirmIconType = 'warning' | 'info' | 'error' | 'success' | 'question'

/**
 * Base popconfirm props interface
 */
export interface PopconfirmProps extends Omit<BaseFloatingPopupProps, 'trigger'> {
  /**
   * Popconfirm title/question text. Defaults to `locale.common.confirmTitle`.
   */
  title?: string

  /**
   * Popconfirm description text (optional, displayed below title)
   */
  description?: string

  /**
   * Icon type to display
   * @default 'warning'
   */
  icon?: PopconfirmIconType

  /**
   * Whether to show icon
   * @default true
   */
  showIcon?: boolean

  /**
   * Confirm button text. Defaults to `locale.common.okText`.
   */
  okText?: string

  /**
   * Cancel button text. Defaults to `locale.common.cancelText`.
   */
  cancelText?: string

  /**
   * Confirm button type
   * @default 'primary'
   */
  okType?: 'primary' | 'danger'

  /**
   * Called when the user confirms. Return a Promise to keep the layer open
   * and show loading on OK until it settles; reject leaves the layer open.
   */
  onConfirm?: () => void | Promise<void>

  /**
   * Called when the user cancels.
   */
  onCancel?: () => void

  /**
   * Custom styles
   */
  style?: Record<string, string | number>
}
