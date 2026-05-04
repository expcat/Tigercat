/**
 * Heatmap chart utilities
 * Cell layout and colour interpolation helpers
 */

import type { HeatmapChartDatum } from '../types/chart'

export interface HeatmapCell {
  /** Row index */
  row: number
  /** Column index */
  col: number
  /** Pixel x */
  x: number
  /** Pixel y */
  y: number
  /** Pixel width */
  w: number
  /** Pixel height */
  h: number
  /** Normalised heat 0-1 */
  heat: number
  /** Fill color string */
  fill: string
  /** Original value */
  value: number
  /** x label */
  xLabel: string
  /** y label */
  yLabel: string
}

/**
 * Parse a hex colour string (#rrggbb) into [r, g, b].
 */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16)
  ]
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('')}`
}

/**
 * Colour interpolation space. `'rgb'` (default) keeps backwards compatible
 * linear hex interpolation; `'oklch'` emits a CSS `color-mix(in oklch, ...)`
 * expression for perceptually uniform shading (delegated to the browser).
 */
export type HeatmapColorSpace = 'rgb' | 'oklch'
export type HeatmapRenderMode = 'svg' | 'canvas' | 'auto'

export const DEFAULT_HEATMAP_CANVAS_THRESHOLD = 1000

export function resolveHeatmapRenderMode(
  cellCount: number,
  options: {
    renderMode?: HeatmapRenderMode
    canvasThreshold?: number
  } = {}
): Exclude<HeatmapRenderMode, 'auto'> {
  const renderMode = options.renderMode ?? 'auto'
  if (renderMode === 'svg' || renderMode === 'canvas') return renderMode

  const threshold = Math.max(0, options.canvasThreshold ?? DEFAULT_HEATMAP_CANVAS_THRESHOLD)
  return cellCount > threshold ? 'canvas' : 'svg'
}

export function getHeatmapCellIndexAtPoint(
  cells: readonly HeatmapCell[],
  x: number,
  y: number
): number | null {
  const index = cells.findIndex(
    (cell) => x >= cell.x && x <= cell.x + cell.w && y >= cell.y && y <= cell.y + cell.h
  )

  return index >= 0 ? index : null
}

/**
 * Linearly interpolate between two hex colours.
 */
export function interpolateColor(minColor: string, maxColor: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(minColor)
  const [r2, g2, b2] = hexToRgb(maxColor)
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t)
}

/**
 * Emit a CSS `color-mix(in oklch, ...)` expression that blends `maxColor`
 * (at `t * 100`%) with `minColor` (at `(1 - t) * 100`%). The browser performs
 * the actual perceptually-uniform interpolation at paint time. Accepts any
 * CSS colour string for both endpoints (hex, var(), color-mix(), etc.).
 */
export function interpolateColorOklch(minColor: string, maxColor: string, t: number): string {
  const clamped = Math.max(0, Math.min(1, t))
  const pct = Math.round(clamped * 10000) / 100
  return `color-mix(in oklch, ${maxColor} ${pct}%, ${minColor})`
}

/**
 * Compute heatmap cell rectangles from data.
 */
export function computeHeatmapCells(
  data: HeatmapChartDatum[],
  opts: {
    xLabels: string[]
    yLabels: string[]
    width: number
    height: number
    cellGap?: number
    minColor?: string
    maxColor?: string
    /**
     * Colour interpolation space. `'rgb'` (default) keeps the legacy hex
     * lerp; `'oklch'` emits CSS `color-mix(in oklch, ...)` for perceptually
     * uniform shading. Opt-in to avoid changing the default visual.
     * @default 'rgb'
     */
    colorSpace?: HeatmapColorSpace
  }
): HeatmapCell[] {
  const {
    xLabels,
    yLabels,
    width,
    height,
    cellGap = 1,
    minColor = '#f0f9ff',
    maxColor = '#2563eb',
    colorSpace = 'rgb'
  } = opts

  const cols = xLabels.length
  const rows = yLabels.length
  if (cols === 0 || rows === 0) return []

  const cellW = (width - cellGap * (cols - 1)) / cols
  const cellH = (height - cellGap * (rows - 1)) / rows

  // Build value lookup
  const valMap = new Map<string, number>()
  for (const d of data) {
    valMap.set(`${d.x}|${d.y}`, d.value)
  }

  let minVal = Infinity
  let maxVal = -Infinity
  for (const d of data) {
    if (d.value < minVal) minVal = d.value
    if (d.value > maxVal) maxVal = d.value
  }
  if (minVal === maxVal) maxVal = minVal + 1 // avoid division by zero

  const cells: HeatmapCell[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = valMap.get(`${xLabels[c]}|${yLabels[r]}`) ?? 0
      const heat = (val - minVal) / (maxVal - minVal)
      cells.push({
        row: r,
        col: c,
        x: c * (cellW + cellGap),
        y: r * (cellH + cellGap),
        w: cellW,
        h: cellH,
        heat,
        fill:
          colorSpace === 'oklch'
            ? interpolateColorOklch(minColor, maxColor, heat)
            : interpolateColor(minColor, maxColor, heat),
        value: val,
        xLabel: xLabels[c],
        yLabel: yLabels[r]
      })
    }
  }

  return cells
}
