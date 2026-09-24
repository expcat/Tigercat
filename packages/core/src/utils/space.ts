/**
 * Space component utility functions
 */

import type { SpaceSize, SpaceProps } from '../types/space'
import { classNames } from './class-names'
import { devWarn } from './dev-warn'

/** Display rules previously injected at runtime. */
export const spaceBaseStyles = {
  '.tiger-space': {
    display: 'inline-flex'
  },
  '.tiger-space.tiger-flex-row': {
    flexDirection: 'row'
  },
  '.tiger-space.flex-col': {
    flexDirection: 'column'
  },
  '.tiger-space.flex-wrap': {
    flexWrap: 'wrap'
  }
} as const

type SpaceAlignValue = NonNullable<SpaceProps['align']>

const SIZE_CLASS: Record<string, string> = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6'
}

const ALIGN_CLASS: Record<SpaceAlignValue, string> = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
  baseline: 'items-baseline',
  stretch: 'items-stretch'
}

/**
 * Build all Tailwind classes for the Space component
 */
const SPACE_SIZES = new Set(['sm', 'md', 'lg'])

/**
 * Named sizes map to gap classes. Unknown names fall back to `md`.
 * Numeric gaps must be finite and non-negative.
 */
export function resolveSpaceSize(size: SpaceSize = 'md'): {
  className?: string
  gap?: string
} {
  if (typeof size === 'number') {
    if (!Number.isFinite(size) || size < 0) {
      devWarn('Space.size', `Space size ${String(size)} is not a finite non-negative number. Using md.`)
      return { className: SIZE_CLASS.md }
    }
    return { gap: `${size}px` }
  }
  if (SPACE_SIZES.has(size)) return { className: SIZE_CLASS[size] }
  devWarn('Space.size', `Unknown Space size "${String(size)}". Using md.`)
  return { className: SIZE_CLASS.md }
}

export function getSpaceClasses(
  { orientation = 'horizontal', size = 'md', align = 'start', wrap = false }: SpaceProps = {},
  className?: string
): string {
  const resolved = resolveSpaceSize(size)
  return classNames(
    'tiger-space inline-flex',
    orientation === 'horizontal' ? 'tiger-flex-row' : 'flex-col',
    ALIGN_CLASS[align],
    resolved.className,
    wrap && 'flex-wrap',
    className
  )
}

/**
 * Inline gap for a numeric size. Named sizes stay on classes.
 */
export function spaceGapPixels(size: SpaceSize | undefined): number | undefined {
  if (typeof size !== 'number') return undefined
  if (!Number.isFinite(size) || size < 0) {
    devWarn('space.size', `[Tigercat] Space gap ${String(size)} is ignored. Use a number >= 0.`)
    return 0
  }
  return size
}

export function getSpaceGapStyle(
  size: SpaceSize = 'md',
  verticalSize?: number
): Record<string, string> | undefined {
  const horizontal = spaceGapPixels(typeof size === 'number' ? size : undefined)
  const vertical = spaceGapPixels(verticalSize)
  if (horizontal === undefined && vertical === undefined) return undefined
  const style: Record<string, string> = {}
  if (horizontal !== undefined) style.columnGap = `${horizontal}px`
  if (vertical !== undefined) style.rowGap = `${vertical}px`
  else if (horizontal !== undefined && typeof size === 'number') {
    style.columnGap = `${horizontal}px`
  }
  return style
}

export function getSpaceStyle(size: SpaceSize = 'md'): Record<string, string> | undefined {
  const gap = resolveSpaceSize(size).gap
  return gap ? { gap } : undefined
}
