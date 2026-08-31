/**
 * Space component utility functions
 */

import type { SpaceSize, SpaceProps } from '../types/space'
import { classNames } from './class-names'
import { isBrowser } from './env'

export const SPACE_STYLE_ID = 'tiger-ui-space-styles'

export const SPACE_CSS = `
.tiger-space {
  display: inline-flex;
}
.tiger-space.tiger-flex-row {
  flex-direction: row;
}
[dir="rtl"] .tiger-space.tiger-flex-row,
[data-tiger-dir="rtl"] .tiger-space.tiger-flex-row {
  flex-direction: row-reverse;
}
.tiger-space.flex-col {
  flex-direction: column;
}
.tiger-space.flex-wrap {
  flex-wrap: wrap;
}
`

export function injectSpaceStyles(): void {
  if (!isBrowser()) return
  if (document.getElementById(SPACE_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = SPACE_STYLE_ID
  style.textContent = SPACE_CSS
  document.head.appendChild(style)
}

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
export function getSpaceClasses(
  { direction = 'horizontal', size = 'md', align = 'start', wrap = false }: SpaceProps = {},
  className?: string
): string {
  injectSpaceStyles()
  return classNames(
    'tiger-space inline-flex',
    direction === 'horizontal' ? 'tiger-flex-row' : 'flex-col',
    ALIGN_CLASS[align],
    typeof size === 'string' ? SIZE_CLASS[size] : undefined,
    wrap && 'flex-wrap',
    className
  )
}

/**
 * Build inline style for numeric gap size
 */
export function getSpaceStyle(size: SpaceSize = 'md'): Record<string, string> | undefined {
  return typeof size === 'number' ? { gap: `${size}px` } : undefined
}
