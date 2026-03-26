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
 * Linearly interpolate between two hex colours.
 */
export function interpolateColor(minColor: string, maxColor: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(minColor)
  const [r2, g2, b2] = hexToRgb(maxColor)
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t)
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
  }
): HeatmapCell[] {
  const {
    xLabels,
    yLabels,
    width,
    height,
    cellGap = 1,
    minColor = '#f0f9ff',
    maxColor = '#2563eb'
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
        fill: interpolateColor(minColor, maxColor, heat),
        value: val,
        xLabel: xLabels[c],
        yLabel: yLabels[r]
      })
    }
  }

  return cells
}
