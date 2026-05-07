import { describe, it, expect, vi } from 'vitest'
import {
  createBackTopVisibilityController,
  getScrollTop,
  scrollToTop,
  shouldShowBackTop,
  type BackTopFrameCallback
} from '@expcat/tigercat-core'
import { createFrameScheduler } from '../utils/frame-scheduler'

describe('back-top-utils', () => {
  it('reads element scroll position and visibility state', () => {
    const container = document.createElement('div')
    container.scrollTop = 240

    expect(getScrollTop(container)).toBe(240)
    expect(shouldShowBackTop(container, 200)).toBe(true)
    expect(shouldShowBackTop(container, 300)).toBe(false)
  })

  it('throttles visibility updates to one animation frame', () => {
    const scheduler = createFrameScheduler()
    const container = document.createElement('div')
    const onChange = vi.fn()
    const controller = createBackTopVisibilityController({
      target: container,
      getVisibilityHeight: () => 100,
      onChange,
      requestFrame: scheduler.requestFrame,
      cancelFrame: scheduler.cancelFrame
    })

    container.scrollTop = 40
    controller.schedule()
    container.scrollTop = 120
    controller.schedule()
    controller.schedule()

    expect(scheduler.pendingCount()).toBe(1)
    expect(onChange).not.toHaveBeenCalled()

    scheduler.flush()

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('cancels a queued visibility update', () => {
    const scheduler = createFrameScheduler()
    const container = document.createElement('div')
    const onChange = vi.fn()
    const controller = createBackTopVisibilityController({
      target: container,
      getVisibilityHeight: () => 100,
      onChange,
      requestFrame: scheduler.requestFrame,
      cancelFrame: scheduler.cancelFrame
    })

    controller.schedule()
    controller.cancel()
    scheduler.flush()

    expect(onChange).not.toHaveBeenCalled()
  })

  it('uses native smooth scroll for positive duration', () => {
    const container = document.createElement('div')
    const scrollTo = vi.fn()
    const callback = vi.fn()
    Object.defineProperty(container, 'scrollTo', { value: scrollTo, configurable: true })

    scrollToTop(container, 450, callback)

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('uses immediate scroll for zero duration', () => {
    const container = document.createElement('div')
    const scrollTo = vi.fn()
    Object.defineProperty(container, 'scrollTo', { value: scrollTo, configurable: true })

    scrollToTop(container, 0)

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })
})
