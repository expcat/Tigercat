/**
 * @vitest-environment happy-dom
 */

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  applyImageLoadError,
  applyImageLoadSuccess,
  clampImageGroupPreviewIndex,
  createImageLoadState,
  formatImagePreviewAriaLabel,
  getCropperHandleStyle,
  getCropperDisplaySize,
  CROP_HANDLES,
  clampScale,
  calculateTransform,
  getPreviewNavState,
  constrainCropRect,
  resizeCropRect,
  moveCropRect,
  getInitialCropRect,
  cropCanvas,
  getImageLabels,
  getTouchDistance,
  toCSSSize,
  resetImageLoadState,
  resolveImageHoverPlacement,
  resolveImagePreviewEnabled,
  resolveImagePreviewSrc
} from '@expcat/tigercat-core'
import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import type { CropRect } from '@expcat/tigercat-core'

describe('image-utils — preview and load state', () => {
  it('formats preview names from a locale template and fallback alt', () => {
    expect(formatImagePreviewAriaLabel('Preview {alt}', 'Cat', 'image')).toBe('Preview Cat')
    expect(formatImagePreviewAriaLabel('Preview {alt}', '  ', 'image')).toBe('Preview image')
    expect(formatImagePreviewAriaLabel('预览 {alt}', undefined, '图片')).toBe('预览 图片')
  })

  it('reads image names from locale objects, not a language id', () => {
    expect(getImageLabels().previewAriaLabel).toBe(enUS.image?.previewAriaLabel)
    expect(getImageLabels({ locale: 'zh-CN' }).previewAriaLabel).toBe(enUS.image?.previewAriaLabel)
    expect(getImageLabels(zhCN).previewAriaLabel).toBe('预览 {alt}')
    expect(getImageLabels(zhCN).groupAriaLabel).toBe('图片组')
  })

  it('disables preview when the group preview flag is false', () => {
    expect(resolveImagePreviewEnabled(true)).toBe(true)
    expect(resolveImagePreviewEnabled(true, false)).toBe(false)
    expect(resolveImagePreviewEnabled(false, true)).toBe(false)
  })

  it('places hover overlay on the logical inline-end side', () => {
    expect(resolveImageHoverPlacement('ltr')).toBe('right')
    expect(resolveImageHoverPlacement('rtl')).toBe('left')
  })

  it('resets load state on src change and switches to fallback only once', () => {
    const initial = createImageLoadState('/a.jpg', false)
    expect(initial.actualSrc).toBe('/a.jpg')
    expect(initial.loading).toBe(true)

    const lazyHidden = resetImageLoadState('/b.jpg', true, false)
    expect(lazyHidden.actualSrc).toBe('')
    expect(lazyHidden.error).toBe(false)

    const inView = resetImageLoadState('/b.jpg', true, true)
    expect(inView.actualSrc).toBe('/b.jpg')

    const afterFallback = applyImageLoadError(inView, '/fallback.jpg')
    expect(afterFallback.actualSrc).toBe('/fallback.jpg')
    expect(afterFallback.error).toBe(false)
    expect(afterFallback.loading).toBe(true)

    const afterFallbackError = applyImageLoadError(afterFallback, '/fallback.jpg')
    expect(afterFallbackError.error).toBe(true)
    expect(resolveImagePreviewSrc(afterFallbackError, '/b.jpg')).toBeUndefined()

    const loaded = applyImageLoadSuccess(afterFallback)
    expect(loaded.loading).toBe(false)
    expect(resolveImagePreviewSrc(loaded, '/b.jpg')).toBe('/fallback.jpg')
  })

  it('clamps group preview index into the current list', () => {
    expect(clampImageGroupPreviewIndex(4, 3)).toBe(2)
    expect(clampImageGroupPreviewIndex(-1, 3)).toBe(0)
    expect(clampImageGroupPreviewIndex(0, 0)).toBe(0)
  })
})

describe('image-utils — class generators', () => {
  it('CROP_HANDLES exposes all 8 directions', () => {
    expect(CROP_HANDLES).toHaveLength(8)
    expect(new Set(CROP_HANDLES)).toEqual(new Set(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']))
  })

  it('centers handle knobs on the crop edge', () => {
    const rect: CropRect = { x: 10, y: 20, width: 100, height: 80 }
    expect(getCropperHandleStyle('nw', rect)).toEqual({
      top: '20px',
      left: '10px',
      transform: 'translate(-50%, -50%)'
    })
    expect(getCropperHandleStyle('e', rect)).toEqual({
      top: '60px',
      left: '110px',
      transform: 'translate(-50%, -50%)'
    })
    expect(getCropperHandleStyle('s', rect)).toEqual({
      top: '100px',
      left: '60px',
      transform: 'translate(-50%, -50%)'
    })
  })

  it('fits the bitmap into the container without upscaling', () => {
    expect(getCropperDisplaySize(800, 600, 400, 400)).toEqual({ width: 400, height: 300 })
    expect(getCropperDisplaySize(100, 50, 400, 400)).toEqual({ width: 100, height: 50 })
    expect(getCropperDisplaySize(0, 50, 400, 400)).toBeNull()
  })
})

describe('image-utils — clampScale', () => {
  it('returns value when within bounds', () => {
    expect(clampScale(1.5, 0.5, 3)).toBe(1.5)
  })

  it('clamps to min when below', () => {
    expect(clampScale(0.1, 0.5, 3)).toBe(0.5)
  })

  it('clamps to max when above', () => {
    expect(clampScale(10, 0.5, 3)).toBe(3)
  })

  it('handles equal min/max', () => {
    expect(clampScale(5, 1, 1)).toBe(1)
  })
})

describe('image-utils — calculateTransform', () => {
  it('builds translate + scale string', () => {
    expect(calculateTransform(1.5, 10, -20)).toBe('translate(10px, -20px) scale(1.5)')
  })

  it('handles zero values', () => {
    expect(calculateTransform(1, 0, 0)).toBe('translate(0px, 0px) scale(1)')
  })
})

describe('image-utils — getPreviewNavState', () => {
  it('returns no prev/next for single image', () => {
    expect(getPreviewNavState(0, 1)).toEqual({ hasPrev: false, hasNext: false, counter: '' })
  })

  it('first of many: no prev, has next, counter shown', () => {
    expect(getPreviewNavState(0, 3)).toEqual({ hasPrev: false, hasNext: true, counter: '1 / 3' })
  })

  it('middle: both prev and next', () => {
    expect(getPreviewNavState(1, 3)).toEqual({ hasPrev: true, hasNext: true, counter: '2 / 3' })
  })

  it('last: prev only', () => {
    expect(getPreviewNavState(2, 3)).toEqual({ hasPrev: true, hasNext: false, counter: '3 / 3' })
  })

  it('clamps an out-of-range index before computing the counter', () => {
    expect(getPreviewNavState(9, 3)).toEqual({ hasPrev: true, hasNext: false, counter: '3 / 3' })
  })

  it('empty gallery has no nav', () => {
    expect(getPreviewNavState(0, 0)).toEqual({ hasPrev: false, hasNext: false, counter: '' })
  })
})

describe('image-utils — constrainCropRect', () => {
  it('keeps valid rect untouched', () => {
    const r: CropRect = { x: 10, y: 10, width: 50, height: 50 }
    expect(constrainCropRect(r, 200, 200)).toEqual(r)
  })

  it('clamps width/height to image bounds', () => {
    const r: CropRect = { x: 0, y: 0, width: 500, height: 500 }
    expect(constrainCropRect(r, 100, 100)).toEqual({ x: 0, y: 0, width: 100, height: 100 })
  })

  it('clamps position so rect stays inside', () => {
    const r: CropRect = { x: 90, y: 90, width: 50, height: 50 }
    const out = constrainCropRect(r, 100, 100)
    expect(out.x).toBe(50)
    expect(out.y).toBe(50)
  })

  it('clamps negative position to 0', () => {
    const r: CropRect = { x: -20, y: -10, width: 50, height: 50 }
    const out = constrainCropRect(r, 100, 100)
    expect(out.x).toBe(0)
    expect(out.y).toBe(0)
  })

  it('enforces aspect ratio (wider currentRatio → shrinks width)', () => {
    const r: CropRect = { x: 0, y: 0, width: 100, height: 50 } // ratio 2
    const out = constrainCropRect(r, 200, 200, 1)
    expect(out.width).toBe(50)
    expect(out.height).toBe(50)
  })

  it('enforces aspect ratio (narrower currentRatio → shrinks height)', () => {
    const r: CropRect = { x: 0, y: 0, width: 50, height: 100 } // ratio 0.5
    const out = constrainCropRect(r, 200, 200, 1)
    expect(out.width).toBe(50)
    expect(out.height).toBe(50)
  })

  it('ignores aspectRatio when 0 or negative', () => {
    const r: CropRect = { x: 0, y: 0, width: 100, height: 50 }
    expect(constrainCropRect(r, 200, 200, 0)).toEqual(r)
    expect(constrainCropRect(r, 200, 200, -1)).toEqual(r)
  })
})

describe('image-utils — resizeCropRect', () => {
  const base: CropRect = { x: 50, y: 50, width: 100, height: 100 }
  const W = 400
  const H = 400

  it('resizes from se handle (grow)', () => {
    const out = resizeCropRect(base, 'se', 30, 40, W, H)
    expect(out.width).toBe(130)
    expect(out.height).toBe(140)
    expect(out.x).toBe(50)
    expect(out.y).toBe(50)
  })

  it('resizes from nw handle (move corner inward)', () => {
    const out = resizeCropRect(base, 'nw', 20, 20, W, H)
    expect(out.x).toBe(70)
    expect(out.y).toBe(70)
    expect(out.width).toBe(80)
    expect(out.height).toBe(80)
  })

  it('resizes from n handle (only y/height)', () => {
    const out = resizeCropRect(base, 'n', 0, 30, W, H)
    expect(out.y).toBe(80)
    expect(out.height).toBe(70)
    expect(out.width).toBe(100)
  })

  it('enforces minimum width when shrinking from west', () => {
    const out = resizeCropRect(base, 'w', 200, 0, W, H, undefined, 30, 30)
    // width would go negative, clamp to minW=30, x adjusts back
    expect(out.width).toBe(30)
    expect(out.x).toBe(120) // 50 + 100 - 30
  })

  it('enforces minimum height when shrinking from north', () => {
    const out = resizeCropRect(base, 'n', 0, 200, W, H, undefined, 30, 30)
    expect(out.height).toBe(30)
    expect(out.y).toBe(120) // 50 + 100 - 30
  })

  it('enforces minimum dimensions on east handle (no x adjust)', () => {
    const small: CropRect = { x: 50, y: 50, width: 30, height: 30 }
    const out = resizeCropRect(small, 'e', -100, 0, W, H, undefined, 20, 20)
    expect(out.width).toBe(20)
    expect(out.x).toBe(50)
  })

  it('keeps the opposite corner fixed when SE hits the image edge', () => {
    const nearEdge: CropRect = { x: 160, y: 160, width: 20, height: 20 }
    const out = resizeCropRect(nearEdge, 'se', 80, 80, 200, 200)
    expect(out.x).toBe(160)
    expect(out.y).toBe(160)
    expect(out.width).toBe(40)
    expect(out.height).toBe(40)
  })

  it('enforces aspect ratio for n handle (width follows height, bottom stays)', () => {
    const out = resizeCropRect(base, 'n', 0, 50, W, H, 1)
    expect(out).toEqual({ x: 75, y: 100, width: 50, height: 50 })
  })

  it('enforces aspect ratio for e handle (height follows width, west stays)', () => {
    const out = resizeCropRect(base, 'e', 50, 0, W, H, 1)
    expect(out.width).toBe(150)
    expect(out.height).toBe(150)
    expect(out.x).toBe(50)
  })

  it('keeps the opposite corner fixed when aspect-locking nw', () => {
    const out = resizeCropRect(base, 'nw', 0, 20, W, H, 1)
    expect(out).toEqual({ x: 70, y: 70, width: 80, height: 80 })
  })

  it('enforces aspect ratio for corner handle (se) and keeps the northwest corner', () => {
    const out = resizeCropRect(base, 'se', 30, 80, W, H, 1)
    expect(out.width).toBe(out.height)
    expect(out.x).toBe(50)
    expect(out.y).toBe(50)
  })
})

describe('image-utils — moveCropRect', () => {
  const base: CropRect = { x: 50, y: 50, width: 100, height: 100 }

  it('moves within bounds', () => {
    expect(moveCropRect(base, 10, 20, 400, 400)).toEqual({ x: 60, y: 70, width: 100, height: 100 })
  })

  it('clamps movement at right/bottom edge', () => {
    expect(moveCropRect(base, 500, 500, 200, 200)).toEqual({
      x: 100,
      y: 100,
      width: 100,
      height: 100
    })
  })

  it('clamps movement at left/top edge', () => {
    expect(moveCropRect(base, -200, -200, 400, 400)).toEqual({
      x: 0,
      y: 0,
      width: 100,
      height: 100
    })
  })
})

describe('image-utils — getInitialCropRect', () => {
  it('centers a 80% rect inside the image (no aspect)', () => {
    const r = getInitialCropRect(200, 100)
    expect(r.width).toBeCloseTo(160)
    expect(r.height).toBeCloseTo(80)
    expect(r.x).toBeCloseTo(20)
    expect(r.y).toBeCloseTo(10)
  })

  it('shrinks width when aspect ratio is taller than container', () => {
    const r = getInitialCropRect(200, 100, 1) // square inside 200x100
    // cropW=160, cropH=80 → 160/80=2 > 1 → cropW = 80
    expect(r.width).toBeCloseTo(80)
    expect(r.height).toBeCloseTo(80)
  })

  it('shrinks height when aspect ratio is wider than container', () => {
    const r = getInitialCropRect(100, 200, 1)
    // cropW=80, cropH=160 → 80/160=0.5 < 1 → cropH = 80
    expect(r.width).toBeCloseTo(80)
    expect(r.height).toBeCloseTo(80)
  })

  it('ignores aspectRatio when 0 or negative', () => {
    const r0 = getInitialCropRect(200, 100, 0)
    expect(r0.width).toBeCloseTo(160)
    const rNeg = getInitialCropRect(200, 100, -1)
    expect(rNeg.width).toBeCloseTo(160)
  })
})

describe('image-utils — cropCanvas', () => {
  function makeImage(naturalW: number, naturalH: number): HTMLImageElement {
    const img = document.createElement('img')
    Object.defineProperty(img, 'naturalWidth', { value: naturalW, configurable: true })
    Object.defineProperty(img, 'naturalHeight', { value: naturalH, configurable: true })
    return img
  }

  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: vi.fn()
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,xx')
  })

  it('produces a canvas sized to scaled crop rect', () => {
    const img = makeImage(800, 600)
    const rect: CropRect = { x: 10, y: 20, width: 100, height: 50 }
    const { canvas, dataUrl } = cropCanvas(img, rect, 400, 300)
    // displayed 400x300, natural 800x600 → scale 2x
    expect(canvas.width).toBe(200)
    expect(canvas.height).toBe(100)
    expect(typeof dataUrl).toBe('string')
  })

  it('respects custom output type and quality', () => {
    const img = makeImage(100, 100)
    const rect: CropRect = { x: 0, y: 0, width: 50, height: 50 }
    const { canvas } = cropCanvas(img, rect, 100, 100, 'image/jpeg', 0.5)
    expect(canvas.width).toBe(50)
    expect(canvas.height).toBe(50)
  })

  it('throws when display size or crop rect is not a finite area', () => {
    const img = makeImage(100, 100)
    const rect: CropRect = { x: 0, y: 0, width: 50, height: 50 }
    expect(() => cropCanvas(img, rect, 0, 100)).toThrow(/finite display size/)
    expect(() => cropCanvas(img, { x: 0, y: 0, width: 0, height: 10 }, 100, 100)).toThrow(
      /finite display size/
    )
  })
})

describe('image-utils — getTouchDistance', () => {
  it('computes Euclidean distance between two touches', () => {
    const a = { clientX: 0, clientY: 0 } as unknown as Touch
    const b = { clientX: 3, clientY: 4 } as unknown as Touch
    expect(getTouchDistance(a, b)).toBe(5)
  })

  it('returns 0 when touches are at same position', () => {
    const a = { clientX: 10, clientY: 10 } as unknown as Touch
    const b = { clientX: 10, clientY: 10 } as unknown as Touch
    expect(getTouchDistance(a, b)).toBe(0)
  })
})

describe('image preview / image-viewer demo viewports', () => {
  it.each([
    'examples/example/vue3/src/examples/image/05/demo.json',
    'examples/example/vue3/src/examples/image-viewer/01/demo.json',
    'examples/example/vue3/src/examples/image-viewer/02/demo.json',
    'examples/example/react/src/examples/image/05/demo.json',
    'examples/example/react/src/examples/image-viewer/01/demo.json',
    'examples/example/react/src/examples/image-viewer/02/demo.json'
  ])('%s minHeight fits 90vh preview and does not freeze height', (relativePath) => {
    const demo = JSON.parse(readFileSync(resolve(process.cwd(), relativePath), 'utf-8')) as {
      viewport: { mode: string; minHeight: number; maxHeight: number; height?: number }
    }
    expect(demo.viewport.mode).toBe('auto')
    expect(demo.viewport.minHeight).toBeGreaterThanOrEqual(520)
    expect(demo.viewport.maxHeight).toBeGreaterThanOrEqual(720)
    expect(demo.viewport).not.toHaveProperty('height')
  })
})

describe('image-utils — toCSSSize', () => {
  it('returns undefined for undefined input', () => {
    expect(toCSSSize(undefined)).toBeUndefined()
  })

  it('appends px to numbers', () => {
    expect(toCSSSize(120)).toBe('120px')
    expect(toCSSSize(0)).toBe('0px')
  })

  it('passes through string values unchanged', () => {
    expect(toCSSSize('50%')).toBe('50%')
    expect(toCSSSize('auto')).toBe('auto')
    expect(toCSSSize('10rem')).toBe('10rem')
  })
})
