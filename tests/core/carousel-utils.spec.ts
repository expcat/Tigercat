import { describe, it, expect, vi } from 'vitest'
import {
  clampSlideIndex,
  createCarouselAutoplayController,
  getCarouselDisplayIndex,
  getCarouselLoopTarget,
  getCarouselTouchPoint,
  getNextSlideIndex,
  getPrevSlideIndex,
  getScrollTransform,
  isCarouselAutoplayEnabled,
  isCarouselHorizontalLock,
  isCarouselPaused,
  resolveCarouselKeyboardNavigation,
  resolveCarouselLoopSnap,
  resolveCarouselRegion,
  resolveCarouselSwipeDirection,
  shouldLoopCarousel,
  type CarouselVisibilityDocument
} from '@expcat/tigercat-core'
import { createFrameScheduler } from '../utils/frame-scheduler'

function createVisibilityDocument(initialHidden = false) {
  let hidden = initialHidden
  const listeners = new Set<EventListenerOrEventListenerObject>()

  const visibilityDocument = {
    get hidden() {
      return hidden
    },
    addEventListener: vi.fn((type: string, listener: EventListenerOrEventListenerObject | null) => {
      if (type === 'visibilitychange' && listener) {
        listeners.add(listener)
      }
    }),
    removeEventListener: vi.fn(
      (type: string, listener: EventListenerOrEventListenerObject | null) => {
        if (type === 'visibilitychange' && listener) {
          listeners.delete(listener)
        }
      }
    )
  } as unknown as CarouselVisibilityDocument

  return {
    visibilityDocument,
    setHidden(nextHidden: boolean) {
      hidden = nextHidden
      const event = new Event('visibilitychange')
      listeners.forEach((listener) => {
        if (typeof listener === 'function') {
          listener(event)
          return
        }
        listener.handleEvent(event)
      })
    }
  }
}

describe('carousel-utils autoplay controller', () => {
  it('advances with requestAnimationFrame after the configured interval', () => {
    const scheduler = createFrameScheduler()
    const onAdvance = vi.fn()
    const controller = createCarouselAutoplayController({
      interval: 1000,
      onAdvance,
      requestFrame: scheduler.requestFrame,
      cancelFrame: scheduler.cancelFrame,
      getCurrentTime: () => 0
    })

    controller.start()

    expect(controller.isRunning()).toBe(true)
    expect(scheduler.pendingCount()).toBe(1)

    scheduler.flush(999)
    expect(onAdvance).not.toHaveBeenCalled()

    scheduler.flush(1000)
    expect(onAdvance).toHaveBeenCalledTimes(1)
    expect(scheduler.pendingCount()).toBe(1)
  })

  it('cancels queued frames when stopped', () => {
    const scheduler = createFrameScheduler()
    const cancelFrame = vi.fn(scheduler.cancelFrame)
    const onAdvance = vi.fn()
    const controller = createCarouselAutoplayController({
      interval: 1000,
      onAdvance,
      requestFrame: scheduler.requestFrame,
      cancelFrame,
      getCurrentTime: () => 0
    })

    controller.start()
    controller.stop()
    scheduler.flush(1000)

    expect(controller.isRunning()).toBe(false)
    expect(cancelFrame).toHaveBeenCalledTimes(1)
    expect(onAdvance).not.toHaveBeenCalled()
  })

  it('pauses frame scheduling while the document is hidden', () => {
    const scheduler = createFrameScheduler()
    const cancelFrame = vi.fn(scheduler.cancelFrame)
    const visibility = createVisibilityDocument(true)
    const onAdvance = vi.fn()
    const controller = createCarouselAutoplayController({
      interval: 1000,
      onAdvance,
      requestFrame: scheduler.requestFrame,
      cancelFrame,
      getCurrentTime: () => 0,
      getDocument: () => visibility.visibilityDocument
    })

    controller.start()
    expect(scheduler.pendingCount()).toBe(0)

    visibility.setHidden(false)
    expect(scheduler.pendingCount()).toBe(1)

    visibility.setHidden(true)
    expect(cancelFrame).toHaveBeenCalledTimes(1)
    expect(scheduler.pendingCount()).toBe(0)

    scheduler.flush(1000)
    expect(onAdvance).not.toHaveBeenCalled()
  })

  it('does not start or advance when the interval is not positive', () => {
    const scheduler = createFrameScheduler()
    const onAdvance = vi.fn()
    const controller = createCarouselAutoplayController({
      interval: 0,
      onAdvance,
      requestFrame: scheduler.requestFrame,
      cancelFrame: scheduler.cancelFrame,
      getCurrentTime: () => 0
    })

    controller.start()
    scheduler.flush(16)
    scheduler.flush(32)

    expect(controller.isRunning()).toBe(false)
    expect(onAdvance).not.toHaveBeenCalled()
    expect(isCarouselAutoplayEnabled(true, 0, false)).toBe(false)
    expect(isCarouselAutoplayEnabled(true, Number.NaN, false)).toBe(false)
    expect(isCarouselAutoplayEnabled(true, 1000, true)).toBe(false)
  })
})

describe('carousel-utils track geometry', () => {
  it('clamps non-finite indexes to 0', () => {
    expect(clampSlideIndex(Number.NaN, 3)).toBe(0)
    expect(clampSlideIndex(Number.POSITIVE_INFINITY, 3)).toBe(0)
    expect(clampSlideIndex(-2, 3)).toBe(0)
    expect(clampSlideIndex(8, 3)).toBe(2)
  })

  it('loops logical indexes without using the track offset', () => {
    expect(getNextSlideIndex(2, 3, true)).toBe(0)
    expect(getPrevSlideIndex(0, 3, true)).toBe(2)
    expect(shouldLoopCarousel(true, 3, 'scroll')).toBe(true)
    expect(shouldLoopCarousel(true, 3, 'fade')).toBe(false)
    expect(shouldLoopCarousel(true, 1, 'scroll')).toBe(false)
  })

  it('places infinite scroll on a clone then snaps back to the real index', () => {
    expect(getCarouselDisplayIndex(0, 3, true)).toBe(1)
    expect(getCarouselLoopTarget(2, 0, 3, true)).toEqual({
      displayIndex: 4,
      logicalIndex: 0,
      needsSnap: true
    })
    expect(getCarouselLoopTarget(0, 2, 3, true)).toEqual({
      displayIndex: 0,
      logicalIndex: 2,
      needsSnap: true
    })
    expect(resolveCarouselLoopSnap(4, 3)).toBe(1)
    expect(resolveCarouselLoopSnap(0, 3)).toBe(3)
    expect(getScrollTransform(4, 'ltr')).toBe('translateX(-400%)')
    expect(getScrollTransform(1, 'ltr')).toBe('translateX(-100%)')
  })

  it('flips the scroll axis under rtl instead of locking LTR left to next', () => {
    expect(getScrollTransform(2, 'rtl')).toBe('translateX(200%)')
    expect(getScrollTransform(2, 'ltr')).toBe('translateX(-200%)')
  })
})

describe('carousel-utils swipe helpers', () => {
  it('reads the first touch point from a touch list', () => {
    expect(
      getCarouselTouchPoint([
        { clientX: 24, clientY: 36 },
        { clientX: 48, clientY: 60 }
      ])
    ).toEqual({ x: 24, y: 36 })
  })

  it('maps a swipe toward inline-start to next in both directions', () => {
    expect(
      resolveCarouselSwipeDirection(
        { x: 120, y: 40 },
        { x: 80, y: 46 },
        {
          minSwipeDistance: 24,
          dir: 'ltr'
        }
      )
    ).toBe('next')
    expect(
      resolveCarouselSwipeDirection(
        { x: 80, y: 40 },
        { x: 124, y: 44 },
        {
          minSwipeDistance: 24,
          dir: 'rtl'
        }
      )
    ).toBe('next')
    expect(
      resolveCarouselSwipeDirection(
        { x: 80, y: 40 },
        { x: 124, y: 44 },
        {
          minSwipeDistance: 24,
          dir: 'ltr'
        }
      )
    ).toBe('prev')
  })

  it('ignores short or vertical gestures', () => {
    expect(
      resolveCarouselSwipeDirection(
        { x: 100, y: 100 },
        { x: 118, y: 104 },
        { minSwipeDistance: 24 }
      )
    ).toBeNull()

    expect(
      resolveCarouselSwipeDirection(
        { x: 100, y: 100 },
        { x: 132, y: 156 },
        { minSwipeDistance: 24 }
      )
    ).toBeNull()
    expect(isCarouselHorizontalLock({ x: 100, y: 100 }, { x: 104, y: 140 })).toBe(false)
    expect(isCarouselHorizontalLock({ x: 100, y: 100 }, { x: 140, y: 104 })).toBe(true)
  })
})

describe('carousel-utils a11y helpers', () => {
  it('does not mint a landmark without a caller-provided name', () => {
    expect(resolveCarouselRegion()).toEqual({ role: 'group' })
    expect(resolveCarouselRegion({ ariaLabel: '   ' })).toEqual({ role: 'group' })
    expect(resolveCarouselRegion({ ariaLabel: 'Highlights' })).toEqual({
      role: 'region',
      ariaLabel: 'Highlights'
    })
    expect(resolveCarouselRegion({ labelledBy: 'title' })).toEqual({ role: 'region' })
  })

  it('keeps hover and focus pause flags independent', () => {
    expect(isCarouselPaused({ hovered: true, pauseOnHover: true })).toBe(true)
    expect(isCarouselPaused({ focused: true, pauseOnFocus: true, hovered: false })).toBe(true)
    expect(
      isCarouselPaused({ hovered: false, focused: false, pauseOnHover: true, pauseOnFocus: true })
    ).toBe(false)
    expect(isCarouselPaused({ userPaused: true, hovered: false, focused: false })).toBe(true)
  })

  it('reverses horizontal keys with dir', () => {
    expect(resolveCarouselKeyboardNavigation('ArrowLeft', 'ltr')).toBe('prev')
    expect(resolveCarouselKeyboardNavigation('ArrowLeft', 'rtl')).toBe('next')
    expect(resolveCarouselKeyboardNavigation('ArrowRight', 'rtl')).toBe('prev')
    expect(resolveCarouselKeyboardNavigation('Home', 'rtl')).toBe('first')
    expect(resolveCarouselKeyboardNavigation('End', 'ltr')).toBe('last')
  })
})
