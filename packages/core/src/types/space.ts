/**
 * Space component types and interfaces
 */

/**
 * Space direction types
 */
export type SpaceDirection = 'horizontal' | 'vertical'

/**
 * Space size types
 */
export type SpaceSize = 'sm' | 'md' | 'lg' | number

/**
 * Space align types
 */
export type SpaceAlign = 'start' | 'end' | 'center' | 'baseline' | 'stretch'

/**
 * Base space props interface
 */
export interface SpaceProps {
  /**
   * Space direction
   * @default 'horizontal'
   */
  direction?: SpaceDirection
  
  /**
   * Space size between items
   * Can be a preset size ('sm' | 'md' | 'lg') or a custom number (in pixels)
   * @default 'md'
   */
  size?: SpaceSize
  
  /**
   * Align items in the space
   * @default 'start'
   */
  align?: SpaceAlign
  
  /**
   * Whether to wrap items
   * @default false
   */
  wrap?: boolean
}

/**
 * Get gap size class or style based on SpaceSize
 */
export function getSpaceGapSize(size: SpaceSize = 'md'): { class?: string; style?: string } {
  if (typeof size === 'number') {
    return { style: `${size}px` }
  }
  
  const sizeMap: Record<Exclude<SpaceSize, number>, string> = {
    sm: 'gap-2',  // 8px
    md: 'gap-4',  // 16px
    lg: 'gap-6',  // 24px
  }
  
  return { class: sizeMap[size] }
}

/**
 * Get alignment class based on SpaceAlign
 */
export function getSpaceAlignClass(align: SpaceAlign = 'start'): string {
  const alignMap: Record<SpaceAlign, string> = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
  }
  
  return alignMap[align]
}

/**
 * Get flex direction class based on SpaceDirection
 */
export function getSpaceDirectionClass(direction: SpaceDirection = 'horizontal'): string {
  return direction === 'horizontal' ? 'flex-row' : 'flex-col'
}
