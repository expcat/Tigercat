/**
 * Space component utility functions
 */

import type { SpaceSize, SpaceAlign, SpaceProps } from '../types/space'
import { classNames } from './class-names'

const SIZE_CLASS: Record<string, string> = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6'
}

const ALIGN_CLASS: Record<SpaceAlign, string> = {
  start: 'items-start',
  end: 'items-end',
  center: 'items-center',
  baseline: 'items-baseline',
  stretch: 'items-stretch'
}

/**
 * Build all Tailwind classes for the Space component
 * @param props - SpaceProps (direction, size, align, wrap)
 * @param className - Optional extra class string (e.g. React className)
 * @returns Combined class string
 */
export function getSpaceClasses(
  { direction = 'horizontal', size = 'md', align = 'start', wrap = false }: SpaceProps = {},
  className?: string
): string {
  return classNames(
    'inline-flex',
    direction === 'horizontal' ? 'flex-row' : 'flex-col',
    ALIGN_CLASS[align],
    typeof size === 'string' ? SIZE_CLASS[size] : undefined,
    wrap && 'flex-wrap',
    className
  )
}

/**
 * Build inline style for numeric gap size
 * @param size - SpaceSize (only numeric values produce a style)
 * @returns Style object with gap property, or undefined
 */
export function getSpaceStyle(size: SpaceSize = 'md'): Record<string, string> | undefined {
  return typeof size === 'number' ? { gap: `${size}px` } : undefined
}
