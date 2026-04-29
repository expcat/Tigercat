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
  dotted: 'border-dotted',
  // Gradient mode renders the line via background-image instead of border-style;
  // we strip the border in `getDividerClasses` below so this entry is only a
  // marker for switch-style consumers.
  gradient: 'border-none'
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
  const sp = (isH ? SPACING_H : SPACING_V)[spacing]
  if (lineStyle === 'gradient') {
    // Background-gradient line: 1px tall (or wide for vertical) with soft
    // fade-in/out. Falls back to `--tiger-border` when the gradient token is
    // missing so the visual stays consistent on default theme.
    const base = isH
      ? 'w-full h-px bg-[var(--tiger-divider-gradient,linear-gradient(90deg,transparent,var(--tiger-border,#e5e7eb),transparent))] border-0'
      : 'h-full w-px bg-[var(--tiger-divider-gradient-vertical,linear-gradient(180deg,transparent,var(--tiger-border,#e5e7eb),transparent))] border-0'
    return sp ? `${base} ${sp}` : base
  }
  const base = isH ? `w-full border-t ${BORDER_COLOR}` : `h-full border-l ${BORDER_COLOR}`
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
