/**
 * @vitest-environment node
 */

import { describe, expect, it, vi } from 'vitest'
import {
  alertBaseClasses,
  alertCountdownContainerClasses,
  alertIconSizeClasses,
  alertSizeClasses,
  createAlertCountdown,
  isAlertInsertedAfterPaint,
  resolveAlertLive
} from '@expcat/tigercat-core'

describe('Alert shell', () => {
  it('reads runtime tokens for radius, padding, and icon size', () => {
    expect(alertBaseClasses).toContain('rounded-[var(--tiger-radius-md)]')
    expect(alertBaseClasses).toContain('border')
    expect(alertSizeClasses.md).toContain('px-[var(--tiger-spacing-lg)]')
    expect(alertSizeClasses.md).toContain('py-[var(--tiger-spacing-lg)]')
    expect(alertSizeClasses.md).toContain('text-[length:var(--tiger-font-size-base)]')
    expect(alertIconSizeClasses.md).toBe('h-5 w-5')
    expect(alertCountdownContainerClasses).toContain('inset-x-0')
    const shell = `${alertBaseClasses} ${alertSizeClasses.md} ${alertIconSizeClasses.md} ${alertCountdownContainerClasses}`
    expect(shell).not.toContain('--tiger-component-alert-')
    expect(shell).not.toContain('inset-inline-')
  })
})

describe('Alert live role', () => {
  it('keeps error as alert and announces inserted non-error status', () => {
    expect(resolveAlertLive('error', true, false)).toEqual({ role: 'alert' })
    expect(resolveAlertLive('error', false, true)).toEqual({})
    expect(resolveAlertLive('info', true, false)).toEqual({})
    expect(resolveAlertLive('success', true, true)).toEqual({ role: 'status', ariaLive: 'polite' })
    expect(resolveAlertLive('warning', true, true)).toEqual({ role: 'status', ariaLive: 'polite' })
  })

  it('does not mark a document-less request as inserted after a microtask', async () => {
    await new Promise<void>((resolve) => queueMicrotask(resolve))
    expect(isAlertInsertedAfterPaint()).toBe(false)
    expect(resolveAlertLive('info', true)).toEqual({})
  })
})

describe('Alert countdown', () => {
  it('pauses the remaining time and continues after resume', () => {
    vi.useFakeTimers()
    const onElapsed = vi.fn()
    const countdown = createAlertCountdown({ onElapsed })
    countdown.sync(5000, false)

    vi.advanceTimersByTime(1000)
    countdown.setPaused(true)
    vi.advanceTimersByTime(10000)
    expect(onElapsed).not.toHaveBeenCalled()

    countdown.setPaused(false)
    expect(onElapsed).not.toHaveBeenCalled()
    vi.advanceTimersByTime(3900)
    expect(onElapsed).not.toHaveBeenCalled()
    vi.advanceTimersByTime(200)
    expect(onElapsed).toHaveBeenCalledTimes(1)

    countdown.dispose()
    vi.useRealTimers()
  })
})
