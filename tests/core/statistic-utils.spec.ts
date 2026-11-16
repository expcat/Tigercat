import { describe, it, expect, vi } from 'vitest'
import {
  canAnimateStatisticValue,
  createStatisticNumberAnimation,
  easeOutCubic,
  formatStatisticValue,
  interpolateStatisticValue,
  resolveStatisticPrecision
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
    it('formats precision and group separators with Intl', () => {
      expect(formatStatisticValue(1234.5, 2, true, 'en-US')).toBe('1,234.50')
      expect(formatStatisticValue(1234567, 0, true, 'de-DE')).toBe('1.234.567')
    })

    it('keeps string values unchanged', () => {
      expect(formatStatisticValue('Active', 2, true)).toBe('Active')
    })

    it.each([
      [1e-7, undefined, 7, '0.0000001'],
      [1.23e-7, undefined, 9, '0.000000123'],
      [-1e-7, undefined, 7, '-0.0000001'],
      [1e-6, undefined, 6, '0.000001'],
      [1e-7, 7, 7, '0.0000001']
    ])('preserves %s with precision %s', (value, precision, digits, expected) => {
      expect(resolveStatisticPrecision(value, precision)).toBe(digits)
      expect(formatStatisticValue(value, precision, false, 'en-US')).toBe(expected)
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
