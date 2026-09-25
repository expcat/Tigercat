import { describe, expect, it } from 'vitest'
import {
  notificationBaseClasses,
  notificationContainerBaseClasses,
  notificationPositionClasses,
  notificationTitleClasses,
  resolveNotificationDuration
} from '@expcat/tigercat-core'

describe('notification shell', () => {
  it('reads runtime tokens and logical corner utilities Tailwind emits', () => {
    expect(notificationContainerBaseClasses).toContain('w-[24rem]')
    expect(notificationBaseClasses).toContain('p-[var(--tiger-spacing-lg)]')
    expect(notificationBaseClasses).toContain('rounded-[var(--tiger-radius-lg)]')
    expect(notificationBaseClasses).toContain('shadow-[var(--tiger-shadow-lg)]')
    expect(notificationTitleClasses).toContain('text-[length:var(--tiger-font-size-base)]')
    expect(notificationTitleClasses).toContain('font-medium')
    expect(notificationPositionClasses['top-right']).toBe('top-6 end-6')
    expect(notificationPositionClasses['bottom-left']).toBe('bottom-6 start-6')
    const shell = `${notificationContainerBaseClasses} ${notificationBaseClasses} ${Object.values(notificationPositionClasses).join(' ')} ${notificationTitleClasses}`
    expect(shell).not.toContain('--tiger-component-notification-')
    expect(shell).not.toContain('inset-inline-')
  })
})

describe('notification-utils', () => {
  it('uses 4500ms unless a finite non-negative duration is passed', () => {
    expect(resolveNotificationDuration(undefined)).toBe(4500)
    expect(resolveNotificationDuration(0)).toBe(0)
    expect(resolveNotificationDuration(1200)).toBe(1200)
    expect(resolveNotificationDuration(Number.NaN)).toBe(0)
    expect(resolveNotificationDuration(-1)).toBe(0)
  })
})
