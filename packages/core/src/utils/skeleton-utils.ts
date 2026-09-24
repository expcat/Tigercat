/**
 * Skeleton component utilities
 * Shared styles and helpers for Skeleton components
 */

import type { SkeletonVariant, SkeletonAnimation, SkeletonShape } from '../types/skeleton'
import { classNames } from './class-names'
import { devWarn } from './dev-warn'

/** Pulse, wave, and reduced motion. Rendering must not write `document.head`. */
export const skeletonBaseStyles = {
  '@keyframes tiger-skeleton-pulse': {
    '0%, 100%': { opacity: '1' },
    '50%': { opacity: '0.5' }
  },
  '@keyframes tiger-skeleton-wave': {
    '0%': { backgroundPosition: '100% 0' },
    '100%': { backgroundPosition: '-100% 0' }
  },
  '.tiger-skeleton-pulse': {
    animationName: 'tiger-skeleton-pulse',
    animationDuration: '1.5s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite'
  },
  '.tiger-skeleton-wave': {
    backgroundImage:
      'linear-gradient(90deg, var(--tiger-skeleton-bg) 0%, var(--tiger-skeleton-bg-alt) 50%, var(--tiger-skeleton-bg) 100%)',
    backgroundSize: '200% 100%',
    animationName: 'tiger-skeleton-wave',
    animationDuration: '1.6s',
    animationTimingFunction: 'ease-in-out',
    animationIterationCount: 'infinite'
  },
  '@media (prefers-reduced-motion: reduce)': {
    '.tiger-skeleton-pulse, .tiger-skeleton-wave': {
      animation: 'none'
    }
  }
} as const

/** Small cap so a caller cannot mount hundreds of bars. */
export const SKELETON_MAX_ROWS = 6

export function resolveSkeletonRows(rows: number | undefined): number {
  if (rows == null || !Number.isFinite(rows)) return 1
  const whole = Math.floor(rows)
  if (whole > SKELETON_MAX_ROWS) {
    devWarn(
      'Skeleton.rows',
      `Skeleton rows are capped at ${SKELETON_MAX_ROWS} (received ${whole}).`
    )
    return SKELETON_MAX_ROWS
  }
  return Math.max(1, whole)
}

/** Bar fill: optional `--tiger-skeleton-bg`, then registered `--tiger-surface-muted`. */
export const skeletonBaseClasses =
  'tiger-skeleton bg-[var(--tiger-skeleton-bg)] rounded-[var(--tiger-radius-sm)]'

/**
 * Animation classes for skeleton.
 * `wave` sweeps a highlight; `pulse` is opacity only. Both honor reduced motion.
 */
export const skeletonAnimationClasses: Record<SkeletonAnimation, string> = {
  pulse: 'tiger-motion-aware tiger-skeleton-pulse',
  wave: 'tiger-motion-aware tiger-skeleton-wave',
  none: ''
} as const

/**
 * Default size utilities. Applied as classes so user `style` / `h-*` can win.
 * `custom` has no default geometry.
 */
export const skeletonVariantSizeClasses: Record<
  SkeletonVariant,
  { width?: string; height?: string }
> = {
  text: { width: 'w-full', height: 'h-4' },
  avatar: { width: 'w-10', height: 'h-10' },
  image: { width: 'w-full', height: 'h-48' },
  button: { width: 'w-24', height: 'h-10' },
  custom: {}
}

/**
 * Shape classes for skeleton (mainly for avatar variant)
 */
export const skeletonShapeClasses: Record<SkeletonShape, string> = {
  circle: 'rounded-full',
  square: 'rounded-[var(--tiger-radius-md)]'
} as const

export interface SkeletonClassOptions {
  width?: string
  height?: string
  /** Skip default width class (wrapper already sizes the bar). */
  omitWidth?: boolean
  /** Skip default height class. */
  omitHeight?: boolean
}

/**
 * Get skeleton classes based on variant and animation
 */
export function getSkeletonClasses(
  variant: SkeletonVariant = 'text',
  animation: SkeletonAnimation = 'pulse',
  shape: SkeletonShape = 'circle',
  options: SkeletonClassOptions = {}
): string {
  const size = skeletonVariantSizeClasses[variant]
  return classNames(
    skeletonBaseClasses,
    animation !== 'none' ? skeletonAnimationClasses[animation] : undefined,
    variant === 'avatar' ? skeletonShapeClasses[shape] : undefined,
    !options.width && !options.omitWidth ? size.width : undefined,
    !options.height && !options.omitHeight ? size.height : undefined
  )
}

/**
 * Inline size only when the caller passed width/height.
 * Variant defaults stay on classes so `style.height` / `h-*` are not crushed.
 */
export function getSkeletonInlineStyle(
  width?: string,
  height?: string
): { width?: string; height?: string } | undefined {
  if (!width && !height) return undefined
  const style: { width?: string; height?: string } = {}
  if (width) style.width = width
  if (height) style.height = height
  return style
}

/**
 * Get width for paragraph text skeleton rows.
 * Percentages are relative to the root, which still honors `width`.
 */
export function getParagraphRowWidth(rowIndex: number, totalRows: number): string {
  if (rowIndex === totalRows - 1) {
    return '60%'
  }

  const widths = ['100%', '95%', '98%', '92%', '96%']
  return widths[rowIndex % widths.length]
}

export function isSkeletonNamed(ariaLabel?: unknown, ariaLabelledBy?: unknown): boolean {
  const label = typeof ariaLabel === 'string' && ariaLabel.trim() !== ''
  const labelledBy = typeof ariaLabelledBy === 'string' && ariaLabelledBy.trim() !== ''
  return label || labelledBy
}

/**
 * Parse aria-hidden from boolean or HTML string attrs (`"false"` / `"true"`).
 * Decorative by default; named skeletons are not hidden.
 */
export function resolveSkeletonAriaHidden(raw: unknown, named: boolean): boolean | undefined {
  if (raw === false || raw === 'false') return false
  if (raw === true || raw === 'true' || raw === '') return true
  if (named) return undefined
  return true
}
