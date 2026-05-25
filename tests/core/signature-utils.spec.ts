import { describe, expect, it, vi } from 'vitest'
import {
  clampSignatureLineWidth,
  cloneSignatureStrokes,
  drawSignatureStrokes,
  getSignatureCanvasDataUrl,
  getSignatureCanvasWrapClasses,
  getSignaturePoint,
  isSignatureEmpty,
  signatureStrokeToPath,
  signatureStrokesToSvg,
  signatureSvgToDataUrl,
  type SignatureStroke
} from '@expcat/tigercat-core'

const stroke: SignatureStroke = {
  color: '#111827',
  lineWidth: 3,
  points: [
    { x: 10, y: 20 },
    { x: 30.1234, y: 40.5678 }
  ]
}

describe('signature-utils', () => {
  it('clamps line width to supported bounds', () => {
    expect(clampSignatureLineWidth(undefined)).toBe(2)
    expect(clampSignatureLineWidth(0)).toBe(1)
    expect(clampSignatureLineWidth(48)).toBe(24)
    expect(clampSignatureLineWidth(6)).toBe(6)
  })

  it('maps client coordinates into canvas coordinates', () => {
    const point = getSignaturePoint(
      110,
      70,
      { left: 10, top: 20, width: 200, height: 100 },
      100,
      50
    )
    expect(point.x).toBe(50)
    expect(point.y).toBe(25)
  })

  it('clamps points within canvas bounds', () => {
    const point = getSignaturePoint(-10, 999, { left: 0, top: 0, width: 100, height: 100 }, 80, 60)
    expect(point.x).toBe(0)
    expect(point.y).toBe(60)
  })

  it('detects empty signatures', () => {
    expect(isSignatureEmpty([])).toBe(true)
    expect(isSignatureEmpty([{ ...stroke, points: [] }])).toBe(true)
    expect(isSignatureEmpty([stroke])).toBe(false)
  })

  it('clones strokes without sharing point references', () => {
    const cloned = cloneSignatureStrokes([stroke])
    cloned[0].points[0].x = 99
    expect(stroke.points[0].x).toBe(10)
  })

  it('converts a stroke to an svg path', () => {
    expect(signatureStrokeToPath(stroke)).toBe('M 10 20 L 30.12 40.57')
  })

  it('exports strokes to svg with background', () => {
    const svg = signatureStrokesToSvg([stroke], {
      width: 120,
      height: 80,
      backgroundColor: '#fff'
    })
    expect(svg).toContain('viewBox="0 0 120 80"')
    expect(svg).toContain('<rect width="100%" height="100%" fill="#fff"/>')
    expect(svg).toContain('stroke="#111827"')
  })

  it('escapes svg attributes', () => {
    const svg = signatureStrokesToSvg([{ ...stroke, color: '"<red>&' }], {
      width: 120,
      height: 80,
      backgroundColor: '"<white>&'
    })
    expect(svg).toContain('&quot;&lt;red&gt;&amp;')
    expect(svg).toContain('&quot;&lt;white&gt;&amp;')
  })

  it('encodes svg data urls', () => {
    expect(signatureSvgToDataUrl('<svg></svg>')).toBe(
      'data:image/svg+xml;charset=utf-8,%3Csvg%3E%3C%2Fsvg%3E'
    )
  })

  it('returns state classes for disabled and readonly modes', () => {
    expect(getSignatureCanvasWrapClasses(true)).toContain('opacity-60')
    expect(getSignatureCanvasWrapClasses(false, true)).toContain('cursor-not-allowed')
    expect(getSignatureCanvasWrapClasses()).toContain('cursor-crosshair')
  })

  it('draws strokes to canvas context', () => {
    const context = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      lineCap: '',
      lineJoin: ''
    } as unknown as CanvasRenderingContext2D

    drawSignatureStrokes(context, [stroke], { width: 120, height: 80, backgroundColor: '#fff' })

    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 120, 80)
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 120, 80)
    expect(context.moveTo).toHaveBeenCalledWith(10, 20)
    expect(context.lineTo).toHaveBeenCalledWith(30.1234, 40.5678)
    expect(context.stroke).toHaveBeenCalled()
  })

  it('draws a dot for single-point strokes', () => {
    const context = {
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn()
    } as unknown as CanvasRenderingContext2D

    drawSignatureStrokes(context, [{ ...stroke, points: [{ x: 1, y: 2 }] }], {
      width: 10,
      height: 10
    })

    expect(context.lineTo).toHaveBeenCalledWith(1.01, 2.01)
  })

  it('returns canvas data urls and ignores svg type', () => {
    const canvas = {
      toDataURL: vi.fn(() => 'data:image/png;base64,test')
    } as unknown as HTMLCanvasElement

    expect(getSignatureCanvasDataUrl(canvas, 'image/png', 0.8)).toBe('data:image/png;base64,test')
    expect(canvas.toDataURL).toHaveBeenCalledWith('image/png', 0.8)
    expect(getSignatureCanvasDataUrl(canvas, 'image/svg+xml')).toBe('')
  })
})
