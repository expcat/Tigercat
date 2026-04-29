/**
 * Chart axis tick generation + grid line dasharray.
 *
 * Split out of `chart-utils.ts` (PR-12).
 */

import type {
  ChartAxisTick,
  ChartGridLineStyle,
  ChartScale,
  ChartScaleValue
} from '../../types/chart'

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
    (scale.type === 'linear' ? getLinearTicks(scale.domain as number[], tickCount) : scale.domain)

  return resolvedTickValues.map((value) => {
    const basePosition = scale.map(value)
    const position =
      scale.type === 'band' && typeof scale.bandwidth === 'number'
        ? basePosition + scale.bandwidth / 2
        : basePosition

    return {
      value,
      position,
      label: format(value)
    }
  })
}

function getLinearTicks(domain: number[], count: number): number[] {
  const min = Math.min(domain[0], domain[1])
  const max = Math.max(domain[0], domain[1])
  if (min === max || !Number.isFinite(min) || !Number.isFinite(max)) {
    return [min]
  }

  const step = getNiceStep((max - min) / Math.max(1, count))
  const start = Math.ceil(min / step) * step
  const end = Math.floor(max / step) * step
  const ticks: number[] = []

  for (let value = start; value <= end + step / 2; value += step) {
    ticks.push(roundTick(value, step))
  }

  return ticks
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
