/**
 * Static layout + 24-grid geometry.
 *
 * Column width, offset, and visibility are media queries generated from the
 * token breakpoint table. Nothing writes `data-tiger-bp` or listens for resize.
 */

import { THEME_CSS_VARS, TIGER_BREAKPOINT_CSS_VALUES } from '../theme-runtime'
import type { Breakpoint } from '../types/grid'
import { OVERLAY_Z_INDEX } from './floating'
import { isBrowser } from './env'

export const GRID_BREAKPOINT_ORDER: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']

const BREAKPOINT_VAR: Record<Breakpoint, string> = {
  xs: THEME_CSS_VARS.breakpointXs,
  sm: THEME_CSS_VARS.breakpointSm,
  md: THEME_CSS_VARS.breakpointMd,
  lg: THEME_CSS_VARS.breakpointLg,
  xl: THEME_CSS_VARS.breakpointXl,
  '2xl': THEME_CSS_VARS.breakpoint2xl
}

const BREAKPOINT_FALLBACK_PX: Record<Breakpoint, number> = {
  xs: parseFloat(TIGER_BREAKPOINT_CSS_VALUES.breakpointXs),
  sm: parseFloat(TIGER_BREAKPOINT_CSS_VALUES.breakpointSm),
  md: parseFloat(TIGER_BREAKPOINT_CSS_VALUES.breakpointMd),
  lg: parseFloat(TIGER_BREAKPOINT_CSS_VALUES.breakpointLg),
  xl: parseFloat(TIGER_BREAKPOINT_CSS_VALUES.breakpointXl),
  '2xl': parseFloat(TIGER_BREAKPOINT_CSS_VALUES.breakpoint2xl)
}

const SPAN_WIDTH = `calc(
  var(--tiger-col-units) * 100% / 24
  - (1 - var(--tiger-col-units) / 24) * var(--tiger-row-gutter-x, 0px)
)`

const OFFSET_MARGIN = `calc(
  var(--tiger-col-offset-units, 0) * 100% / 24
  + var(--tiger-col-offset-units, 0) / 24 * var(--tiger-row-gutter-x, 0px)
)`

function breakpointBlock(bp: Breakpoint): string {
  if (bp === 'xs') {
    return `
.tiger-col {
  --tiger-col-units: var(--tiger-col-span, 24);
  --tiger-col-offset-units: var(--tiger-col-offset, 0);
  --tiger-col-order-units: var(--tiger-col-order, 0);
  --tiger-col-display: var(--tiger-col-display-base, block);
}
.tiger-container-pad { padding-inline: 1rem; }
`
  }

  const spanChain = buildCascade('--tiger-col-span', '24', bp)
  const offsetChain = buildCascade('--tiger-col-offset', '0', bp)
  const orderChain = buildCascade('--tiger-col-order', '0', bp)
  const displayChain = buildDisplayCascade(bp)
  const min = BREAKPOINT_FALLBACK_PX[bp]
  const columnChain = buildTokenCascade('--tiger-columns', '1', bp)
  const gapChain = buildTokenCascade('--tiger-gap', '0px', bp)

  return `
@container tiger-row (min-width: ${min}px) {
  .tiger-col {
    --tiger-col-units: ${spanChain};
    --tiger-col-offset-units: ${offsetChain};
    --tiger-col-order-units: ${orderChain};
    --tiger-col-display: ${displayChain};
  }
}
@container tiger (min-width: ${min}px) {
  .tiger-responsive-columns {
    --tiger-columns: ${columnChain};
    --tiger-gap: ${gapChain};
  }
}
@media (min-width: ${min}px) {
  .tiger-container-pad {
    padding-inline: ${bp === 'sm' || bp === 'md' ? '1.5rem' : '2rem'};
  }
}
`
}

function buildCascade(base: string, fallback: string, upto: Breakpoint): string {
  let expr = `var(${base}, ${fallback})`
  for (const bp of GRID_BREAKPOINT_ORDER) {
    if (bp === 'xs') continue
    expr = `var(${base}-${bp}, ${expr})`
    if (bp === upto) break
  }
  return expr
}

/** Breakpoint chain that never reads the property it assigns. */
function buildTokenCascade(prefix: string, fallback: string, upto: Breakpoint): string {
  let expr = `var(${prefix}-base, ${fallback})`
  for (const bp of GRID_BREAKPOINT_ORDER) {
    if (bp === 'xs') continue
    expr = `var(${prefix}-${bp}, ${expr})`
    if (bp === upto) break
  }
  return expr
}

function buildDisplayCascade(upto: Breakpoint): string {
  let expr = 'var(--tiger-col-display-base, block)'
  for (const bp of GRID_BREAKPOINT_ORDER) {
    if (bp === 'xs') continue
    expr = `var(--tiger-col-display-${bp}, ${expr})`
    if (bp === upto) break
  }
  return expr
}

function breakpointCss(): string {
  return GRID_BREAKPOINT_ORDER.map((bp) =>
    bp === 'xs' ? breakpointBlock('xs') : breakpointBlock(bp)
  ).join('\n')
}

export const LAYOUT_GRID_CSS = `
:root {
  ${THEME_CSS_VARS.breakpointXs}: ${TIGER_BREAKPOINT_CSS_VALUES.breakpointXs};
  ${THEME_CSS_VARS.breakpointSm}: ${TIGER_BREAKPOINT_CSS_VALUES.breakpointSm};
  ${THEME_CSS_VARS.breakpointMd}: ${TIGER_BREAKPOINT_CSS_VALUES.breakpointMd};
  ${THEME_CSS_VARS.breakpointLg}: ${TIGER_BREAKPOINT_CSS_VALUES.breakpointLg};
  ${THEME_CSS_VARS.breakpointXl}: ${TIGER_BREAKPOINT_CSS_VALUES.breakpointXl};
  ${THEME_CSS_VARS.breakpoint2xl}: ${TIGER_BREAKPOINT_CSS_VALUES.breakpoint2xl};
}

.tiger-layout {
  display: flex;
  min-height: 0;
  flex-direction: column;
}
.tiger-layout.tiger-flex-row {
  flex-direction: row;
}
.tiger-layout-nested {
  flex: 1 1 0%;
  min-height: 0;
}
.tiger-layout-full {
  height: 100dvh;
  overflow: hidden;
}

.tiger-skip-link {
  position: absolute;
  inset-inline-start: 0.5rem;
  inset-block-start: 0.5rem;
  z-index: ${OVERLAY_Z_INDEX.viewport + 1};
  padding: 0.5rem 0.75rem;
  background: var(--tiger-surface);
  color: var(--tiger-text);
  border-radius: var(--tiger-radius-md);
  transform: translateY(-200%);
}
.tiger-skip-link:focus {
  transform: none;
}

.tiger-header {
  display: flex;
  align-items: center;
  height: 4rem;
  padding-inline: 1rem;
  box-sizing: border-box;
  border-bottom: 1px solid var(--tiger-border);
}
.tiger-header-default {
  background-color: var(--tiger-surface);
}
.tiger-header-sticky {
  position: sticky;
  inset-block-start: 0;
  z-index: ${OVERLAY_Z_INDEX.viewport};
}
.tiger-header-translucent,
.tiger-header-blur {
  background-color: color-mix(in srgb, var(--tiger-surface) 80%, transparent);
}
@supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .tiger-header-translucent,
  .tiger-header-blur {
    background-color: color-mix(in srgb, var(--tiger-surface) 70%, transparent);
    -webkit-backdrop-filter: blur(16px) saturate(1.8);
    backdrop-filter: blur(16px) saturate(1.8);
  }
  .tiger-header-blur {
    -webkit-backdrop-filter: blur(24px) saturate(1.8);
    backdrop-filter: blur(24px) saturate(1.8);
    box-shadow: var(--tiger-shadow-sm);
  }
}

.tiger-sidebar {
  order: -1;
  flex-shrink: 0;
  min-height: 0;
  overflow-x: clip;
  overflow-y: auto;
  box-sizing: border-box;
  background-color: var(--tiger-surface);
  border-inline-end: 1px solid var(--tiger-border);
  transition-property: width, min-width;
  transition-duration: var(--tiger-motion-duration-base);
}
.tiger-sidebar-end {
  order: 1;
  border-inline-end: 0;
  border-inline-start: 1px solid var(--tiger-border);
}
.tiger-sidebar-default-width {
  width: 16rem;
}
@media (prefers-reduced-motion: reduce) {
  .tiger-sidebar {
    transition-duration: 0ms;
    transition-delay: 0ms;
  }
}

.tiger-content {
  flex: 1 1 0%;
  min-height: 0;
  min-width: 0;
  overflow: auto;
  background-color: var(--tiger-surface-muted);
}

.tiger-footer {
  box-sizing: border-box;
  background-color: var(--tiger-surface);
  border-top: 1px solid var(--tiger-border);
  padding: 1rem;
}
.tiger-footer-compact {
  padding-block: 0.5rem;
}

.tiger-container {
  width: 100%;
  box-sizing: border-box;
}
.tiger-container-center {
  margin-inline: auto;
}
.tiger-container-pad {
  padding-inline: 1rem;
}
.tiger-container-full {
  max-width: 100%;
}

.tiger-row {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  box-sizing: border-box;
  container-type: inline-size;
  container-name: tiger-row;
  column-gap: var(--tiger-row-gutter-x, 0px);
  row-gap: var(--tiger-row-gutter-y, 0px);
  align-items: var(--tiger-row-align, flex-start);
  justify-content: var(--tiger-row-justify, flex-start);
}
.tiger-cq {
  container-type: inline-size;
  container-name: tiger;
}
.tiger-responsive-columns {
  --tiger-columns: var(--tiger-columns-base, 1);
  --tiger-gap: var(--tiger-gap-base, 0px);
}
.tiger-desc-vgrid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(var(--tiger-columns, 1), minmax(0, 1fr));
}
.tiger-desc-hgrid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(var(--tiger-columns, 1), minmax(0, 1fr));
}
.tiger-desc-pair {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-column: span var(--tiger-desc-span, 1);
}
.tiger-list-grid {
  display: grid;
  grid-template-columns: repeat(var(--tiger-columns, 1), minmax(0, 1fr));
  gap: var(--tiger-gap, 0px);
}
.tiger-masonry-flow {
  column-count: var(--tiger-columns, 1);
  column-gap: var(--tiger-gap, 0px);
}
.tiger-masonry-flow > .tiger-masonry-item {
  break-inside: avoid;
  margin-block-end: var(--tiger-gap, 0px);
  width: 100%;
}
.tiger-row-nowrap {
  flex-wrap: nowrap;
}

.tiger-col {
  box-sizing: border-box;
  min-width: 0;
  order: var(--tiger-col-order-units, 0);
  margin-inline-start: ${OFFSET_MARGIN};
}
.tiger-col:not(.tiger-col-flex) {
  display: var(--tiger-col-display, block);
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: ${SPAN_WIDTH};
  max-width: ${SPAN_WIDTH};
}
.tiger-col.tiger-col-flex {
  display: block;
  min-width: 0;
  flex: var(--tiger-col-flex);
}

${breakpointCss()}
`

export function readThemeBreakpointPx(
  bp: Breakpoint,
  root: HTMLElement | null = isBrowser() ? document.documentElement : null
): number {
  const fallback = BREAKPOINT_FALLBACK_PX[bp]
  if (!root) return fallback
  const raw = getComputedStyle(root).getPropertyValue(BREAKPOINT_VAR[bp]).trim()
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : fallback
}

export function resolveActiveGridBreakpoint(
  width: number,
  px: Partial<Record<Breakpoint, number>> = {}
): Breakpoint {
  let active: Breakpoint = 'xs'
  for (const bp of GRID_BREAKPOINT_ORDER) {
    const min = px[bp] ?? BREAKPOINT_FALLBACK_PX[bp]
    if (width >= min) active = bp
  }
  return active
}

export function readThemeBreakpointMap(
  root: HTMLElement | null = isBrowser() ? document.documentElement : null
): Record<Breakpoint, number> {
  const map = {} as Record<Breakpoint, number>
  for (const bp of GRID_BREAKPOINT_ORDER) {
    map[bp] = readThemeBreakpointPx(bp, root)
  }
  return map
}
