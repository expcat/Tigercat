import { describe, it, expect, vi } from 'vitest'
import {
  canAnimateStatisticValue,
  createStatisticNumberAnimation,
  easeOutCubic,
  formatStatisticValue,
  interpolateStatisticValue
} from '@expcat/tigercat-core'

function createFrameScheduler() {
  let nextFrame = 1
  const callbacks = new Map<number, FrameRequestCallback>()
  const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    const frame = nextFrame++
    callbacks.set(frame, callback)
    return frame
  })
  const cancelAnimationFrame = vi.fn((frame: number) => {
    callbacks.delete(frame)
  })

  return {
    requestAnimationFrame,
    cancelAnimationFrame,
    flush(timestamp: number, frame = [...callbacks.keys()][0]) {
      const callback = callbacks.get(frame)
      callbacks.delete(frame)
      callback?.(timestamp)
    }
  }
}

describe('statistic-utils', () => {
  describe('formatStatisticValue', () => {
    it('formats precision and group separators together', () => {
      expect(formatStatisticValue(1234.5, 2, true)).toBe('1,234.50')
    })

    it('keeps string values unchanged', () => {
      expect(formatStatisticValue('Active', 2, true)).toBe('Active')
    })
  })

  describe('animation helpers', () => {
    it('uses an ease-out curve for interpolation', () => {
      expect(easeOutCubic(0)).toBe(0)
      expect(easeOutCubic(1)).toBe(1)
      expect(interpolateStatisticValue(0, 100, 0.5)).toBeGreaterThan(50)
    })

    it('only animates finite numeric values', () => {
      expect(canAnimateStatisticValue(10)).toBe(true)
      expect(canAnimateStatisticValue('10')).toBe(false)
      expect(canAnimateStatisticValue(Number.NaN)).toBe(false)
    })

    it('updates values with requestAnimationFrame until complete', () => {
      const scheduler = createFrameScheduler()
      const onUpdate = vi.fn()
      const onComplete = vi.fn()

      createStatisticNumberAnimation({
        from: 0,
        to: 100,
        duration: 100,
        onUpdate,
        onComplete,
        requestAnimationFrame: scheduler.requestAnimationFrame,
        cancelAnimationFrame: scheduler.cancelAnimationFrame
      })

      expect(scheduler.requestAnimationFrame).toHaveBeenCalledTimes(1)

      scheduler.flush(0)
      scheduler.flush(50)
      scheduler.flush(100)

      expect(onUpdate).toHaveBeenNthCalledWith(1, 0)
      expect(onUpdate).toHaveBeenNthCalledWith(2, interpolateStatisticValue(0, 100, 0.5))
      expect(onUpdate).toHaveBeenLastCalledWith(100)
      expect(onComplete).toHaveBeenCalledOnce()
    })

    it('cancels pending frames when stopped', () => {
      const scheduler = createFrameScheduler()
      const controller = createStatisticNumberAnimation({
        from: 0,
        to: 100,
        duration: 100,
        onUpdate: vi.fn(),
        requestAnimationFrame: scheduler.requestAnimationFrame,
        cancelAnimationFrame: scheduler.cancelAnimationFrame
      })

      controller.stop()

      expect(scheduler.cancelAnimationFrame).toHaveBeenCalledWith(1)
    })
  })
})
