/**
 * Space component utility functions
 */

import type { SpaceSize, SpaceAlign, SpaceDirection } from '../types/space'

/**
 * Base class for Space component
 */
export const SPACE_BASE_CLASS = 'inline-flex'

/**
 * Get gap size class or style based on SpaceSize
 * @param size - Space size (preset or custom number)
 * @returns Object with class or style property
 */
export function getSpaceGapSize(size: SpaceSize = 'md'): { class?: string; style?: string } {
  if (typeof size === 'number') {
    return { style: `${size}px` }
  }

  const sizeMap: Record<Exclude<SpaceSize, number>, string> = {
    sm: 'gap-2', // 8px
    md: 'gap-4', // 16px
    lg: 'gap-6' // 24px
  }

  return { class: sizeMap[size] }
}

/**
 * Get alignment class based on SpaceAlign
 * @param align - Alignment option
 * @returns Tailwind alignment class
 */
export function getSpaceAlignClass(align: SpaceAlign = 'start'): string {
  const alignMap: Record<SpaceAlign, string> = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch'
  }

  return alignMap[align]
}

/**
 * Get flex direction class based on SpaceDirection
 * @param direction - Space direction
 * @returns Tailwind flex direction class
 */
export function getSpaceDirectionClass(direction: SpaceDirection = 'horizontal'): string {
  return direction === 'horizontal' ? 'flex-row' : 'flex-col'
}
