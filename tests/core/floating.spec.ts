/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import {
  computeFloatingPosition,
  getArrowStyles,
  getFloatingMiddleware,
  getPlacementSide,
  getTransformOrigin
} from '@expcat/tigercat-core'

describe('floating utilities', () => {
  describe('getFloatingMiddleware', () => {
    it('reuses middleware for identical options without an arrow element', () => {
      const first = getFloatingMiddleware({ offset: 8, flip: true, shift: true })
      const second = getFloatingMiddleware({ offset: 8, flip: true, shift: true })

      expect(first).toBe(second)
      expect(first.map((middleware) => middleware.name)).toEqual([
        'offset',
        'flip',
        'shift',
        'size'
      ])
    })

    it('keeps distinct middleware chains for different scalar options', () => {
      const defaultMiddleware = getFloatingMiddleware({ offset: 8 })
      const customOffsetMiddleware = getFloatingMiddleware({ offset: 12 })
      const noFlipMiddleware = getFloatingMiddleware({ offset: 8, flip: false })

      expect(customOffsetMiddleware).not.toBe(defaultMiddleware)
      expect(noFlipMiddleware).not.toBe(defaultMiddleware)
      expect(noFlipMiddleware.map((middleware) => middleware.name)).toEqual([
        'offset',
        'shift',
        'size'
      ])
    })

    it('caches arrow middleware per arrow element', () => {
      const arrowElement = document.createElement('div')
      const otherArrowElement = document.createElement('div')

      const first = getFloatingMiddleware({ arrowElement })
      const second = getFloatingMiddleware({ arrowElement })
      const otherElementMiddleware = getFloatingMiddleware({ arrowElement: otherArrowElement })
      const noArrowMiddleware = getFloatingMiddleware()

      expect(first).toBe(second)
      expect(first).not.toBe(otherElementMiddleware)
      expect(first).not.toBe(noArrowMiddleware)
      expect(first.map((middleware) => middleware.name)).toEqual([
        'offset',
        'flip',
        'shift',
        'size',
        'arrow'
      ])
    })

    it('keeps arrow padding variants separate for the same element', () => {
      const arrowElement = document.createElement('div')
      const defaultArrowPadding = getFloatingMiddleware({ arrowElement, arrowPadding: 8 })
      const customArrowPadding = getFloatingMiddleware({ arrowElement, arrowPadding: 12 })

      expect(customArrowPadding).not.toBe(defaultArrowPadding)
    })
  })

  describe('anchored reference visibility', () => {
    function rect(top: number, left: number, width: number, height: number): () => DOMRect {
      return () =>
        ({
          top,
          left,
          right: left + width,
          bottom: top + height,
          width,
          height,
          x: left,
          y: top,
          toJSON() {
            return {}
          }
        }) as DOMRect
    }

    it('hides a trigger scrolled out of a clipping scrollport and shows one inside it', async () => {
      const scrollport = document.createElement('div')
      scrollport.style.overflowY = 'auto'
      scrollport.getBoundingClientRect = rect(64, 0, 800, 836)
      const trigger = document.createElement('button')
      const floating = document.createElement('div')
      scrollport.appendChild(trigger)
      document.body.append(scrollport, floating)

      trigger.getBoundingClientRect = rect(120, 16, 184, 50)
      expect((await computeFloatingPosition(trigger, floating)).referenceHidden).toBe(false)

      trigger.getBoundingClientRect = rect(-80, 16, 184, 50)
      expect((await computeFloatingPosition(trigger, floating)).referenceHidden).toBe(true)
    })
  })

  describe('placement helpers', () => {
    it('gets transform origin from placement', () => {
      expect(getTransformOrigin('top-start')).toBe('bottom left')
      expect(getTransformOrigin('right-end')).toBe('left bottom')
    })

    it('gets placement side from placement', () => {
      expect(getPlacementSide('bottom-end')).toBe('bottom')
      expect(getPlacementSide('left-start')).toBe('left')
    })

    it('places the arrow on the opposite side of the floating element', () => {
      expect(getArrowStyles('top', { x: 12 })).toMatchObject({
        position: 'absolute',
        bottom: '-4px',
        left: '12px'
      })
      expect(getArrowStyles('left', { y: 8 })).toMatchObject({
        position: 'absolute',
        right: '-4px',
        top: '8px'
      })
      // No middleware coordinate must still leave the caret on the edge center.
      // An omitted cross axis would use the static position (corner, or the next line).
      expect(getArrowStyles('top')).toMatchObject({
        bottom: '-4px',
        left: 'calc(50% - 4px)'
      })
      expect(getArrowStyles('top').top).toBeUndefined()
      expect(getArrowStyles('right')).toMatchObject({
        left: '-4px',
        top: 'calc(50% - 4px)'
      })
      expect(getArrowStyles('right').bottom).toBeUndefined()
      expect(getArrowStyles('bottom', { x: 0 }).left).toBe('0px')
    })
  })
})
