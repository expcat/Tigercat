import { describe, it, expect, vi } from 'vitest'
import {
  createChartResizeObserverController,
  resolveResponsiveChartSize
} from '@expcat/tigercat-core'
import { createFrameScheduler } from '../utils/frame-scheduler'

class MockResizeObserver {
  static latest: MockResizeObserver | undefined
  target?: Element
  disconnect = vi.fn()
  constructor(private readonly callback: ResizeObserverCallback) {
    MockResizeObserver.latest = this
  }
  observe(target: Element) {
    this.target = target
  }
  emit(width: number, height: number) {
    if (!this.target) return
    this.callback(
      [
        {
          target: this.target,
          contentRect: new DOMRect(0, 0, width, height),
          contentBoxSize: [{ inlineSize: width, blockSize: height } as ResizeObserverSize]
        } as ResizeObserverEntry
      ],
      this as unknown as ResizeObserver
    )
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
    expect(
      resolveResponsiveChartSize(
        { width: Number.NaN, height: -10 },
        { width: Number.NaN, height: 0 }
      )
    ).toEqual({
      width: 320,
      height: 200
    })
  })

  it('batches ResizeObserver updates to one animation frame', () => {
    vi.stubGlobal('ResizeObserver', MockResizeObserver)
    const frames = createFrameScheduler()
    const onSizeChange = vi.fn()
    const target = document.createElement('div')
    const controller = createChartResizeObserverController({
      onSizeChange,
      requestFrame: frames.requestFrame,
      cancelFrame: frames.cancelFrame
    })

    controller.observe(target)
    MockResizeObserver.latest?.emit(320, 180)
    MockResizeObserver.latest?.emit(480, 260)

    expect(frames.pendingCount()).toBe(1)
    expect(onSizeChange).not.toHaveBeenCalled()

    frames.flush()

    expect(onSizeChange).toHaveBeenCalledTimes(1)
    expect(onSizeChange).toHaveBeenCalledWith({ width: 480, height: 260 })
    vi.unstubAllGlobals()
  })

  it('disconnects observer and cancels pending frame', () => {
    vi.stubGlobal('ResizeObserver', MockResizeObserver)
    const frames = createFrameScheduler()
    const onSizeChange = vi.fn()
    const target = document.createElement('div')
    const controller = createChartResizeObserverController({
      onSizeChange,
      requestFrame: frames.requestFrame,
      cancelFrame: frames.cancelFrame
    })

    controller.observe(target)
    const observer = MockResizeObserver.latest
    observer?.emit(320, 180)
    controller.disconnect()
    frames.flush()

    expect(observer?.disconnect).toHaveBeenCalledTimes(1)
    expect(onSizeChange).not.toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})
