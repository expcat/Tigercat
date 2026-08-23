/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import {
  DEFAULT_IMAGE_COMPARE_ARIA_LABEL,
  DEFAULT_IMAGE_COMPARE_FIT,
  DEFAULT_IMAGE_COMPARE_ORIENTATION,
  DEFAULT_IMAGE_COMPARE_POSITION,
  DEFAULT_IMAGE_COMPARE_STEP,
  IMAGE_COMPARE_POSITION_VAR,
  getImageCompareClipStyle,
  getImageCompareHandleClasses,
  getImageCompareHandleStyle,
  getImageCompareImgClasses,
  getImageCompareKeyboardPosition,
  getImageComparePointerClientPoint,
  getImageComparePositionFromPointer,
  getImageCompareRootClasses,
  getImageCompareRootStyle,
  isImageCompareInteractiveTarget,
  isImageCompareVertical,
  resolveImageCompareAriaLabel,
  resolveImageCompareFit,
  resolveImageCompareOrientation,
  resolveImageComparePosition,
  resolveImageCompareStep
} from '@expcat/tigercat-core'

describe('image-compare-utils', () => {
  describe('resolvers', () => {
    it('accepts known orientations and falls back otherwise', () => {
      expect(resolveImageCompareOrientation('horizontal')).toBe('horizontal')
      expect(resolveImageCompareOrientation('vertical')).toBe('vertical')
      expect(resolveImageCompareOrientation()).toBe(DEFAULT_IMAGE_COMPARE_ORIENTATION)
      expect(resolveImageCompareOrientation('diagonal' as never)).toBe(
        DEFAULT_IMAGE_COMPARE_ORIENTATION
      )
      expect(isImageCompareVertical('vertical')).toBe(true)
      expect(isImageCompareVertical('horizontal')).toBe(false)
    })

    it('clamps and snaps position, falling back for non-finite values', () => {
      expect(resolveImageComparePosition(50)).toBe(50)
      expect(resolveImageComparePosition()).toBe(DEFAULT_IMAGE_COMPARE_POSITION)
      expect(resolveImageComparePosition(Number.NaN)).toBe(DEFAULT_IMAGE_COMPARE_POSITION)
      expect(resolveImageComparePosition(-10)).toBe(0)
      expect(resolveImageComparePosition(150)).toBe(100)
      expect(resolveImageComparePosition(54, 10)).toBe(50)
    })

    it('resolves step, fit, and aria-label with fallbacks', () => {
      expect(resolveImageCompareStep(5)).toBe(5)
      expect(resolveImageCompareStep()).toBe(DEFAULT_IMAGE_COMPARE_STEP)
      expect(resolveImageCompareStep(0)).toBe(DEFAULT_IMAGE_COMPARE_STEP)
      expect(resolveImageCompareStep(-1)).toBe(DEFAULT_IMAGE_COMPARE_STEP)
      expect(resolveImageCompareFit('contain')).toBe('contain')
      expect(resolveImageCompareFit()).toBe(DEFAULT_IMAGE_COMPARE_FIT)
      expect(resolveImageCompareFit('stretch' as never)).toBe(DEFAULT_IMAGE_COMPARE_FIT)
      expect(resolveImageCompareAriaLabel('  Before and after  ')).toBe('Before and after')
      expect(resolveImageCompareAriaLabel('')).toBe(DEFAULT_IMAGE_COMPARE_ARIA_LABEL)
      expect(resolveImageCompareAriaLabel()).toBe(DEFAULT_IMAGE_COMPARE_ARIA_LABEL)
    })
  })

  describe('pointer and keyboard', () => {
    const rect = { left: 0, top: 0, width: 200, height: 100 }

    it('maps pointer location to a snapped percentage', () => {
      expect(
        getImageComparePositionFromPointer({
          clientX: 80,
          clientY: 10,
          rect,
          step: 1
        })
      ).toBe(40)
      expect(
        getImageComparePositionFromPointer({
          clientX: 10,
          clientY: 75,
          rect,
          orientation: 'vertical',
          step: 1
        })
      ).toBe(75)
    })

    it('reads mouse and touch client points', () => {
      expect(getImageComparePointerClientPoint({ clientX: 12, clientY: 8 })).toEqual({
        clientX: 12,
        clientY: 8
      })
      expect(
        getImageComparePointerClientPoint({
          touches: [{ clientX: 3, clientY: 4 }]
        })
      ).toEqual({ clientX: 3, clientY: 4 })
      expect(getImageComparePointerClientPoint({})).toBeNull()
    })

    it('moves the handle with slider keyboard keys', () => {
      expect(getImageCompareKeyboardPosition('ArrowRight', 50, 1)).toBe(51)
      expect(getImageCompareKeyboardPosition('ArrowLeft', 50, 1)).toBe(49)
      expect(getImageCompareKeyboardPosition('Home', 50, 1)).toBe(0)
      expect(getImageCompareKeyboardPosition('End', 50, 1)).toBe(100)
      expect(getImageCompareKeyboardPosition('Escape', 50, 1)).toBeNull()
    })

    it('ignores interactive slot targets except the handle', () => {
      const root = document.createElement('div')
      const handle = document.createElement('div')
      const button = document.createElement('button')
      const img = document.createElement('img')
      root.append(handle, button, img)
      document.body.append(root)

      expect(isImageCompareInteractiveTarget(button, handle)).toBe(true)
      expect(isImageCompareInteractiveTarget(img, handle)).toBe(false)
      expect(isImageCompareInteractiveTarget(handle, handle)).toBe(false)

      root.remove()
    })
  })

  describe('styles and classes', () => {
    it('clips the before pane from the end edge', () => {
      expect(getImageCompareClipStyle(50, 'horizontal')).toEqual({
        clipPath: 'inset(0 50% 0 0)'
      })
      expect(getImageCompareClipStyle(25, 'vertical')).toEqual({
        clipPath: 'inset(0 0 75% 0)'
      })
    })

    it('offsets the handle from the start edge', () => {
      expect(getImageCompareHandleStyle(40, 'horizontal')).toEqual({ left: '40%' })
      expect(getImageCompareHandleStyle(70, 'vertical')).toEqual({ top: '70%' })
    })

    it('writes position, width, and height onto the root style', () => {
      const style = getImageCompareRootStyle({ position: 30, width: 320, height: '12rem' })
      expect(style[IMAGE_COMPARE_POSITION_VAR]).toBe('30%')
      expect(style.width).toBe('320px')
      expect(style.height).toBe('12rem')
    })

    it('composes root and handle classes from orientation and disabled', () => {
      const root = getImageCompareRootClasses({
        orientation: 'vertical',
        disabled: true,
        className: 'extra'
      })
      expect(root).toContain('tiger-image-compare')
      expect(root).toContain('tiger-image-compare-vertical')
      expect(root).toContain('tiger-image-compare-disabled')
      expect(root).toContain('extra')
      expect(getImageCompareRootClasses().includes('tiger-image-compare-horizontal')).toBe(true)

      const handle = getImageCompareHandleClasses({ orientation: 'vertical', disabled: true })
      expect(handle).toContain('cursor-ns-resize')
      expect(handle).toContain('cursor-not-allowed')
    })

    it('reuses Image object-fit classes for pane images', () => {
      expect(getImageCompareImgClasses('contain')).toContain('object-contain')
      expect(getImageCompareImgClasses()).toContain('object-cover')
    })
  })
})
