import { describe, expect, it } from 'vitest'
import { getStableChartGradientPrefix, stackSeriesData } from '@expcat/tigercat-core'

describe('chart format utilities', () => {
  it('creates stable gradient prefixes from normalized instance ids', () => {
    expect(getStableChartGradientPrefix('line', ':r0:')).toBe('tiger-line-grad-r0')
    expect(getStableChartGradientPrefix('bar', 'chart 1')).toBe('tiger-bar-grad-chart-1')
    expect(getStableChartGradientPrefix('pie', '---')).toBe('tiger-pie-grad-0')
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
        { original: { x: 'Feb', y: -1 }, y0: 0, y1: -1 }
      ],
      [
        { original: { x: 'Jan', y: 5 }, y0: 5, y1: 10 },
        { original: { x: 'Feb', y: 0 }, y0: 4, y1: 4 }
      ]
    ])
  })

  it('returns an empty stack for empty series input', () => {
    expect(stackSeriesData([])).toEqual([])
  })
})
