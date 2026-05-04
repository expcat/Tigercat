import { describe, it, expect, vi } from 'vitest'
import {
  createCarouselAutoplayController,
  type CarouselFrameCallback,
  type CarouselVisibilityDocument
} from '@expcat/tigercat-core'

function createFrameScheduler() {
  let nextHandle = 1
  const callbacks = new Map<number, CarouselFrameCallback>()

  return {
    requestFrame(callback: CarouselFrameCallback) {
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

function createVisibilityDocument(initialHidden = false) {
  let hidden = initialHidden
  const listeners = new Set<EventListenerOrEventListenerObject>()

  const visibilityDocument = {
    get hidden() {
      return hidden
    },
    addEventListener: vi.fn((type: string, listener: EventListenerOrEventListenerObject | null) => {
      if (type === 'visibilitychange' && listener) {
        listeners.add(listener)
      }
    }),
    removeEventListener: vi.fn(
      (type: string, listener: EventListenerOrEventListenerObject | null) => {
        if (type === 'visibilitychange' && listener) {
          listeners.delete(listener)
        }
      }
    )
  } as unknown as CarouselVisibilityDocument

  return {
    visibilityDocument,
    setHidden(nextHidden: boolean) {
      hidden = nextHidden
      const event = new Event('visibilitychange')
      listeners.forEach((listener) => {
        if (typeof listener === 'function') {
          listener(event)
          return
        }
        listener.handleEvent(event)
      })
    }
  }
}

describe('carousel-utils autoplay controller', () => {
  it('advances with requestAnimationFrame after the configured interval', () => {
    const scheduler = createFrameScheduler()
    const onAdvance = vi.fn()
    const controller = createCarouselAutoplayController({
      interval: 1000,
      onAdvance,
      requestFrame: scheduler.requestFrame,
      cancelFrame: scheduler.cancelFrame,
      getCurrentTime: () => 0
    })

    controller.start()

    expect(controller.isRunning()).toBe(true)
    expect(scheduler.pendingCount()).toBe(1)

    scheduler.flush(999)
    expect(onAdvance).not.toHaveBeenCalled()

    scheduler.flush(1000)
    expect(onAdvance).toHaveBeenCalledTimes(1)
    expect(scheduler.pendingCount()).toBe(1)
  })

  it('cancels queued frames when stopped', () => {
    const scheduler = createFrameScheduler()
    const cancelFrame = vi.fn(scheduler.cancelFrame)
    const onAdvance = vi.fn()
    const controller = createCarouselAutoplayController({
      interval: 1000,
      onAdvance,
      requestFrame: scheduler.requestFrame,
      cancelFrame,
      getCurrentTime: () => 0
    })

    controller.start()
    controller.stop()
    scheduler.flush(1000)

    expect(controller.isRunning()).toBe(false)
    expect(cancelFrame).toHaveBeenCalledTimes(1)
    expect(onAdvance).not.toHaveBeenCalled()
  })

  it('pauses frame scheduling while the document is hidden', () => {
    const scheduler = createFrameScheduler()
    const cancelFrame = vi.fn(scheduler.cancelFrame)
    const visibility = createVisibilityDocument(true)
    const onAdvance = vi.fn()
    const controller = createCarouselAutoplayController({
      interval: 1000,
      onAdvance,
      requestFrame: scheduler.requestFrame,
      cancelFrame,
      getCurrentTime: () => 0,
      getDocument: () => visibility.visibilityDocument
    })

    controller.start()
    expect(scheduler.pendingCount()).toBe(0)

    visibility.setHidden(false)
    expect(scheduler.pendingCount()).toBe(1)

    visibility.setHidden(true)
    expect(cancelFrame).toHaveBeenCalledTimes(1)
    expect(scheduler.pendingCount()).toBe(0)

    scheduler.flush(1000)
    expect(onAdvance).not.toHaveBeenCalled()
  })
})
