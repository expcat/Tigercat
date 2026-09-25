import { describe, expect, it, vi } from 'vitest'
import {
  createWatermarkRenderController,
  getWatermarkOverlayStyle,
  renderWatermarkCanvas,
  renderWatermarkDataUrl,
  resolveWatermarkFont,
  resolveWatermarkPaintColor,
  WATERMARK_FALLBACK_INK,
  WATERMARK_IMAGE_ALPHA,
  watermarkDefaults,
  watermarkFontDefaults,
  type WatermarkFrameCallback,
  type WatermarkRenderOptions
} from '@expcat/tigercat-core'
import { createFrameScheduler } from '../utils/frame-scheduler'

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
      textBaseline: '',
      globalAlpha: 1
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
      color: 'color-mix(in srgb, var(--tiger-text) 15%, transparent)'
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

  it('falls back from image loading failure to text content', async () => {
    const { canvas, ctx } = createCanvasMock()
    const createElement = mockCanvasElement(canvas)
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
    ).resolves.toBe('data:image/png;base64,canvas')
    expect(ctx.fillText).toHaveBeenCalledWith('Demo', 60, 32)
    createElement.mockRestore()
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
    expect(ctx.globalAlpha).toBe(1)

    createElement.mockRestore()
  })

  it('resolves theme ink to a canvas color and falls back when it cannot', () => {
    expect(resolveWatermarkPaintColor('#111827')).toBe('#111827')
    expect(resolveWatermarkPaintColor('rgba(0, 0, 0, 0.4)')).toBe('rgba(0, 0, 0, 0.4)')

    const host = document.createElement('div')
    document.body.appendChild(host)
    const view = host.ownerDocument.defaultView
    const computed = vi.spyOn(view!, 'getComputedStyle').mockReturnValue({
      color: 'rgba(15, 23, 42, 0.15)'
    } as CSSStyleDeclaration)
    expect(
      resolveWatermarkPaintColor('color-mix(in srgb, var(--tiger-text) 15%, transparent)', host)
    ).toBe('rgba(15, 23, 42, 0.15)')
    computed.mockReturnValue({
      color: 'color-mix(in srgb, var(--tiger-text) 15%, transparent)'
    } as CSSStyleDeclaration)
    expect(resolveWatermarkPaintColor(watermarkFontDefaults.color, host)).toBe(
      WATERMARK_FALLBACK_INK
    )
    computed.mockRestore()
    host.remove()
  })

  it('paints text with the resolved ink instead of the raw theme expression', () => {
    const { canvas, ctx } = createCanvasMock()
    const createElement = mockCanvasElement(canvas)
    const host = document.createElement('div')
    const view = host.ownerDocument.defaultView
    vi.spyOn(view!, 'getComputedStyle').mockReturnValue({
      color: 'rgba(15, 23, 42, 0.15)'
    } as CSSStyleDeclaration)

    renderWatermarkCanvas({ ...renderOptions(), host })
    expect(ctx.fillStyle).toBe('rgba(15, 23, 42, 0.15)')

    createElement.mockRestore()
  })

  it('draws image tiles at the decorative alpha', async () => {
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
    const alphas: number[] = []
    const original = ctx.drawImage
    ctx.drawImage = vi.fn((...args: unknown[]) => {
      alphas.push(ctx.globalAlpha)
      return original(...(args as []))
    }) as typeof ctx.drawImage

    await renderWatermarkDataUrl({ ...renderOptions(), image: '/mark.png' })
    expect(alphas).toEqual([WATERMARK_IMAGE_ALPHA])

    createElement.mockRestore()
  })

  it('builds overlay background style', () => {
    const style = getWatermarkOverlayStyle({
      base64Url: 'data:image/png;base64,abc',
      width: watermarkDefaults.width,
      height: watermarkDefaults.height,
      gapX: watermarkDefaults.gapX,
      gapY: watermarkDefaults.gapY,
      offsetX: 4,
      offsetY: 8,
      zIndex: 12
    })
    const size = `${watermarkDefaults.width + watermarkDefaults.gapX}px ${watermarkDefaults.height + watermarkDefaults.gapY}px`
    expect(style).toEqual({
      '--tiger-watermark-image': 'url("data:image/png;base64,abc")',
      '--tiger-watermark-size': size,
      '--tiger-watermark-position': '4px 8px',
      '--tiger-watermark-z': '12'
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

  it('does not re-encode the tile when the host is observed', async () => {
    const frames = createFrameScheduler()
    const onRender = vi.fn()
    const target = document.createElement('div')
    const controller = createWatermarkRenderController({
      getRenderOptions: renderOptions,
      onRender,
      render: () => 'data:image/png;base64,resize',
      requestFrame: frames.requestFrame,
      cancelFrame: frames.cancelFrame
    })

    controller.observe(target)
    controller.observe(target)
    frames.flush()
    await controller.flush()

    expect(onRender).not.toHaveBeenCalled()
    expect(controller.isPending()).toBe(false)
  })

  it('disconnect cancels a pending render', async () => {
    const frames = createFrameScheduler()
    const onRender = vi.fn()
    const controller = createWatermarkRenderController({
      getRenderOptions: renderOptions,
      onRender,
      render: () => 'data:image/png;base64,next',
      requestFrame: frames.requestFrame,
      cancelFrame: frames.cancelFrame
    })

    controller.render()
    controller.disconnect()
    frames.flush()
    await controller.flush()

    expect(onRender).not.toHaveBeenCalled()
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
    expect(style['--tiger-watermark-z']).toBe('999')
    expect(style['--tiger-watermark-position']).toBe('0px 0px')
    expect(style['--tiger-watermark-size']).toContain('210px')
    expect(style['--tiger-watermark-size']).toContain('120px')
  })

  it('observe does not watch the host for removal or style changes', () => {
    const onRender = vi.fn()
    const target = document.createElement('div')
    const overlay = document.createElement('div')
    target.appendChild(overlay)
    const controller = createWatermarkRenderController({
      getRenderOptions: renderOptions,
      onRender,
      render: () => 'data:image/png;base64,x'
    })

    controller.observe(target)
    overlay.remove()
    overlay.setAttribute('style', '')
    expect(onRender).not.toHaveBeenCalled()
  })
})
