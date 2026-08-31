/**
 * Injected layout + 24-grid geometry.
 *
 * Happy-dom tests and apps without a processed Tailwind sheet still get
 * flex direction, gap, span lock, and breakpoint cascade. Media queries
 * cannot read CSS variables, so Col/Container padding follow
 * `html[data-tiger-bp]` written by {@link syncGridBreakpointAttr}.
 */

import { THEME_CSS_VARS, TIGER_BREAKPOINT_CSS_VALUES } from '../theme-runtime'
import type { Breakpoint } from '../types/grid'
import { isBrowser } from './env'

export const LAYOUT_GRID_STYLE_ID = 'tiger-ui-layout-grid-styles'

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
html[data-tiger-bp="xs"] .tiger-container-pad { padding-inline: 1rem; }
`
  }

  const spanChain = buildCascade('--tiger-col-span', '24', bp)
  const offsetChain = buildCascade('--tiger-col-offset', '0', bp)
  const orderChain = buildCascade('--tiger-col-order', '0', bp)
  const displayChain = buildDisplayCascade(bp)

  return `
html[data-tiger-bp="${bp}"] .tiger-col {
  --tiger-col-units: ${spanChain};
  --tiger-col-offset-units: ${offsetChain};
  --tiger-col-order-units: ${orderChain};
  --tiger-col-display: ${displayChain};
}
html[data-tiger-bp="${bp}"] .tiger-container-pad {
  padding-inline: ${bp === 'sm' || bp === 'md' ? '1.5rem' : '2rem'};
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
[dir="rtl"] .tiger-layout.tiger-flex-row,
[data-tiger-dir="rtl"] .tiger-layout.tiger-flex-row {
  flex-direction: row-reverse;
}
.tiger-layout-nested {
  flex: 1 1 0%;
  min-height: 0;
}
.tiger-layout-full {
  height: 100dvh;
  overflow: hidden;
}

.tiger-header {
  display: flex;
  align-items: center;
  padding-inline: 1rem;
  box-sizing: border-box;
  border-bottom: 1px solid var(--tiger-border, #e5e7eb);
}
.tiger-header-default {
  height: 4rem;
  background-color: var(--tiger-surface, #ffffff);
}
.tiger-header-translucent,
.tiger-header-blur {
  position: sticky;
  top: 0;
  z-index: 200;
  background-color: color-mix(in srgb, var(--tiger-surface, #ffffff) 80%, transparent);
}
@supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .tiger-header-translucent,
  .tiger-header-blur {
    background-color: color-mix(in srgb, var(--tiger-surface, #ffffff) 70%, transparent);
    -webkit-backdrop-filter: blur(var(--tiger-blur-glass, 16px)) saturate(var(--tiger-header-saturate, 1.8));
    backdrop-filter: blur(var(--tiger-blur-glass, 16px)) saturate(var(--tiger-header-saturate, 1.8));
  }
  .tiger-header-blur {
    -webkit-backdrop-filter: blur(var(--tiger-blur-glass-strong, 24px)) saturate(var(--tiger-header-saturate, 1.8));
    backdrop-filter: blur(var(--tiger-blur-glass-strong, 24px)) saturate(var(--tiger-header-saturate, 1.8));
    box-shadow: var(--tiger-header-shadow, 0 1px 2px 0 rgb(0 0 0 / 0.05));
  }
}

.tiger-sidebar {
  flex-shrink: 0;
  min-height: 0;
  overflow-x: clip;
  overflow-y: auto;
  box-sizing: border-box;
  background-color: var(--tiger-surface, #ffffff);
  border-inline-end: 1px solid var(--tiger-border, #e5e7eb);
  transition-property: width, min-width;
  transition-duration: var(--tiger-motion-duration-base, 300ms);
}
.tiger-sidebar-end {
  border-inline-end: 0;
  border-inline-start: 1px solid var(--tiger-border, #e5e7eb);
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
  background-color: var(--tiger-layout-content-bg, var(--tiger-surface-muted, #f9fafb));
}

.tiger-footer {
  box-sizing: border-box;
  background-color: var(--tiger-surface, #ffffff);
  border-top: 1px solid var(--tiger-border, #e5e7eb);
  padding: 1rem;
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
  column-gap: var(--tiger-row-gutter-x, 0px);
  row-gap: var(--tiger-row-gutter-y, 0px);
  align-items: var(--tiger-row-align, flex-start);
  justify-content: var(--tiger-row-justify, flex-start);
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

export function injectLayoutGridStyles(): void {
  if (!isBrowser()) return
  if (document.getElementById(LAYOUT_GRID_STYLE_ID)) return

  const style = document.createElement('style')
  style.id = LAYOUT_GRID_STYLE_ID
  style.textContent = LAYOUT_GRID_CSS
  document.head.appendChild(style)
}

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

export function syncGridBreakpointAttr(
  target: HTMLElement | null = isBrowser() ? document.documentElement : null
): Breakpoint | undefined {
  if (!isBrowser() || !target) return undefined
  injectLayoutGridStyles()
  const width = window.innerWidth
  const active = resolveActiveGridBreakpoint(width, readThemeBreakpointMap(target))
  if (target.dataset.tigerBp !== active) target.dataset.tigerBp = active
  return active
}

let breakpointSyncStarted = false

export function ensureGridBreakpointSync(): void {
  if (!isBrowser() || breakpointSyncStarted) return
  breakpointSyncStarted = true
  injectLayoutGridStyles()
  syncGridBreakpointAttr()
  window.addEventListener('resize', () => syncGridBreakpointAttr(), { passive: true })
}

/** Test-only: allow re-binding the resize listener after JSDOM teardown. */
export function resetGridBreakpointSync(): void {
  breakpointSyncStarted = false
}
