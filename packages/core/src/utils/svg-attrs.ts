/**
 * SVG attribute helpers.
 *
 * Some utilities (e.g. `getSpinnerSVG`) may return React-flavored attribute keys
 * like `className`. When rendering SVG with Vue `h()`, we need to normalize to
 * Vue's `class` key.
 */

/**
 * Default SVG namespace
 */
export const SVG_DEFAULT_XMLNS = 'http://www.w3.org/2000/svg'

/**
 * Default viewBox for 24x24 icons
 */
export const SVG_DEFAULT_VIEWBOX_24 = '0 0 24 24'

/**
 * Default viewBox for 20x20 icons
 */
export const SVG_DEFAULT_VIEWBOX_20 = '0 0 20 20'

/**
 * Default fill value (none = outline icons)
 */
export const SVG_DEFAULT_FILL = 'none'

/**
 * Default stroke value for outline icons
 */
export const SVG_DEFAULT_STROKE = 'currentColor'

/**
 * Shared 24 outline stroke width (Heroicons 24). Named Icon, children SVG
 * defaults, close buttons, and status glyphs all read this one value.
 */
export const ICON_STROKE_WIDTH = 1.5

export const ICON_STROKE_LINECAP = 'round'

export const ICON_STROKE_LINEJOIN = 'round'

export type IconPaintMode = 'stroke' | 'fill'

/**
 * Missing `mode` is stroke (outline), matching the built-in registry.
 */
export function resolveIconPaintMode(mode?: string | null): IconPaintMode {
  return mode === 'fill' ? 'fill' : 'stroke'
}

export interface ResolvedIconSvgAttrs {
  xmlns: string
  viewBox: string
  fill: string
  stroke: string
  strokeWidth?: number | string
  strokeLinecap?: string
  strokeLinejoin?: string
  'aria-hidden': 'true'
  focusable: 'false'
}

/**
 * Default SVG attributes for outline icons. `resolveIconSvgAttrs` builds on this
 * so the helper is not a dead export.
 */
export function getSvgDefaultAttrs(size: 24 | 20 = 24): Record<string, string> {
  return {
    xmlns: SVG_DEFAULT_XMLNS,
    viewBox: size === 20 ? SVG_DEFAULT_VIEWBOX_20 : SVG_DEFAULT_VIEWBOX_24,
    fill: SVG_DEFAULT_FILL,
    stroke: SVG_DEFAULT_STROKE
  }
}

/**
 * Paint + a11y attributes for a named or definition-driven icon SVG.
 * Fill mode never strokes; stroke mode never fills.
 */
export function resolveIconSvgAttrs(
  input: {
    mode?: string | null
    viewBox?: string | null
    size?: 24 | 20
  } = {}
): ResolvedIconSvgAttrs {
  const defaults = getSvgDefaultAttrs(input.size)
  const viewBox = input.viewBox || defaults.viewBox
  const base = {
    xmlns: defaults.xmlns,
    viewBox,
    'aria-hidden': 'true' as const,
    focusable: 'false' as const
  }

  if (resolveIconPaintMode(input.mode) === 'fill') {
    return {
      ...base,
      fill: 'currentColor',
      stroke: 'none'
    }
  }

  return {
    ...base,
    fill: defaults.fill,
    stroke: defaults.stroke,
    strokeWidth: ICON_STROKE_WIDTH,
    strokeLinecap: ICON_STROKE_LINECAP,
    strokeLinejoin: ICON_STROKE_LINEJOIN
  }
}

function firstDefined<T>(...values: Array<T | undefined | null>): T | undefined {
  for (const value of values) {
    if (value != null) return value
  }
  return undefined
}

/**
 * Fill in missing paint attrs on a custom children `<svg>`. Caller-supplied
 * values win; a11y attrs always hide the glyph from the accessibility tree.
 */
export function mergeChildSvgAttrs(
  existing: Record<string, unknown> = {},
  size: 24 | 20 = 24
): ResolvedIconSvgAttrs {
  const defaults = resolveIconSvgAttrs({ mode: 'stroke', size })
  return {
    xmlns: firstDefined(existing.xmlns as string | undefined, defaults.xmlns) ?? defaults.xmlns,
    viewBox:
      firstDefined(existing.viewBox as string | undefined, defaults.viewBox) ?? defaults.viewBox,
    fill: firstDefined(existing.fill as string | undefined, defaults.fill) ?? defaults.fill,
    stroke: firstDefined(existing.stroke as string | undefined, defaults.stroke) ?? defaults.stroke,
    strokeWidth: firstDefined(
      existing.strokeWidth as number | string | undefined,
      existing['stroke-width'] as number | string | undefined,
      defaults.strokeWidth
    ),
    strokeLinecap: firstDefined(
      existing.strokeLinecap as string | undefined,
      existing['stroke-linecap'] as string | undefined,
      defaults.strokeLinecap
    ),
    strokeLinejoin: firstDefined(
      existing.strokeLinejoin as string | undefined,
      existing['stroke-linejoin'] as string | undefined,
      defaults.strokeLinejoin
    ),
    'aria-hidden': 'true',
    focusable: 'false'
  }
}

/**
 * Map camelCase SVG paint keys to Vue `h()` kebab-case.
 */
export function toVueSvgAttrs(attrs: ResolvedIconSvgAttrs): Record<string, unknown> {
  const { strokeWidth, strokeLinecap, strokeLinejoin, ...rest } = attrs
  return {
    ...rest,
    ...(strokeWidth != null ? { 'stroke-width': strokeWidth } : {}),
    ...(strokeLinecap != null ? { 'stroke-linecap': strokeLinecap } : {}),
    ...(strokeLinejoin != null ? { 'stroke-linejoin': strokeLinejoin } : {})
  }
}

export function normalizeSvgAttrs(svgAttrs: Record<string, unknown>): Record<string, unknown> {
  if ('className' in svgAttrs && !('class' in svgAttrs)) {
    const { className, ...rest } = svgAttrs
    return {
      ...rest,
      class: className
    }
  }

  return svgAttrs
}
