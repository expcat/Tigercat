/**
 * Modal component utility functions
 */

import { classNames } from './class-names'
import type { ModalSize } from '../types/modal'

/**
 * Base modal wrapper classes
 */
export const modalWrapperClasses = 'fixed inset-0 overflow-y-auto'

/**
 * Modal mask/overlay classes
 */
export const modalMaskClasses =
  'fixed inset-0 bg-[var(--tiger-modal-mask,rgba(0,0,0,0.5))] transition-opacity'

/**
 * Modal container classes (for centering)
 */
export const getModalContainerClasses = (centered: boolean) => {
  return classNames(
    'flex min-h-full',
    centered ? 'items-center justify-center p-4' : 'items-start justify-center pt-16 pb-4 px-4'
  )
}

/**
 * Modal content wrapper classes
 */
export const modalContentWrapperClasses =
  'relative transform overflow-hidden rounded-lg bg-[var(--tiger-surface,#ffffff)] shadow-xl transition-all'

/**
 * Modal size classes
 */
export const modalSizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm w-full',
  md: 'max-w-md w-full',
  lg: 'max-w-lg w-full',
  xl: 'max-w-xl w-full',
  full: 'max-w-full w-full mx-4'
}

/**
 * Modal header classes
 */
export const modalHeaderClasses =
  'flex items-center justify-between px-6 py-4 border-b border-[var(--tiger-border,#e5e7eb)]'

/**
 * Modal title classes
 */
export const modalTitleClasses = 'text-lg font-semibold text-[var(--tiger-text,#111827)]'

/**
 * Modal close button classes
 */
export const modalCloseButtonClasses =
  'text-[var(--tiger-text-muted,#9ca3af)] hover:text-[var(--tiger-text-muted,#6b7280)] focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)] rounded-md p-1 transition-colors'

/**
 * Modal body classes
 */
export const modalBodyClasses = 'px-6 py-4 text-[var(--tiger-text,#374151)]'

/**
 * Modal footer classes
 */
export const modalFooterClasses =
  'flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--tiger-border,#e5e7eb)] bg-[var(--tiger-surface-muted,#f9fafb)]'

/**
 * Get complete modal content classes
 */
export function getModalContentClasses(size: ModalSize, className?: string): string {
  return classNames(modalContentWrapperClasses, modalSizeClasses[size], className)
}
