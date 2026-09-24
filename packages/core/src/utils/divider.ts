import type { DividerOrientation, DividerLineStyle, DividerSpacing } from '../types/divider'
import { THEME_CSS_VARS } from '../theme-runtime'
import { classNames } from './class-names'

/** Stretch and labeled flex. Wired by the Tailwind plugin; components do not inject a style tag. */
export const dividerBaseStyles = {
  '.tiger-divider-vertical': {
    alignSelf: 'stretch'
  },
  '.tiger-divider-line-vertical': {
    alignSelf: 'stretch',
    width: '1px'
  },
  '.tiger-divider-labeled': {
    display: 'flex',
    alignItems: 'center'
  },
  '.tiger-divider-labeled.tiger-divider-vertical': {
    flexDirection: 'column'
  }
} as const

const COLOR_TOKEN_VARS = new Set<string>(
  Object.entries(THEME_CSS_VARS)
    .filter(([key]) => !key.startsWith('breakpoint'))
    .map(([, cssVar]) => cssVar)
)

const COLOR_TOKEN_NAMES = new Map<string, string>(
  Object.entries(THEME_CSS_VARS).filter(([key]) => !key.startsWith('breakpoint'))
)

/** Gradient paint accepts a theme token name or `var(--tiger-*)` for that token. */
export function resolveDividerColorToken(color?: string): string | undefined {
  if (!color) return undefined
  const trimmed = color.trim()
  const named = COLOR_TOKEN_NAMES.get(trimmed)
  if (named) return `var(${named})`
  const match = /^var\(\s*(--tiger-[a-z0-9-]+)\s*\)$/i.exec(trimmed)
  if (match && COLOR_TOKEN_VARS.has(match[1])) return `var(${match[1]})`
  return undefined
}

const BORDER_COLOR = 'border-[var(--tiger-border)]' as const

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
  const isH = isDividerHorizontal(orientation)
  const sp = (isH ? SPACING_H : SPACING_V)[spacing]
  if (labeled) {
    return classNames(
      'tiger-divider tiger-divider-labeled flex items-center',
      isH ? 'w-full gap-2' : 'tiger-divider-vertical flex-col self-stretch gap-2',
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
  const isH = isDividerHorizontal(orientation)
  if (lineStyle === 'gradient') {
    return classNames(
      'tiger-divider border-0',
      labeled && (isH ? 'flex-1 min-w-0' : 'flex-1 min-h-0'),
      isH ? 'w-full' : 'tiger-divider-vertical tiger-divider-line-vertical self-stretch w-px',
      !labeled && !isH && 'tiger-divider-vertical'
    )
  }
  return classNames(
    'tiger-divider',
    BORDER_COLOR,
    LINE_STYLE_MAP[lineStyle],
    labeled && (isH ? 'flex-1 min-w-0' : 'flex-1 min-h-0'),
    isH ? 'w-full border-t' : 'tiger-divider-vertical self-stretch border-s',
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
    const c = resolveDividerColorToken(color) || 'var(--tiger-border)'
    const thick = thickness || '1px'
    return isH
      ? {
          backgroundImage: `linear-gradient(to inline-end, transparent, ${c}, transparent)`,
          height: thick,
          borderWidth: '0px'
        }
      : {
          backgroundImage: `linear-gradient(to block-end, transparent, ${c}, transparent)`,
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
