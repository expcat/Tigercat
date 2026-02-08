import type { DividerOrientation, DividerLineStyle, DividerSpacing } from '../types/divider'

const BORDER_COLOR = 'border-[var(--tiger-border,#e5e7eb)]' as const

const SPACING_H: Record<DividerSpacing, string> = {
  none: '',
  xs: 'my-1',
  sm: 'my-2',
  md: 'my-4',
  lg: 'my-6',
  xl: 'my-8'
} as const

const SPACING_V: Record<DividerSpacing, string> = {
  none: '',
  xs: 'mx-1',
  sm: 'mx-2',
  md: 'mx-4',
  lg: 'mx-6',
  xl: 'mx-8'
} as const

const LINE_STYLE_MAP: Record<DividerLineStyle, string> = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted'
} as const

/**
 * Get combined Tailwind classes for a divider
 */
export function getDividerClasses(
  orientation: DividerOrientation,
  lineStyle: DividerLineStyle,
  spacing: DividerSpacing
): string {
  const isH = orientation === 'horizontal'
  const base = isH ? `w-full border-t ${BORDER_COLOR}` : `h-full border-l ${BORDER_COLOR}`
  const sp = (isH ? SPACING_H : SPACING_V)[spacing]
  return sp ? `${base} ${LINE_STYLE_MAP[lineStyle]} ${sp}` : `${base} ${LINE_STYLE_MAP[lineStyle]}`
}

/**
 * Get inline style object for custom color / thickness
 * Returns undefined when no custom values are set (avoids empty object allocation)
 */
export function getDividerStyle(
  orientation: DividerOrientation,
  color?: string,
  thickness?: string
): Record<string, string> | undefined {
  if (!color && !thickness) return undefined
  const style: Record<string, string> = {}
  if (color) style.borderColor = color
  if (thickness) {
    style[orientation === 'horizontal' ? 'borderTopWidth' : 'borderLeftWidth'] = thickness
  }
  return style
}
