import { describe, expect, it, vi } from 'vitest'
import {
  createWatermarkRenderController,
  getWatermarkOverlayStyle,
  resolveWatermarkFont,
  watermarkDefaults,
  type WatermarkFrameCallback,
  type WatermarkResizeObserverLike
} from '@expcat/tigercat-core'

function createFrameScheduler() {
  let nextHandle = 1
  const callbacks = new Map<number, WatermarkFrameCallback>()

  return {
    requestFrame(callback: WatermarkFrameCallback) {
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
  const observer: WatermarkResizeObserverLike = {
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
    emit() {
      if (!callback || !observedTarget) return

      callback(
        [
          {
            target: observedTarget,
            contentRect: new DOMRect(0, 0, 320, 180)
          } as ResizeObserverEntry
        ],
        observer as ResizeObserver
      )
    }
  }
}

describe('watermark-utils', () => {
  it('resolves font defaults', () => {
    expect(resolveWatermarkFont({ fontSize: 20, color: 'red' })).toEqual({
      fontSize: 20,
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
      color: 'red'
    })
  })

  it('builds overlay background style', () => {
    expect(
      getWatermarkOverlayStyle({
        base64Url: 'data:image/png;base64,abc',
        width: watermarkDefaults.width,
        height: watermarkDefaults.height,
        gapX: watermarkDefaults.gapX,
        gapY: watermarkDefaults.gapY,
        offsetX: 4,
        offsetY: 8,
        zIndex: 12
      })
    ).toMatchObject({
      zIndex: '12',
      backgroundImage: 'url(data:image/png;base64,abc)',
      backgroundSize: '220px 164px',
      backgroundPosition: '4px 8px'
    })
  })

  it('batches render requests to one animation frame', async () => {
    const frames = createFrameScheduler()
    const onRender = vi.fn()
    const render = vi.fn(() => 'data:image/png;base64,next')
    const controller = createWatermarkRenderController({
      getRenderOptions: () => ({
        content: 'Demo',
        width: 120,
        height: 64,
        rotate: -22,
        font: resolveWatermarkFont()
      }),
      onRender,
      render,
      requestFrame: frames.requestFrame,
      cancelFrame: frames.cancelFrame
    })

    controller.render()
    controller.render()

    expect(frames.pendingCount()).toBe(1)
    expect(render).not.toHaveBeenCalled()

    frames.flush()
    await controller.flush()

    expect(render).toHaveBeenCalledTimes(1)
    expect(onRender).toHaveBeenCalledWith('data:image/png;base64,next')
  })

  it('redraws after ResizeObserver changes using rAF batching', async () => {
    const frames = createFrameScheduler()
    const resize = createResizeObserverFactory()
    const onRender = vi.fn()
    const target = document.createElement('div')
    const controller = createWatermarkRenderController({
      getRenderOptions: () => ({
        content: 'Demo',
        width: 120,
        height: 64,
        rotate: -22,
        font: resolveWatermarkFont()
      }),
      onRender,
      render: () => 'data:image/png;base64,resize',
      requestFrame: frames.requestFrame,
      cancelFrame: frames.cancelFrame,
      createResizeObserver: resize.factory
    })

    controller.observe(target)
    resize.emit()
    resize.emit()

    expect(resize.observer.observe).toHaveBeenCalledWith(target)
    expect(frames.pendingCount()).toBe(1)

    frames.flush()
    await controller.flush()

    expect(onRender).toHaveBeenCalledTimes(1)
    expect(onRender).toHaveBeenCalledWith('data:image/png;base64,resize')
  })

  it('disconnects observer and cancels pending render', async () => {
    const frames = createFrameScheduler()
    const resize = createResizeObserverFactory()
    const onRender = vi.fn()
    const target = document.createElement('div')
    const controller = createWatermarkRenderController({
      getRenderOptions: () => ({
        content: 'Demo',
        width: 120,
        height: 64,
        rotate: -22,
        font: resolveWatermarkFont()
      }),
      onRender,
      render: () => 'data:image/png;base64,next',
      requestFrame: frames.requestFrame,
      cancelFrame: frames.cancelFrame,
      createResizeObserver: resize.factory
    })

    controller.observe(target)
    controller.render()
    controller.disconnect()
    frames.flush()
    await controller.flush()

    expect(resize.observer.disconnect).toHaveBeenCalledTimes(1)
    expect(onRender).not.toHaveBeenCalled()
  })
})
