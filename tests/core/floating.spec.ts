/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import { getFloatingMiddleware, getPlacementSide, getTransformOrigin } from '@expcat/tigercat-core'

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

  describe('placement helpers', () => {
    it('gets transform origin from placement', () => {
      expect(getTransformOrigin('top-start')).toBe('bottom left')
      expect(getTransformOrigin('right-end')).toBe('left bottom')
    })

    it('gets placement side from placement', () => {
      expect(getPlacementSide('bottom-end')).toBe('bottom')
      expect(getPlacementSide('left-start')).toBe('left')
    })
  })
})
