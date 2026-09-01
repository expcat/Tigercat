import { describe, expect, it } from 'vitest'
import {
  isChartActivationKey,
  nextChartSelectedIndex,
  resolveChartIndex,
  tooltipPositionFromEvent
} from '@expcat/tigercat-core'

describe('chart interaction helpers', () => {
  it('resolves controlled index over local', () => {
    expect(resolveChartIndex(2, 0)).toBe(2)
    expect(resolveChartIndex(undefined, 0)).toBe(0)
    expect(resolveChartIndex(null, 0)).toBeNull()
  })

  it('toggles selection', () => {
    expect(nextChartSelectedIndex(null, 1)).toBe(1)
    expect(nextChartSelectedIndex(1, 1)).toBeNull()
  })

  it('recognizes activation keys', () => {
    expect(isChartActivationKey('Enter')).toBe(true)
    expect(isChartActivationKey(' ')).toBe(true)
    expect(isChartActivationKey('Tab')).toBe(false)
  })

  it('reads tooltip coordinates from a pointer event', () => {
    expect(tooltipPositionFromEvent({ clientX: 12, clientY: 8 })).toEqual({ x: 12, y: 8 })
  })
})
