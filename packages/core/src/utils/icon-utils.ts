import { type IconSize } from '../types/icon'
import { devWarn } from './dev-warn'
import { ICON_STROKE_LINECAP, ICON_STROKE_LINEJOIN, ICON_STROKE_WIDTH } from './svg-attrs'

export const iconWrapperClasses = 'inline-flex align-middle'

export const iconSvgBaseClasses = 'inline-block'

export const iconSizeClasses: Record<IconSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8'
} as const

export const DEFAULT_ICON_SIZE: IconSize = 'md'

export const iconSvgDefaultStrokeWidth = ICON_STROKE_WIDTH

export const iconSvgDefaultStrokeLinecap = ICON_STROKE_LINECAP

export const iconSvgDefaultStrokeLinejoin = ICON_STROKE_LINEJOIN

export function resolveIconSize(size?: string | null): IconSize {
  if (size && size in iconSizeClasses) return size as IconSize
  return DEFAULT_ICON_SIZE
}

/**
 * Write `color` onto the wrapper only when the prop is set. An omitted color
 * must not clobber `style.color`. Explicit `color` wins and warns on conflict.
 */
export function resolveIconWrapperStyle(
  color: string | undefined,
  style?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (color == null) return style
  const styleColor = style?.color
  if (styleColor != null && styleColor !== color) {
    devWarn('Icon.color', '[Tigercat] Icon color and style.color differ; color wins.')
  }
  return { ...style, color }
}

export function warnUnknownIconName(name: string | undefined): void {
  if (!name) return
  devWarn(`Icon.name.${name}`, `[Tigercat] Icon name "${name}" is not registered.`)
}
