/**
 * Alert component utilities
 * Shared styles and helpers for Alert components
 */

import { classNames } from './class-names'
import { closeIconPathD } from './icons/common'
import {
  statusErrorIconPath,
  statusInfoIconPath,
  statusSuccessIconPath,
  statusWarningIconPath
} from './icons/status'

import type { AlertSize, AlertType } from '../types/alert'

/**
 * Base classes for all alert variants.
 * `relative overflow-hidden` is the containing block for the countdown bar.
 */
export const alertBaseClasses =
  'relative overflow-hidden flex items-start rounded-[var(--tiger-component-alert-border-radius,var(--tiger-radius-md,0.5rem))] border tiger-motion-aware [transition:var(--tiger-transition-base,all_200ms_cubic-bezier(0.4,0,0.2,1))]'

/**
 * Size classes for alert variants.
 * `md` reads `--tiger-component-alert-*`; sm/lg stay on the type scale.
 */
export const alertSizeClasses: Record<AlertSize, string> = {
  sm: 'p-3 text-sm',
  md: 'px-[var(--tiger-component-alert-padding-x,1rem)] py-[var(--tiger-component-alert-padding-y,1rem)] text-[length:var(--tiger-component-alert-font-size,1rem)]',
  lg: 'p-5 text-lg'
} as const

/**
 * Icon size classes
 */
export const alertIconSizeClasses: Record<AlertSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-[var(--tiger-component-alert-icon-size,1.25rem)] w-[var(--tiger-component-alert-icon-size,1.25rem)]',
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
  'ms-auto -me-1 -mt-0.5 rounded-[var(--tiger-radius-md,0.5rem)] p-1.5 inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2 tiger-motion-aware transition-colors'

/**
 * Alert icon container base classes
 */
export const alertIconContainerClasses = 'flex-shrink-0'

/**
 * Content next to the type icon. Spacing is only applied when the icon is shown.
 */
export function getAlertContentClasses(showIcon: boolean): string {
  return classNames('flex-1 min-w-0', showIcon && 'ms-3')
}

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

/**
 * Static info/success/warning bars are not live regions. Empty shells never
 * are. `error` with content is `alert` (assertive). Callers may override.
 */
export function resolveAlertRole(type: AlertType, hasContent: boolean): 'alert' | undefined {
  if (!hasContent) return undefined
  return type === 'error' ? 'alert' : undefined
}

/**
 * Banner mode classes — full-width, no border-radius
 * @since 0.9.0
 */
export const alertBannerClasses = 'rounded-none border-x-0 w-full'

/**
 * Countdown progress bar container classes
 * @since 0.9.0
 */
export const alertCountdownContainerClasses = 'absolute inset-inline-0 bottom-0 h-1 overflow-hidden'

/**
 * Countdown progress bar classes. Duration is set via `animationDuration`.
 * @since 0.9.0
 */
export const alertCountdownBarClasses =
  'h-full w-full me-auto tiger-motion-aware tiger-alert-countdown'

/**
 * Plugin keyframes for the countdown bar (width shrinks toward inline-start).
 */
export const alertCountdownBaseStyles = {
  '@keyframes tiger-alert-countdown': {
    from: { width: '100%' },
    to: { width: '0%' }
  },
  '.tiger-alert-countdown': {
    animationName: 'tiger-alert-countdown',
    animationTimingFunction: 'linear',
    animationFillMode: 'forwards'
  }
} as const

/**
 * Countdown bar color classes by alert type
 * @since 0.9.0
 */
export const alertCountdownColorClasses: Record<AlertType, string> = {
  success: 'bg-[var(--tiger-success,#16a34a)]',
  warning: 'bg-[var(--tiger-warning,#d97706)]',
  error: 'bg-[var(--tiger-error,#dc2626)]',
  info: 'bg-[var(--tiger-info,#3b82f6)]'
}
