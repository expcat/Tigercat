import { beforeEach, describe, expect, it } from 'vitest'
import {
  getAreaGradientPrefix,
  getBarGradientPrefix,
  getFunnelGradientPrefix,
  getGaugeGradientPrefix,
  getLineGradientPrefix,
  getPieGradientPrefix,
  getRadarGradientPrefix,
  getScatterGradientPrefix,
  getStableChartGradientPrefix,
  getSunburstGradientPrefix,
  getTreeMapGradientPrefix,
  resetAreaGradientCounter,
  resetBarGradientCounter,
  resetFunnelGradientCounter,
  resetGaugeGradientCounter,
  resetLineGradientCounter,
  resetPieGradientCounter,
  resetRadarGradientCounter,
  resetScatterGradientCounter,
  resetSunburstGradientCounter,
  resetTreeMapGradientCounter,
  stackSeriesData
} from '@expcat/tigercat-core'

describe('chart format utilities', () => {
  beforeEach(() => {
    resetLineGradientCounter()
    resetAreaGradientCounter()
    resetBarGradientCounter()
    resetScatterGradientCounter()
    resetRadarGradientCounter()
    resetGaugeGradientCounter()
    resetFunnelGradientCounter()
    resetTreeMapGradientCounter()
    resetSunburstGradientCounter()
    resetPieGradientCounter()
  })

  it('creates stable gradient prefixes from normalized instance ids', () => {
    expect(getStableChartGradientPrefix('line', ':r0:')).toBe('tiger-line-grad-r0')
    expect(getStableChartGradientPrefix('bar', 'chart 1')).toBe('tiger-bar-grad-chart-1')
    expect(getStableChartGradientPrefix('pie', '---')).toBe('tiger-pie-grad-0')
  })

  it('keeps independent counters for every chart family', () => {
    expect(getLineGradientPrefix()).toBe('tiger-line-grad-1')
    expect(getLineGradientPrefix()).toBe('tiger-line-grad-2')
    expect(getAreaGradientPrefix()).toBe('tiger-area-grad-1')
    expect(getBarGradientPrefix()).toBe('tiger-bar-grad-1')
    expect(getScatterGradientPrefix()).toBe('tiger-scatter-grad-1')
    expect(getRadarGradientPrefix()).toBe('tiger-radar-grad-1')
    expect(getGaugeGradientPrefix()).toBe('tiger-gauge-grad-1')
    expect(getFunnelGradientPrefix()).toBe('tiger-funnel-grad-1')
    expect(getTreeMapGradientPrefix()).toBe('tiger-treemap-grad-1')
    expect(getSunburstGradientPrefix()).toBe('tiger-sunburst-grad-1')
    expect(getPieGradientPrefix()).toBe('tiger-pie-grad-1')
  })

  it('resets individual gradient counters', () => {
    getLineGradientPrefix()
    getLineGradientPrefix()
    resetLineGradientCounter()

    expect(getLineGradientPrefix()).toBe('tiger-line-grad-1')
  })

  it('stacks series data by matching x values', () => {
    const series = [
      [
        { x: 'Jan', y: 2 },
        { x: 'Feb', y: 4 }
      ],
      [
        { x: 'Jan', y: 3 },
        { x: 'Feb', y: -1 }
      ],
      [{ x: 'Jan', y: 5 }]
    ]

    expect(stackSeriesData(series)).toEqual([
      [
        { original: { x: 'Jan', y: 2 }, y0: 0, y1: 2 },
        { original: { x: 'Feb', y: 4 }, y0: 0, y1: 4 }
      ],
      [
        { original: { x: 'Jan', y: 3 }, y0: 2, y1: 5 },
        { original: { x: 'Feb', y: -1 }, y0: 4, y1: 3 }
      ],
      [{ original: { x: 'Jan', y: 5 }, y0: 5, y1: 10 }]
    ])
  })

  it('returns an empty stack for empty series input', () => {
    expect(stackSeriesData([])).toEqual([])
  })
})
