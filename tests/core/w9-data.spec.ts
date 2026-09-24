import { describe, expect, it } from 'vitest'
import {
  commitValidatedCellEdit,
  funnelLayerRatios,
  layoutSankey,
  layoutWaterfall,
  narrowWidgetParams,
  resolveTableVirtualStrategy,
  toggleLegendHidden,
  virtualGridWindow,
  virtualizeMiddleColumns
} from '@expcat/tigercat-core'
import type { TableColumn } from '@expcat/tigercat-core'

describe('w9 data helpers', () => {
  it('keeps one table virtual strategy and leaves variable rows unwindowed', () => {
    expect(resolveTableVirtualStrategy({ virtual: true })).toBe('window')
    expect(resolveTableVirtualStrategy({ virtual: true, variableRowHeight: true })).toBe(
      'passthrough'
    )
    expect(resolveTableVirtualStrategy({ virtual: false })).toBe('passthrough')
  })

  it('virtualizes only the middle columns', () => {
    const columns: TableColumn[] = [
      { key: 'pin', title: 'Pin', width: 80, fixed: 'start' },
      ...Array.from({ length: 8 }, (_, index) => ({
        key: `c${index}`,
        title: `C${index}`,
        width: 120
      }))
    ]
    const slice = virtualizeMiddleColumns({
      columns,
      widths: columns.map((column) => Number(column.width)),
      scrollLeft: 0,
      viewportWidth: 240,
      overscan: 0,
      enabled: true
    })
    expect(slice.active).toBe(true)
    expect(slice.start.map((column) => column.key)).toEqual(['pin'])
    expect(slice.middle.length).toBeLessThan(8)
  })

  it('toggles legend hide without treating it as selection', () => {
    expect(toggleLegendHidden([], '2')).toEqual(['2'])
    expect(toggleLegendHidden(['2'], '2')).toEqual([])
  })

  it('lays out waterfall totals and sankey links', () => {
    const bars = layoutWaterfall([
      { label: 'Open', value: 10, kind: 'total' },
      { label: 'Gain', value: 4, kind: 'increase' },
      { label: 'Loss', value: 3, kind: 'decrease' }
    ])
    expect(bars[0]).toMatchObject({ y0: 0, y1: 10 })
    expect(bars[1]).toMatchObject({ y0: 10, y1: 14 })
    expect(bars[2]).toMatchObject({ y0: 14, y1: 11 })
    const sankey = layoutSankey(
      [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' }
      ],
      [{ source: 'a', target: 'b', value: 5 }],
      400,
      200
    )
    expect(sankey.nodes).toHaveLength(2)
    expect(sankey.links[0].path.startsWith('M')).toBe(true)
    expect(sankey.nodes[0].x).toBeLessThan(sankey.nodes[1].x)
  })

  it('windows a multi-column grid with the shared range', () => {
    const window = virtualGridWindow({
      scroll: 0,
      viewport: 80,
      itemCount: 20,
      itemSize: 40,
      columns: 2,
      overscan: 0
    })
    expect(window.columns).toBe(2)
    expect(window.end).toBeLessThan(10)
  })

  it('refuses the next cell value when validation fails', () => {
    const failed = commitValidatedCellEdit({
      data: [{ qty: 1 }],
      rowIndex: 0,
      column: { key: 'qty', edit: 'number', validate: () => 'bad' },
      raw: 2
    })
    expect(failed.ok).toBe(false)
    if (!failed.ok) expect(failed).not.toHaveProperty('nextData')
    const passed = commitValidatedCellEdit({
      data: [{ qty: 1 }],
      rowIndex: 0,
      column: { key: 'qty', edit: 'number', validate: () => true },
      raw: 2
    })
    expect(passed.ok).toBe(true)
    if (passed.ok) expect(passed.nextData[0].qty).toBe(2)
  })

  it('computes funnel ratios from drawn layers', () => {
    const ratios = funnelLayerRatios([100, 50, 25])
    expect(ratios[1].versusPrevious).toBe(0.5)
    expect(ratios[2].versusFirst).toBe(0.25)
  })

  it('drops unknown widget params', () => {
    const params = narrowWidgetParams('number', { min: 1, mystery: true })
    expect(params).toEqual({ min: 1 })
  })
})
