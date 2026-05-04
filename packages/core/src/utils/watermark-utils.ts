/**
 * Watermark component utilities
 * Shared logic for generating watermark patterns via Canvas
 */

import type { WatermarkFont } from '../types/watermark'

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export const watermarkDefaults = {
  width: 120,
  height: 64,
  rotate: -22,
  zIndex: 9,
  gapX: 100,
  gapY: 100,
  offsetX: 0,
  offsetY: 0
} as const

export const watermarkFontDefaults: Required<WatermarkFont> = {
  fontSize: 16,
  fontFamily: 'sans-serif',
  fontWeight: 'normal',
  color: 'rgba(0,0,0,0.15)'
}

// ---------------------------------------------------------------------------
// Canvas rendering helpers
// ---------------------------------------------------------------------------

/**
 * Merge user font options with defaults.
 */
export function resolveWatermarkFont(font?: WatermarkFont): Required<WatermarkFont> {
  return { ...watermarkFontDefaults, ...font }
}

export interface WatermarkRenderOptions {
  content?: string | string[]
  image?: string
  width: number
  height: number
  rotate: number
  font: Required<WatermarkFont>
}

type WatermarkRenderingContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

function getWatermarkDpr(): number {
  return typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1
}

function prepareWatermarkContext(
  ctx: WatermarkRenderingContext,
  width: number,
  height: number,
  rotate: number,
  dpr: number
): void {
  ctx.scale(dpr, dpr)
  ctx.translate(width / 2, height / 2)
  ctx.rotate((rotate * Math.PI) / 180)
  ctx.translate(-width / 2, -height / 2)
}

function drawWatermarkContent(
  ctx: WatermarkRenderingContext,
  content: string | string[] | undefined,
  width: number,
  height: number,
  font: Required<WatermarkFont>
): void {
  ctx.fillStyle = font.color
  ctx.font = `${font.fontWeight} ${font.fontSize}px ${font.fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  if (typeof content === 'string') {
    ctx.fillText(content, width / 2, height / 2)
    return
  }

  if (Array.isArray(content)) {
    const lineHeight = font.fontSize * 1.5
    const startY = height / 2 - ((content.length - 1) / 2) * lineHeight
    content.forEach((line, index) => {
      ctx.fillText(line, width / 2, startY + index * lineHeight)
    })
  }
}

function renderWatermarkToDomCanvas(
  opts: WatermarkRenderOptions,
  image?: CanvasImageSource
): string | undefined {
  if (typeof document === 'undefined') return undefined

  const { content, width, height, rotate, font } = opts
  const canvas = document.createElement('canvas')
  const dpr = getWatermarkDpr()
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) return undefined

  prepareWatermarkContext(ctx, width, height, rotate, dpr)

  if (image) {
    ctx.drawImage(image, 0, 0, width, height)
  } else {
    drawWatermarkContent(ctx, content, width, height, font)
  }

  return canvas.toDataURL()
}

function blobToDataUrl(blob: Blob): Promise<string | undefined> {
  if (typeof FileReader === 'undefined') return Promise.resolve(undefined)

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : undefined)
    reader.onerror = () => resolve(undefined)
    reader.readAsDataURL(blob)
  })
}

async function renderWatermarkToOffscreenCanvas(
  opts: WatermarkRenderOptions
): Promise<string | undefined> {
  if (typeof OffscreenCanvas === 'undefined') return undefined

  const { content, width, height, rotate, font } = opts
  const dpr = getWatermarkDpr()
  const canvas = new OffscreenCanvas(width * dpr, height * dpr)
  const ctx = canvas.getContext('2d')
  if (!ctx) return undefined

  prepareWatermarkContext(ctx, width, height, rotate, dpr)
  drawWatermarkContent(ctx, content, width, height, font)

  if (typeof canvas.convertToBlob !== 'function') return undefined

  const blob = await canvas.convertToBlob()
  return blobToDataUrl(blob)
}

function loadWatermarkImage(src: string): Promise<HTMLImageElement | undefined> {
  if (typeof Image === 'undefined') return Promise.resolve(undefined)

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => resolve(undefined)
    img.src = src
  })
}

/**
 * Render watermark content onto a canvas and return a data-URL.
 *
 * Returns `undefined` in non-browser environments (SSR).
 */
export function renderWatermarkCanvas(opts: {
  content?: string | string[]
  image?: string
  width: number
  height: number
  rotate: number
  font: Required<WatermarkFont>
}): string | undefined {
  return renderWatermarkToDomCanvas(opts)
}

export async function renderWatermarkDataUrl(
  opts: WatermarkRenderOptions
): Promise<string | undefined> {
  if (opts.image) {
    const image = await loadWatermarkImage(opts.image)
    return image ? renderWatermarkToDomCanvas(opts, image) : undefined
  }

  const offscreenResult = await renderWatermarkToOffscreenCanvas(opts)
  return offscreenResult ?? renderWatermarkToDomCanvas(opts)
}

export type WatermarkFrameCallback = (timestamp: number) => void

export type WatermarkFrameRequest = (callback: WatermarkFrameCallback) => number

export type WatermarkFrameCancel = (handle: number) => void

export interface WatermarkResizeObserverLike {
  observe: (target: Element) => void
  disconnect: () => void
}

export type WatermarkResizeObserverFactory = (
  callback: ResizeObserverCallback
) => WatermarkResizeObserverLike

export interface WatermarkRenderControllerOptions {
  getRenderOptions: () => WatermarkRenderOptions
  onRender: (base64Url: string | undefined) => void
  requestFrame?: WatermarkFrameRequest
  cancelFrame?: WatermarkFrameCancel
  createResizeObserver?: WatermarkResizeObserverFactory
  render?: (options: WatermarkRenderOptions) => Promise<string | undefined> | string | undefined
}

export interface WatermarkRenderController {
  render: () => void
  observe: (target: Element) => void
  disconnect: () => void
  flush: () => Promise<void>
  isPending: () => boolean
}

function requestDefaultWatermarkFrame(callback: WatermarkFrameCallback): number {
  if (globalThis.requestAnimationFrame) {
    return globalThis.requestAnimationFrame(callback)
  }

  return globalThis.setTimeout(() => callback(globalThis.performance?.now?.() ?? Date.now()), 16)
}

function cancelDefaultWatermarkFrame(handle: number): void {
  if (globalThis.cancelAnimationFrame) {
    globalThis.cancelAnimationFrame(handle)
    return
  }

  globalThis.clearTimeout(handle)
}

function createDefaultWatermarkResizeObserver(
  callback: ResizeObserverCallback
): WatermarkResizeObserverLike {
  return new ResizeObserver(callback)
}

export function createWatermarkRenderController(
  options: WatermarkRenderControllerOptions
): WatermarkRenderController {
  const requestFrame = options.requestFrame ?? requestDefaultWatermarkFrame
  const cancelFrame = options.cancelFrame ?? cancelDefaultWatermarkFrame
  const render = options.render ?? renderWatermarkDataUrl
  const createResizeObserver = options.createResizeObserver ?? createDefaultWatermarkResizeObserver

  let observer: WatermarkResizeObserverLike | undefined
  let observedTarget: Element | undefined
  let frameHandle: number | undefined
  let pending = false
  let renderVersion = 0

  async function applyPending(): Promise<void> {
    frameHandle = undefined
    if (!pending) return

    pending = false
    const currentVersion = renderVersion
    const result = await render(options.getRenderOptions())
    if (currentVersion !== renderVersion) return

    options.onRender(result)
  }

  function renderNextFrame(): void {
    pending = true
    renderVersion += 1
    if (frameHandle !== undefined) return

    frameHandle = requestFrame(() => {
      void applyPending()
    })
  }

  function disconnect(): void {
    observer?.disconnect()
    observer = undefined
    observedTarget = undefined
    pending = false
    renderVersion += 1

    if (frameHandle !== undefined) {
      cancelFrame(frameHandle)
      frameHandle = undefined
    }
  }

  function observe(target: Element): void {
    if (target === observedTarget && observer) return

    disconnect()
    observedTarget = target

    if (options.createResizeObserver || typeof ResizeObserver !== 'undefined') {
      observer = createResizeObserver((entries) => {
        if (!entries.some((entry) => entry.target === target)) return
        renderNextFrame()
      })
      observer.observe(target)
    }
  }

  async function flush(): Promise<void> {
    if (frameHandle !== undefined) {
      cancelFrame(frameHandle)
    }

    await applyPending()
  }

  return {
    render: renderNextFrame,
    observe,
    disconnect,
    flush,
    isPending: () => frameHandle !== undefined
  }
}

// ---------------------------------------------------------------------------
// Overlay style helpers
// ---------------------------------------------------------------------------

export const watermarkWrapperClasses = 'relative'

/**
 * Build the inline `style` object for the watermark overlay <div>.
 */
export function getWatermarkOverlayStyle(opts: {
  base64Url?: string
  width: number
  height: number
  gapX: number
  gapY: number
  offsetX: number
  offsetY: number
  zIndex: number
}): Record<string, string> {
  const bgSize = `${opts.width + opts.gapX}px ${opts.height + opts.gapY}px`
  return {
    position: 'absolute',
    inset: '0',
    pointerEvents: 'none',
    zIndex: String(opts.zIndex),
    backgroundImage: opts.base64Url ? `url(${opts.base64Url})` : 'none',
    backgroundRepeat: 'repeat',
    backgroundSize: bgSize,
    backgroundPosition: `${opts.offsetX}px ${opts.offsetY}px`
  }
}
