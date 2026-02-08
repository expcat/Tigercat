/**
 * Alert component utilities
 * Shared styles and helpers for Alert components
 */

import {
  closeIconPathD,
  statusErrorIconPath,
  statusInfoIconPath,
  statusSuccessIconPath,
  statusWarningIconPath
} from './common-icons'

import type { AlertSize, AlertType } from '../types/alert'

/**
 * Base classes for all alert variants
 */
export const alertBaseClasses = 'flex items-start rounded-lg border transition-all duration-200'

/**
 * Size classes for alert variants
 */
export const alertSizeClasses: Record<AlertSize, string> = {
  sm: 'p-3 text-sm',
  md: 'p-4 text-base',
  lg: 'p-5 text-lg'
} as const

/**
 * Icon size classes
 */
export const alertIconSizeClasses: Record<AlertSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
} as const

/**
 * Title size classes
 */
export const alertTitleSizeClasses: Record<AlertSize, string> = {
  sm: 'text-sm font-medium',
  md: 'text-base font-medium',
  lg: 'text-lg font-medium'
} as const

/**
 * Description size classes
 */
export const alertDescriptionSizeClasses: Record<AlertSize, string> = {
  sm: 'text-xs mt-1',
  md: 'text-sm mt-1',
  lg: 'text-base mt-1.5'
} as const

/**
 * Close button base classes
 */
export const alertCloseButtonBaseClasses =
  'ml-auto -mr-1 -mt-0.5 rounded-md p-1.5 inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors'

/**
 * Alert icon container base classes
 */
export const alertIconContainerClasses = 'flex-shrink-0'

/**
 * Alert content container classes
 */
export const alertContentClasses = 'flex-1 ml-3'

/**
 * SVG path for close (x) icon
 */
export const alertCloseIconPath = closeIconPathD

/**
 * Icon paths keyed by alert type
 */
const alertIconPaths: Record<AlertType, string> = {
  success: statusSuccessIconPath,
  warning: statusWarningIconPath,
  error: statusErrorIconPath,
  info: statusInfoIconPath
}

/**
 * Get icon path based on alert type
 * @param type - Alert type
 * @returns SVG path string for the icon
 */
export function getAlertIconPath(type: AlertType): string {
  return alertIconPaths[type]
}
