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

  it('watermarkDefaults contains expected keys', () => {
    expect(watermarkDefaults).toHaveProperty('width')
    expect(watermarkDefaults).toHaveProperty('height')
    expect(watermarkDefaults).toHaveProperty('gapX')
    expect(watermarkDefaults).toHaveProperty('gapY')
    expect(watermarkDefaults).toHaveProperty('rotate')
    expect(watermarkDefaults).toHaveProperty('zIndex')
    expect(typeof watermarkDefaults.width).toBe('number')
    expect(typeof watermarkDefaults.rotate).toBe('number')
  })

  it('resolves font with all defaults when no args', () => {
    const font = resolveWatermarkFont()
    expect(font.fontSize).toBeGreaterThan(0)
    expect(font.fontFamily).toBeTruthy()
    expect(font.fontWeight).toBeTruthy()
    expect(font.color).toBeTruthy()
  })

  it('resolves font with full override', () => {
    const font = resolveWatermarkFont({
      fontSize: 24,
      fontFamily: 'monospace',
      fontWeight: 'bold',
      color: '#ff0000'
    })
    expect(font).toEqual({
      fontSize: 24,
      fontFamily: 'monospace',
      fontWeight: 'bold',
      color: '#ff0000'
    })
  })

  it('overlay style handles custom offsets and zIndex', () => {
    const style = getWatermarkOverlayStyle({
      base64Url: 'data:image/png;base64,test',
      width: 200,
      height: 100,
      gapX: 10,
      gapY: 20,
      offsetX: 0,
      offsetY: 0,
      zIndex: 999
    })
    expect(style.zIndex).toBe('999')
    expect(style.backgroundPosition).toBe('0px 0px')
    expect(style.backgroundSize).toContain('210px') // width + gapX
    expect(style.backgroundSize).toContain('120px') // height + gapY
  })

  it('controller re-observe replaces previous target', () => {
    const frames = createFrameScheduler()
    const resize = createResizeObserverFactory()
    const onRender = vi.fn()
    const target1 = document.createElement('div')
    const target2 = document.createElement('div')
    const controller = createWatermarkRenderController({
      getRenderOptions: () => ({
        content: 'Demo',
        width: 120,
        height: 64,
        rotate: -22,
        font: resolveWatermarkFont()
      }),
      onRender,
      render: () => 'data:image/png;base64,x',
      requestFrame: frames.requestFrame,
      cancelFrame: frames.cancelFrame,
      createResizeObserver: resize.factory
    })

    controller.observe(target1)
    controller.observe(target2)
    expect(resize.observer.observe).toHaveBeenCalledTimes(2)
  })
})
