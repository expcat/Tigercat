import { describe, expect, it, vi } from 'vitest'
import {
  computeHeatmapCells,
  getHeatmapCellIndexAtPoint,
  layoutHeatmap,
  nextHeatmapCellIndex,
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

  it('indexes the drawn cell, not the input array offset', () => {
    const layout = layoutHeatmap(
      [
        { x: 'Tue', y: 'AM', value: 90 },
        { x: 'Mon', y: 'AM', value: 10 }
      ],
      {
        xLabels: ['Mon', 'Tue'],
        yLabels: ['AM'],
        width: 100,
        height: 50,
        cellGap: 0
      }
    )
    expect(layout.cells[0].datum?.value).toBe(10)
    expect(layout.cells[1].datum?.value).toBe(90)
    expect(layout.cells[0].index).toBe(0)
    expect(layout.cells[1].index).toBe(1)
  })

  it('matches numeric x/y as column and row indices', () => {
    const layout = layoutHeatmap([{ x: 0, y: 0, value: 7 }], {
      xLabels: ['Mon'],
      yLabels: ['AM'],
      width: 40,
      height: 40
    })
    expect(layout.cells[0].datum?.value).toBe(7)
    expect(layout.cells[0].empty).toBe(false)
  })

  it('uses the data min/max for colour domain instead of clamping to 0', () => {
    const layout = layoutHeatmap(
      [
        { x: 'A', y: 'One', value: 10 },
        { x: 'B', y: 'One', value: 100 }
      ],
      {
        xLabels: ['A', 'B'],
        yLabels: ['One'],
        width: 100,
        height: 20,
        cellGap: 0
      }
    )
    expect(layout.minVal).toBe(10)
    expect(layout.maxVal).toBe(100)
    expect(layout.cells[0].heat).toBe(0)
    expect(layout.cells[1].heat).toBe(1)
  })

  it('skips non-finite values instead of painting them as 0', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const layout = layoutHeatmap([{ x: 'Mon', y: 'AM', value: Number.POSITIVE_INFINITY }], {
      xLabels: ['Mon', 'Tue'],
      yLabels: ['AM'],
      width: 100,
      height: 50,
      cellGap: -4
    })
    expect(layout.cells).toHaveLength(2)
    expect(layout.cells[0].empty).toBe(true)
    expect(layout.cells[0].value).toBeNull()
    expect(layout.cells[1].empty).toBe(true)
    warn.mockRestore()
  })

  it('keeps axis label centers aligned when the gap exceeds the inner width', () => {
    const layout = layoutHeatmap([{ x: 'A', y: 'One', value: 1 }], {
      xLabels: ['A', 'B'],
      yLabels: ['One'],
      width: 10,
      height: 10,
      cellGap: 40
    })
    expect(layout.xAxisLabels[0].x).toBeCloseTo(layout.cells[0].x + layout.cells[0].w / 2)
    expect(layout.xAxisLabels[1].x).toBeCloseTo(layout.cells[1].x + layout.cells[1].w / 2)
  })

  it('does not emit an illegal fill for unparseable rgb colours', () => {
    const layout = layoutHeatmap([{ x: 'A', y: 'One', value: 1 }], {
      xLabels: ['A'],
      yLabels: ['One'],
      width: 20,
      height: 20,
      minColor: 'var(--tiger-primary)',
      maxColor: '#fff',
      colorSpace: 'rgb'
    })
    expect(layout.cells[0].fill).toMatch(/^#[0-9a-f]{6}$/i)
    expect(layout.cells[0].fill).not.toContain('NaN')
  })

  it('moves focus by row and column', () => {
    expect(nextHeatmapCellIndex(0, 'ArrowRight', 3, 2)).toBe(1)
    expect(nextHeatmapCellIndex(1, 'ArrowDown', 3, 2)).toBe(4)
    expect(nextHeatmapCellIndex(4, 'ArrowLeft', 3, 2)).toBe(3)
    expect(nextHeatmapCellIndex(3, 'ArrowUp', 3, 2)).toBe(0)
  })
})
