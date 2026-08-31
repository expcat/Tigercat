import type { DividerOrientation, DividerLineStyle, DividerSpacing } from '../types/divider'
import { classNames } from './class-names'
import { isBrowser } from './env'

export const DIVIDER_STYLE_ID = 'tiger-ui-divider-styles'

export const DIVIDER_CSS = `
.tiger-divider-vertical {
  align-self: stretch;
}
.tiger-divider-line-vertical {
  align-self: stretch;
  width: 1px;
}
.tiger-divider-labeled {
  display: flex;
  align-items: center;
}
.tiger-divider-labeled.tiger-divider-vertical {
  flex-direction: column;
}
`

export function injectDividerStyles(): void {
  if (!isBrowser()) return
  if (document.getElementById(DIVIDER_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = DIVIDER_STYLE_ID
  style.textContent = DIVIDER_CSS
  document.head.appendChild(style)
}

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

const LINE_STYLE_MAP: Record<Exclude<DividerLineStyle, 'gradient'>, string> = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted'
} as const

export function isDividerHorizontal(orientation: DividerOrientation): boolean {
  return orientation !== 'vertical'
}

/**
 * Classes for the root separator (spacing + stretch + labeled flex).
 */
export function getDividerClasses(
  orientation: DividerOrientation,
  lineStyle: DividerLineStyle,
  spacing: DividerSpacing,
  labeled = false
): string {
  injectDividerStyles()
  const isH = isDividerHorizontal(orientation)
  const sp = (isH ? SPACING_H : SPACING_V)[spacing]
  if (labeled) {
    return classNames(
      'tiger-divider tiger-divider-labeled',
      isH ? 'w-full gap-2' : 'tiger-divider-vertical gap-2',
      sp
    )
  }
  return classNames(getDividerLineClasses(orientation, lineStyle), sp)
}

/**
 * Classes for the painted line (or each half of a labeled separator).
 */
export function getDividerLineClasses(
  orientation: DividerOrientation,
  lineStyle: DividerLineStyle,
  labeled = false
): string {
  injectDividerStyles()
  const isH = isDividerHorizontal(orientation)
  if (lineStyle === 'gradient') {
    return classNames(
      'tiger-divider border-0',
      labeled && (isH ? 'flex-1 min-w-0' : 'flex-1 min-h-0'),
      isH ? 'w-full' : 'tiger-divider-vertical tiger-divider-line-vertical',
      !labeled && !isH && 'tiger-divider-vertical'
    )
  }
  return classNames(
    'tiger-divider',
    BORDER_COLOR,
    LINE_STYLE_MAP[lineStyle],
    labeled && (isH ? 'flex-1 min-w-0' : 'flex-1 min-h-0'),
    isH ? 'w-full border-t' : 'tiger-divider-vertical border-s',
    !isH && !labeled && 'w-px'
  )
}

/**
 * Inline color / thickness. Gradient paints via background, not unused border-*.
 */
export function getDividerStyle(
  orientation: DividerOrientation,
  color?: string,
  thickness?: string,
  lineStyle: DividerLineStyle = 'solid'
): Record<string, string> | undefined {
  const isH = isDividerHorizontal(orientation)
  if (lineStyle === 'gradient') {
    const c = color || 'var(--tiger-border, #e5e7eb)'
    const thick = thickness || '1px'
    return isH
      ? {
          backgroundImage: `linear-gradient(to right, transparent, ${c}, transparent)`,
          height: thick,
          borderWidth: '0px'
        }
      : {
          backgroundImage: `linear-gradient(to bottom, transparent, ${c}, transparent)`,
          width: thick,
          borderWidth: '0px'
        }
  }
  if (!color && !thickness) return undefined
  const style: Record<string, string> = {}
  if (color) style.borderColor = color
  if (thickness) {
    if (isH) style.borderBlockStartWidth = thickness
    else style.borderInlineStartWidth = thickness
  }
  return style
}

export function hasDividerLabel(children: unknown): boolean {
  if (children == null || children === false) return false
  if (typeof children === 'string') return children.trim() !== ''
  if (Array.isArray(children)) return children.some(hasDividerLabel)
  return true
}
