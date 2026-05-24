import { describe, expect, it, vi } from 'vitest'
import {
  createWatermarkRenderController,
  getWatermarkOverlayStyle,
  renderWatermarkCanvas,
  renderWatermarkDataUrl,
  resolveWatermarkFont,
  watermarkDefaults,
  watermarkFontDefaults,
  type WatermarkFrameCallback,
  type WatermarkRenderOptions,
  type WatermarkResizeObserverLike
} from '@expcat/tigercat-core'
import { createFrameScheduler } from '../utils/frame-scheduler'

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
  function createCanvasMock() {
    const ctx = {
      scale: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      drawImage: vi.fn(),
      fillText: vi.fn(),
      fillStyle: '',
      font: '',
      textAlign: '',
      textBaseline: ''
    }
    const canvas = document.createElement('canvas')
    vi.spyOn(canvas, 'getContext').mockReturnValue(ctx as unknown as CanvasRenderingContext2D)
    vi.spyOn(canvas, 'toDataURL').mockReturnValue('data:image/png;base64,canvas')
    return { canvas, ctx }
  }

  function mockCanvasElement(canvas: HTMLCanvasElement) {
    const originalCreateElement = document.createElement.bind(document)
    return vi.spyOn(document, 'createElement').mockImplementation((tagName, options) => {
      if (tagName === 'canvas') return canvas
      return originalCreateElement(tagName, options)
    })
  }

  const renderOptions = (): WatermarkRenderOptions => ({
    content: 'Demo',
    width: 120,
    height: 64,
    rotate: -22,
    font: resolveWatermarkFont()
  })

  it('resolves font defaults', () => {
    expect(resolveWatermarkFont({ fontSize: 20, color: 'red' })).toEqual({
      fontSize: 20,
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
      color: 'red'
    })
  })

  it('exports font defaults', () => {
    expect(watermarkFontDefaults).toEqual({
      fontSize: 16,
      fontFamily: 'sans-serif',
      fontWeight: 'normal',
      color: 'rgba(0,0,0,0.15)'
    })
  })

  it('renders text content to a DOM canvas', () => {
    const { canvas, ctx } = createCanvasMock()
    const createElement = mockCanvasElement(canvas)

    expect(renderWatermarkCanvas(renderOptions())).toBe('data:image/png;base64,canvas')
    expect(ctx.scale).toHaveBeenCalled()
    expect(ctx.rotate).toHaveBeenCalledWith((-22 * Math.PI) / 180)
    expect(ctx.fillText).toHaveBeenCalledWith('Demo', 60, 32)
    expect(canvas.style.width).toBe('120px')
    expect(canvas.style.height).toBe('64px')

    createElement.mockRestore()
  })

  it('renders multi-line content to centered canvas lines', () => {
    const { canvas, ctx } = createCanvasMock()
    const createElement = mockCanvasElement(canvas)

    expect(renderWatermarkCanvas({ ...renderOptions(), content: ['Line 1', 'Line 2'] })).toBe(
      'data:image/png;base64,canvas'
    )
    expect(ctx.fillText).toHaveBeenCalledTimes(2)
    expect(ctx.fillText).toHaveBeenNthCalledWith(1, 'Line 1', 60, 20)
    expect(ctx.fillText).toHaveBeenNthCalledWith(2, 'Line 2', 60, 44)

    createElement.mockRestore()
  })

  it('returns undefined when DOM canvas rendering is unavailable', () => {
    const canvas = document.createElement('canvas')
    vi.spyOn(canvas, 'getContext').mockReturnValue(null)
    const createElement = mockCanvasElement(canvas)

    expect(renderWatermarkCanvas(renderOptions())).toBeUndefined()

    createElement.mockRestore()
  })

  it('returns undefined outside the browser', () => {
    const originalWindow = globalThis.window
    vi.stubGlobal('window', undefined)

    expect(renderWatermarkCanvas(renderOptions())).toBeUndefined()

    vi.stubGlobal('window', originalWindow)
  })

  it('falls back from image loading failure to undefined', async () => {
    class ImageMock {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      crossOrigin = ''
      set src(_value: string) {
        this.onerror?.()
      }
    }
    vi.stubGlobal('Image', ImageMock)

    await expect(
      renderWatermarkDataUrl({ ...renderOptions(), image: '/missing.png' })
    ).resolves.toBeUndefined()
  })

  it('renders loaded images into the DOM canvas path', async () => {
    const { canvas, ctx } = createCanvasMock()
    const createElement = mockCanvasElement(canvas)
    class ImageMock {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      crossOrigin = ''
      set src(_value: string) {
        this.onload?.()
      }
    }
    vi.stubGlobal('Image', ImageMock)

    await expect(renderWatermarkDataUrl({ ...renderOptions(), image: '/mark.png' })).resolves.toBe(
      'data:image/png;base64,canvas'
    )
    expect(ctx.drawImage).toHaveBeenCalled()

    createElement.mockRestore()
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

  it('skips duplicate observe calls for the same target', () => {
    const resize = createResizeObserverFactory()
    const target = document.createElement('div')
    const controller = createWatermarkRenderController({
      getRenderOptions: renderOptions,
      onRender: vi.fn(),
      render: () => 'data:image/png;base64,x',
      createResizeObserver: resize.factory
    })

    controller.observe(target)
    controller.observe(target)

    expect(resize.factory).toHaveBeenCalledTimes(1)
    expect(resize.observer.observe).toHaveBeenCalledTimes(1)
  })

  it('flushes pending render even before the scheduled frame runs', async () => {
    const frames = createFrameScheduler()
    const onRender = vi.fn()
    const controller = createWatermarkRenderController({
      getRenderOptions: renderOptions,
      onRender,
      render: () => 'data:image/png;base64,flush',
      requestFrame: frames.requestFrame,
      cancelFrame: frames.cancelFrame
    })

    controller.render()
    expect(controller.isPending()).toBe(true)

    await controller.flush()

    expect(controller.isPending()).toBe(false)
    expect(onRender).toHaveBeenCalledWith('data:image/png;base64,flush')
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
