/**
 * Skeleton component utilities
 * Shared styles and helpers for Skeleton components
 */

import type {
  SkeletonVariant,
  SkeletonAnimation,
  SkeletonShape,
} from '../types/skeleton';

export const skeletonBaseClasses =
  'bg-[var(--tiger-skeleton-bg,#e5e7eb)] rounded';

/**
 * Animation classes for skeleton
 */
export const skeletonAnimationClasses: Record<SkeletonAnimation, string> = {
  pulse: 'animate-pulse',
  wave: 'animate-pulse bg-gradient-to-r from-[var(--tiger-skeleton-bg,#e5e7eb)] via-[var(--tiger-skeleton-bg-alt,#d1d5db)] to-[var(--tiger-skeleton-bg,#e5e7eb)] bg-[length:200%_100%]',
  none: '',
} as const;

/**
 * Default dimensions for different skeleton variants
 */
export const skeletonVariantDefaults: Record<
  SkeletonVariant,
  { width?: string; height: string }
> = {
  text: {
    width: '100%',
    height: '1rem', // ~16px
  },
  avatar: {
    width: '2.5rem', // 40px (matches md avatar)
    height: '2.5rem',
  },
  image: {
    width: '100%',
    height: '12rem', // ~192px
  },
  button: {
    width: '6rem', // ~96px
    height: '2.5rem', // ~40px
  },
  custom: {
    width: '100%',
    height: '1rem',
  },
} as const;

/**
 * Shape classes for skeleton (mainly for avatar variant)
 */
export const skeletonShapeClasses: Record<SkeletonShape, string> = {
  circle: 'rounded-full',
  square: 'rounded-md',
} as const;

/**
 * Get skeleton classes based on variant and animation
 * @param variant - Skeleton variant
 * @param animation - Animation type
 * @param shape - Shape (for avatar variant)
 * @returns Combined CSS classes
 */
export function getSkeletonClasses(
  variant: SkeletonVariant = 'text',
  animation: SkeletonAnimation = 'pulse',
  shape: SkeletonShape = 'circle'
): string {
  const classes = [skeletonBaseClasses];

  if (animation !== 'none') classes.push(skeletonAnimationClasses[animation]);
  if (variant === 'avatar') classes.push(skeletonShapeClasses[shape]);

  return classes.join(' ');
}

/**
 * Get skeleton dimensions based on variant and custom values
 * @param variant - Skeleton variant
 * @param customWidth - Custom width value
 * @param customHeight - Custom height value
 * @returns Object with width and height styles
 */
export function getSkeletonDimensions(
  variant: SkeletonVariant = 'text',
  customWidth?: string,
  customHeight?: string
): { width?: string; height: string } {
  const defaults = skeletonVariantDefaults[variant];

  return {
    width: customWidth || defaults.width,
    height: customHeight || defaults.height,
  };
}

/**
 * Get width for paragraph text skeleton rows
 * Each row has a slightly different width for natural appearance
 * @param rowIndex - Index of the row (0-based)
 * @param totalRows - Total number of rows
 * @returns Width percentage
 */
export function getParagraphRowWidth(
  rowIndex: number,
  totalRows: number
): string {
  // Last row is typically shorter
  if (rowIndex === totalRows - 1) {
    return '60%';
  }

  // Vary the width slightly for natural appearance
  const widths = ['100%', '95%', '98%', '92%', '96%'];
  return widths[rowIndex % widths.length];
}
