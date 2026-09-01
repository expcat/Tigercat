/**
 * @vitest-environment node
 */

import { describe, expect, it, vi } from 'vitest'
import {
  computeScrollAreaAxisState,
  computeScrollAreaState,
  computeScrollFromThumbOffset,
  computeScrollFromTrackPoint,
  createEmptyScrollAreaState,
  getScrollAreaBoxStyle,
  getScrollAreaContentClasses,
  getScrollAreaScrollbarClasses,
  getScrollAreaScrollbarPlacementStyle,
  getScrollAreaShadowSides,
  getScrollAreaShadowStyle,
  getScrollAreaThumbClasses,
  getScrollAreaThumbStyle,
  getScrollAreaViewportClasses,
  isScrollAreaAxisEnabled,
  observeScrollAreaSize,
  readScrollAreaMetrics,
  resolveScrollAreaLength,
  shouldRenderScrollAreaScrollbar,
  SCROLL_AREA_MIN_THUMB_SIZE
} from '@expcat/tigercat-core'

const metrics = {
  scrollTop: 100,
  scrollLeft: 0,
  scrollHeight: 400,
  scrollWidth: 200,
  clientHeight: 200,
  clientWidth: 200
}

describe('scroll-area-utils', () => {
  describe('computeScrollAreaAxisState', () => {
    it('derives thumb size and offset proportional to the viewport', () => {
      // client 200 of scroll 400 → thumb covers half the track (100px)
      const state = computeScrollAreaAxisState(100, 400, 200)
      expect(state.scrollable).toBe(true)
      expect(state.thumbSize).toBe(100)
      // halfway scrolled → thumb sits halfway down the remaining track
      expect(state.progress).toBeCloseTo(0.5)
      expect(state.thumbOffset).toBe(50)
    })

    it('reports a non-scrollable axis when the content fits', () => {
      const state = computeScrollAreaAxisState(0, 200, 200)
      expect(state).toMatchObject({
        scrollable: false,
        thumbOffset: 0,
        progress: 0,
        atStart: true,
        atEnd: true
      })
    })

    it('keeps the thumb grabbable on very long content', () => {
      const state = computeScrollAreaAxisState(0, 100_000, 200)
      expect(state.thumbSize).toBe(SCROLL_AREA_MIN_THUMB_SIZE)
    })

    it('honours a custom minimum thumb size', () => {
      expect(computeScrollAreaAxisState(0, 100_000, 200, 40).thumbSize).toBe(40)
    })

    it('flags the start and end edges', () => {
      expect(computeScrollAreaAxisState(0, 400, 200).atStart).toBe(true)
      expect(computeScrollAreaAxisState(0, 400, 200).atEnd).toBe(false)
      expect(computeScrollAreaAxisState(200, 400, 200).atEnd).toBe(true)
    })

    it('clamps an out-of-range scroll position', () => {
      expect(computeScrollAreaAxisState(9999, 400, 200).progress).toBe(1)
      expect(computeScrollAreaAxisState(-50, 400, 200).progress).toBe(0)
    })

    it('treats a zero-sized viewport as not scrollable', () => {
      expect(computeScrollAreaAxisState(0, 0, 0).scrollable).toBe(false)
    })
  })

  describe('computeScrollAreaState', () => {
    it('derives both axes from viewport metrics', () => {
      const state = computeScrollAreaState(metrics)
      expect(state.y.scrollable).toBe(true)
      expect(state.x.scrollable).toBe(false)
    })

    it('maps RTL negative, RTL 0=physical-left, and LTR onto the same logical progress', () => {
      const rtlNegative = computeScrollAreaState(
        { ...metrics, scrollLeft: -200, scrollWidth: 400, clientWidth: 200 },
        undefined,
        'rtl'
      )
      const rtlPhysical = computeScrollAreaState(
        { ...metrics, scrollLeft: 0, scrollWidth: 400, clientWidth: 200 },
        undefined,
        'rtl'
      )
      const ltr = computeScrollAreaState(
        { ...metrics, scrollLeft: 200, scrollWidth: 400, clientWidth: 200 },
        undefined,
        'ltr'
      )
      expect(rtlNegative.x.progress).toBeCloseTo(1)
      expect(rtlPhysical.x.progress).toBeCloseTo(1)
      expect(ltr.x.progress).toBeCloseTo(1)
    })

    it('starts empty before the viewport is measured', () => {
      expect(createEmptyScrollAreaState()).toEqual({
        x: {
          scrollable: false,
          thumbSize: 0,
          thumbOffset: 0,
          progress: 0,
          atStart: true,
          atEnd: true
        },
        y: {
          scrollable: false,
          thumbSize: 0,
          thumbOffset: 0,
          progress: 0,
          atStart: true,
          atEnd: true
        }
      })
    })
  })

  describe('readScrollAreaMetrics', () => {
    it('copies only the measurements the state derives from', () => {
      expect(readScrollAreaMetrics({ ...metrics, extra: 1 } as never)).toEqual(metrics)
    })
  })

  describe('computeScrollFromThumbOffset', () => {
    it('maps a thumb offset back to a scroll offset', () => {
      // track 200, thumb 100 → 100px of travel maps onto 200px of scroll
      expect(computeScrollFromThumbOffset(50, 200, 100, 400, 200)).toBe(100)
    })

    it('clamps beyond either end of the track', () => {
      expect(computeScrollFromThumbOffset(-999, 200, 100, 400, 200)).toBe(0)
      expect(computeScrollFromThumbOffset(999, 200, 100, 400, 200)).toBe(200)
    })

    it('returns 0 when there is no travel available', () => {
      expect(computeScrollFromThumbOffset(50, 200, 200, 200, 200)).toBe(0)
      expect(computeScrollFromThumbOffset(50, 0, 0, 400, 200)).toBe(0)
    })
  })

  describe('computeScrollFromTrackPoint', () => {
    it('centers the thumb under the pointer', () => {
      // point 100 with a 100px thumb → offset 50 → scroll 100
      expect(computeScrollFromTrackPoint(100, 200, 100, 400, 200)).toBe(100)
    })

    it('clamps a click near the track start to the top', () => {
      expect(computeScrollFromTrackPoint(0, 200, 100, 400, 200)).toBe(0)
    })
  })

  describe('isScrollAreaAxisEnabled', () => {
    it.each([
      ['vertical', 'y', true],
      ['vertical', 'x', false],
      ['horizontal', 'x', true],
      ['horizontal', 'y', false],
      ['both', 'x', true],
      ['both', 'y', true]
    ] as const)('%s direction enables %s = %s', (direction, axis, expected) => {
      expect(isScrollAreaAxisEnabled(direction, axis)).toBe(expected)
    })
  })

  describe('shouldRenderScrollAreaScrollbar', () => {
    const scrollable = computeScrollAreaAxisState(0, 400, 200)
    const fits = computeScrollAreaAxisState(0, 200, 200)

    it('renders an overflowing axis under auto', () => {
      expect(shouldRenderScrollAreaScrollbar('auto', 'vertical', 'y', scrollable)).toBe(true)
      expect(shouldRenderScrollAreaScrollbar('auto', 'vertical', 'y', fits)).toBe(false)
    })

    it('renders a fitting axis under always', () => {
      expect(shouldRenderScrollAreaScrollbar('always', 'vertical', 'y', fits)).toBe(true)
    })

    it('never renders under hidden', () => {
      expect(shouldRenderScrollAreaScrollbar('hidden', 'both', 'y', scrollable)).toBe(false)
    })

    it('never renders an axis the direction disables', () => {
      expect(shouldRenderScrollAreaScrollbar('always', 'vertical', 'x', scrollable)).toBe(false)
    })
  })

  describe('getScrollAreaShadowSides', () => {
    it('shows the bottom edge while scrolled to the top', () => {
      const state = computeScrollAreaState({ ...metrics, scrollTop: 0 })
      expect(getScrollAreaShadowSides(state, 'vertical')).toEqual(['bottom'])
    })

    it('shows both edges in the middle of the range', () => {
      expect(getScrollAreaShadowSides(computeScrollAreaState(metrics), 'vertical')).toEqual([
        'top',
        'bottom'
      ])
    })

    it('shows the top edge only at the end of the range', () => {
      const state = computeScrollAreaState({ ...metrics, scrollTop: 200 })
      expect(getScrollAreaShadowSides(state, 'vertical')).toEqual(['top'])
    })

    it('ignores an axis the direction disables', () => {
      const state = computeScrollAreaState({ ...metrics, scrollWidth: 400 })
      expect(getScrollAreaShadowSides(state, 'vertical')).toEqual(['top', 'bottom'])
      expect(getScrollAreaShadowSides(state, 'both')).toEqual(['top', 'bottom', 'inline-end'])
    })

    it('returns nothing when nothing overflows', () => {
      const state = computeScrollAreaState({ ...metrics, scrollHeight: 200, scrollTop: 0 })
      expect(getScrollAreaShadowSides(state, 'both')).toEqual([])
    })
  })

  describe('resolveScrollAreaLength', () => {
    it.each([
      [240, '240px'],
      ['50vh', '50vh'],
      [undefined, undefined],
      ['', undefined]
    ])('resolves %s', (input, expected) => {
      expect(resolveScrollAreaLength(input)).toBe(expected)
    })
  })

  describe('getScrollAreaBoxStyle', () => {
    it('emits only the dimensions that were provided', () => {
      expect(getScrollAreaBoxStyle({ maxHeight: 300 })).toEqual({ maxHeight: '300px' })
      expect(getScrollAreaBoxStyle({})).toEqual({})
    })

    it('passes string lengths through untouched', () => {
      expect(getScrollAreaBoxStyle({ height: '20rem', width: '100%' })).toEqual({
        height: '20rem',
        width: '100%'
      })
    })
  })

  describe('class builders', () => {
    it('picks the overflow axis from the direction', () => {
      expect(getScrollAreaViewportClasses('vertical')).toContain('overflow-y-auto')
      expect(getScrollAreaViewportClasses('horizontal')).toContain('overflow-x-auto')
      expect(getScrollAreaViewportClasses('both')).toContain('overflow-auto')
    })

    it('hides the native scrollbar and appends a custom class', () => {
      const classes = getScrollAreaViewportClasses('vertical', 'custom-viewport')
      expect(classes).toContain('[&::-webkit-scrollbar]:hidden')
      expect(classes).toContain('custom-viewport')
    })

    it('lets horizontal content grow past the viewport', () => {
      expect(getScrollAreaContentClasses('vertical')).not.toContain('min-w-max')
      expect(getScrollAreaContentClasses('horizontal')).toContain('min-w-max')
      expect(getScrollAreaContentClasses('both')).not.toContain('min-w-max')
    })

    it('fades the scrollbar only in hover mode', () => {
      expect(getScrollAreaScrollbarClasses('y', 'md', 'hover')).toContain(
        'group-hover/scroll-area:opacity-100'
      )
      expect(getScrollAreaScrollbarClasses('y', 'md', 'always')).toContain('opacity-100')
      expect(getScrollAreaScrollbarClasses('y', 'md', 'always')).not.toContain('opacity-0')
    })

    it('maps the size token onto the scrollbar thickness', () => {
      expect(getScrollAreaScrollbarClasses('y', 'sm', 'auto')).toContain('w-1.5')
      expect(getScrollAreaScrollbarClasses('x', 'lg', 'auto')).toContain('h-3.5')
    })

    it('marks a dragging thumb', () => {
      expect(getScrollAreaThumbClasses('y', true)).not.toBe(getScrollAreaThumbClasses('y', false))
    })
  })

  describe('getScrollAreaThumbStyle', () => {
    it('sizes the vertical thumb along the block axis', () => {
      const axisState = computeScrollAreaAxisState(100, 400, 200)
      expect(getScrollAreaThumbStyle('y', axisState)).toEqual({
        position: 'absolute',
        height: '100px',
        top: '50px',
        insetInlineStart: '2px',
        insetInlineEnd: '2px'
      })
    })

    it('sizes the horizontal thumb along the inline axis', () => {
      const axisState = computeScrollAreaAxisState(100, 400, 200)
      expect(getScrollAreaThumbStyle('x', axisState)).toEqual({
        position: 'absolute',
        width: '100px',
        insetInlineStart: '50px',
        top: '2px',
        bottom: '2px'
      })
    })
  })

  describe('overlay chrome geometry', () => {
    it('pins the vertical track with inline logical insets', () => {
      expect(getScrollAreaScrollbarPlacementStyle('y', 'md', false)).toMatchObject({
        position: 'absolute',
        width: '10px',
        insetBlockStart: '0px',
        insetBlockEnd: '0px',
        insetInlineEnd: '0px'
      })
    })

    it('gives the top shadow a non-empty box without Tailwind inset utilities', () => {
      expect(getScrollAreaShadowStyle('top')).toMatchObject({
        position: 'absolute',
        insetInlineStart: '0px',
        insetInlineEnd: '0px',
        top: '0px',
        height: '0.75rem'
      })
    })
  })

  describe('observeScrollAreaSize', () => {
    it('observes every provided target and disconnects on teardown', () => {
      const observe = vi.fn()
      const disconnect = vi.fn()
      class ResizeObserverMock {
        observe = observe
        disconnect = disconnect
        unobserve = vi.fn()
      }
      vi.stubGlobal('ResizeObserver', ResizeObserverMock)

      const viewport = {} as Element
      const content = {} as Element
      const teardown = observeScrollAreaSize([viewport, content, null], vi.fn())

      expect(observe).toHaveBeenCalledTimes(2)
      teardown()
      expect(disconnect).toHaveBeenCalledTimes(1)
      vi.unstubAllGlobals()
    })

    it('invokes the callback when an observed element resizes', () => {
      let trigger: (() => void) | undefined
      class ResizeObserverMock {
        observe = vi.fn()
        disconnect = vi.fn()
        unobserve = vi.fn()
        constructor(callback: () => void) {
          trigger = callback
        }
      }
      vi.stubGlobal('ResizeObserver', ResizeObserverMock)

      const onResize = vi.fn()
      observeScrollAreaSize([{} as Element], onResize)
      trigger?.()

      expect(onResize).toHaveBeenCalledTimes(1)
      vi.unstubAllGlobals()
    })

    it('degrades to a no-op teardown without ResizeObserver', () => {
      vi.stubGlobal('ResizeObserver', undefined)
      expect(() => observeScrollAreaSize([{} as Element], vi.fn())()).not.toThrow()
      vi.unstubAllGlobals()
    })

    it('degrades to a no-op teardown when every target is missing', () => {
      const construct = vi.fn()
      class ResizeObserverMock {
        observe = vi.fn()
        disconnect = vi.fn()
        unobserve = vi.fn()
        constructor() {
          construct()
        }
      }
      vi.stubGlobal('ResizeObserver', ResizeObserverMock)
      observeScrollAreaSize([null, undefined], vi.fn())()
      expect(construct).not.toHaveBeenCalled()
      vi.unstubAllGlobals()
    })
  })
})
