/**
 * Skeleton component types and interfaces
 */

/**
 * Skeleton variant types - different placeholder shapes
 */
export type SkeletonVariant = 'text' | 'avatar' | 'image' | 'button' | 'custom'

/**
 * Skeleton animation types
 */
export type SkeletonAnimation = 'pulse' | 'wave' | 'none'

/**
 * Skeleton shape types (for avatar variant)
 */
export type SkeletonShape = 'circle' | 'square'

/**
 * Base skeleton props interface
 */
export interface SkeletonProps {
  /**
   * Skeleton variant - determines the placeholder shape
   * @default 'text'
   */
  variant?: SkeletonVariant

  /**
   * Animation type
   * @default 'pulse'
   */
  animation?: SkeletonAnimation

  /**
   * Width of the skeleton
   * Can be a CSS value (e.g., '100px', '50%', '100%')
   * @default undefined (uses variant defaults)
   */
  width?: string

  /**
   * Height of the skeleton
   * Can be a CSS value (e.g., '20px', '100px')
   * @default undefined (uses variant defaults)
   */
  height?: string

  /**
   * Shape of the skeleton (for avatar variant)
   * @default 'circle'
   */
  shape?: SkeletonShape

  /**
   * Number of skeleton items to render (for text variant)
   * @default 1
   */
  rows?: number

  /**
   * Whether to render as a paragraph with varying widths (for text variant)
   * @default false
   */
  paragraph?: boolean

  /**
   * Additional CSS classes
   */
  className?: string
}
