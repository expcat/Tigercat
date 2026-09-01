/**
 * Heatmap layout: row-major cells, axis anchors, canvas paint.
 * Vue/React only bind the returned geometry.
 */

import type { ChartScaleValue, HeatmapChartDatum } from '../types/chart'
import { getChartElementOpacity } from './chart-interaction'
import { formatChartTemplate, isFiniteNumber } from './chart/layout'
import { devWarn } from './dev-warn'
import { isBrowser } from './env'

export const DEFAULT_HEATMAP_WIDTH = 400
export const DEFAULT_HEATMAP_HEIGHT = 300
export const DEFAULT_HEATMAP_PADDING = 40
export const DEFAULT_HEATMAP_MIN_COLOR = '#f0f9ff'
export const DEFAULT_HEATMAP_MAX_COLOR = '#2563eb'
export const DEFAULT_HEATMAP_CELL_RADIUS = 2
export const DEFAULT_HEATMAP_CELL_GAP = 1
export const DEFAULT_HEATMAP_EMPTY_FILL = '#f3f4f6'
export const DEFAULT_HEATMAP_CANVAS_THRESHOLD = 1000

export const heatmapCellTransitionClasses =
  'transition-opacity motion-reduce:transition-none [transition-duration:var(--tiger-motion-duration-base,200ms)]'

export interface HeatmapCell {
  /** Row-major index: `row * cols + col` */
  index: number
  row: number
  col: number
  x: number
  y: number
  w: number
  h: number
  heat: number
  fill: string
  /** Original finite value, or `null` when the cell is empty */
  value: number | null
  xLabel: string
  yLabel: string
  datum: HeatmapChartDatum | null
  empty: boolean
}

export interface HeatmapAxisLabel {
  text: string
  x: number
  y: number
}

export interface LaidOutHeatmap {
  cells: HeatmapCell[]
  xAxisLabels: HeatmapAxisLabel[]
  yAxisLabels: HeatmapAxisLabel[]
  cols: number
  rows: number
  cellW: number
  cellH: number
  cellGap: number
  minVal: number
  maxVal: number
}

export type HeatmapColorSpace = 'rgb' | 'oklch'
export type HeatmapRenderMode = 'svg' | 'canvas' | 'auto'

export interface LayoutHeatmapOptions {
  xLabels: string[]
  yLabels: string[]
  width: number
  height: number
  cellGap?: number
  minColor?: string
  maxColor?: string
  colorSpace?: HeatmapColorSpace
  min?: number
  max?: number
}

function parseHexColor(color: string): [number, number, number] | null {
  const trimmed = color.trim()
  const short = /^#([0-9a-f]{3})$/i.exec(trimmed)
  if (short) {
    const hex = short[1]
    return [
      parseInt(hex[0] + hex[0], 16),
      parseInt(hex[1] + hex[1], 16),
      parseInt(hex[2] + hex[2], 16)
    ]
  }
  const long = /^#([0-9a-f]{6})$/i.exec(trimmed)
  if (!long) return null
  const hex = long[1]
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16)
  ]
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('')}`
}

function resolveRgbEndpoint(color: string, fallback: string): [number, number, number] {
  return parseHexColor(color) ?? parseHexColor(fallback) ?? [240, 249, 255]
}

/**
 * Linearly interpolate between two hex colours. Unparseable endpoints fall
 * back to the default heatmap range so `#NaNNaNNaN` never reaches fill.
 */
export function interpolateColor(minColor: string, maxColor: string, t: number): string {
  const clamped = isFiniteNumber(t) ? Math.max(0, Math.min(1, t)) : 0
  const [r1, g1, b1] = resolveRgbEndpoint(minColor, DEFAULT_HEATMAP_MIN_COLOR)
  const [r2, g2, b2] = resolveRgbEndpoint(maxColor, DEFAULT_HEATMAP_MAX_COLOR)
  return rgbToHex(r1 + (r2 - r1) * clamped, g1 + (g2 - g1) * clamped, b1 + (b2 - b1) * clamped)
}

export function interpolateColorOklch(minColor: string, maxColor: string, t: number): string {
  const clamped = isFiniteNumber(t) ? Math.max(0, Math.min(1, t)) : 0
  const pct = Math.round(clamped * 10000) / 100
  return `color-mix(in oklch, ${maxColor} ${pct}%, ${minColor})`
}

export function heatmapLabelFill(fill: string, heat: number): string {
  const rgb = parseHexColor(fill)
  if (!rgb) return heat > 0.55 ? '#f9fafb' : '#111827'
  const luminance = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255
  return luminance > 0.55 ? '#111827' : '#f9fafb'
}

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

export function getHeatmapDevicePixelRatio(): number {
  if (!isBrowser()) return 1
  const dpr = window.devicePixelRatio
  return isFiniteNumber(dpr) && dpr > 0 ? dpr : 1
}

export function getHeatmapCellIndexAtPoint(
  cells: readonly HeatmapCell[],
  x: number,
  y: number
): number | null {
  if (cells.length === 0 || !isFiniteNumber(x) || !isFiniteNumber(y)) return null
  let cols = 0
  let rows = 0
  for (const cell of cells) {
    cols = Math.max(cols, cell.col + 1)
    rows = Math.max(rows, cell.row + 1)
  }
  const cellW = cells[0].w
  const cellH = cells[0].h
  const gapX =
    cols > 1 ? (cells.find((cell) => cell.col === 1 && cell.row === 0)?.x ?? cellW) - cellW : 0
  const gapY =
    rows > 1 ? (cells.find((cell) => cell.row === 1 && cell.col === 0)?.y ?? cellH) - cellH : 0
  const strideX = cellW + gapX
  const strideY = cellH + gapY
  if (!(strideX > 0) || !(strideY > 0)) return null
  const col = Math.floor(x / strideX)
  const row = Math.floor(y / strideY)
  if (col < 0 || col >= cols || row < 0 || row >= rows) return null
  const localX = x - col * strideX
  const localY = y - row * strideY
  if (localX > cellW || localY > cellH) return null
  return row * cols + col
}

export function nextHeatmapCellIndex(
  index: number,
  key: string,
  cols: number,
  rows: number
): number {
  if (cols <= 0 || rows <= 0) return index
  const row = Math.floor(index / cols)
  const col = index % cols
  if (key === 'ArrowRight') return row * cols + Math.min(cols - 1, col + 1)
  if (key === 'ArrowLeft') return row * cols + Math.max(0, col - 1)
  if (key === 'ArrowDown') return Math.min(rows - 1, row + 1) * cols + col
  if (key === 'ArrowUp') return Math.max(0, row - 1) * cols + col
  return index
}

function heatmapLookupKey(x: ChartScaleValue, y: ChartScaleValue): string {
  return `${String(x)}\0${String(y)}`
}

function isNumericIndex(value: ChartScaleValue): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

export function formatHeatmapTooltip(
  template: string,
  cell: Pick<HeatmapCell, 'xLabel' | 'yLabel' | 'value'>,
  valueText: string
): string {
  return formatChartTemplate(template, {
    x: cell.xLabel,
    y: cell.yLabel,
    value: valueText
  })
}

function resolveCellFill(
  heat: number,
  minColor: string,
  maxColor: string,
  colorSpace: HeatmapColorSpace
): string {
  if (colorSpace === 'oklch') return interpolateColorOklch(minColor, maxColor, heat)
  return interpolateColor(minColor, maxColor, heat)
}

export function layoutHeatmap(
  data: readonly HeatmapChartDatum[],
  opts: LayoutHeatmapOptions
): LaidOutHeatmap {
  const xLabels = opts.xLabels
  const yLabels = opts.yLabels
  const cols = xLabels.length
  const rows = yLabels.length
  const empty: LaidOutHeatmap = {
    cells: [],
    xAxisLabels: [],
    yAxisLabels: [],
    cols,
    rows,
    cellW: 0,
    cellH: 0,
    cellGap: 0,
    minVal: 0,
    maxVal: 1
  }
  const safeWidth = isFiniteNumber(opts.width) ? Math.max(0, opts.width) : 0
  const safeHeight = isFiniteNumber(opts.height) ? Math.max(0, opts.height) : 0
  const safeCellGap = isFiniteNumber(opts.cellGap) ? Math.max(0, opts.cellGap) : 0
  if (cols === 0 || rows === 0 || safeWidth <= 0 || safeHeight <= 0) return empty

  const totalGapX = Math.min(safeWidth, safeCellGap * Math.max(0, cols - 1))
  const totalGapY = Math.min(safeHeight, safeCellGap * Math.max(0, rows - 1))
  const cellW = Math.max(0, (safeWidth - totalGapX) / cols)
  const cellH = Math.max(0, (safeHeight - totalGapY) / rows)
  const usedGapX = cols > 1 ? totalGapX / (cols - 1) : 0
  const usedGapY = rows > 1 ? totalGapY / (rows - 1) : 0

  const byLabel = new Map<string, HeatmapChartDatum>()
  const byIndex = new Map<string, HeatmapChartDatum>()
  for (const datum of data) {
    if (!isFiniteNumber(datum.value)) {
      devWarn('HeatmapChart.nonFinite', 'HeatmapChart skipped a datum with a non-finite value')
      continue
    }
    const labelKey = heatmapLookupKey(datum.x, datum.y)
    if (byLabel.has(labelKey)) {
      devWarn(
        'HeatmapChart.duplicate',
        'HeatmapChart received duplicate x/y keys; later value wins'
      )
    }
    byLabel.set(labelKey, datum)
    if (isNumericIndex(datum.x) && isNumericIndex(datum.y)) {
      const indexKey = heatmapLookupKey(datum.x, datum.y)
      byIndex.set(indexKey, datum)
    }
  }

  const present: number[] = []
  const occupancy: Array<HeatmapChartDatum | null> = new Array(rows * cols).fill(null)
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const xLabel = xLabels[col]
      const yLabel = yLabels[row]
      const datum =
        byLabel.get(heatmapLookupKey(xLabel, yLabel)) ??
        byIndex.get(heatmapLookupKey(col, row)) ??
        null
      occupancy[row * cols + col] = datum
      if (datum) present.push(datum.value)
    }
  }

  let minVal = isFiniteNumber(opts.min) ? opts.min : present.length > 0 ? Math.min(...present) : 0
  let maxVal = isFiniteNumber(opts.max) ? opts.max : present.length > 0 ? Math.max(...present) : 1
  if (minVal === maxVal) maxVal = minVal + 1

  const minColor = opts.minColor ?? DEFAULT_HEATMAP_MIN_COLOR
  const maxColor = opts.maxColor ?? DEFAULT_HEATMAP_MAX_COLOR
  const colorSpace = opts.colorSpace ?? 'rgb'

  const cells: HeatmapCell[] = []
  const xAxisLabels: HeatmapAxisLabel[] = []
  const yAxisLabels: HeatmapAxisLabel[] = []

  for (let col = 0; col < cols; col++) {
    const x = col * (cellW + usedGapX)
    xAxisLabels.push({
      text: xLabels[col],
      x: x + cellW / 2,
      y: safeHeight + 16
    })
  }
  for (let row = 0; row < rows; row++) {
    const y = row * (cellH + usedGapY)
    yAxisLabels.push({
      text: yLabels[row],
      x: -8,
      y: y + cellH / 2
    })
  }

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const index = row * cols + col
      const datum = occupancy[index]
      const emptyCell = datum === null
      const value = emptyCell ? null : datum.value
      const heat = emptyCell
        ? 0
        : Math.max(0, Math.min(1, (datum.value - minVal) / (maxVal - minVal)))
      cells.push({
        index,
        row,
        col,
        x: col * (cellW + usedGapX),
        y: row * (cellH + usedGapY),
        w: cellW,
        h: cellH,
        heat,
        fill: emptyCell
          ? DEFAULT_HEATMAP_EMPTY_FILL
          : resolveCellFill(heat, minColor, maxColor, colorSpace),
        value,
        xLabel: xLabels[col],
        yLabel: yLabels[row],
        datum,
        empty: emptyCell
      })
    }
  }

  return {
    cells,
    xAxisLabels,
    yAxisLabels,
    cols,
    rows,
    cellW,
    cellH,
    cellGap: usedGapX,
    minVal,
    maxVal
  }
}

/** Cells projection of `layoutHeatmap`. */
export function computeHeatmapCells(
  data: HeatmapChartDatum[],
  opts: LayoutHeatmapOptions
): HeatmapCell[] {
  return layoutHeatmap(data, opts).cells
}

export interface PaintHeatmapCanvasOptions {
  width: number
  height: number
  dpr?: number
  cellRadius?: number
  showValues?: boolean
  valueFormatter?: (value: number) => string
  activeIndex?: number | null
  activeOpacity?: number
  inactiveOpacity?: number
}

function paintRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
): void {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
  ctx.fill()
}

export function paintHeatmapCanvas(
  ctx: CanvasRenderingContext2D,
  cells: readonly HeatmapCell[],
  options: PaintHeatmapCanvasOptions
): void {
  const dpr = isFiniteNumber(options.dpr) && options.dpr > 0 ? options.dpr : 1
  const width = Math.max(0, options.width)
  const height = Math.max(0, options.height)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '10px sans-serif'

  const cellRadius = isFiniteNumber(options.cellRadius) ? Math.max(0, options.cellRadius) : 0
  const activeIndex = options.activeIndex ?? null

  for (const cell of cells) {
    if (cell.empty) continue
    ctx.globalAlpha =
      getChartElementOpacity(cell.index, activeIndex, {
        activeOpacity: options.activeOpacity,
        inactiveOpacity: options.inactiveOpacity
      }) ?? 1
    ctx.fillStyle = cell.fill
    const radius = Math.max(0, Math.min(cellRadius, cell.w / 2, cell.h / 2))
    if (radius > 0) {
      paintRoundedRect(ctx, cell.x, cell.y, cell.w, cell.h, radius)
    } else {
      ctx.fillRect(cell.x, cell.y, cell.w, cell.h)
    }
    if (options.showValues && cell.value !== null) {
      ctx.globalAlpha = 1
      ctx.fillStyle = heatmapLabelFill(cell.fill, cell.heat)
      const text = options.valueFormatter ? options.valueFormatter(cell.value) : `${cell.value}`
      ctx.fillText(text, cell.x + cell.w / 2, cell.y + cell.h / 2)
    }
  }
  ctx.globalAlpha = 1
}
