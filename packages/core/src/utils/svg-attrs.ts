/**
 * SVG attribute helpers.
 *
 * Some utilities (e.g. `getSpinnerSVG`) may return React-flavored attribute keys
 * like `className`. When rendering SVG with Vue `h()`, we need to normalize to
 * Vue's `class` key.
 */

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
