/**
 * Chart axis tick generation + grid line dasharray.
 *
 * Split out of `chart-utils.ts` (PR-12).
 */

import { devWarn } from '../dev-warn'
import type {
  ChartAxisOrientation,
  ChartAxisTick,
  ChartGridLine,
  ChartGridLineStyle,
  ChartScale,
  ChartScaleValue
} from '../../types/chart'
import { scaleContainsValue } from './scale'

const linearTickValuesCache = new Map<string, readonly number[]>()
const maxLinearTickValuesCacheSize = 128

export function getChartAxisTicks(
  scale: ChartScale,
  options: {
    tickCount?: number
    tickValues?: ChartScaleValue[]
    tickFormat?: (value: ChartScaleValue) => string
  } = {}
): ChartAxisTick[] {
  const { tickCount = 5, tickValues, tickFormat } = options
  const format = tickFormat ?? ((value: ChartScaleValue) => `${value}`)

  const resolvedTickValues =
    tickValues ??
    (scale.type === 'linear'
      ? getLinearChartTickValues(scale.domain as number[], tickCount)
      : scale.domain)

  const ticks: ChartAxisTick[] = []
  for (const value of resolvedTickValues) {
    if (scale.type !== 'linear' && !scaleContainsValue(scale, value)) {
      devWarn(
        `chart-axis.unknown-tick:${String(value)}`,
        `ChartAxis: tick value "${String(value)}" is not in the scale domain and was skipped`
      )
      continue
    }

    const basePosition = scale.map(value)
    const position =
      scale.type === 'band' && typeof scale.bandwidth === 'number'
        ? basePosition + scale.bandwidth / 2
        : basePosition

    ticks.push({
      value,
      position,
      label: format(value)
    })
  }
  return ticks
}

function getLinearTickCacheKey(min: number, max: number, count: number): string {
  return `${min}:${max}:${count}`
}

export function clearChartAxisTickCache(): void {
  linearTickValuesCache.clear()
}

export function getChartAxisTickCacheSize(): number {
  return linearTickValuesCache.size
}

export function getLinearChartTickValues(domain: number[], count: number): readonly number[] {
  const min = Math.min(domain[0], domain[1])
  const max = Math.max(domain[0], domain[1])
  if (min === max || !Number.isFinite(min) || !Number.isFinite(max)) {
    return [min]
  }

  const cacheKey = getLinearTickCacheKey(min, max, count)
  const cachedTicks = linearTickValuesCache.get(cacheKey)
  if (cachedTicks) return cachedTicks

  const step = getNiceStep((max - min) / Math.max(1, count))
  const start = Math.ceil(min / step) * step
  const end = Math.floor(max / step) * step
  const ticks: number[] = []

  for (let value = start; value <= end + step / 2; value += step) {
    ticks.push(roundTick(value, step))
  }

  if (linearTickValuesCache.size >= maxLinearTickValuesCacheSize) {
    const firstKey = linearTickValuesCache.keys().next().value
    if (firstKey) {
      linearTickValuesCache.delete(firstKey)
    }
  }

  const frozenTicks = Object.freeze(ticks)
  linearTickValuesCache.set(cacheKey, frozenTicks)
  return frozenTicks
}

function getNiceStep(step: number): number {
  if (!Number.isFinite(step) || step <= 0) return 1
  const exponent = Math.floor(Math.log10(step))
  const fraction = step / Math.pow(10, exponent)
  const niceFraction = fraction >= 5 ? 5 : fraction >= 2 ? 2 : fraction >= 1 ? 1 : 0.5

  return niceFraction * Math.pow(10, exponent)
}

function roundTick(value: number, step: number): number {
  const precision = Math.max(0, -Math.floor(Math.log10(step)) + 1)
  return Number(value.toFixed(precision))
}

export function getChartGridLineDasharray(lineStyle: ChartGridLineStyle): string | undefined {
  if (lineStyle === 'dashed') return '4 4'
  if (lineStyle === 'dotted') return '1 4'
  return undefined
}

export interface ChartAxisTickGeometry {
  key: string
  value: ChartScaleValue
  label: string
  line: { x1: number; y1: number; x2: number; y2: number }
  text: {
    x: number
    y: number
    textAnchor: 'start' | 'middle' | 'end'
    dy: string
  }
}

export interface ChartAxisLabelGeometry {
  x: number
  y: number
  textAnchor: 'start' | 'middle' | 'end'
  dy: string
  transform?: string
  text: string
}

export interface ChartAxisGeometry {
  axisLine: { x1: number; y1: number; x2: number; y2: number }
  ticks: ChartAxisTickGeometry[]
  label: ChartAxisLabelGeometry | null
}

export function getChartAxisGeometry(
  scale: ChartScale,
  options: {
    orientation?: ChartAxisOrientation
    tickCount?: number
    tickValues?: ChartScaleValue[]
    tickFormat?: (value: ChartScaleValue) => string
    tickSize?: number
    tickPadding?: number
    label?: string
    labelOffset?: number
  } = {}
): ChartAxisGeometry {
  const orientation = options.orientation ?? 'bottom'
  const tickSize = options.tickSize ?? 6
  const tickPadding = options.tickPadding ?? 4
  const labelOffset = options.labelOffset ?? 28
  const isHorizontal = orientation === 'top' || orientation === 'bottom'
  const isTopOrLeft = orientation === 'top' || orientation === 'left'
  const rangeStart = scale.range[0]
  const rangeEnd = scale.range[1]
  const tickDirection = isTopOrLeft ? -1 : 1
  const labelBase = tickSize + tickPadding + labelOffset
  const labelPosition = (rangeStart + rangeEnd) / 2
  const ticks = getChartAxisTicks(scale, {
    tickCount: options.tickCount ?? 5,
    tickValues: options.tickValues,
    tickFormat: options.tickFormat
  })

  return {
    axisLine: isHorizontal
      ? { x1: rangeStart, y1: 0, x2: rangeEnd, y2: 0 }
      : { x1: 0, y1: rangeStart, x2: 0, y2: rangeEnd },
    ticks: ticks.map((tick, index) => {
      const textAnchor: 'start' | 'middle' | 'end' = isHorizontal
        ? 'middle'
        : isTopOrLeft
          ? 'end'
          : 'start'
      return {
        key: `${index}-${String(tick.value)}`,
        value: tick.value,
        label: tick.label,
        line: isHorizontal
          ? {
              x1: tick.position,
              y1: 0,
              x2: tick.position,
              y2: tickSize * tickDirection
            }
          : {
              x1: 0,
              y1: tick.position,
              x2: tickSize * tickDirection,
              y2: tick.position
            },
        text: isHorizontal
          ? {
              x: tick.position,
              y: tickSize * tickDirection + tickPadding * tickDirection,
              textAnchor,
              dy: isTopOrLeft ? '-0.32em' : '0.71em'
            }
          : {
              x: (tickSize + tickPadding) * tickDirection,
              y: tick.position,
              textAnchor,
              dy: '0.32em'
            }
      }
    }),
    label: options.label
      ? isHorizontal
        ? {
            x: labelPosition,
            y: labelBase * tickDirection,
            textAnchor: 'middle' as const,
            dy: isTopOrLeft ? '-0.32em' : '0.71em',
            text: options.label
          }
        : {
            x: labelBase * tickDirection,
            y: labelPosition,
            textAnchor: 'middle' as const,
            dy: '0.32em',
            transform: `rotate(${isTopOrLeft ? -90 : 90} ${labelBase * tickDirection} ${labelPosition})`,
            text: options.label
          }
      : null
  }
}

export interface ChartGridLineSpec {
  key: string
  axis: 'x' | 'y'
  x1: number
  y1: number
  x2: number
  y2: number
  strokeWidth: number
  strokeDasharray?: string
}

function resolveGridRange(
  scaleRange: [number, number] | undefined,
  explicitRange: [number, number] | undefined,
  size: number | undefined
): [number, number] | null {
  if (explicitRange && Number.isFinite(explicitRange[0]) && Number.isFinite(explicitRange[1])) {
    return explicitRange
  }
  if (scaleRange) return scaleRange
  if (typeof size === 'number' && Number.isFinite(size) && size >= 0) {
    return [0, size]
  }
  return null
}

export function getChartGridLines(options: {
  xScale?: ChartScale
  yScale?: ChartScale
  xRange?: [number, number]
  yRange?: [number, number]
  width?: number
  height?: number
  show?: ChartGridLine
  xTicks?: number
  yTicks?: number
  xTickValues?: ChartScaleValue[]
  yTickValues?: ChartScaleValue[]
  lineStyle?: ChartGridLineStyle
  strokeWidth?: number
}): ChartGridLineSpec[] {
  const show = options.show ?? 'both'
  const strokeWidth = options.strokeWidth ?? 1
  const dasharray = getChartGridLineDasharray(options.lineStyle ?? 'solid')
  const xExtent = resolveGridRange(options.xScale?.range, options.xRange, options.width)
  const yExtent = resolveGridRange(options.yScale?.range, options.yRange, options.height)
  const lines: ChartGridLineSpec[] = []

  if ((show === 'both' || show === 'x') && options.xScale && yExtent) {
    const ticks = getChartAxisTicks(options.xScale, {
      tickCount: options.xTicks ?? 5,
      tickValues: options.xTickValues
    })
    ticks.forEach((tick, index) => {
      lines.push({
        key: `x-${index}-${String(tick.value)}`,
        axis: 'x',
        x1: tick.position,
        y1: yExtent[0],
        x2: tick.position,
        y2: yExtent[1],
        strokeWidth,
        strokeDasharray: dasharray
      })
    })
  }

  if ((show === 'both' || show === 'y') && options.yScale && xExtent) {
    const ticks = getChartAxisTicks(options.yScale, {
      tickCount: options.yTicks ?? 5,
      tickValues: options.yTickValues
    })
    ticks.forEach((tick, index) => {
      lines.push({
        key: `y-${index}-${String(tick.value)}`,
        axis: 'y',
        x1: xExtent[0],
        y1: tick.position,
        x2: xExtent[1],
        y2: tick.position,
        strokeWidth,
        strokeDasharray: dasharray
      })
    })
  }

  return lines
}
