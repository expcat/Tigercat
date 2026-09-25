/**
 * Watermark component utilities
 * Shared logic for generating watermark patterns via Canvas
 */

import type { WatermarkFont } from '../types/watermark'
import { isBrowser } from './env'

// ---------------------------------------------------------------------------
// Defaults
// ---------------------------------------------------------------------------

export const watermarkDefaults = {
  width: 120,
  height: 64,
  rotate: -22,
  zIndex: 20,
  gapX: 100,
  gapY: 100,
  offsetX: 0,
  offsetY: 0
} as const

export const WATERMARK_DEFAULT_INK = 'color-mix(in srgb, var(--tiger-text) 15%, transparent)'

/** Canvas cannot resolve `var()` / `color-mix()`. Use this when the probe fails. */
export const WATERMARK_FALLBACK_INK = 'rgba(0, 0, 0, 0.15)'

/**
 * Image tiles are drawn at this alpha. Text ink already carries the 15% mix.
 * Opaque logos stay decorative instead of covering the content underneath.
 */
export const WATERMARK_IMAGE_ALPHA = 0.15

export const watermarkFontDefaults: Required<WatermarkFont> = {
  fontSize: 16,
  fontFamily: 'sans-serif',
  fontWeight: 'normal',
  color: WATERMARK_DEFAULT_INK
}

const CANVAS_PAINT_COLOR = /^(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(|^#[0-9a-fA-F]{3,8}$/

/**
 * Color string a canvas `fillStyle` will actually use.
 * `color-mix()` and `var(--tiger-text)` are resolved against `host` (or the
 * document element). An unresolved theme color falls back to 15% black so the
 * tile cannot paint as opaque black.
 */
export function resolveWatermarkPaintColor(color: string, host?: Element | null): string {
  const raw = color.trim()
  if (!raw) return WATERMARK_FALLBACK_INK
  if (!/var\(|color-mix\(/i.test(raw)) return raw
  if (!isBrowser() || typeof document === 'undefined') return WATERMARK_FALLBACK_INK

  const parent = host?.isConnected ? host : document.documentElement
  if (!parent) return WATERMARK_FALLBACK_INK

  const probe = document.createElement('span')
  probe.setAttribute('aria-hidden', 'true')
  probe.style.cssText =
    'position:absolute;left:0;top:0;visibility:hidden;pointer-events:none;color:' + raw
  parent.appendChild(probe)
  const view = probe.ownerDocument.defaultView
  const resolved =
    view && typeof view.getComputedStyle === 'function'
      ? view.getComputedStyle(probe).color.trim()
      : ''
  probe.remove()
  if (resolved && CANVAS_PAINT_COLOR.test(resolved)) return resolved
  return WATERMARK_FALLBACK_INK
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
  gapX?: number
  gapY?: number
  rotate: number
  font: Required<WatermarkFont>
  /** Element whose computed `--tiger-text` the default ink follows. */
  host?: Element | null
}

type WatermarkRenderingContext = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D

function getWatermarkDpr(): number {
  return isBrowser() ? window.devicePixelRatio || 1 : 1
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
  font: Required<WatermarkFont>,
  host?: Element | null
): void {
  ctx.fillStyle = resolveWatermarkPaintColor(font.color, host)
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

function tileSize(opts: Pick<WatermarkRenderOptions, 'width' | 'height' | 'gapX' | 'gapY'>): {
  tileW: number
  tileH: number
} {
  return {
    tileW: opts.width + Math.max(0, opts.gapX ?? 0),
    tileH: opts.height + Math.max(0, opts.gapY ?? 0)
  }
}

function renderWatermarkToDomCanvas(
  opts: WatermarkRenderOptions,
  image?: CanvasImageSource
): string | undefined {
  if (!isBrowser()) return undefined

  const { content, width, height, rotate, font, host } = opts
  const { tileW, tileH } = tileSize(opts)
  const canvas = document.createElement('canvas')
  const dpr = getWatermarkDpr()
  canvas.width = tileW * dpr
  canvas.height = tileH * dpr
  canvas.style.width = `${tileW}px`
  canvas.style.height = `${tileH}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) return undefined

  prepareWatermarkContext(ctx, width, height, rotate, dpr)

  if (image) {
    ctx.globalAlpha = WATERMARK_IMAGE_ALPHA
    ctx.drawImage(image, 0, 0, width, height)
    ctx.globalAlpha = 1
  } else {
    drawWatermarkContent(ctx, content, width, height, font, host)
  }

  try {
    return canvas.toDataURL()
  } catch {
    return undefined
  }
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

  const { content, width, height, rotate, font, host } = opts
  const { tileW, tileH } = tileSize(opts)
  const dpr = getWatermarkDpr()
  const canvas = new OffscreenCanvas(tileW * dpr, tileH * dpr)
  const ctx = canvas.getContext('2d')
  if (!ctx) return undefined

  prepareWatermarkContext(ctx, width, height, rotate, dpr)
  drawWatermarkContent(ctx, content, width, height, font, host)

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

export async function paintWatermark(
  opts: WatermarkRenderOptions
): Promise<{ url?: string; imageFailed: boolean }> {
  if (opts.image) {
    const image = await loadWatermarkImage(opts.image)
    if (!image) return { imageFailed: true }
    return { url: renderWatermarkToDomCanvas(opts, image), imageFailed: false }
  }
  const offscreenResult = await renderWatermarkToOffscreenCanvas(opts)
  return { url: offscreenResult ?? renderWatermarkToDomCanvas(opts), imageFailed: false }
}

export async function renderWatermarkDataUrl(
  opts: WatermarkRenderOptions
): Promise<string | undefined> {
  if (opts.image) {
    const image = await loadWatermarkImage(opts.image)
    if (image) {
      const painted = renderWatermarkToDomCanvas(opts, image)
      if (painted) return painted
    }
  }

  const offscreenResult = await renderWatermarkToOffscreenCanvas(opts)
  return offscreenResult ?? renderWatermarkToDomCanvas(opts)
}

export type WatermarkFrameCallback = (timestamp: number) => void

export type WatermarkFrameRequest = (callback: WatermarkFrameCallback) => number

export type WatermarkFrameCancel = (handle: number) => void

export interface WatermarkRenderControllerOptions {
  getRenderOptions: () => WatermarkRenderOptions
  onRender: (base64Url: string | undefined) => void
  requestFrame?: WatermarkFrameRequest
  cancelFrame?: WatermarkFrameCancel
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

function readStyleNumber(value: string): number {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

/**
 * Whether the overlay still paints a visible tiled background.
 * Uses computed style. This is the foundation coverage predicate; do not
 * add a second check.
 */
export function watermarkOverlayCoversHost(overlay: HTMLElement): boolean {
  if (overlay.hidden) return false
  const view = overlay.ownerDocument.defaultView
  const computed =
    view && typeof view.getComputedStyle === 'function' ? view.getComputedStyle(overlay) : null
  const display = computed?.display || overlay.style.display
  const visibility = computed?.visibility || overlay.style.visibility
  if (display === 'none' || visibility === 'hidden' || visibility === 'collapse') return false

  const opacityRaw = computed?.opacity || overlay.style.opacity
  const opacity = opacityRaw === '' ? 1 : readStyleNumber(opacityRaw)
  if (!Number.isFinite(opacity) || opacity < 0.05) return false

  const computedBg = computed?.backgroundImage ?? ''
  const variableImage = overlay.style.getPropertyValue('--tiger-watermark-image').trim()
  const background =
    computedBg && computedBg !== 'none'
      ? computedBg
      : variableImage.startsWith('url(')
        ? variableImage
        : overlay.style.backgroundImage
  if (!background || background === 'none') return false

  const inlineWidth = overlay.style.width
  const inlineHeight = overlay.style.height
  if (
    inlineWidth === '0' ||
    inlineWidth === '0px' ||
    inlineHeight === '0' ||
    inlineHeight === '0px'
  ) {
    return false
  }
  const computedWidth = computed ? readStyleNumber(computed.width) : Number.NaN
  const computedHeight = computed ? readStyleNumber(computed.height) : Number.NaN
  if (computedWidth === 0 || computedHeight === 0) return false

  const rect = overlay.getBoundingClientRect()
  const width = computedWidth > 0 ? computedWidth : rect.width
  const height = computedHeight > 0 ? computedHeight : rect.height
  if (width === 0 && height === 0) {
    const stretched = overlay.style.inset === '0' || overlay.style.inset === '0px'
    if (!stretched) return false
  }
  return true
}

export function createWatermarkRenderController(
  options: WatermarkRenderControllerOptions
): WatermarkRenderController {
  const requestFrame = options.requestFrame ?? requestDefaultWatermarkFrame
  const cancelFrame = options.cancelFrame ?? cancelDefaultWatermarkFrame
  const render = options.render ?? renderWatermarkDataUrl

  let frameHandle: number | undefined
  let pending = false
  let renderVersion = 0

  async function applyPending(): Promise<void> {
    frameHandle = undefined
    if (!pending) return

    pending = false
    const currentVersion = renderVersion
    try {
      const result = await render(options.getRenderOptions())
      if (currentVersion !== renderVersion) return
      options.onRender(result)
    } catch {
      if (currentVersion !== renderVersion) return
      options.onRender(undefined)
    }
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
    pending = false
    renderVersion += 1

    if (frameHandle !== undefined) {
      cancelFrame(frameHandle)
      frameHandle = undefined
    }
  }

  function observe(_target: Element): void {
    // Host size changes must not re-encode the tile. The stylesheet repeats it.
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

export const watermarkWrapperClasses = 'relative isolate'

export const watermarkOverlayClasses = 'tiger-watermark-overlay'

/** Tile rules. The overlay only sets the custom properties below. */
export const watermarkBaseStyles = {
  '.tiger-watermark-overlay': {
    position: 'absolute',
    inset: '0',
    pointerEvents: 'none',
    zIndex: 'var(--tiger-watermark-z, 20)',
    backgroundImage: 'var(--tiger-watermark-image, none)',
    backgroundRepeat: 'repeat',
    backgroundSize: 'var(--tiger-watermark-size, auto)',
    backgroundPosition: 'var(--tiger-watermark-position, 0 0)',
    printColorAdjust: 'exact',
    WebkitPrintColorAdjust: 'exact'
  },
  '@media print': {
    '.tiger-watermark-overlay[data-watermark-print="off"]': {
      display: 'none'
    }
  }
} as const

function watermarkImageValue(url?: string): string {
  if (!url || /["'\\()]/.test(url)) return 'none'
  return `url("${url}")`
}

/**
 * Custom properties consumed by {@link watermarkBaseStyles}.
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
  /** Extra space between tile rows. CSS only; does not re-encode the tile. */
  rowGap?: number
  /** Repeat density. Values above 1 pack tiles tighter. CSS only. */
  density?: number
}): Record<string, string> {
  const rowGap =
    typeof opts.rowGap === 'number' && Number.isFinite(opts.rowGap) ? Math.max(0, opts.rowGap) : 0
  const density =
    typeof opts.density === 'number' && Number.isFinite(opts.density) && opts.density > 0
      ? opts.density
      : 1
  const tileW = (opts.width + opts.gapX) / density
  const tileH = (opts.height + opts.gapY + rowGap) / density
  const style: Record<string, string> = {
    '--tiger-watermark-image': watermarkImageValue(opts.base64Url),
    '--tiger-watermark-size': `${tileW}px ${tileH}px`,
    '--tiger-watermark-position': `${opts.offsetX}px ${opts.offsetY}px`,
    '--tiger-watermark-z': String(opts.zIndex)
  }
  if (rowGap > 0) style['--tiger-watermark-row-gap'] = `${rowGap}px`
  if (density !== 1) style['--tiger-watermark-density'] = String(density)
  return style
}
