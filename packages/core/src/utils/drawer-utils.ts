/**
 * Drawer utility functions
 */

import { classNames } from './class-names'
import type { DrawerPlacement, DrawerSize } from '../types/drawer'
import type { SwipeGesture, SwipeDirection } from './gesture-utils'
import { clampSheetDragDistance } from './gesture-utils'
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

/** How far a covered drawer shifts when a later drawer opens on the same edge. */
export const DRAWER_PUSH_DISTANCE_PX = 180

export interface DrawerLayerSnapshot {
  id: number
  placement: Exclude<DrawerPlacement, 'start' | 'end'>
}

const drawerLayers: DrawerLayerSnapshot[] = []
const drawerListeners = new Set<() => void>()

function emitDrawerLayers(): void {
  drawerListeners.forEach((listener) => listener())
}

export function getDrawerLayers(): readonly DrawerLayerSnapshot[] {
  return drawerLayers
}

export function subscribeDrawerLayers(listener: () => void): () => void {
  drawerListeners.add(listener)
  return () => {
    drawerListeners.delete(listener)
  }
}

export function registerDrawerLayer(
  placement: Exclude<DrawerPlacement, 'start' | 'end'>
): { id: number; release: () => void } {
  const id = drawerLayers.length === 0 ? 1 : drawerLayers[drawerLayers.length - 1].id + 1
  drawerLayers.push({ id, placement })
  emitDrawerLayers()
  let released = false
  return {
    id,
    release() {
      if (released) return
      released = true
      const index = drawerLayers.findIndex((layer) => layer.id === id)
      if (index >= 0) drawerLayers.splice(index, 1)
      emitDrawerLayers()
    }
  }
}

export function resetDrawerLayers(): void {
  drawerLayers.length = 0
  emitDrawerLayers()
}

export function drawerLayerIndex(id: number): number {
  return drawerLayers.findIndex((layer) => layer.id === id)
}

/** Only the top drawer paints a mask. Covered drawers are pushed aside. */
export function drawerShowsMask(id: number, mask: boolean): boolean {
  if (!mask) return false
  const index = drawerLayerIndex(id)
  return index >= 0 && index === drawerLayers.length - 1
}

export function drawerPushOffset(
  id: number,
  placement: Exclude<DrawerPlacement, 'start' | 'end'>
): { x: number; y: number } {
  const index = drawerLayerIndex(id)
  if (index < 0) return { x: 0, y: 0 }
  let above = 0
  for (let cursor = index + 1; cursor < drawerLayers.length; cursor += 1) {
    if (drawerLayers[cursor].placement === placement) above += 1
  }
  if (above === 0) return { x: 0, y: 0 }
  const distance = above * DRAWER_PUSH_DISTANCE_PX
  if (placement === 'right') return { x: -distance, y: 0 }
  if (placement === 'left') return { x: distance, y: 0 }
  if (placement === 'bottom') return { x: 0, y: -distance }
  return { x: 0, y: distance }
}

export function drawerResizeAxis(
  placement: Exclude<DrawerPlacement, 'start' | 'end'>
): 'width' | 'height' {
  return placement === 'top' || placement === 'bottom' ? 'height' : 'width'
}

/** Positive distance moves the panel toward its close edge. */
export function drawerFollowDistance(
  placement: Exclude<DrawerPlacement, 'start' | 'end'>,
  deltaX: number,
  deltaY: number
): number {
  if (placement === 'right') return clampSheetDragDistance(deltaX)
  if (placement === 'left') return clampSheetDragDistance(-deltaX)
  if (placement === 'bottom') return clampSheetDragDistance(deltaY)
  return clampSheetDragDistance(-deltaY)
}

export function drawerFollowTransform(
  placement: Exclude<DrawerPlacement, 'start' | 'end'>,
  distance: number
): string {
  const traveled = clampSheetDragDistance(distance)
  if (placement === 'right') return `translate3d(${traveled}px, 0, 0)`
  if (placement === 'left') return `translate3d(${-traveled}px, 0, 0)`
  if (placement === 'bottom') return `translate3d(0, ${traveled}px, 0)`
  return `translate3d(0, ${-traveled}px, 0)`
}

/** Dragging the inner edge. Positive grows the panel. */
export function drawerResizeDelta(
  placement: Exclude<DrawerPlacement, 'start' | 'end'>,
  deltaX: number,
  deltaY: number
): number {
  if (placement === 'right') return -deltaX
  if (placement === 'left') return deltaX
  if (placement === 'bottom') return -deltaY
  return deltaY
}
