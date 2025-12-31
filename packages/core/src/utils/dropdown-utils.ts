/**
 * Dropdown utility functions
 */
import { classNames } from './class-names'
import type { DropdownPlacement } from '../types/dropdown'

/**
 * Get base dropdown container classes
 */
export function getDropdownContainerClasses(): string {
  return classNames(
    'tiger-dropdown',
    'relative',
    'inline-block'
  )
}

/**
 * Get dropdown trigger classes
 */
export function getDropdownTriggerClasses(disabled: boolean): string {
  return classNames(
    'tiger-dropdown-trigger',
    'cursor-pointer',
    disabled && 'cursor-not-allowed opacity-50'
  )
}

/**
 * Get dropdown menu wrapper classes
 */
export function getDropdownMenuWrapperClasses(
  visible: boolean,
  placement: DropdownPlacement
): string {
  const positionClasses = getPlacementClasses(placement)
  
  return classNames(
    'tiger-dropdown-menu-wrapper',
    'absolute',
    'z-50',
    positionClasses,
    visible ? 'block' : 'hidden'
  )
}

/**
 * Get dropdown menu classes
 */
export function getDropdownMenuClasses(): string {
  return classNames(
    'tiger-dropdown-menu',
    'min-w-[160px]',
    'py-1',
    'bg-white',
    'rounded-md',
    'shadow-lg',
    'border',
    'border-gray-200',
    'dark:bg-gray-800',
    'dark:border-gray-700'
  )
}

/**
 * Get dropdown item classes
 */
export function getDropdownItemClasses(
  disabled: boolean,
  divided: boolean
): string {
  return classNames(
    'tiger-dropdown-item',
    'flex',
    'items-center',
    'gap-2',
    'px-4',
    'py-2',
    'text-sm',
    'text-gray-700',
    'dark:text-gray-200',
    'transition-colors',
    'duration-150',
    divided && 'border-t border-gray-200 dark:border-gray-700',
    disabled
      ? 'cursor-not-allowed opacity-50'
      : classNames(
          'cursor-pointer',
          'hover:bg-gray-100',
          'dark:hover:bg-gray-700',
          'active:bg-gray-200',
          'dark:active:bg-gray-600'
        )
  )
}

/**
 * Get placement-specific positioning classes
 */
function getPlacementClasses(placement: DropdownPlacement): string {
  const placementMap: Record<DropdownPlacement, string> = {
    'bottom-start': 'top-full left-0 mt-2',
    'bottom': 'top-full left-1/2 -translate-x-1/2 mt-2',
    'bottom-end': 'top-full right-0 mt-2',
    'top-start': 'bottom-full left-0 mb-2',
    'top': 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    'top-end': 'bottom-full right-0 mb-2',
    'left-start': 'right-full top-0 mr-2',
    'left': 'right-full top-1/2 -translate-y-1/2 mr-2',
    'left-end': 'right-full bottom-0 mr-2',
    'right-start': 'left-full top-0 ml-2',
    'right': 'left-full top-1/2 -translate-y-1/2 ml-2',
    'right-end': 'left-full bottom-0 ml-2',
  }
  
  return placementMap[placement] || placementMap['bottom-start']
}
