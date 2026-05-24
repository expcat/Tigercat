import { describe, it, expect, vi } from 'vitest'
import {
  createLongPressController,
  getGestureTouchDistance,
  getGestureTouchPoint,
  isLongPress,
  resolvePanGesture,
  resolvePinchScale,
  resolveSwipeGesture
} from '@expcat/tigercat-core'

describe('gesture-utils', () => {
  it('reads touch points and two-finger distance', () => {
    const touches = [
      { clientX: 10, clientY: 20 },
      { clientX: 13, clientY: 24 }
    ]

    expect(getGestureTouchPoint(touches, 100)).toEqual({ x: 10, y: 20, time: 100 })
    expect(getGestureTouchDistance(touches)).toBe(5)
  })

  it('resolves swipe direction and velocity', () => {
    const gesture = resolveSwipeGesture(
      { x: 120, y: 40, time: 0 },
      { x: 40, y: 48, time: 200 },
      { minDistance: 24 }
    )

    expect(gesture).toMatchObject({ direction: 'left', distance: 80, velocity: 0.4 })
  })

  it('ignores gestures below distance, velocity, or cross-axis thresholds', () => {
    expect(resolveSwipeGesture({ x: 0, y: 0 }, { x: 12, y: 0 })).toBeNull()
    expect(
      resolveSwipeGesture(
        { x: 0, y: 0, time: 0 },
        { x: 60, y: 0, time: 1000 },
        { minVelocity: 0.2 }
      )
    ).toBeNull()
    expect(
      resolveSwipeGesture({ x: 0, y: 0 }, { x: 60, y: 40 }, { maxCrossAxisRatio: 0.5 })
    ).toBeNull()
  })

  it('resolves pan offset and pinch scale', () => {
    expect(resolvePanGesture({ x: 8, y: 10 }, { x: 20, y: 26 }, { minDistance: 10 })).toEqual({
      offsetX: 12,
      offsetY: 16,
      distance: 20,
      deltaX: 12,
      deltaY: 16
    })

    expect(resolvePinchScale(80, 120)).toEqual({ scale: 1.5, distance: 120 })
  })

  it('supports long press threshold checks and controller cancellation', () => {
    expect(isLongPress(0, 499)).toBe(false)
    expect(isLongPress(0, 500)).toBe(true)

    const onLongPress = vi.fn()
    const callbacks = new Map<number, () => void>()
    const controller = createLongPressController({
      threshold: 300,
      onLongPress,
      setTimer: (callback) => {
        callbacks.set(1, callback)
        return 1
      },
      clearTimer: (handle) => callbacks.delete(handle)
    })

    controller.start()
    expect(controller.isPending()).toBe(true)
    controller.cancel()
    expect(controller.isPending()).toBe(false)
    expect(callbacks.has(1)).toBe(false)
  })
})
