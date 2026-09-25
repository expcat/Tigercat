/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  alertBaseClasses,
  alertCountdownContainerClasses,
  alertIconSizeClasses,
  alertSizeClasses,
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
})
