import { describe, it, expect } from 'vitest'
import {
  clampZoom,
  normalizeRotation,
  createDefaultTransform,
  getImageTransformStyle,
  applyWheelZoom,
  createPanState,
  startPan,
  movePan,
  createPinchState,
  startPinch,
  movePinch
} from '@expcat/tigercat-core'

describe('image-viewer gesture utils', () => {
  // ─── clampZoom / normalizeRotation ────────────────────────

  describe('clampZoom', () => {
    it('clamps within bounds', () => {
      expect(clampZoom(2, 0.5, 3)).toBe(2)
      expect(clampZoom(0.1, 0.5, 3)).toBe(0.5)
      expect(clampZoom(5, 0.5, 3)).toBe(3)
    })
  })

  describe('normalizeRotation', () => {
    it('normalizes positive rotation', () => {
      expect(normalizeRotation(450)).toBe(90)
    })

    it('normalizes negative rotation', () => {
      expect(normalizeRotation(-90)).toBe(270)
    })

    it('keeps zero', () => {
      expect(normalizeRotation(0)).toBe(0)
    })
  })

  // ─── GestureTransform ────────────────────────────────────

  describe('createDefaultTransform', () => {
    it('returns centered, 1x scale, no rotation', () => {
      const t = createDefaultTransform()
      expect(t).toEqual({ scale: 1, translateX: 0, translateY: 0, rotation: 0 })
    })
  })

  describe('getImageTransformStyle', () => {
    it('generates CSS transform string', () => {
      const css = getImageTransformStyle({ scale: 2, translateX: 10, translateY: -5, rotation: 90 })
      expect(css).toBe('translate(10px, -5px) scale(2) rotate(90deg)')
    })

    it('handles default transform', () => {
      const css = getImageTransformStyle(createDefaultTransform())
      expect(css).toBe('translate(0px, 0px) scale(1) rotate(0deg)')
    })
  })

  // ─── Wheel zoom ──────────────────────────────────────────

  describe('applyWheelZoom', () => {
    it('zooms in with negative deltaY', () => {
      const result = applyWheelZoom(1, -100, { minZoom: 0.5, maxZoom: 3 })
      expect(result).toBeGreaterThan(1)
    })

    it('zooms out with positive deltaY', () => {
      const result = applyWheelZoom(1, 100, { minZoom: 0.5, maxZoom: 3 })
      expect(result).toBeLessThan(1)
    })

    it('clamps to minZoom', () => {
      const result = applyWheelZoom(0.5, 10000, { minZoom: 0.5, maxZoom: 3 })
      expect(result).toBe(0.5)
    })

    it('clamps to maxZoom', () => {
      const result = applyWheelZoom(3, -10000, { minZoom: 0.5, maxZoom: 3 })
      expect(result).toBe(3)
    })

    it('uses custom step', () => {
      const result = applyWheelZoom(1, -100, { minZoom: 0.5, maxZoom: 3, step: 0.01 })
      expect(result).toBe(2)
    })
  })

  // ─── Pan ─────────────────────────────────────────────────

  describe('pan', () => {
    it('createPanState returns inactive state', () => {
      const s = createPanState()
      expect(s.isPanning).toBe(false)
    })

    it('startPan captures start position', () => {
      const s = startPan(100, 200, 10, 20)
      expect(s.isPanning).toBe(true)
      expect(s.startX).toBe(100)
      expect(s.startY).toBe(200)
      expect(s.startTranslateX).toBe(10)
      expect(s.startTranslateY).toBe(20)
    })

    it('movePan computes delta', () => {
      const s = startPan(100, 200, 0, 0)
      const result = movePan(s, 150, 250)
      expect(result.translateX).toBe(50)
      expect(result.translateY).toBe(50)
    })

    it('movePan preserves starting translate', () => {
      const s = startPan(100, 200, 30, -10)
      const result = movePan(s, 120, 180)
      expect(result.translateX).toBe(50) // 30 + (120-100)
      expect(result.translateY).toBe(-30) // -10 + (180-200)
    })
  })

  // ─── Pinch ───────────────────────────────────────────────

  describe('pinch', () => {
    it('createPinchState returns inactive state', () => {
      const s = createPinchState()
      expect(s.isPinching).toBe(false)
    })

    it('startPinch captures initial distance and scale', () => {
      const s = startPinch(
        { clientX: 0, clientY: 0 },
        { clientX: 100, clientY: 0 },
        1.5
      )
      expect(s.isPinching).toBe(true)
      expect(s.initialDistance).toBe(100)
      expect(s.initialScale).toBe(1.5)
    })

    it('movePinch scales proportionally', () => {
      const s = startPinch(
        { clientX: 0, clientY: 0 },
        { clientX: 100, clientY: 0 },
        1
      )
      // Double the distance → double the scale
      const result = movePinch(
        s,
        { clientX: 0, clientY: 0 },
        { clientX: 200, clientY: 0 },
        0.5,
        3
      )
      expect(result).toBe(2)
    })

    it('movePinch clamps to minZoom', () => {
      const s = startPinch(
        { clientX: 0, clientY: 0 },
        { clientX: 100, clientY: 0 },
        1
      )
      const result = movePinch(
        s,
        { clientX: 0, clientY: 0 },
        { clientX: 10, clientY: 0 },
        0.5,
        3
      )
      expect(result).toBe(0.5)
    })

    it('movePinch clamps to maxZoom', () => {
      const s = startPinch(
        { clientX: 0, clientY: 0 },
        { clientX: 100, clientY: 0 },
        2
      )
      const result = movePinch(
        s,
        { clientX: 0, clientY: 0 },
        { clientX: 500, clientY: 0 },
        0.5,
        3
      )
      expect(result).toBe(3)
    })

    it('movePinch returns initial scale when initial distance is 0', () => {
      const s: ReturnType<typeof createPinchState> = {
        isPinching: true,
        initialDistance: 0,
        initialScale: 1.5
      }
      const result = movePinch(
        s,
        { clientX: 0, clientY: 0 },
        { clientX: 100, clientY: 0 },
        0.5,
        3
      )
      expect(result).toBe(1.5)
    })
  })
})
