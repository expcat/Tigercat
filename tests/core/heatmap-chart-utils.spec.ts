import { describe, expect, it } from 'vitest'
import {
  computeHeatmapCells,
  getHeatmapCellIndexAtPoint,
  resolveHeatmapRenderMode
} from '@expcat/tigercat-core'

describe('heatmap chart utils', () => {
  it('keeps small heatmaps on svg in auto mode', () => {
    expect(resolveHeatmapRenderMode(100, { renderMode: 'auto', canvasThreshold: 1000 })).toBe('svg')
  })

  it('switches large heatmaps to canvas in auto mode', () => {
    expect(resolveHeatmapRenderMode(1001, { renderMode: 'auto', canvasThreshold: 1000 })).toBe(
      'canvas'
    )
  })

  it('honors explicit render mode', () => {
    expect(resolveHeatmapRenderMode(10, { renderMode: 'canvas' })).toBe('canvas')
    expect(resolveHeatmapRenderMode(2000, { renderMode: 'svg' })).toBe('svg')
  })

  it('finds the heatmap cell at a canvas point', () => {
    const cells = computeHeatmapCells(
      [
        { x: 'Mon', y: 'AM', value: 1 },
        { x: 'Tue', y: 'PM', value: 2 }
      ],
      {
        xLabels: ['Mon', 'Tue'],
        yLabels: ['AM', 'PM'],
        width: 100,
        height: 100,
        cellGap: 0
      }
    )

    expect(getHeatmapCellIndexAtPoint(cells, 25, 25)).toBe(0)
    expect(getHeatmapCellIndexAtPoint(cells, 75, 75)).toBe(3)
    expect(getHeatmapCellIndexAtPoint(cells, 101, 101)).toBeNull()
  })
})
