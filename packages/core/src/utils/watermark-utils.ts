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
  if (typeof document === 'undefined') return undefined

  const { content, width, height, rotate, font } = opts
  const canvas = document.createElement('canvas')
  const dpr = window.devicePixelRatio || 1
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) return undefined

  ctx.scale(dpr, dpr)
  ctx.translate(width / 2, height / 2)
  ctx.rotate((rotate * Math.PI) / 180)
  ctx.translate(-width / 2, -height / 2)

  ctx.fillStyle = font.color
  ctx.font = `${font.fontWeight} ${font.fontSize}px ${font.fontFamily}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  if (typeof content === 'string') {
    ctx.fillText(content, width / 2, height / 2)
  } else if (Array.isArray(content)) {
    const lineHeight = font.fontSize * 1.5
    const startY = height / 2 - ((content.length - 1) / 2) * lineHeight
    content.forEach((line, i) => {
      ctx.fillText(line, width / 2, startY + i * lineHeight)
    })
  }

  return canvas.toDataURL()
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
