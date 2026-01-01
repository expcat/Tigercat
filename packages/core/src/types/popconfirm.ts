/**
 * Popconfirm component types and interfaces
 */

import type { DropdownPlacement } from './dropdown'

/**
 * Popconfirm icon type
 */
export type PopconfirmIconType = 'warning' | 'info' | 'error' | 'success' | 'question'

/**
 * Base popconfirm props interface
 */
export interface PopconfirmProps {
  /**
   * Whether the popconfirm is visible (controlled mode)
   */
  visible?: boolean
  
  /**
   * Default visibility (uncontrolled mode)
   * @default false
   */
  defaultVisible?: boolean
  
  /**
   * Popconfirm title/question text
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
   * Confirm button text
   * @default '确定' (Chinese) / 'Confirm' (English)
   */
  okText?: string
  
  /**
   * Cancel button text
   * @default '取消' (Chinese) / 'Cancel' (English)
   */
  cancelText?: string
  
  /**
   * Confirm button type
   * @default 'primary'
   */
  okType?: 'primary' | 'danger'
  
  /**
   * Popconfirm placement relative to trigger
   * @default 'top'
   */
  placement?: DropdownPlacement
  
  /**
   * Whether the popconfirm is disabled
   * @default false
   */
  disabled?: boolean
  
  /**
   * Additional CSS classes
   */
  className?: string
  
  /**
   * Custom styles
   */
  style?: Record<string, string | number>
}
