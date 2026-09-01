/**
 * Modal component utility functions
 */

import { classNames } from './class-names'
import type { ModalSize } from '../types/modal'
import type { SwipeGesture } from './gesture-utils'

/**
 * Base modal wrapper classes
 */
export const modalWrapperClasses = 'fixed inset-0 overflow-y-auto pointer-events-none'

/**
 * Modal mask/overlay classes
 */
export const modalMaskClasses =
  'fixed inset-0 pointer-events-auto bg-[var(--tiger-component-modal-overlay-bg,rgba(0,0,0,0.45))] backdrop-blur-[2px] tiger-motion-aware [transition:var(--tiger-transition-base,opacity_300ms_ease)]'

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
  'relative pointer-events-auto overflow-hidden rounded-[var(--tiger-radius-xl,1rem)] bg-[var(--tiger-surface,#ffffff)] shadow-xl tiger-motion-aware [transition:var(--tiger-transition-base,opacity_300ms_ease,transform_300ms_ease)]'

export const modalMobileSheetClasses =
  'max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:!w-screen max-md:max-w-none max-md:max-h-[90dvh] max-md:flex max-md:flex-col max-md:rounded-t-[var(--tiger-radius-xl,1rem)] max-md:rounded-b-none'

/**
 * Modal size classes
 */
export const modalSizeClasses: Record<ModalSize, string> = {
  sm: 'w-full max-w-[var(--tiger-component-modal-width-sm,400px)]',
  md: 'w-full max-w-[var(--tiger-component-modal-width-md,520px)]',
  lg: 'w-full max-w-[var(--tiger-component-modal-width-lg,680px)]',
  xl: 'w-full max-w-[var(--tiger-component-modal-width-xl,860px)]',
  full: 'h-full w-full max-w-none rounded-none'
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
  'text-[var(--tiger-text-muted,#9ca3af)] hover:text-[var(--tiger-text-muted,#6b7280)] focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)]/40 rounded-[var(--tiger-radius-md,0.5rem)] p-1 transition-colors'

/**
 * Modal body classes
 */
export const modalBodyClasses =
  'min-h-0 flex-1 overflow-y-auto px-6 py-4 text-[var(--tiger-text,#374151)]'

/**
 * Modal footer classes
 */
export const modalFooterClasses =
  'flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--tiger-border,#e5e7eb)]'

/**
 * Get complete modal content classes
 */
export function getModalContentClasses(
  size: ModalSize,
  className?: string,
  mobileSheet = false
): string {
  return classNames(
    modalContentWrapperClasses,
    modalSizeClasses[size],
    mobileSheet && modalMobileSheetClasses,
    className
  )
}

export function isModalSheetSwipeCloseGesture(gesture: SwipeGesture | null | undefined): boolean {
  return Boolean(gesture && gesture.direction === 'down')
}
