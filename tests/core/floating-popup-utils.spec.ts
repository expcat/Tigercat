/**
 * @vitest-environment node
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createFloatingHoverDelayController,
  DEFAULT_FLOATING_HOVER_HIDE_DELAY_MS,
  DEFAULT_FLOATING_HOVER_SHOW_DELAY_MS
} from '@expcat/tigercat-core'

describe('createFloatingHoverDelayController', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('exposes 0ms show delay and 100ms hide delay defaults', () => {
    expect(DEFAULT_FLOATING_HOVER_SHOW_DELAY_MS).toBe(0)
    expect(DEFAULT_FLOATING_HOVER_HIDE_DELAY_MS).toBe(100)
  })

  it('does not hide immediately on leave', () => {
    const show = vi.fn()
    const hide = vi.fn()
    const controller = createFloatingHoverDelayController({ show, hide })

    controller.enter()
    expect(show).toHaveBeenCalledTimes(1)

    controller.leave()
    expect(hide).not.toHaveBeenCalled()
  })

  it('hides once after hideDelay', () => {
    const show = vi.fn()
    const hide = vi.fn()
    const controller = createFloatingHoverDelayController({ show, hide })

    controller.enter()
    controller.leave()
    vi.advanceTimersByTime(DEFAULT_FLOATING_HOVER_HIDE_DELAY_MS - 1)
    expect(hide).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(hide).toHaveBeenCalledTimes(1)
  })

  it('cancels pending hide when enter happens before delay', () => {
    const show = vi.fn()
    const hide = vi.fn()
    const controller = createFloatingHoverDelayController({ show, hide })

    controller.enter()
    controller.leave()
    vi.advanceTimersByTime(DEFAULT_FLOATING_HOVER_HIDE_DELAY_MS - 1)
    controller.enter()
    vi.advanceTimersByTime(DEFAULT_FLOATING_HOVER_HIDE_DELAY_MS)

    expect(hide).not.toHaveBeenCalled()
    expect(show).toHaveBeenCalledTimes(2)
  })

  it('closeNow cancels pending hide and hides immediately', () => {
    const show = vi.fn()
    const hide = vi.fn()
    const controller = createFloatingHoverDelayController({ show, hide })

    controller.enter()
    controller.leave()
    controller.closeNow()

    expect(hide).toHaveBeenCalledTimes(1)
    vi.advanceTimersByTime(DEFAULT_FLOATING_HOVER_HIDE_DELAY_MS)
    expect(hide).toHaveBeenCalledTimes(1)
  })

  it('dispose clears pending hide without hiding', () => {
    const show = vi.fn()
    const hide = vi.fn()
    const controller = createFloatingHoverDelayController({ show, hide })

    controller.enter()
    controller.leave()
    controller.dispose()
    vi.advanceTimersByTime(DEFAULT_FLOATING_HOVER_HIDE_DELAY_MS)

    expect(hide).not.toHaveBeenCalled()
  })
})
