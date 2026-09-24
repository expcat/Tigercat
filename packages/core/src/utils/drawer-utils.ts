/**
 * Drawer utility functions
 */

import { classNames } from './class-names'
import type { DrawerPlacement, DrawerSize } from '../types/drawer'
import type { SwipeGesture, SwipeDirection } from './gesture-utils'
import { RESPONSIVE_BREAKPOINT_FALLBACK_PX } from './responsive'

/**
 * Get mask/backdrop classes
 */
export function getDrawerMaskClasses(visible: boolean): string {
  return classNames(
    'fixed inset-0 bg-[var(--tiger-component-drawer-overlay-bg)] backdrop-blur-[2px] tiger-motion-aware [transition:var(--tiger-transition-base)]',
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
    'absolute bg-[var(--tiger-surface)] shadow-xl pointer-events-auto tiger-motion-aware [transition:var(--tiger-transition-base)]'
  const mobileFullscreenClasses = 'max-md:inset-0 max-md:!w-screen max-md:!h-[100dvh]'

  const sizeMap: Record<DrawerSize, { width: string; height: string }> = {
    sm: {
      width: 'w-[var(--tiger-component-drawer-width-sm)]',
      height: 'h-48'
    },
    md: {
      width: 'w-[var(--tiger-component-drawer-width-md)]',
      height: 'h-64'
    },
    lg: {
      width: 'w-[var(--tiger-component-drawer-width-lg)]',
      height: 'h-96'
    },
    xl: {
      width: 'w-[var(--tiger-component-drawer-width-xl)]',
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

export interface DrawerSwipeCloseOptions {
  placement: DrawerPlacement
  /** Writing direction. `start` / `end` become a physical edge before the swipe axis. */
  direction?: 'ltr' | 'rtl'
  /**
   * Panel is full-bleed. The close swipe then follows the reading direction
   * outward (LTR right, RTL left) instead of the edge the panel came from.
   */
  fullscreen?: boolean
}

export function isDrawerMobileFullscreen(options: {
  fullscreenOnMobile: boolean
  viewportWidth: number
  mdMinWidth?: number
}): boolean {
  if (!options.fullscreenOnMobile) return false
  const md = options.mdMinWidth ?? RESPONSIVE_BREAKPOINT_FALLBACK_PX.md
  return options.viewportWidth < md
}

export function getDrawerSwipeCloseDirection(options: DrawerSwipeCloseOptions): SwipeDirection {
  const writing = options.direction ?? 'ltr'
  if (options.fullscreen) return writing === 'rtl' ? 'left' : 'right'
  const physical = resolveDrawerPlacement(options.placement, writing)
  const directionMap: Record<Exclude<DrawerPlacement, 'start' | 'end'>, SwipeDirection> = {
    left: 'left',
    right: 'right',
    top: 'up',
    bottom: 'down'
  }
  return directionMap[physical]
}

export function isDrawerSwipeCloseGesture(
  options: DrawerSwipeCloseOptions,
  gesture: SwipeGesture | null | undefined
): boolean {
  return Boolean(gesture && gesture.direction === getDrawerSwipeCloseDirection(options))
}

/**
 * Get drawer header classes
 */
export function getDrawerHeaderClasses(): string {
  return 'flex items-center justify-between px-6 py-4 border-b border-[var(--tiger-border)]'
}

/**
 * Get drawer body classes
 */
/** `false` removes the default padding. Custom spacing belongs on `bodyClassName`. */
export function getDrawerBodyClasses(customClass?: string, bodyPadding?: boolean): string {
  const padding = bodyPadding === false ? undefined : 'px-6 py-4'
  return classNames('flex-1 overflow-y-auto', padding, customClass)
}

/**
 * Get drawer footer classes
 */
export function getDrawerFooterClasses(): string {
  return 'px-6 py-4 border-t border-[var(--tiger-border)]'
}

/**
 * Get drawer close button classes
 */
export function getDrawerCloseButtonClasses(): string {
  return classNames(
    'inline-flex items-center justify-center',
    'w-8 h-8 rounded-[var(--tiger-radius-md)]',
    'text-[var(--tiger-text-secondary)] hover:text-[var(--tiger-text-secondary)] hover:bg-[var(--tiger-surface-muted)]',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary)]/40 focus:ring-offset-2'
  )
}

/**
 * Get drawer title classes
 */
export function getDrawerTitleClasses(): string {
  return 'text-lg font-semibold text-[var(--tiger-text)]'
}
