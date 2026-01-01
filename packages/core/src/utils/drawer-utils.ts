/**
 * Drawer utility functions
 */

import { classNames } from './class-names'
import type { DrawerPlacement, DrawerSize } from '../types/drawer'

/**
 * Get mask/backdrop classes
 */
export function getDrawerMaskClasses(visible: boolean): string {
  return classNames(
    'fixed inset-0 bg-black transition-opacity duration-300',
    visible ? 'opacity-50' : 'opacity-0 pointer-events-none'
  )
}

/**
 * Get drawer container classes (wrapper positioned over mask)
 */
export function getDrawerContainerClasses(zIndex: number): string {
  return classNames(
    'fixed inset-0 overflow-hidden pointer-events-none',
    `z-[${zIndex}]`
  )
}

/**
 * Get drawer panel classes based on placement and visibility
 */
export function getDrawerPanelClasses(
  placement: DrawerPlacement,
  visible: boolean,
  size: DrawerSize
): string {
  const baseClasses = 'absolute bg-white shadow-xl transition-transform duration-300 ease-in-out pointer-events-auto'
  
  // Size mappings
  const sizeMap: Record<DrawerSize, { width: string; height: string }> = {
    sm: { width: 'w-64', height: 'h-48' },
    md: { width: 'w-96', height: 'h-64' },
    lg: { width: 'w-[32rem]', height: 'h-96' },
    xl: { width: 'w-[48rem]', height: 'h-[32rem]' },
    full: { width: 'w-full', height: 'h-full' },
  }

  // Placement-specific classes
  const placementClasses: Record<DrawerPlacement, string> = {
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
    ),
  }

  return classNames(baseClasses, placementClasses[placement])
}

/**
 * Get drawer header classes
 */
export function getDrawerHeaderClasses(): string {
  return 'flex items-center justify-between px-6 py-4 border-b border-gray-200'
}

/**
 * Get drawer body classes
 */
export function getDrawerBodyClasses(customClass?: string): string {
  return classNames('flex-1 overflow-y-auto px-6 py-4', customClass)
}

/**
 * Get drawer footer classes
 */
export function getDrawerFooterClasses(): string {
  return 'px-6 py-4 border-t border-gray-200'
}

/**
 * Get drawer close button classes
 */
export function getDrawerCloseButtonClasses(): string {
  return classNames(
    'inline-flex items-center justify-center',
    'w-8 h-8 rounded-md',
    'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
    'transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-[var(--tiger-primary,#2563eb)] focus:ring-offset-2'
  )
}

/**
 * Get drawer title classes
 */
export function getDrawerTitleClasses(): string {
  return 'text-lg font-semibold text-gray-900'
}
