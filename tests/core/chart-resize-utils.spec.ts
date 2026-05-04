import { describe, it, expect, vi } from 'vitest'
import {
  createChartResizeObserverController,
  resolveResponsiveChartSize,
  type ChartResizeFrameCallback,
  type ChartResizeObserverLike
} from '@expcat/tigercat-core'

function createFrameScheduler() {
  let nextHandle = 1
  const callbacks = new Map<number, ChartResizeFrameCallback>()

  return {
    requestFrame(callback: ChartResizeFrameCallback) {
      const handle = nextHandle
      nextHandle += 1
      callbacks.set(handle, callback)
      return handle
    },
    cancelFrame(handle: number) {
      callbacks.delete(handle)
    },
    flush(timestamp = 0) {
      const frameCallbacks = [...callbacks.values()]
      callbacks.clear()
      frameCallbacks.forEach((callback) => callback(timestamp))
    },
    pendingCount() {
      return callbacks.size
    }
  }
}

function createResizeObserverFactory() {
  let callback: ResizeObserverCallback | undefined
  let observedTarget: Element | undefined
  const observer: ChartResizeObserverLike = {
    observe: vi.fn((target: Element) => {
      observedTarget = target
    }),
    disconnect: vi.fn()
  }

  return {
    factory: vi.fn((nextCallback: ResizeObserverCallback) => {
      callback = nextCallback
      return observer
    }),
    observer,
    emit(width: number, height: number) {
      if (!callback || !observedTarget) return

      callback(
        [
          {
            target: observedTarget,
            contentRect: new DOMRect(0, 0, width, height)
          } as ResizeObserverEntry
        ],
        observer as ResizeObserver
      )
    }
  }
}

describe('chart-resize-utils', () => {
  it('resolves observed responsive size with fallback dimensions', () => {
    expect(resolveResponsiveChartSize({ width: 320, height: 200 }, null)).toEqual({
      width: 320,
      height: 200
    })
    expect(
      resolveResponsiveChartSize({ width: 320, height: 200 }, { width: 480, height: 0 })
    ).toEqual({
      width: 480,
      height: 200
    })
  })

  it('batches ResizeObserver updates to one animation frame', () => {
    const frames = createFrameScheduler()
    const resize = createResizeObserverFactory()
    const onSizeChange = vi.fn()
    const target = document.createElement('div')
    const controller = createChartResizeObserverController({
      onSizeChange,
      requestFrame: frames.requestFrame,
      cancelFrame: frames.cancelFrame,
      createResizeObserver: resize.factory
    })

    controller.observe(target)
    resize.emit(320, 180)
    resize.emit(480, 260)

    expect(frames.pendingCount()).toBe(1)
    expect(onSizeChange).not.toHaveBeenCalled()

    frames.flush()

    expect(onSizeChange).toHaveBeenCalledTimes(1)
    expect(onSizeChange).toHaveBeenCalledWith({ width: 480, height: 260 })
  })

  it('disconnects observer and cancels pending frame', () => {
    const frames = createFrameScheduler()
    const resize = createResizeObserverFactory()
    const onSizeChange = vi.fn()
    const target = document.createElement('div')
    const controller = createChartResizeObserverController({
      onSizeChange,
      requestFrame: frames.requestFrame,
      cancelFrame: frames.cancelFrame,
      createResizeObserver: resize.factory
    })

    controller.observe(target)
    resize.emit(320, 180)
    controller.disconnect()
    frames.flush()

    expect(resize.observer.disconnect).toHaveBeenCalledTimes(1)
    expect(onSizeChange).not.toHaveBeenCalled()
  })
})
