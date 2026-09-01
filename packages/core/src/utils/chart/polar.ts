/**
 * Polar / radial chart layout: pie, donut, radar.
 * Vue/React only bind the returned geometry.
 */

import type { PieChartDatum, RadarChartDatum, RadarChartSeries } from '../../types/chart-radial'
import { getChartElementOpacity } from '../chart-interaction'
import { devWarn } from '../dev-warn'
import { formatChartTemplate, isFiniteNumber } from './layout'
import {
  computePieHoverOffset,
  computePieLabelLine,
  createCircleRingPath,
  createPieArcPath,
  createPolygonPath,
  createPolygonRingPath,
  getPieArcs,
  getRadarAngles,
  getRadarLabelAlign,
  polarToCartesian
} from './path'
import { DEFAULT_CHART_COLORS, RADAR_SPLIT_AREA_COLORS } from './color'

export const PIE_OUTSIDE_RADIUS_RATIO = 0.72
export const DEFAULT_PIE_START_ANGLE = -Math.PI / 2
export const DEFAULT_DONUT_INNER_RADIUS_RATIO = 0.6
/** Label offset 12 + text-xs (~12) + top-axis baseline. */
export const DEFAULT_POLAR_CHART_PADDING = 36
export const DEFAULT_GAUGE_START_ANGLE = -135
export const DEFAULT_GAUGE_END_ANGLE = 135
export const DEFAULT_GAUGE_WIDTH = 280
export const DEFAULT_GAUGE_HEIGHT = 200
export const DEFAULT_FUNNEL_HEIGHT = 300

export function pieSliceDisplayLabel(
  datum: PieChartDatum,
  index: number,
  template: string
): string {
  if (datum.label) return datum.label
  return formatChartTemplate(template, { index: index + 1, value: datum.value })
}

export function funnelStageDisplayLabel(
  datum: { label?: string; value: number },
  index: number,
  template: string
): string {
  if (datum.label) return datum.label
  return formatChartTemplate(template, { index: index + 1, value: datum.value })
}

export function resolvePieRadii(options: {
  innerWidth: number
  innerHeight: number
  innerRadius?: number
  outerRadius?: number
  innerRadiusRatio?: number
  labelPosition?: 'inside' | 'outside'
  hoverOffset?: number
}): {
  cx: number
  cy: number
  innerRadius: number
  outerRadius: number
  maxRadius: number
} {
  const cx = options.innerWidth / 2
  const cy = options.innerHeight / 2
  const hover = Math.max(0, options.hoverOffset ?? 0)
  const maxRadius = Math.max(0, Math.min(options.innerWidth, options.innerHeight) / 2 - hover)
  let outerRadius: number
  if (isFiniteNumber(options.outerRadius)) {
    outerRadius = Math.max(0, options.outerRadius)
  } else {
    outerRadius =
      options.labelPosition === 'outside' ? maxRadius * PIE_OUTSIDE_RADIUS_RATIO : maxRadius
  }
  let innerRadius = 0
  if (isFiniteNumber(options.innerRadius)) {
    innerRadius = Math.min(Math.max(0, options.innerRadius), outerRadius)
  } else if (isFiniteNumber(options.innerRadiusRatio)) {
    const ratio = Math.min(Math.max(options.innerRadiusRatio, 0), 1)
    innerRadius = outerRadius * ratio
  }
  return { cx, cy, innerRadius, outerRadius, maxRadius }
}

export interface LaidOutPieSlice {
  index: number
  datum: PieChartDatum
  value: number
  startAngle: number
  endAngle: number
  path: string
  color: string
  fill: string
  percent: number
  midAngle: number
  labelX: number
  labelY: number
  hoverDx: number
  hoverDy: number
  outside?: {
    points: string
    x: number
    y: number
    textAnchor: 'start' | 'end' | 'middle'
  }
}

export function layoutPieSlices(
  data: PieChartDatum[],
  options: {
    cx: number
    cy: number
    innerRadius: number
    outerRadius: number
    startAngle: number
    endAngle: number
    padAngle: number
    palette: string[]
    gradient?: boolean
    gradientPrefix?: string
    hoverOffset?: number
    labelPosition?: 'inside' | 'outside'
  }
): LaidOutPieSlice[] {
  data.forEach((datum) => {
    if (!isFiniteNumber(datum.value)) {
      devWarn('PieChart.nonFinite', 'PieChart skipped a datum with a non-finite value')
    } else if (datum.value < 0) {
      devWarn('PieChart.negative', 'PieChart skipped a datum with a negative value')
    } else if (datum.value === 0) {
      devWarn('PieChart.zero', 'PieChart skipped a datum with value 0')
    }
  })

  const arcs = getPieArcs(data, {
    startAngle: options.startAngle,
    endAngle: options.endAngle,
    padAngle: options.padAngle
  })
  const total = arcs.reduce((sum, arc) => sum + arc.value, 0)
  const labelRadius = options.innerRadius + (options.outerRadius - options.innerRadius) / 2
  const hoverOffset = options.hoverOffset ?? 0

  const slices: LaidOutPieSlice[] = []
  for (const arc of arcs) {
    const path = createPieArcPath({
      cx: options.cx,
      cy: options.cy,
      innerRadius: options.innerRadius,
      outerRadius: options.outerRadius,
      startAngle: arc.startAngle,
      endAngle: arc.endAngle
    })
    if (!path || path.includes('NaN')) continue
    const color = arc.data.color ?? options.palette[arc.index % options.palette.length]
    const hover = computePieHoverOffset(arc.startAngle, arc.endAngle, hoverOffset)
    const midAngle = (arc.startAngle + arc.endAngle) / 2
    const labelPos = polarToCartesian(options.cx, options.cy, labelRadius, midAngle)
    let outside: LaidOutPieSlice['outside']
    if (options.labelPosition === 'outside') {
      const line = computePieLabelLine(
        options.cx,
        options.cy,
        options.outerRadius,
        arc.startAngle,
        arc.endAngle
      )
      outside = {
        points: `${line.anchor.x},${line.anchor.y} ${line.elbow.x},${line.elbow.y} ${line.label.x},${line.label.y}`,
        x: line.label.x,
        y: line.label.y,
        textAnchor: line.textAnchor
      }
    }
    slices.push({
      index: arc.index,
      datum: arc.data,
      value: arc.value,
      startAngle: arc.startAngle,
      endAngle: arc.endAngle,
      path,
      color,
      fill:
        options.gradient && options.gradientPrefix
          ? `url(#${options.gradientPrefix}-${arc.index})`
          : color,
      percent: total > 0 ? (arc.value / total) * 100 : 0,
      midAngle,
      labelX: labelPos.x,
      labelY: labelPos.y,
      hoverDx: hover.dx,
      hoverDy: hover.dy,
      outside
    })
  }
  return slices
}

export interface RadarIndicator {
  key: string
  label: string
  index: number
}

export function resolveRadarIndicators(
  series: RadarChartSeries[],
  explicit?: string[]
): RadarIndicator[] {
  if (explicit && explicit.length > 0) {
    return explicit.map((label, index) => ({ key: String(label), label, index }))
  }
  const first = series[0]?.data ?? []
  return first.map((datum, index) => ({
    key: datum.label ?? String(index),
    label: datum.label ?? String(index + 1),
    index
  }))
}

function radarValueForIndicator(
  data: RadarChartDatum[],
  indicator: RadarIndicator
): { value: number; datum: RadarChartDatum } | null {
  const labeled = data.some((datum) => Boolean(datum.label))
  const datum = labeled
    ? data.find((item) => item.label === indicator.label || item.label === indicator.key)
    : data[indicator.index]
  if (!datum) return null
  if (!isFiniteNumber(datum.value) || datum.value < 0) return null
  return { value: datum.value, datum }
}

export interface LaidOutRadarPoint {
  x: number
  y: number
  value: number
  index: number
  angle: number
  datum: RadarChartDatum
}

export interface LaidOutRadarSeries {
  seriesIndex: number
  series: RadarChartSeries
  seriesKey: string
  color: string
  fill: string
  stroke: string
  fillOpacity: number
  path: string
  points: LaidOutRadarPoint[]
  opacity: number | undefined
}

export interface LaidOutRadar {
  cx: number
  cy: number
  radius: number
  angles: number[]
  indicators: RadarIndicator[]
  maxValue: number
  grid: Array<
    { type: 'circle'; cx: number; cy: number; r: number } | { type: 'polygon'; d: string }
  >
  splitAreas: Array<{ d: string; color: string }>
  axes: Array<{ x1: number; y1: number; x2: number; y2: number }>
  labels: Array<{
    x: number
    y: number
    text: string
    textAnchor: 'start' | 'middle' | 'end'
    dominantBaseline: 'auto' | 'middle' | 'hanging'
  }>
  levelLabels: Array<{ x: number; y: number; text: string }>
  series: LaidOutRadarSeries[]
}

export function layoutRadar(
  series: RadarChartSeries[],
  options: {
    innerWidth: number
    innerHeight: number
    startAngle: number
    maxValue?: number
    levels: number
    gridShape: 'polygon' | 'circle'
    palette: string[]
    gradient?: boolean
    gradientPrefix?: string
    indicators?: string[]
    showLabels?: boolean
    showGrid?: boolean
    showAxis?: boolean
    showSplitArea?: boolean
    showLevelLabels?: boolean
    labelOffset?: number
    levelLabelOffset?: number
    labelFormatter?: (datum: RadarChartDatum, index: number) => string
    levelLabelFormatter?: (value: number, level: number) => string
    labelAutoAlign?: boolean
    strokeColor?: string
    fillColor?: string
    fillOpacity?: number
    splitAreaColors?: string[]
    seriesKeys?: string[]
    activeIndex?: number | null
    activeOpacity?: number
    inactiveOpacity?: number
  }
): LaidOutRadar {
  const cx = options.innerWidth / 2
  const cy = options.innerHeight / 2
  const labelOffset = options.labelOffset ?? 12
  const labelSpace = options.showLabels === false ? 4 : labelOffset + 14
  const radius = Math.max(0, Math.min(options.innerWidth, options.innerHeight) / 2 - labelSpace)
  const indicators = resolveRadarIndicators(series, options.indicators)
  const angles = getRadarAngles(indicators.length, options.startAngle)

  series.forEach((item) => {
    item.data.forEach((datum) => {
      if (!isFiniteNumber(datum.value)) {
        devWarn('RadarChart.nonFinite', 'RadarChart skipped a datum with a non-finite value')
      } else if (datum.value < 0) {
        devWarn('RadarChart.negative', 'RadarChart skipped a datum with a negative value')
      }
    })
  })

  const values = series.flatMap((item) =>
    item.data.map((datum) => datum.value).filter((value) => isFiniteNumber(value) && value > 0)
  )
  const computedMax = values.length > 0 ? Math.max(...values) : 0
  const maxValue =
    isFiniteNumber(options.maxValue) && options.maxValue > 0
      ? options.maxValue
      : computedMax > 0
        ? computedMax
        : 1
  if (computedMax <= 0) {
    devWarn(
      'RadarChart.emptyDomain',
      'RadarChart has no positive values; radius domain falls back to 1'
    )
  }

  const resolvedLevels = Math.max(1, Math.floor(options.levels))
  const grid: LaidOutRadar['grid'] = []
  if (options.showGrid !== false && angles.length > 0) {
    for (let index = 0; index < resolvedLevels; index++) {
      const levelRadius = radius * ((index + 1) / resolvedLevels)
      if (options.gridShape === 'circle') {
        grid.push({ type: 'circle', cx, cy, r: levelRadius })
      } else {
        const ringPoints = angles.map((angle) => polarToCartesian(cx, cy, levelRadius, angle))
        grid.push({ type: 'polygon', d: createPolygonPath(ringPoints) })
      }
    }
  }

  const areaColors =
    options.splitAreaColors && options.splitAreaColors.length > 0
      ? options.splitAreaColors
      : RADAR_SPLIT_AREA_COLORS
  const splitAreas: LaidOutRadar['splitAreas'] = []
  if (options.showSplitArea && angles.length > 0) {
    for (let index = 0; index < resolvedLevels; index++) {
      const outerIndex = resolvedLevels - 1 - index
      const outerRadius = radius * ((outerIndex + 1) / resolvedLevels)
      const innerRadius = radius * (outerIndex / resolvedLevels)
      const color = areaColors[outerIndex % areaColors.length]
      const d =
        options.gridShape === 'circle'
          ? createCircleRingPath(cx, cy, outerRadius, innerRadius)
          : createPolygonRingPath(
              angles.map((angle) => polarToCartesian(cx, cy, outerRadius, angle)),
              outerIndex > 0
                ? angles.map((angle) => polarToCartesian(cx, cy, innerRadius, angle))
                : []
            )
      splitAreas.push({ d, color })
    }
  }

  const axes =
    options.showAxis === false || angles.length === 0
      ? []
      : angles.map((angle) => {
          const end = polarToCartesian(cx, cy, radius, angle)
          return { x1: cx, y1: cy, x2: end.x, y2: end.y }
        })

  const labels: LaidOutRadar['labels'] = []
  if (options.showLabels !== false && angles.length > 0) {
    indicators.forEach((indicator, index) => {
      const angle = angles[index]
      const position = polarToCartesian(cx, cy, radius + labelOffset, angle)
      const align =
        options.labelAutoAlign === false
          ? { textAnchor: 'middle' as const, dominantBaseline: 'middle' as const }
          : getRadarLabelAlign(angle)
      const first = series[0]?.data[index]
      const text =
        options.labelFormatter && first ? options.labelFormatter(first, index) : indicator.label
      labels.push({ x: position.x, y: position.y, text, ...align })
    })
  }

  const levelLabels: LaidOutRadar['levelLabels'] = []
  if (options.showLevelLabels && options.showGrid !== false && angles.length > 0) {
    const formatLevel = options.levelLabelFormatter ?? ((value: number) => `${value}`)
    const levelLabelOffset = options.levelLabelOffset ?? 8
    for (let index = 0; index < resolvedLevels; index++) {
      const ratio = (index + 1) / resolvedLevels
      const value = maxValue * ratio
      const position = polarToCartesian(
        cx,
        cy,
        radius * ratio + levelLabelOffset,
        options.startAngle
      )
      levelLabels.push({ x: position.x, y: position.y, text: formatLevel(value, index) })
    }
  }

  const palette = options.palette.length > 0 ? options.palette : [...DEFAULT_CHART_COLORS]
  const laidSeries: LaidOutRadarSeries[] = series.map((item, seriesIndex) => {
    const color = item.color ?? palette[seriesIndex % palette.length]
    const points: LaidOutRadarPoint[] = []
    indicators.forEach((indicator, index) => {
      const matched = radarValueForIndicator(item.data, indicator)
      if (!matched) return
      const angle = angles[index]
      if (!isFiniteNumber(angle)) return
      const pointRadius = radius * (matched.value / maxValue)
      const pos = polarToCartesian(cx, cy, pointRadius, angle)
      if (!isFiniteNumber(pos.x) || !isFiniteNumber(pos.y)) return
      points.push({
        x: pos.x,
        y: pos.y,
        value: matched.value,
        index,
        angle,
        datum: matched.datum
      })
    })
    const path = createPolygonPath(points)
    const fillOpacity = (item.fillOpacity ?? options.fillOpacity ?? 0.2) * (item.opacity ?? 1)
    const seriesKey = options.seriesKeys?.[seriesIndex] ?? `radar-${seriesIndex}`
    const fill =
      options.gradient && options.gradientPrefix
        ? `url(#${options.gradientPrefix}-${seriesKey})`
        : (item.fillColor ?? options.fillColor ?? color)
    return {
      seriesIndex,
      series: item,
      seriesKey,
      color,
      fill,
      stroke: item.strokeColor ?? options.strokeColor ?? color,
      fillOpacity,
      path: path.includes('NaN') ? '' : path,
      points,
      opacity: getChartElementOpacity(seriesIndex, options.activeIndex ?? null, {
        activeOpacity: options.activeOpacity,
        inactiveOpacity: options.inactiveOpacity
      })
    }
  })

  return {
    cx,
    cy,
    radius,
    angles,
    indicators,
    maxValue,
    grid,
    splitAreas,
    axes,
    labels,
    levelLabels,
    series: laidSeries
  }
}
