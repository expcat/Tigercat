/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import {
  getImageImgClasses,
  getCropperHandleClasses,
  CROP_HANDLES,
  clampScale,
  calculateTransform,
  getPreviewNavState,
  constrainCropRect,
  resizeCropRect,
  moveCropRect,
  getInitialCropRect,
  cropCanvas,
  getTouchDistance,
  toCSSSize
} from '@expcat/tigercat-core'
import type { CropHandle, CropRect, ImageFit } from '@expcat/tigercat-core'

describe('image-utils — class generators', () => {
  it('getImageImgClasses maps every ImageFit value', () => {
    const fits: Array<[ImageFit, string]> = [
      ['contain', 'object-contain'],
      ['cover', 'object-cover'],
      ['fill', 'object-fill'],
      ['none', 'object-none'],
      ['scale-down', 'object-scale-down']
    ]
    for (const [fit, fragment] of fits) {
      const cls = getImageImgClasses(fit)
      expect(cls).toContain('block')
      expect(cls).toContain('w-full')
      expect(cls).toContain('h-full')
      expect(cls).toContain(fragment)
    }
  })

  it('CROP_HANDLES exposes all 8 directions', () => {
    expect(CROP_HANDLES).toHaveLength(8)
    expect(new Set(CROP_HANDLES)).toEqual(
      new Set(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'])
    )
  })

  it('getCropperHandleClasses includes correct cursor and position for each handle', () => {
    const expectations: Array<[CropHandle, string, string]> = [
      ['nw', 'cursor-nw-resize', '-top-1.5'],
      ['n', 'cursor-n-resize', '-top-1.5'],
      ['ne', 'cursor-ne-resize', '-right-1.5'],
      ['e', 'cursor-e-resize', '-right-1.5'],
      ['se', 'cursor-se-resize', '-bottom-1.5'],
      ['s', 'cursor-s-resize', '-bottom-1.5'],
      ['sw', 'cursor-sw-resize', '-left-1.5'],
      ['w', 'cursor-w-resize', '-left-1.5']
    ]
    for (const [handle, cursor, position] of expectations) {
      const cls = getCropperHandleClasses(handle)
      expect(cls).toContain('absolute')
      expect(cls).toContain('w-3')
      expect(cls).toContain('h-3')
      expect(cls).toContain(cursor)
      expect(cls).toContain(position)
    }
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

  it('resizes from e handle (only width)', () => {
    const out = resizeCropRect(base, 'e', 50, 0, W, H)
    expect(out.width).toBe(150)
  })

  it('resizes from s handle (only height)', () => {
    const out = resizeCropRect(base, 's', 0, 25, W, H)
    expect(out.height).toBe(125)
  })

  it('resizes from w handle (only x/width)', () => {
    const out = resizeCropRect(base, 'w', 20, 0, W, H)
    expect(out.x).toBe(70)
    expect(out.width).toBe(80)
  })

  it('resizes from ne handle', () => {
    const out = resizeCropRect(base, 'ne', 20, 30, W, H)
    expect(out.width).toBe(120)
    expect(out.y).toBe(80)
    expect(out.height).toBe(70)
  })

  it('resizes from sw handle', () => {
    const out = resizeCropRect(base, 'sw', 20, 30, W, H)
    expect(out.x).toBe(70)
    expect(out.width).toBe(80)
    expect(out.height).toBe(130)
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

  it('enforces aspect ratio for n handle (width follows height)', () => {
    const out = resizeCropRect(base, 'n', 0, 50, W, H, 1)
    // height becomes 50, width should match → 50
    expect(out.height).toBe(50)
    expect(out.width).toBe(50)
  })

  it('enforces aspect ratio for e handle (height follows width)', () => {
    const out = resizeCropRect(base, 'e', 50, 0, W, H, 1)
    expect(out.width).toBe(150)
    expect(out.height).toBe(150)
  })

  it('enforces aspect ratio for corner handle (se)', () => {
    const out = resizeCropRect(base, 'se', 30, 80, W, H, 1)
    expect(out.width).toBe(out.height)
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
