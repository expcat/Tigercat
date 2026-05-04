import { describe, it, expect, vi } from 'vitest'
import { createRafRepeatActionController, type RepeatFrameCallback } from '@expcat/tigercat-core'

function createFrameScheduler() {
  let nextHandle = 1
  const callbacks = new Map<number, RepeatFrameCallback>()

  return {
    requestFrame(callback: RepeatFrameCallback) {
      const handle = nextHandle
      nextHandle += 1
      callbacks.set(handle, callback)
      return handle
    },
    cancelFrame(handle: number) {
      callbacks.delete(handle)
    },
    flush(timestamp: number) {
      const frameCallbacks = [...callbacks.values()]
      callbacks.clear()
      frameCallbacks.forEach((callback) => callback(timestamp))
    },
    pendingCount() {
      return callbacks.size
    }
  }
}

describe('repeat-action-utils', () => {
  it('runs immediately, then repeats after the configured delay and interval', () => {
    const scheduler = createFrameScheduler()
    const action = vi.fn()
    const controller = createRafRepeatActionController({
      initialDelay: 100,
      interval: 50,
      now: () => 0,
      requestFrame: scheduler.requestFrame,
      cancelFrame: scheduler.cancelFrame
    })

    controller.start(action)
    expect(action).toHaveBeenCalledTimes(1)

    scheduler.flush(99)
    expect(action).toHaveBeenCalledTimes(1)

    scheduler.flush(100)
    expect(action).toHaveBeenCalledTimes(2)

    scheduler.flush(149)
    expect(action).toHaveBeenCalledTimes(2)

    scheduler.flush(150)
    expect(action).toHaveBeenCalledTimes(3)
  })

  it('cancels the queued frame when stopped', () => {
    const scheduler = createFrameScheduler()
    const action = vi.fn()
    const controller = createRafRepeatActionController({
      now: () => 0,
      requestFrame: scheduler.requestFrame,
      cancelFrame: scheduler.cancelFrame
    })

    controller.start(action)
    expect(controller.isRunning()).toBe(true)
    expect(scheduler.pendingCount()).toBe(1)

    controller.stop()
    expect(controller.isRunning()).toBe(false)
    expect(scheduler.pendingCount()).toBe(0)
  })

  it('restarts with a fresh action and timing window', () => {
    const scheduler = createFrameScheduler()
    const firstAction = vi.fn()
    const secondAction = vi.fn()
    let now = 0
    const controller = createRafRepeatActionController({
      initialDelay: 100,
      interval: 50,
      now: () => now,
      requestFrame: scheduler.requestFrame,
      cancelFrame: scheduler.cancelFrame
    })

    controller.start(firstAction)
    now = 20
    controller.start(secondAction)
    scheduler.flush(119)

    expect(firstAction).toHaveBeenCalledTimes(1)
    expect(secondAction).toHaveBeenCalledTimes(1)

    scheduler.flush(120)
    expect(secondAction).toHaveBeenCalledTimes(2)
  })
})
