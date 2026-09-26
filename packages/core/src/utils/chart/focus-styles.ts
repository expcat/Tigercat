/**
 * Chart canvas focus chrome. Not a public export: the Tailwind plugin is the
 * only consumer. Chart SVG geometry becomes mouse-focusable in Chromium once
 * it has a `focus` listener, and any mark with `tabindex` is too. The user
 * agent then paints `outline: auto` around the bounding box — a black
 * rectangle on a sector, arc, or bar. The canvas opts out of that box.
 * Keyboard focus keeps a shape-following halo; the canvas element itself uses
 * the focus-ring token. Forced colors still get a system outline because
 * filters are discarded.
 */
export const chartCanvasFocusStyles = {
  '[data-chart-canvas]:focus': {
    outline: 'none'
  },
  '[data-chart-canvas]:focus-visible': {
    outline: '2px solid var(--tiger-focus-ring)',
    outlineOffset: '2px'
  },
  '[data-chart-canvas] :focus, [data-chart-canvas] :focus-visible': {
    outline: 'none'
  },
  '[data-chart-canvas] :focus-visible': {
    filter: 'drop-shadow(0 0 2px var(--tiger-focus-ring))'
  },
  '@media (forced-colors: active)': {
    '[data-chart-canvas] :focus-visible, [data-chart-canvas]:focus-visible': {
      outline: '2px solid Highlight',
      outlineOffset: '2px',
      filter: 'none'
    }
  }
}
