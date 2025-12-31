/**
 * Alert component utilities
 * Shared styles and helpers for Alert components
 */

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
  lg: 'p-5 text-lg',
} as const

/**
 * Icon size classes
 */
export const alertIconSizeClasses: Record<AlertSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
} as const

/**
 * Title size classes
 */
export const alertTitleSizeClasses: Record<AlertSize, string> = {
  sm: 'text-sm font-medium',
  md: 'text-base font-medium',
  lg: 'text-lg font-medium',
} as const

/**
 * Description size classes
 */
export const alertDescriptionSizeClasses: Record<AlertSize, string> = {
  sm: 'text-xs mt-1',
  md: 'text-sm mt-1',
  lg: 'text-base mt-1.5',
} as const

/**
 * Close button base classes
 */
export const alertCloseButtonBaseClasses = 'ml-auto -mr-1 -mt-0.5 rounded-md p-1.5 inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors'

/**
 * Alert icon container base classes
 */
export const alertIconContainerClasses = 'flex-shrink-0'

/**
 * Alert content container classes
 */
export const alertContentClasses = 'flex-1 ml-3'

/**
 * SVG path for success (check circle) icon
 */
export const alertSuccessIconPath = 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'

/**
 * SVG path for warning (exclamation triangle) icon
 */
export const alertWarningIconPath = 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'

/**
 * SVG path for error (x circle) icon
 */
export const alertErrorIconPath = 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'

/**
 * SVG path for info (information circle) icon
 */
export const alertInfoIconPath = 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'

/**
 * SVG path for close (x) icon
 */
export const alertCloseIconPath = 'M6 18L18 6M6 6l12 12'

/**
 * Get icon path based on alert type
 * @param type - Alert type
 * @returns SVG path string for the icon
 */
export function getAlertIconPath(type: AlertType): string {
  const iconPaths: Record<AlertType, string> = {
    success: alertSuccessIconPath,
    warning: alertWarningIconPath,
    error: alertErrorIconPath,
    info: alertInfoIconPath,
  }
  
  return iconPaths[type]
}
