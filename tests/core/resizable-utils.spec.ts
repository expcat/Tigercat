import { describe, it, expect } from 'vitest'
import {
  getResizableHandleClasses,
  calculateResizeDelta,
  clampDimensions,
  applyAspectRatio,
  defaultResizeHandles,
  resizableBaseClasses,
  resizableHandlePositionStyles
} from '@expcat/tigercat-core'

describe('resizable-utils', () => {
  describe('defaultResizeHandles', () => {
    it('should have default handles', () => {
      expect(defaultResizeHandles).toEqual(['right', 'bottom', 'bottom-right'])
    })
  })

  describe('resizableHandlePositionStyles', () => {
    it('should have all 8 positions', () => {
      const positions = Object.keys(resizableHandlePositionStyles)
      expect(positions).toHaveLength(8)
      expect(positions).toContain('top')
      expect(positions).toContain('right')
      expect(positions).toContain('bottom')
      expect(positions).toContain('left')
      expect(positions).toContain('top-left')
      expect(positions).toContain('top-right')
      expect(positions).toContain('bottom-left')
      expect(positions).toContain('bottom-right')
    })

    it('should have correct cursor for each position', () => {
      expect(resizableHandlePositionStyles.right.cursor).toBe('cursor-e-resize')
      expect(resizableHandlePositionStyles.bottom.cursor).toBe('cursor-s-resize')
      expect(resizableHandlePositionStyles['bottom-right'].cursor).toBe('cursor-se-resize')
    })
  })

  describe('getResizableHandleClasses', () => {
    it('should return classes for a handle', () => {
      const classes = getResizableHandleClasses('right', false, false)
      expect(classes).toContain('absolute')
      expect(classes).toContain('cursor-e-resize')
    })

    it('should include dragging classes', () => {
      const classes = getResizableHandleClasses('right', true, false)
      expect(classes).toContain('opacity-100')
    })

    it('should include disabled classes', () => {
      const classes = getResizableHandleClasses('right', false, true)
      expect(classes).toContain('pointer-events-none')
    })
  })

  describe('calculateResizeDelta', () => {
    it('should calculate right handle delta', () => {
      const { deltaWidth, deltaHeight } = calculateResizeDelta('right', 50, 30, 'both')
      expect(deltaWidth).toBe(50)
      expect(deltaHeight).toBe(0)
    })

    it('should calculate bottom handle delta', () => {
      const { deltaWidth, deltaHeight } = calculateResizeDelta('bottom', 50, 30, 'both')
      expect(deltaWidth).toBe(0)
      expect(deltaHeight).toBe(30)
    })

    it('should calculate bottom-right handle delta', () => {
      const { deltaWidth, deltaHeight } = calculateResizeDelta('bottom-right', 50, 30, 'both')
      expect(deltaWidth).toBe(50)
      expect(deltaHeight).toBe(30)
    })

    it('should calculate left handle delta (inverted)', () => {
      const { deltaWidth, deltaHeight } = calculateResizeDelta('left', 50, 30, 'both')
      expect(deltaWidth).toBe(-50)
      expect(deltaHeight).toBe(0)
    })

    it('should calculate top handle delta (inverted)', () => {
      const { deltaWidth, deltaHeight } = calculateResizeDelta('top', 50, 30, 'both')
      expect(deltaWidth).toBe(0)
      expect(deltaHeight).toBe(-30)
    })

    it('should calculate top-left handle delta', () => {
      const { deltaWidth, deltaHeight } = calculateResizeDelta('top-left', 50, 30, 'both')
      expect(deltaWidth).toBe(-50)
      expect(deltaHeight).toBe(-30)
    })

    it('should restrict to horizontal axis', () => {
      const { deltaWidth, deltaHeight } = calculateResizeDelta('bottom-right', 50, 30, 'horizontal')
      expect(deltaWidth).toBe(50)
      expect(deltaHeight).toBe(0)
    })

    it('should restrict to vertical axis', () => {
      const { deltaWidth, deltaHeight } = calculateResizeDelta('bottom-right', 50, 30, 'vertical')
      expect(deltaWidth).toBe(0)
      expect(deltaHeight).toBe(30)
    })
  })

  describe('clampDimensions', () => {
    it('should clamp below min', () => {
      const { width, height } = clampDimensions(50, 30, 100, 100)
      expect(width).toBe(100)
      expect(height).toBe(100)
    })

    it('should clamp above max', () => {
      const { width, height } = clampDimensions(500, 500, 0, 0, 400, 300)
      expect(width).toBe(400)
      expect(height).toBe(300)
    })

    it('should return value within range', () => {
      const { width, height } = clampDimensions(200, 150, 100, 100, 400, 300)
      expect(width).toBe(200)
      expect(height).toBe(150)
    })

    it('should handle no max', () => {
      const { width, height } = clampDimensions(9999, 9999, 0, 0)
      expect(width).toBe(9999)
      expect(height).toBe(9999)
    })
  })

  describe('applyAspectRatio', () => {
    it('should maintain aspect ratio 2:1', () => {
      const { width, height } = applyAspectRatio(400, 300, 200, 100)
      expect(width).toBe(400)
      expect(height).toBe(200) // 400 / 2
    })

    it('should maintain aspect ratio 1:1', () => {
      const { width, height } = applyAspectRatio(300, 200, 100, 100)
      expect(width).toBe(300)
      expect(height).toBe(300)
    })

    it('should handle zero original dimensions', () => {
      const { width, height } = applyAspectRatio(300, 200, 0, 0)
      expect(width).toBe(300)
      expect(height).toBe(200)
    })
  })
})
