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
 * Get default SVG attributes for icon components
 *
 * @param size - Icon size (24 or 20), defaults to 24
 * @returns Default SVG attributes object
 */
export function getSvgDefaultAttrs(size: 24 | 20 = 24): Record<string, string> {
  return {
    xmlns: SVG_DEFAULT_XMLNS,
    viewBox: size === 20 ? SVG_DEFAULT_VIEWBOX_20 : SVG_DEFAULT_VIEWBOX_24,
    fill: SVG_DEFAULT_FILL
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
