/**
 * Loading/Spinner component utilities
 */

import { classNames } from './class-names'
import { overlayZIndexClass } from './floating'
import type { LoadingSize, LoadingColor, LoadingVariant } from '../types/loading'

/**
 * Loading size dimension mappings
 */
export const loadingSizeClasses: Record<LoadingSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
  xl: 'h-16 w-16'
}

/**
 * Loading text size classes
 */
export const loadingTextSizeClasses: Record<LoadingSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
}

/**
 * Loading color classes using CSS variables
 */
export const loadingColorClasses: Record<LoadingColor, string> = {
  primary: 'text-[var(--tiger-primary,#2563eb)]',
  secondary: 'text-[var(--tiger-secondary,#4b5563)]',
  success: 'text-[var(--tiger-success,#16a34a)]',
  warning: 'text-[var(--tiger-warning,#ca8a04)]',
  danger: 'text-[var(--tiger-error,#dc2626)]',
  info: 'text-[var(--tiger-info,#3b82f6)]',
  default: 'text-[var(--tiger-text-muted,#6b7280)]'
}

/**
 * Base classes for loading container
 */
export const loadingContainerBaseClasses = 'inline-flex flex-col items-center justify-center gap-2'

/**
 * Base classes for fullscreen loading
 */
export const loadingFullscreenBaseClasses = `fixed inset-0 ${overlayZIndexClass.modal} flex items-center justify-center`

/**
 * Relative wrapper for the region overlay (children + mask).
 */
export const loadingRegionBaseClasses = 'relative'

/**
 * In-place overlay that covers the region content.
 */
export const loadingRegionOverlayClasses =
  'absolute inset-0 z-10 flex items-center justify-center bg-[color-mix(in_srgb,var(--tiger-surface,#ffffff)_85%,transparent)]'

/**
 * Default fullscreen / region mask: 90% of `--tiger-surface`.
 */
export const DEFAULT_LOADING_BACKGROUND =
  'color-mix(in srgb, var(--tiger-surface, #ffffff) 90%, transparent)'

/**
 * Base classes for spinner animation
 */
export const loadingSpinnerBaseClasses = 'tiger-motion-aware animate-spin'

/**
 * Get loading spinner classes
 */
export function getLoadingClasses(
  variant: LoadingVariant,
  size: LoadingSize,
  color: LoadingColor,
  customColor?: string
): string {
  const sizeClass = loadingSizeClasses[size]
  const colorClass = customColor ? '' : loadingColorClasses[color]

  const baseClasses = classNames(sizeClass, colorClass)

  switch (variant) {
    case 'dots':
    case 'bars':
      return baseClasses
    case 'pulse':
      return classNames(baseClasses, 'tiger-motion-aware animate-pulse')
    case 'spinner':
    case 'ring':
    default:
      return classNames(baseClasses, loadingSpinnerBaseClasses)
  }
}

export type LoadingSvgElement = {
  type: 'circle' | 'path'
  attrs: Record<string, unknown>
}

/**
 * SVG descriptor for spinner / ring / pulse.
 * `dots` / `bars` return an empty element list — callers should use
 * {@link getLoadingIndicator} instead of drawing the wrong glyph.
 */
export function getSpinnerSVG(variant: LoadingVariant): {
  viewBox: string
  elements: LoadingSvgElement[]
} {
  switch (variant) {
    case 'dots':
    case 'bars':
      return { viewBox: '0 0 24 24', elements: [] }

    case 'ring':
      return {
        viewBox: '0 0 24 24',
        elements: [
          {
            type: 'circle',
            attrs: {
              className: 'opacity-25',
              cx: '12',
              cy: '12',
              r: '10',
              stroke: 'currentColor',
              strokeWidth: '3',
              fill: 'none'
            }
          },
          {
            type: 'circle',
            attrs: {
              className: 'opacity-75',
              cx: '12',
              cy: '12',
              r: '10',
              stroke: 'currentColor',
              strokeWidth: '3',
              fill: 'none',
              strokeLinecap: 'round',
              strokeDasharray: '48 16'
            }
          }
        ]
      }

    case 'pulse':
      return {
        viewBox: '0 0 24 24',
        elements: [
          {
            type: 'circle',
            attrs: {
              cx: '12',
              cy: '12',
              r: '10',
              fill: 'currentColor'
            }
          }
        ]
      }

    case 'spinner':
    default:
      return {
        viewBox: '0 0 24 24',
        elements: [
          {
            type: 'circle',
            attrs: {
              className: 'opacity-25',
              cx: '12',
              cy: '12',
              r: '10',
              stroke: 'currentColor',
              strokeWidth: '4',
              fill: 'none'
            }
          },
          {
            type: 'path',
            attrs: {
              className: 'opacity-75',
              fill: 'currentColor',
              d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            }
          }
        ]
      }
  }
}

/**
 * Dots variant dimensions based on size
 */
export const dotsVariantConfig: Record<LoadingSize, { dotSize: string; gap: string }> = {
  sm: { dotSize: 'h-1 w-1', gap: 'gap-0.5' },
  md: { dotSize: 'h-1.5 w-1.5', gap: 'gap-1' },
  lg: { dotSize: 'h-2.5 w-2.5', gap: 'gap-1.5' },
  xl: { dotSize: 'h-4 w-4', gap: 'gap-2' }
}

/**
 * Bars variant dimensions based on size
 */
export const barsVariantConfig: Record<
  LoadingSize,
  { barWidth: string; barHeight: string; gap: string }
> = {
  sm: { barWidth: 'w-0.5', barHeight: 'h-3', gap: 'gap-0.5' },
  md: { barWidth: 'w-1', barHeight: 'h-5', gap: 'gap-1' },
  lg: { barWidth: 'w-1.5', barHeight: 'h-8', gap: 'gap-1.5' },
  xl: { barWidth: 'w-2', barHeight: 'h-12', gap: 'gap-2' }
}

export type LoadingAnimationIndex = 0 | 1 | 2

export const loadingDotsWrapperBaseClasses = 'flex items-center'

export const loadingBarsWrapperBaseClasses = 'flex items-end'

export const loadingDotBaseClasses = 'tiger-motion-aware rounded-full bg-current animate-bounce-dot'

export const loadingBarBaseClasses = 'tiger-motion-aware rounded-sm bg-current animate-scale-bar'

export function getLoadingTextClasses(
  size: LoadingSize,
  color: LoadingColor,
  customColor?: string
): string {
  return classNames(
    loadingTextSizeClasses[size],
    customColor ? '' : loadingColorClasses[color],
    'font-medium'
  )
}

export function getLoadingDotsWrapperClasses(size: LoadingSize): string {
  const config = dotsVariantConfig[size]
  return classNames(loadingDotsWrapperBaseClasses, config.gap)
}

export function getLoadingDotClasses(
  size: LoadingSize,
  index: LoadingAnimationIndex,
  colorClass?: string
): string {
  const config = dotsVariantConfig[size]
  return classNames(config.dotSize, loadingDotBaseClasses, colorClass, animationDelayClasses[index])
}

export function getLoadingBarsWrapperClasses(size: LoadingSize): string {
  const config = barsVariantConfig[size]
  return classNames(loadingBarsWrapperBaseClasses, config.gap)
}

export function getLoadingBarClasses(
  size: LoadingSize,
  index: LoadingAnimationIndex,
  colorClass?: string
): string {
  const config = barsVariantConfig[size]
  return classNames(
    config.barWidth,
    config.barHeight,
    loadingBarBaseClasses,
    colorClass,
    animationDelayClasses[index]
  )
}

/**
 * Animation delay classes for dots and bars
 */
export const animationDelayClasses = [
  'animation-delay-0',
  'animation-delay-150',
  'animation-delay-300'
]

export type LoadingIndicatorNode =
  | {
      kind: 'svg'
      className: string
      viewBox: string
      elements: LoadingSvgElement[]
    }
  | {
      kind: 'items'
      className: string
      items: Array<{ className: string }>
    }

/**
 * Framework-agnostic indicator tree. Vue/React only bind elements.
 */
export function getLoadingIndicator(options: {
  variant: LoadingVariant
  size: LoadingSize
  color: LoadingColor
  customColor?: string
}): LoadingIndicatorNode {
  const { variant, size, color, customColor } = options
  const colorClass = customColor ? '' : loadingColorClasses[color]
  const steps: LoadingAnimationIndex[] = [0, 1, 2]

  if (variant === 'dots') {
    return {
      kind: 'items',
      className: getLoadingDotsWrapperClasses(size),
      items: steps.map((index) => ({ className: getLoadingDotClasses(size, index, colorClass) }))
    }
  }

  if (variant === 'bars') {
    return {
      kind: 'items',
      className: getLoadingBarsWrapperClasses(size),
      items: steps.map((index) => ({ className: getLoadingBarClasses(size, index, colorClass) }))
    }
  }

  const svg = getSpinnerSVG(variant)
  return {
    kind: 'svg',
    className: getLoadingClasses(variant, size, color, customColor),
    viewBox: svg.viewBox,
    elements: svg.elements
  }
}

/**
 * Plugin keyframes for dots / bars. `tiger-motion-aware` already zeros
 * duration under prefers-reduced-motion.
 */
export const loadingAnimationBaseStyles = {
  '@keyframes tiger-bounce-dot': {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-100%)' }
  },
  '@keyframes tiger-scale-bar': {
    '0%, 100%': { transform: 'scaleY(1)' },
    '50%': { transform: 'scaleY(1.5)' }
  },
  '.animate-bounce-dot': {
    animation:
      'tiger-bounce-dot var(--tiger-motion-duration-slow,0.6s) var(--tiger-motion-ease-standard,ease-in-out) infinite'
  },
  '.animate-scale-bar': {
    animation:
      'tiger-scale-bar var(--tiger-motion-duration-slow,0.6s) var(--tiger-motion-ease-standard,ease-in-out) infinite'
  },
  '.animation-delay-0': { animationDelay: '0s' },
  '.animation-delay-150': { animationDelay: '0.15s' },
  '.animation-delay-300': { animationDelay: '0.3s' }
} as const
