/**
 * Drawer utility functions
 */

import { classNames } from './class-names'
import type { DrawerPlacement, DrawerSize } from '../types/drawer'
import type { SwipeGesture, SwipeDirection } from './gesture-utils'

/**
 * Get mask/backdrop classes
 */
export function getDrawerMaskClasses(visible: boolean): string {
  return classNames(
    'fixed inset-0 bg-[var(--tiger-component-drawer-overlay-bg,rgba(0,0,0,0.45))] backdrop-blur-[2px] tiger-motion-aware [transition:var(--tiger-transition-base,opacity_300ms_ease)]',
    visible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
  )
}

/**
 * Get drawer container classes (wrapper positioned over mask)
 */
export function getDrawerContainerClasses(): string {
  return 'fixed inset-0 overflow-hidden pointer-events-none'
}

/**
 * Get drawer panel classes based on placement and visibility
 */
export function getDrawerPanelClasses(
  placement: Exclude<DrawerPlacement, 'start' | 'end'>,
  visible: boolean,
  size: DrawerSize,
  fullscreenOnMobile: boolean = true
): string {
  const baseClasses =
    'absolute bg-[var(--tiger-surface,#ffffff)] shadow-xl pointer-events-auto tiger-motion-aware [transition:var(--tiger-transition-base,transform_300ms_ease)]'
  const mobileFullscreenClasses = 'max-md:inset-0 max-md:!w-screen max-md:!h-[100dvh]'

  const sizeMap: Record<DrawerSize, { width: string; height: string }> = {
    sm: {
      width: 'w-[var(--tiger-component-drawer-width-sm,256px)]',
      height: 'h-48'
    },
    md: {
      width: 'w-[var(--tiger-component-drawer-width-md,378px)]',
      height: 'h-64'
    },
    lg: {
      width: 'w-[var(--tiger-component-drawer-width-lg,520px)]',
      height: 'h-96'
    },
    xl: {
      width: 'w-[var(--tiger-component-drawer-width-xl,680px)]',
      height: 'h-[32rem]'
    },
    full: { width: 'w-full', height: 'h-full' }
  }

  // Placement-specific classes
  const placementClasses: Record<Exclude<DrawerPlacement, 'start' | 'end'>, string> = {
    left: classNames(
      'top-0 bottom-0 left-0',
      sizeMap[size].width,
      visible ? 'translate-x-0' : '-translate-x-full'
    ),
    right: classNames(
      'top-0 bottom-0 right-0',
      sizeMap[size].width,
      visible ? 'translate-x-0' : 'translate-x-full'
    ),
    top: classNames(
      'top-0 left-0 right-0',
      sizeMap[size].height,
      visible ? 'translate-y-0' : '-translate-y-full'
    ),
    bottom: classNames(
      'bottom-0 left-0 right-0',
      sizeMap[size].height,
      visible ? 'translate-y-0' : 'translate-y-full'
    )
  }

  return classNames(
    baseClasses,
    placementClasses[placement],
    fullscreenOnMobile && mobileFullscreenClasses
  )
}

export function resolveDrawerPlacement(
  placement: DrawerPlacement,
  direction: 'ltr' | 'rtl' = 'ltr'
): Exclude<DrawerPlacement, 'start' | 'end'> {
  if (placement === 'start') return direction === 'rtl' ? 'right' : 'left'
  if (placement === 'end') return direction === 'rtl' ? 'left' : 'right'
  return placement
}

export function getDrawerSwipeCloseDirection(
  placement: Exclude<DrawerPlacement, 'start' | 'end'>
): SwipeDirection {
  const directionMap: Record<Exclude<DrawerPlacement, 'start' | 'end'>, SwipeDirection> = {
    left: 'left',
    right: 'right',
    top: 'up',
    bottom: 'down'
  }

  return directionMap[placement]
}

export function isDrawerSwipeCloseGesture(
  placement: Exclude<DrawerPlacement, 'start' | 'end'>,
  gesture: SwipeGesture | null | undefined
): boolean {
  return Boolean(gesture && gesture.direction === getDrawerSwipeCloseDirection(placement))
}

/**
 * Get drawer header classes
 */
export function getDrawerHeaderClasses(): string {
  return 'flex items-center justify-between px-6 py-4 border-b border-[var(--tiger-border,#e5e7eb)]'
}

/**
 * Get drawer body classes
 */
export function getDrawerBodyClasses(customClass?: string, bodyPadding?: boolean | string): string {
  const padding =
    bodyPadding === false ? undefined : typeof bodyPadding === 'string' ? bodyPadding : 'px-6 py-4'
  return classNames('flex-1 overflow-y-auto', padding, customClass)
}

/**
 * Get drawer footer classes
 */
export function getDrawerFooterClasses(): string {
  return 'px-6 py-4 border-t border-[var(--tiger-border,#e5e7eb)]'
}

/**
 * Get drawer close button classes
 */
export function getDrawerCloseButtonClasses(): string {
  return classNames(
    'inline-flex items-center justify-center',
    'w-8 h-8 rounded-[var(--tiger-radius-md,0.5rem)]',
    'text-[var(--tiger-text-muted,#9ca3af)] hover:text-[var(--tiger-text-muted,#6b7280)] hover:bg-[var(--tiger-surface-muted,#f9fafb)]',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)]/40 focus:ring-offset-2'
  )
}

/**
 * Get drawer title classes
 */
export function getDrawerTitleClasses(): string {
  return 'text-lg font-semibold text-[var(--tiger-text,#111827)]'
}
