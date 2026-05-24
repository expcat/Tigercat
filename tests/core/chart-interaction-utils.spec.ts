import { describe, expect, it, vi } from 'vitest'
import {
  applyChartBrush,
  createChartLinkController,
  normalizeChartBrushRange
} from '@expcat/tigercat-core'

describe('chart interaction brush helpers', () => {
  it('normalizes brush ranges into data bounds', () => {
    expect(normalizeChartBrushRange(4, 1, 5)).toEqual({ startIndex: 1, endIndex: 4 })
    expect(normalizeChartBrushRange(-3, 99, 5)).toEqual({ startIndex: 0, endIndex: 4 })
  })

  it('applies a brush range to data', () => {
    expect(applyChartBrush(['a', 'b', 'c', 'd'], { startIndex: 1, endIndex: 2 })).toEqual([
      'b',
      'c'
    ])
  })
})

describe('chart link controller', () => {
  it('publishes payloads to listeners in the same group', () => {
    const controller = createChartLinkController<{ index: number }>()
    const listener = vi.fn()
    const other = vi.fn()

    controller.subscribe('sales', listener)
    controller.subscribe('traffic', other)
    controller.publish('sales', { index: 2 })

    expect(listener).toHaveBeenCalledWith({ index: 2 })
    expect(other).not.toHaveBeenCalled()
    expect(controller.getListenerCount()).toBe(2)
  })

  it('unsubscribes listeners', () => {
    const controller = createChartLinkController<number>()
    const listener = vi.fn()
    const unsubscribe = controller.subscribe('group', listener)

    unsubscribe()
    controller.publish('group', 1)

    expect(listener).not.toHaveBeenCalled()
    expect(controller.getListenerCount('group')).toBe(0)
  })
})
