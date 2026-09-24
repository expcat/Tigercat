/**
 * Modal component utility functions
 */

import { classNames } from './class-names'
import type { ModalSize } from '../types/modal'
import type { SwipeGesture } from './gesture-utils'

/**
 * Base modal wrapper classes
 */
export const modalWrapperClasses = 'fixed inset-0 overflow-hidden pointer-events-none'

/**
 * Modal mask/overlay classes
 */
export const modalMaskClasses =
  'fixed inset-0 pointer-events-auto bg-[var(--tiger-component-modal-overlay-bg)] backdrop-blur-[2px] tiger-motion-aware [transition:var(--tiger-transition-base)]'

/**
 * Modal container classes (for centering)
 */
export const getModalContainerClasses = (centered: boolean) => {
  return classNames(
    'flex h-full max-h-full min-h-0',
    centered ? 'items-center justify-center p-4' : 'items-start justify-center pt-16 pb-4 px-4'
  )
}

/**
 * Modal content wrapper classes
 */
/** Dialog is capped to the viewport. Only the body scrolls; header and footer stay put. */
export const modalContentWrapperClasses =
  'relative flex min-h-0 max-h-[90dvh] w-full flex-col pointer-events-auto overflow-hidden rounded-[var(--tiger-radius-xl)] bg-[var(--tiger-surface)] shadow-xl tiger-motion-aware [transition:var(--tiger-transition-base)]'

/** Same 90dvh cap as the dialog. The sheet only changes edge and radius. */
export const modalMobileSheetClasses =
  'max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:top-auto max-md:!w-screen max-md:max-w-none max-md:rounded-t-[var(--tiger-radius-xl)] max-md:rounded-b-none'

/** Inline duration wins over the transition shorthand while dragging. */
export const modalDragStyle = { transitionDuration: '0ms' } as const

/**
 * Modal size classes
 */
export const modalSizeClasses: Record<ModalSize, string> = {
  sm: 'w-full max-w-[var(--tiger-component-modal-width-sm)]',
  md: 'w-full max-w-[var(--tiger-component-modal-width-md)]',
  lg: 'w-full max-w-[var(--tiger-component-modal-width-lg)]',
  xl: 'w-full max-w-[var(--tiger-component-modal-width-xl)]',
  full: 'h-full w-full max-w-none rounded-none'
}

/**
 * Modal header classes
 */
export const modalHeaderClasses =
  'flex items-center justify-between px-6 py-4 border-b border-[var(--tiger-border)]'

/**
 * Modal title classes
 */
export const modalTitleClasses = 'text-lg font-semibold text-[var(--tiger-text)]'

/**
 * Modal close button classes
 */
export const modalCloseButtonClasses =
  'text-[var(--tiger-text-secondary)] hover:text-[var(--tiger-text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary)]/40 rounded-[var(--tiger-radius-md)] p-1 transition-colors'

/**
 * Modal body classes
 */
export const modalBodyClasses =
  'min-h-0 flex-1 overflow-y-auto px-6 py-4 text-[var(--tiger-text)]'

/**
 * Modal footer classes
 */
export const modalFooterClasses =
  'flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--tiger-border)]'

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
