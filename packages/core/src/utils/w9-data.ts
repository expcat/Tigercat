/**
 * W9 data, chart, editor, and composite helpers.
 * Virtual windows, xlsx bytes, and the upload queue stay in their existing modules.
 */

import type { TableColumn, TableFixedPosition } from '../types/table'
import type { ExclusiveVirtualRange } from '../types/virtual-list'
import { calculateVirtualColumnRange, type VirtualColumnRange } from './virtual-table-utils'
import { calculateVirtualRange } from './virtual-list-utils'
import { tableRowKeyId } from './table-utils'
import { formatMonthYear } from './date-utils'
import { downsampleSeriesData } from './chart-shared'
import { devWarn } from './dev-warn'
import { formatW9Label, getW9DataLabels } from './i18n/w9/data-labels'

export { formatW9Label, getW9DataLabels }
export type { W9DataLabels } from './i18n/w9/data-labels'

export type TableVirtualStrategy = 'window' | 'passthrough'

export function resolveTableVirtualStrategy(options: {
  virtual?: boolean
  variableRowHeight?: boolean
  spannedCells?: boolean
  expandable?: unknown
  groupBy?: string
}): TableVirtualStrategy {
  if (!options.virtual) return 'passthrough'
  if (options.variableRowHeight || options.spannedCells || options.expandable || options.groupBy) {
    return 'passthrough'
  }
  return 'window'
}

export interface TableSortLevel {
  key: string
  direction: 'asc' | 'desc'
}

/** Controlled multi-sort. A repeated key moves to the end and flips direction. */
export function nextMultiSort(
  current: readonly TableSortLevel[],
  columnKey: string
): TableSortLevel[] {
  const rest = current.filter((level) => level.key !== columnKey)
  const existing = current.find((level) => level.key === columnKey)
  if (!existing) return [...rest, { key: columnKey, direction: 'asc' }]
  if (existing.direction === 'asc') return [...rest, { key: columnKey, direction: 'desc' }]
  return rest
}

export function columnHasSpan<T>(column: TableColumn<T>): boolean {
  return column.rowSpan !== undefined || column.colSpan !== undefined
}

export function tableHasSpannedColumns<T>(columns: readonly TableColumn<T>[]): boolean {
  return columns.some((column) => columnHasSpan(column))
}

export function resolveCellSpan(
  span: number | ((record: unknown, index: number) => number) | undefined,
  record: unknown,
  index: number
): number {
  const value = typeof span === 'function' ? span(record, index) : span
  if (typeof value !== 'number' || !Number.isFinite(value)) return 1
  return Math.max(0, Math.floor(value))
}

export interface PinnedColumnSlice<T> {
  start: TableColumn<T>[]
  middle: TableColumn<T>[]
  end: TableColumn<T>[]
}

export function splitPinnedColumns<T>(columns: readonly TableColumn<T>[]): PinnedColumnSlice<T> {
  const start: TableColumn<T>[] = []
  const middle: TableColumn<T>[] = []
  const end: TableColumn<T>[] = []
  for (const column of columns) {
    if (column.fixed === 'start') start.push(column)
    else if (column.fixed === 'end') end.push(column)
    else middle.push(column)
  }
  return { start, middle, end }
}

export interface PinnedVirtualColumns<T> {
  start: TableColumn<T>[]
  middle: TableColumn<T>[]
  end: TableColumn<T>[]
  range: VirtualColumnRange
  active: boolean
}

/**
 * Pinned columns stay outside the virtual slice. Only the middle uses the
 * existing column-range helper.
 */
export function virtualizeMiddleColumns<T>(options: {
  columns: readonly TableColumn<T>[]
  widths: readonly number[]
  scrollLeft: number
  viewportWidth: number
  overscan?: number
  dir?: 'ltr' | 'rtl'
  enabled?: boolean
}): PinnedVirtualColumns<T> {
  const split = splitPinnedColumns(options.columns)
  const idle: PinnedVirtualColumns<T> = {
    start: split.start,
    middle: split.middle,
    end: split.end,
    range: { start: 0, end: split.middle.length, inlineBefore: 0, inlineAfter: 0 },
    active: false
  }
  if (!options.enabled) return idle
  const widthByKey = new Map<string, number>()
  options.columns.forEach((column, index) => {
    const width = options.widths[index]
    widthByKey.set(column.key, Number.isFinite(width) && width > 0 ? width : 0)
  })
  const middleWidths = split.middle.map((column) => widthByKey.get(column.key) ?? 0)
  if (middleWidths.length === 0 || middleWidths.some((width) => width <= 0)) return idle
  const viewport = Number.isFinite(options.viewportWidth) ? options.viewportWidth : 0
  if (!(viewport > 0)) return idle
  const range = calculateVirtualColumnRange(
    options.scrollLeft,
    viewport,
    middleWidths,
    options.overscan ?? 2,
    options.dir ?? 'ltr'
  )
  return {
    start: split.start,
    middle: split.middle.slice(range.start, range.end),
    end: split.end,
    range,
    active: true
  }
}

export function shiftSelectTableKeys(options: {
  orderedKeys: readonly (string | number)[]
  anchor: string | number | null
  target: string | number
  disabledKeys?: readonly (string | number)[]
}): (string | number)[] {
  const disabled = new Set((options.disabledKeys ?? []).map((key) => tableRowKeyId(key)))
  const anchor = options.anchor ?? options.target
  const start = options.orderedKeys.findIndex((key) => tableRowKeyId(key) === tableRowKeyId(anchor))
  const end = options.orderedKeys.findIndex(
    (key) => tableRowKeyId(key) === tableRowKeyId(options.target)
  )
  if (start < 0 || end < 0) return []
  const [from, to] = start <= end ? [start, end] : [end, start]
  const next: (string | number)[] = []
  for (let index = from; index <= to; index++) {
    const key = options.orderedKeys[index]
    if (disabled.has(tableRowKeyId(key))) continue
    next.push(key)
  }
  return next
}

export function selectionAnnouncement(
  previousCount: number | null,
  nextCount: number,
  template: string
): string | null {
  if (previousCount === nextCount) return null
  return formatW9Label(template, { count: nextCount })
}

export function toggleCollapsedKey(
  keys: readonly string[],
  key: string
): string[] {
  return keys.includes(key) ? keys.filter((item) => item !== key) : [...keys, key]
}

export type TableKeyboardMode = 'native' | 'grid'

export function resolveTableKeyboardMode(grid?: boolean): TableKeyboardMode {
  return grid ? 'grid' : 'native'
}

export interface GridCellMove {
  row: number
  column: number
}

export function nextGridCell(options: {
  row: number
  column: number
  rowCount: number
  columnCount: number
  key: string
}): GridCellMove | null {
  const rowCount = Math.max(0, options.rowCount)
  const columnCount = Math.max(0, options.columnCount)
  if (rowCount === 0 || columnCount === 0) return null
  let row = options.row
  let column = options.column
  if (options.key === 'ArrowRight') column += 1
  else if (options.key === 'ArrowLeft') column -= 1
  else if (options.key === 'ArrowDown') row += 1
  else if (options.key === 'ArrowUp') row -= 1
  else return null
  if (row < 0 || column < 0 || row >= rowCount || column >= columnCount) {
    return { row: options.row, column: options.column }
  }
  return { row, column }
}

export type TableEditKind = 'text' | 'number' | 'select'

export interface TableEditResult {
  ok: true
  value: unknown
  nextData: Record<string, unknown>[]
}

export interface TableEditFailure {
  ok: false
  message?: string
}

export function commitValidatedCellEdit(options: {
  data: readonly Record<string, unknown>[]
  rowIndex: number
  column: Pick<TableColumn, 'key' | 'dataKey' | 'edit' | 'validate'>
  raw: unknown
}): TableEditResult | TableEditFailure {
  const row = options.data[options.rowIndex]
  if (!row) return { ok: false, message: 'missing-row' }
  const kind = options.column.edit ?? 'text'
  let value: unknown = rawEditValue(kind, options.raw)
  if (kind === 'number' && (typeof value !== 'number' || !Number.isFinite(value))) {
    return { ok: false, message: 'invalid-number' }
  }
  const verdict = options.column.validate?.(value, row)
  if (verdict === false) return { ok: false }
  if (typeof verdict === 'string' && verdict.length > 0) return { ok: false, message: verdict }
  const field = options.column.dataKey || options.column.key
  const nextData = options.data.map((record, index) =>
    index === options.rowIndex ? { ...record, [field]: value } : record
  )
  return { ok: true, value, nextData }
}

function rawEditValue(kind: TableEditKind, raw: unknown): unknown {
  if (kind === 'number') {
    if (typeof raw === 'number') return raw
    if (typeof raw === 'string' && raw.trim() !== '') return Number(raw)
    return Number.NaN
  }
  return raw
}

export type TableExportScopeName = 'page' | 'selected' | 'all'

export function formatExportCell<T>(
  value: unknown,
  record: T,
  formatter?: (value: unknown, record: T) => string
): string {
  if (formatter) return formatter(value, record)
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return ''
}

export function resolveFormattedExportRows<T extends Record<string, unknown>>(options: {
  scope: TableExportScopeName
  pageRecords: readonly T[]
  processedRecords: readonly T[]
  processedKeys: readonly (string | number)[]
  selectedKeys: readonly (string | number)[]
  columns: readonly TableColumn<T>[]
}): { columns: string[]; rows: string[][] } {
  const selected = new Set(options.selectedKeys.map((key) => tableRowKeyId(key)))
  let records = options.processedRecords
  if (options.scope === 'page') records = options.pageRecords
  if (options.scope === 'selected') {
    records = options.processedRecords.filter((_, index) =>
      selected.has(tableRowKeyId(options.processedKeys[index] ?? index))
    )
  }
  const columns = options.columns.map((column) => column.title || column.key)
  const rows = records.map((record) =>
    options.columns.map((column) => {
      const field = column.dataKey || column.key
      return formatExportCell(record[field], record, column.cellFormatter)
    })
  )
  return { columns, rows }
}

export function sumNumericColumn<T extends Record<string, unknown>>(
  records: readonly T[],
  column: Pick<TableColumn<T>, 'key' | 'dataKey'>
): number | null {
  const field = column.dataKey || column.key
  let total = 0
  let any = false
  for (const record of records) {
    const value = record[field]
    if (typeof value === 'number' && Number.isFinite(value)) {
      total += value
      any = true
    }
  }
  return any ? total : null
}

export function buildSummaryCells<T extends Record<string, unknown>>(options: {
  records: readonly T[]
  columns: readonly TableColumn<T>[]
  caller?: Record<string, unknown>
  sum?: boolean | readonly string[]
}): string[] {
  const sumKeys =
    options.sum === true
      ? null
      : Array.isArray(options.sum)
        ? new Set(options.sum)
        : options.sum
          ? new Set(options.sum)
          : null
  return options.columns.map((column) => {
    const field = column.dataKey || column.key
    if (options.caller && Object.prototype.hasOwnProperty.call(options.caller, field)) {
      return formatExportCell(options.caller[field], options.caller)
    }
    const shouldSum = options.sum === true || (sumKeys ? sumKeys.has(column.key) : Boolean(column.sum))
    if (!shouldSum) return ''
    const total = sumNumericColumn(options.records, column)
    return total === null ? '' : String(total)
  })
}

export function cardVirtualWindow(options: {
  scrollTop: number
  viewportHeight: number
  cardHeight: number | undefined
  variable: boolean
  count: number
  overscan?: number
}): ExclusiveVirtualRange | null {
  if (options.variable || !(typeof options.cardHeight === 'number') || !(options.cardHeight > 0)) {
    return null
  }
  return calculateVirtualRange(
    options.scrollTop,
    options.viewportHeight,
    options.count,
    options.cardHeight,
    options.overscan ?? 2
  )
}

export function reorderByHandle<T>(items: readonly T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
    return [...items]
  }
  const next = [...items]
  const [moved] = next.splice(from, 1)
  next.splice(to, 0, moved)
  return next
}

export function logicalEdge(fixed: TableFixedPosition): 'inline-start' | 'inline-end' {
  return fixed === 'start' ? 'inline-start' : 'inline-end'
}

export function toggleLegendHidden(hiddenKeys: readonly string[], key: string): string[] {
  return hiddenKeys.includes(key) ? hiddenKeys.filter((item) => item !== key) : [...hiddenKeys, key]
}

export function isLegendHidden(hiddenKeys: readonly string[], key: string): boolean {
  return hiddenKeys.includes(key)
}

/** Domain stays on the full series. Hidden keys only affect drawing. */
export function domainExtentIncludingHidden(values: readonly number[]): { min: number; max: number } {
  const finite = values.filter((value) => Number.isFinite(value))
  if (finite.length === 0) return { min: 0, max: 0 }
  return { min: Math.min(...finite), max: Math.max(...finite) }
}

export interface BarSeriesInput {
  key: string
  data: readonly { x: string | number; y: number }[]
}

export interface LaidOutGroupedBar {
  seriesKey: string
  x: string | number
  y: number
  slot: number
  slots: number
  stacked: boolean
  y0: number
  y1: number
}

/**
 * Grouped bars share one category bandwidth. Stacked bars use that same band
 * and accumulate from the running total.
 */
export function layoutGroupedOrStackedBars(
  series: readonly BarSeriesInput[],
  mode: 'grouped' | 'stacked',
  hiddenKeys: readonly string[] = []
): LaidOutGroupedBar[] {
  const visible = series.filter((item) => !isLegendHidden(hiddenKeys, item.key))
  const categories: (string | number)[] = []
  const seen = new Set<string>()
  for (const item of series) {
    for (const point of item.data) {
      const id = String(point.x)
      if (!seen.has(id)) {
        seen.add(id)
        categories.push(point.x)
      }
    }
  }
  const slots = mode === 'grouped' ? Math.max(1, visible.length) : 1
  const bars: LaidOutGroupedBar[] = []
  categories.forEach((x) => {
    let stack = 0
    visible.forEach((item, slot) => {
      const point = item.data.find((entry) => String(entry.x) === String(x))
      if (!point || !Number.isFinite(point.y)) return
      if (mode === 'stacked') {
        const y0 = stack
        stack += point.y
        bars.push({
          seriesKey: item.key,
          x,
          y: point.y,
          slot: 0,
          slots: 1,
          stacked: true,
          y0,
          y1: stack
        })
      } else {
        bars.push({
          seriesKey: item.key,
          x,
          y: point.y,
          slot,
          slots,
          stacked: false,
          y0: 0,
          y1: point.y
        })
      }
    })
  })
  return bars
}

export function formatChartTimeTick(value: number | Date, locale?: string): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return formatMonthYear(date.getFullYear(), date.getMonth(), locale)
}

export interface ChartReferenceMark {
  axis?: 'y' | 'y2'
  value: number
  end?: number
  label?: string
}

export function chartReferenceInDomain(
  mark: ChartReferenceMark,
  domain: { min: number; max: number }
): boolean {
  const start = mark.value
  const end = mark.end ?? mark.value
  return Math.max(start, end) >= domain.min && Math.min(start, end) <= domain.max
}

export function brushDomain(
  current: { min: number; max: number },
  next: { min: number; max: number } | null
): { min: number; max: number } {
  if (!next) return current
  const min = Math.min(next.min, next.max)
  const max = Math.max(next.min, next.max)
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) return current
  return { min, max }
}

export function chartSeriesForHitTest<T>(
  data: readonly T[],
  threshold: number,
  getValue: (item: T, index: number) => number
): T[] {
  return downsampleSeriesData(data, threshold, getValue).map((point) => point.item)
}

export interface StructuredTooltipRow {
  name: string
  value: string
  percent: string
}

export function structuredTooltipRows(
  items: readonly { name: string; value: number }[],
  total: number
): StructuredTooltipRow[] {
  const safeTotal = Number.isFinite(total) && total !== 0 ? total : 0
  return items.map((item) => ({
    name: item.name,
    value: String(item.value),
    percent: safeTotal === 0 ? '0%' : `${Math.round((item.value / safeTotal) * 1000) / 10}%`
  }))
}

export interface PieLabelBox {
  index: number
  x: number
  y: number
  width: number
  height: number
}

/** Nudge external labels so their boxes do not overlap. */
export function separatePieLabels(labels: readonly PieLabelBox[], gap = 4): PieLabelBox[] {
  const next = labels.map((label) => ({ ...label }))
  next.sort((a, b) => a.y - b.y)
  for (let index = 1; index < next.length; index++) {
    const previous = next[index - 1]
    const current = next[index]
    const minY = previous.y + previous.height + gap
    if (current.y < minY) current.y = minY
  }
  return next
}

export type PieRadiusMode = 'equal' | 'rose'

export function pieOuterRadius(
  mode: PieRadiusMode,
  base: number,
  value: number,
  max: number
): number {
  if (mode !== 'rose' || !(max > 0)) return base
  const ratio = Math.max(0, value) / max
  return base * (0.35 + 0.65 * ratio)
}

export interface RadarIndicatorScale {
  name: string
  max: number
}

export function radarRatio(value: number, indicator: RadarIndicatorScale): number {
  if (!Number.isFinite(value) || !(indicator.max > 0)) return 0
  return Math.max(0, Math.min(1, value / indicator.max))
}

export type GaugeDisplay = 'pointer' | 'arc'

export function gaugeShowsPointer(display: GaugeDisplay): boolean {
  return display === 'pointer'
}

export interface HeatColorStop {
  offset: number
  color: string
}

export function heatColorBand(minColor: string, maxColor: string): HeatColorStop[] {
  return [
    { offset: 0, color: minColor },
    { offset: 1, color: maxColor }
  ]
}

export function heatBandLabel(value: number | null, min: number, max: number): string {
  if (value === null) return ''
  return `${min} – ${value} – ${max}`
}

export interface FunnelRatio {
  index: number
  value: number
  versusPrevious: number | null
  versusFirst: number | null
}

export function funnelLayerRatios(values: readonly number[]): FunnelRatio[] {
  const first = values.find((value) => Number.isFinite(value) && value !== 0) ?? null
  let previous: number | null = null
  return values.map((value, index) => {
    const ratio: FunnelRatio = {
      index,
      value,
      versusPrevious:
        previous === null || previous === 0 || !Number.isFinite(value) ? null : value / previous,
      versusFirst: first === null || !Number.isFinite(value) ? null : value / first
    }
    if (Number.isFinite(value)) previous = value
    return ratio
  })
}

export function drillInto(path: readonly string[], id: string): string[] {
  return [...path, id]
}

export function drillBreadcrumb(path: readonly string[]): string[] {
  return [...path]
}

export function drillBack(path: readonly string[]): string[] {
  return path.slice(0, -1)
}

export interface DrillNode {
  id: string
  children?: readonly DrillNode[]
}

export function drillVisibleNodes(roots: readonly DrillNode[], path: readonly string[]): DrillNode[] {
  let level: readonly DrillNode[] = roots
  for (const id of path) {
    const next = level.find((node) => node.id === id)
    if (!next || !next.children) return []
    level = next.children
  }
  return [...level]
}

export type WaterfallKind = 'increase' | 'decrease' | 'total'

export interface WaterfallDatum {
  label: string
  value: number
  kind: WaterfallKind
}

export interface LaidOutWaterfallBar {
  index: number
  label: string
  kind: WaterfallKind
  y0: number
  y1: number
  value: number
}

export function layoutWaterfall(data: readonly WaterfallDatum[]): LaidOutWaterfallBar[] {
  let running = 0
  return data.map((item, index) => {
    if (item.kind === 'total') {
      const bar = { index, label: item.label, kind: item.kind, y0: 0, y1: item.value, value: item.value }
      running = item.value
      return bar
    }
    const delta = item.kind === 'decrease' ? -Math.abs(item.value) : Math.abs(item.value)
    const y0 = running
    running += delta
    return {
      index,
      label: item.label,
      kind: item.kind,
      y0,
      y1: running,
      value: delta
    }
  })
}

export interface SankeyNodeInput {
  id: string
  label?: string
}

export interface SankeyLinkInput {
  source: string
  target: string
  value: number
}

export interface LaidOutSankeyNode {
  id: string
  label: string
  column: number
  x: number
  y: number
  width: number
  height: number
}

export interface LaidOutSankeyLink {
  source: string
  target: string
  value: number
  path: string
  width: number
}

export interface LaidOutSankey {
  nodes: LaidOutSankeyNode[]
  links: LaidOutSankeyLink[]
}

export function layoutSankey(
  nodes: readonly SankeyNodeInput[],
  links: readonly SankeyLinkInput[],
  width: number,
  height: number,
  direction: 'ltr' | 'rtl' = 'ltr'
): LaidOutSankey {
  const incoming = new Map<string, number>()
  const outgoing = new Map<string, number>()
  for (const node of nodes) {
    incoming.set(node.id, 0)
    outgoing.set(node.id, 0)
  }
  const finiteLinks = links.filter(
    (link) =>
      incoming.has(link.source) &&
      incoming.has(link.target) &&
      Number.isFinite(link.value) &&
      link.value > 0
  )
  for (const link of finiteLinks) {
    outgoing.set(link.source, (outgoing.get(link.source) ?? 0) + link.value)
    incoming.set(link.target, (incoming.get(link.target) ?? 0) + link.value)
  }
  const column = new Map<string, number>()
  const sources = nodes.filter((node) => (incoming.get(node.id) ?? 0) === 0)
  const queue = (sources.length > 0 ? sources : nodes.slice(0, 1)).map((node) => node.id)
  for (const id of queue) column.set(id, 0)
  const bySource = new Map<string, string[]>()
  for (const link of finiteLinks) {
    const list = bySource.get(link.source) ?? []
    list.push(link.target)
    bySource.set(link.source, list)
  }
  const pending = [...queue]
  while (pending.length > 0) {
    const id = pending.shift() as string
    const nextColumn = (column.get(id) ?? 0) + 1
    for (const target of bySource.get(id) ?? []) {
      const existing = column.get(target)
      if (existing === undefined || existing < nextColumn) {
        column.set(target, nextColumn)
        pending.push(target)
      }
    }
  }
  let maxColumn = 0
  for (const node of nodes) {
    if (!column.has(node.id)) column.set(node.id, 0)
    maxColumn = Math.max(maxColumn, column.get(node.id) ?? 0)
  }
  const columns: string[][] = Array.from({ length: maxColumn + 1 }, () => [])
  for (const node of nodes) columns[column.get(node.id) ?? 0].push(node.id)
  const nodeWidth = Math.min(24, Math.max(8, width / 20))
  const gap = 8
  const innerHeight = Math.max(0, height - gap)
  const laidNodes: LaidOutSankeyNode[] = []
  const nodeBox = new Map<string, LaidOutSankeyNode>()
  columns.forEach((ids, columnIndex) => {
    const magnitude = ids.map((id) => Math.max(incoming.get(id) ?? 0, outgoing.get(id) ?? 0, 1))
    const total = magnitude.reduce((sum, value) => sum + value, 0)
    const usable = Math.max(0, innerHeight - gap * Math.max(0, ids.length - 1))
    let y = gap / 2
    ids.forEach((id, index) => {
      const nodeHeight = total > 0 ? (magnitude[index] / total) * usable : usable / ids.length
      const logicalX =
        maxColumn === 0
          ? (width - nodeWidth) / 2
          : (columnIndex / maxColumn) * Math.max(0, width - nodeWidth)
      const x = direction === 'rtl' ? width - nodeWidth - logicalX : logicalX
      const node = nodes.find((item) => item.id === id)
      const laid: LaidOutSankeyNode = {
        id,
        label: node?.label ?? id,
        column: columnIndex,
        x,
        y,
        width: nodeWidth,
        height: Math.max(2, nodeHeight)
      }
      laidNodes.push(laid)
      nodeBox.set(id, laid)
      y += nodeHeight + gap
    })
  })
  const sourceCursor = new Map<string, number>()
  const targetCursor = new Map<string, number>()
  const laidLinks: LaidOutSankeyLink[] = finiteLinks.map((link) => {
    const source = nodeBox.get(link.source)
    const target = nodeBox.get(link.target)
    if (!source || !target) {
      return { source: link.source, target: link.target, value: link.value, path: '', width: 0 }
    }
    const sourceMag = Math.max(outgoing.get(link.source) ?? 0, 1)
    const targetMag = Math.max(incoming.get(link.target) ?? 0, 1)
    const thickness = Math.max(1, (link.value / sourceMag) * source.height)
    const sourceOffset = sourceCursor.get(link.source) ?? 0
    const targetOffset = targetCursor.get(link.target) ?? 0
    sourceCursor.set(link.source, sourceOffset + (link.value / sourceMag) * source.height)
    targetCursor.set(link.target, targetOffset + (link.value / targetMag) * target.height)
    const x1 = direction === 'rtl' ? source.x : source.x + source.width
    const x2 = direction === 'rtl' ? target.x + target.width : target.x
    const y1 = source.y + sourceOffset + thickness / 2
    const y2 = target.y + targetOffset + Math.max(1, (link.value / targetMag) * target.height) / 2
    const mid = (x1 + x2) / 2
    const path = `M ${x1} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${x2} ${y2}`
    return { source: link.source, target: link.target, value: link.value, path, width: thickness }
  })
  return { nodes: laidNodes, links: laidLinks }
}

export interface CodeLanguageDefinition {
  id: string
  keywords?: readonly string[]
}

const codeLanguages = new Map<string, CodeLanguageDefinition>()

export function registerCodeEditorLanguage(definition: CodeLanguageDefinition): void {
  codeLanguages.set(definition.id, definition)
}

export function registeredCodeEditorLanguage(id: string): CodeLanguageDefinition | undefined {
  return codeLanguages.get(id)
}

export interface CodeMatch {
  index: number
  length: number
}

export function findCodeMatches(text: string, query: string): CodeMatch[] {
  if (!query) return []
  const matches: CodeMatch[] = []
  let from = 0
  while (from <= text.length) {
    const index = text.indexOf(query, from)
    if (index < 0) break
    matches.push({ index, length: query.length })
    from = index + Math.max(1, query.length)
  }
  return matches
}

export function replaceCodeMatches(text: string, query: string, replacement: string, all: boolean): string {
  if (!query) return text
  if (all) return text.split(query).join(replacement)
  const index = text.indexOf(query)
  if (index < 0) return text
  return text.slice(0, index) + replacement + text.slice(index + query.length)
}

export interface BracketPair {
  open: number
  close: number
}

const BRACKETS: Record<string, string> = { '(': ')', '[': ']', '{': '}' }
const CLOSING = new Set(Object.values(BRACKETS))

export function matchBrackets(text: string, caret: number): BracketPair | null {
  const index = Math.max(0, Math.min(text.length - 1, caret))
  const char = text[index]
  if (!char) return null
  if (BRACKETS[char]) return scanBracket(text, index, 1, char, BRACKETS[char])
  if (CLOSING.has(char)) {
    const open = Object.keys(BRACKETS).find((key) => BRACKETS[key] === char)
    if (!open) return null
    return scanBracket(text, index, -1, open, char)
  }
  return null
}

function scanBracket(
  text: string,
  start: number,
  step: 1 | -1,
  open: string,
  close: string
): BracketPair | null {
  let depth = 0
  for (let index = start; index >= 0 && index < text.length; index += step) {
    const char = text[index]
    if (char === open) depth += step === 1 ? 1 : -1
    else if (char === close) depth += step === 1 ? -1 : 1
    if (depth === 0 && index !== start) {
      return step === 1 ? { open: start, close: index } : { open: index, close: start }
    }
  }
  return null
}

export function codeEditorLineWindow(options: {
  scrollTop: number
  viewportHeight: number
  lineHeight: number
  lineCount: number
  overscan?: number
}): ExclusiveVirtualRange {
  return calculateVirtualRange(
    options.scrollTop,
    options.viewportHeight,
    options.lineCount,
    options.lineHeight,
    options.overscan ?? 3
  )
}

export interface MarkdownHeading {
  level: number
  text: string
  index: number
}

export function markdownHeadings(markdown: string): MarkdownHeading[] {
  const headings: MarkdownHeading[] = []
  const lines = markdown.split('\n')
  let offset = 0
  for (const line of lines) {
    const match = /^(#{1,6})\s+(.+)$/.exec(line)
    if (match) {
      headings.push({ level: match[1].length, text: match[2].trim(), index: offset })
    }
    offset += line.length + 1
  }
  return headings
}

export function lockedPaneScroll(scrollTop: number, sourceRange: number, targetRange: number): number {
  if (!(sourceRange > 0) || !(targetRange > 0)) return 0
  const ratio = Math.min(1, Math.max(0, scrollTop / sourceRange))
  return ratio * targetRange
}

export function htmlToMarkdown(sanitizedHtml: string): string {
  return sanitizedHtml
    .replace(/<h([1-6])[^>]*>(.*?)<\/h\1>/gi, (_, level: string, text: string) => {
      return `${'#'.repeat(Number(level))} ${stripTags(text)}\n\n`
    })
    .replace(/<li>\s*<input[^>]*checked[^>]*>\s*(.*?)<\/li>/gi, (_, text: string) => `- [x] ${stripTags(text)}\n`)
    .replace(/<li>\s*<input[^>]*>\s*(.*?)<\/li>/gi, (_, text: string) => `- [ ] ${stripTags(text)}\n`)
    .replace(/<li[^>]*>(.*?)<\/li>/gi, (_, text: string) => `- ${stripTags(text)}\n`)
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
    .replace(/<s[^>]*>(.*?)<\/s>/gi, '~~$1~~')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, '').trim()
}

export type RichTextBlockType =
  | 'paragraph'
  | 'heading'
  | 'list'
  | 'quote'
  | 'code'
  | 'link'
  | 'image'
  | 'table'

export interface RichTextBlock {
  type: RichTextBlockType
  text?: string
  level?: number
  ordered?: boolean
  href?: string
  src?: string
  alt?: string
  width?: number
  rows?: string[][]
  items?: string[]
}

export function slashInsertBlock(kind: RichTextBlockType): RichTextBlock {
  if (kind === 'heading') return { type: 'heading', level: 2, text: '' }
  if (kind === 'list') return { type: 'list', ordered: false, items: [''] }
  if (kind === 'quote') return { type: 'quote', text: '' }
  if (kind === 'code') return { type: 'code', text: '' }
  if (kind === 'link') return { type: 'link', href: '', text: '' }
  if (kind === 'image') return { type: 'image', src: '', alt: '', width: undefined }
  if (kind === 'table') return { type: 'table', rows: [['', ''], ['', '']] }
  return { type: 'paragraph', text: '' }
}

export function serializeRichText(blocks: readonly RichTextBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === 'heading') return `${'#'.repeat(block.level ?? 1)} ${block.text ?? ''}`
      if (block.type === 'list') {
        return (block.items ?? [])
          .map((item, index) => (block.ordered ? `${index + 1}. ${item}` : `- ${item}`))
          .join('\n')
      }
      if (block.type === 'quote') return `> ${block.text ?? ''}`
      if (block.type === 'code') return `\`\`\`\n${block.text ?? ''}\n\`\`\``
      if (block.type === 'link') return `[${block.text ?? ''}](${block.href ?? ''})`
      if (block.type === 'image') return `![${block.alt ?? ''}](${block.src ?? ''})`
      if (block.type === 'table') {
        return (block.rows ?? []).map((row) => `| ${row.join(' | ')} |`).join('\n')
      }
      return block.text ?? ''
    })
    .join('\n\n')
}

export function applyMarkdownShortcut(text: string): RichTextBlock | null {
  const heading = /^(#{1,6})\s+(.*)$/.exec(text)
  if (heading) return { type: 'heading', level: heading[1].length, text: heading[2] }
  if (/^>\s+/.test(text)) return { type: 'quote', text: text.replace(/^>\s+/, '') }
  if (/^```/.test(text)) return { type: 'code', text: text.replace(/^```/, '') }
  if (/^[-*]\s+/.test(text)) return { type: 'list', ordered: false, items: [text.replace(/^[-*]\s+/, '')] }
  if (/^\d+\.\s+/.test(text)) return { type: 'list', ordered: true, items: [text.replace(/^\d+\.\s+/, '')] }
  return null
}

export function setRichTextImageWidth(block: RichTextBlock, width: number): RichTextBlock {
  if (block.type !== 'image') return block
  return { ...block, width: Number.isFinite(width) && width > 0 ? width : undefined }
}

export interface FilePermission {
  readable?: boolean
  writable?: boolean
}

export function canEmitFileOpen(permission: FilePermission | undefined): boolean {
  return permission?.readable !== false
}

export function canEmitFileRename(permission: FilePermission | undefined): boolean {
  return permission?.writable !== false
}

export function canEmitFileDelete(permission: FilePermission | undefined): boolean {
  return permission?.writable !== false
}

export interface FileSearchHit<T> {
  item: T
  path: string[]
}

export function searchFileTree<T extends { name: string; children?: readonly T[] }>(
  items: readonly T[],
  query: string,
  recursive: boolean
): FileSearchHit<T>[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return items.map((item) => ({ item, path: [item.name] }))
  const hits: FileSearchHit<T>[] = []
  const walk = (nodes: readonly T[], path: string[]) => {
    for (const node of nodes) {
      const nextPath = [...path, node.name]
      if (node.name.toLowerCase().includes(needle)) hits.push({ item: node, path: nextPath })
      if (recursive && node.children) walk(node.children, nextPath)
    }
  }
  walk(items, [])
  return hits
}

export function nudgeAnnotationBox(
  box: { x: number; y: number; width: number; height: number },
  key: string,
  step = 0.01
): { x: number; y: number; width: number; height: number } {
  const next = { ...box }
  if (key === 'ArrowLeft') next.x -= step
  else if (key === 'ArrowRight') next.x += step
  else if (key === 'ArrowUp') next.y -= step
  else if (key === 'ArrowDown') next.y += step
  next.x = clampUnit(next.x)
  next.y = clampUnit(next.y)
  return next
}

function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

export function scaleAnnotationBox(
  box: { x: number; y: number; width: number; height: number },
  factor: number
): { x: number; y: number; width: number; height: number } {
  const width = clampUnit(box.width * factor)
  const height = clampUnit(box.height * factor)
  return { x: box.x, y: box.y, width, height }
}

export function movePolygonVertex(
  points: readonly { x: number; y: number }[],
  index: number,
  next: { x: number; y: number }
): { x: number; y: number }[] {
  return points.map((point, pointIndex) =>
    pointIndex === index ? { x: clampUnit(next.x), y: clampUnit(next.y) } : { ...point }
  )
}

export interface AnnotationHistoryEntry<T> {
  annotations: T[]
}

export function pushAnnotationHistory<T>(
  past: readonly AnnotationHistoryEntry<T>[],
  current: readonly T[],
  limit = 50
): AnnotationHistoryEntry<T>[] {
  const next = [...past, { annotations: current.map((item) => structuredCloneSafe(item)) }]
  return next.slice(-limit)
}

export function undoAnnotation<T>(
  past: readonly AnnotationHistoryEntry<T>[]
): { past: AnnotationHistoryEntry<T>[]; annotations: T[] } | null {
  if (past.length === 0) return null
  const entry = past[past.length - 1]
  return { past: past.slice(0, -1), annotations: entry.annotations.map((item) => structuredCloneSafe(item)) }
}

function structuredCloneSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

export function virtualGridWindow(options: {
  scroll: number
  viewport: number
  itemCount: number
  itemSize: number
  columns?: number
  overscan?: number
}): ExclusiveVirtualRange & { columns: number } {
  const columns = Math.max(1, Math.floor(options.columns ?? 1))
  const rows = Math.ceil(options.itemCount / columns)
  const range = calculateVirtualRange(
    options.scroll,
    options.viewport,
    rows,
    options.itemSize,
    options.overscan ?? 2
  )
  return { ...range, columns }
}

export function stickyIndexesInWindow(
  range: ExclusiveVirtualRange,
  sticky: readonly number[],
  count: number
): number[] {
  const visible = new Set<number>()
  for (let index = range.start; index < range.end; index++) visible.add(index)
  for (const index of sticky) {
    if (index >= 0 && index < count) visible.add(index)
  }
  return [...visible].sort((a, b) => a - b)
}

export function scrollOffsetForId(
  ids: readonly (string | number)[],
  id: string | number,
  itemSize: number
): number | null {
  const index = ids.findIndex((item) => String(item) === String(id))
  if (index < 0) return null
  return index * itemSize
}

export function appendInfiniteIds<T extends string | number>(
  ids: readonly T[],
  next: readonly T[]
): T[] {
  const seen = new Set(ids.map((id) => String(id)))
  const appended = [...ids]
  for (const id of next) {
    if (seen.has(String(id))) continue
    seen.add(String(id))
    appended.push(id)
  }
  return appended
}

export function dragMoveAnnouncement(
  from: number,
  to: number,
  locale?: string
): string {
  return formatW9Label(getW9DataLabels(locale).dragFromTo, { from: from + 1, to: to + 1 })
}

export interface PrintPreviewPage {
  index: number
  numberLabel: string
}

export function paginatePrintPreview(options: {
  contentHeightMm: number
  pageHeightMm: number
  marginMm?: number
  manualBreaks?: number
}): PrintPreviewPage[] {
  const margin = options.marginMm ?? 0
  const content = Math.max(0, options.pageHeightMm - margin * 2)
  const autoPages =
    content <= 0 ? 1 : Math.max(1, Math.ceil(Math.max(0, options.contentHeightMm) / content))
  const count = autoPages + Math.max(0, options.manualBreaks ?? 0)
  return Array.from({ length: count }, (_, index) => ({
    index,
    numberLabel: String(index + 1)
  }))
}

export function groupActivityByDate<T extends { time?: string | number | Date }>(
  items: readonly T[]
): { title: string; items: T[] }[] {
  const groups: { title: string; items: T[] }[] = []
  for (const item of items) {
    const title = activityDateTitle(item.time)
    const last = groups[groups.length - 1]
    if (!last || last.title !== title) groups.push({ title, items: [item] })
    else last.items.push(item)
  }
  return groups
}

function activityDateTitle(time: string | number | Date | undefined): string {
  if (time === undefined) return ''
  const date = time instanceof Date ? time : new Date(time)
  if (Number.isNaN(date.getTime())) return String(time)
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function latestActivityAnnouncement<T extends { title?: string }>(items: readonly T[]): string | null {
  const latest = items[0]
  if (!latest?.title) return null
  return latest.title
}

export interface CommentEditRequest {
  id: string | number
  body: string
}

export function commentEditRequest(id: string | number, body: string): CommentEditRequest {
  return { id, body }
}

export function commentDisplayHtml(mode: 'plain' | 'rich', sanitized: string): 'text' | 'fragment' {
  return mode === 'rich' ? 'fragment' : 'text'
}

export interface AssigneeOption {
  id: string
  name: string
  department?: string
}

export function filterAssignees(
  options: readonly AssigneeOption[],
  query: string
): AssigneeOption[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return [...options]
  return options.filter((option) => {
    const haystack = `${option.name} ${option.department ?? ''} ${option.id}`.toLowerCase()
    return haystack.includes(needle)
  })
}

export function toggleAssignee(selected: readonly string[], id: string): string[] {
  return selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]
}

export function nextListboxIndex(current: number, key: string, count: number): number {
  if (count <= 0) return -1
  if (key === 'ArrowDown') return Math.min(count - 1, current + 1)
  if (key === 'ArrowUp') return Math.max(0, current - 1)
  if (key === 'Home') return 0
  if (key === 'End') return count - 1
  return current
}

const WIDGET_PARAMS: Record<string, readonly string[]> = {
  input: ['maxLength', 'prefix'],
  number: ['min', 'max', 'step', 'precision'],
  select: ['multiple', 'showSearch'],
  slider: ['min', 'max', 'step'],
  date: ['picker', 'showTime']
}

export function narrowWidgetParams(
  widget: string,
  params: Record<string, unknown> | undefined
): Record<string, unknown> {
  if (!params) return {}
  const allowed = WIDGET_PARAMS[widget]
  if (!allowed) {
    devWarn('SchemaForm.widgetParams', `Unknown widget params for ${widget}`)
    return {}
  }
  const next: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(params)) {
    if (allowed.includes(key)) next[key] = value
    else devWarn('SchemaForm.widgetParams', `Unknown ${widget} param "${key}"`)
  }
  return next
}

export function schemaFieldIsReadOnly(field: { readOnly?: boolean }): boolean {
  return field.readOnly === true
}

export function stableModelSnapshot(model: unknown): string {
  return JSON.stringify(model ?? null)
}

export function wizardStepIsDirty(snapshot: string, model: unknown): boolean {
  return snapshot !== stableModelSnapshot(model)
}

export interface GanttDependencyKind {
  type: 'FS' | 'SS' | 'FF' | 'SF'
}

export function ganttDependencyAnchors(
  type: GanttDependencyKind['type'],
  source: { x: number; width: number },
  target: { x: number; width: number }
): { x1: number; x2: number } {
  const sourceStart = source.x
  const sourceEnd = source.x + source.width
  const targetStart = target.x
  const targetEnd = target.x + target.width
  if (type === 'SS') return { x1: sourceStart, x2: targetStart }
  if (type === 'FF') return { x1: sourceEnd, x2: targetEnd }
  if (type === 'SF') return { x1: sourceStart, x2: targetEnd }
  return { x1: sourceEnd, x2: targetStart }
}

export function isGanttMilestone(start: number, end: number): boolean {
  return Number.isFinite(start) && start === end
}

export function countdownRemainingRatio(remaining: number, total: number): number {
  if (!(total > 0) || !Number.isFinite(remaining)) return 0
  return Math.min(1, Math.max(0, remaining / total))
}

export function calendarWeekNumber(date: Date, weekStartsOn = 1): number {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = utc.getUTCDay()
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn
  utc.setUTCDate(utc.getUTCDate() - diff + 3)
  const firstThursday = new Date(Date.UTC(utc.getUTCFullYear(), 0, 4))
  const firstDay = firstThursday.getUTCDay()
  const firstDiff = (firstDay < weekStartsOn ? 7 : 0) + firstDay - weekStartsOn
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDiff + 3)
  return 1 + Math.round((utc.getTime() - firstThursday.getTime()) / 604800000)
}

export function timelineLabelSide(mode: 'vertical' | 'horizontal', contentSide: 'start' | 'end'): 'start' | 'end' {
  if (mode === 'horizontal') return contentSide === 'start' ? 'end' : 'start'
  return contentSide === 'start' ? 'end' : 'start'
}

export function collapseLevelKeys(active: readonly (string | number)[], key: string | number, accordion: boolean): (string | number)[] {
  const id = String(key)
  const open = active.some((item) => String(item) === id)
  if (accordion) return open ? [] : [key]
  if (open) return active.filter((item) => String(item) !== id)
  return [...active, key]
}

export function orgVisibleIds(
  nodes: readonly { id: string; children?: readonly { id: string }[] }[],
  collapsed: readonly string[]
): string[] {
  const hidden = new Set(collapsed)
  const ids: string[] = []
  const walk = (list: readonly { id: string; children?: readonly { id: string }[] }[], parentCollapsed: boolean) => {
    for (const node of list) {
      if (!parentCollapsed) ids.push(node.id)
      walk(node.children ?? [], parentCollapsed || hidden.has(node.id))
    }
  }
  walk(nodes, false)
  return ids
}

export function findOrgMatch(
  nodes: readonly { id: string; label: string; children?: readonly { id: string; label: string }[] }[],
  query: string
): string | null {
  const needle = query.trim().toLowerCase()
  if (!needle) return null
  const walk = (
    list: readonly { id: string; label: string; children?: readonly { id: string; label: string }[] }[]
  ): string | null => {
    for (const node of list) {
      if (node.label.toLowerCase().includes(needle) || node.id.toLowerCase().includes(needle)) return node.id
      const child = walk((node.children ?? []) as { id: string; label: string; children?: { id: string; label: string }[] }[])
      if (child) return child
    }
    return null
  }
  return walk(nodes)
}

export function ganttVisibleWindow(
  tasks: readonly { start: number; end: number }[],
  window: { start: number; end: number } | null
): { start: number; end: number }[] {
  if (!window) return tasks.map((task) => ({ start: task.start, end: task.end }))
  return tasks
    .filter((task) => task.end >= window.start && task.start <= window.end)
    .map((task) => ({
      start: Math.max(task.start, window.start),
      end: Math.min(task.end, window.end)
    }))
}

export function ganttRowWindow(
  scrollTop: number,
  viewport: number,
  rowCount: number,
  rowHeight: number
): ExclusiveVirtualRange {
  return calculateVirtualRange(scrollTop, viewport, rowCount, rowHeight, 2)
}

export function devWarnUnknown(scope: string, message: string): void {
  devWarn(scope, message)
}
