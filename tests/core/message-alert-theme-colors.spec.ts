/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  defaultAlertThemeColors,
  defaultMessageThemeColors,
  getAlertTypeClasses,
  getMessageTypeClasses
} from '@expcat/tigercat-core'

const MESSAGE_STATUS_TYPES = ['info', 'success', 'warning', 'error'] as const
const ALERT_TYPES = ['success', 'warning', 'error', 'info'] as const

const MESSAGE_STATUS_TOKENS = {
  info: '--tiger-info',
  success: '--tiger-success',
  warning: '--tiger-warning',
  error: '--tiger-error'
} as const

const OLD_MESSAGE_BG_HEXES = ['#eff6ff', '#f0fdf4', '#fffbeb', '#fef2f2']
const OLD_MESSAGE_INK_HEXES = ['#1e40af', '#166534', '#92400e', '#991b1b']
const OLD_ALERT_BG_HEXES = ['#f0fdf4', '#fefce8', '#fef2f2', '#eff6ff']
const OLD_ALERT_HOVER_HEXES = ['#dcfce7', '#fef9c3', '#fee2e2', '#dbeafe']
const OLD_ALERT_DESC_HEXES = ['#15803d', '#a16207', '#b91c1c', '#1d4ed8']

describe('Message / Alert default theme chrome (P2-2)', () => {
  it('pairs Message info/success/warning/error with registered surface + status, not locked pastels', () => {
    for (const type of MESSAGE_STATUS_TYPES) {
      const scheme = defaultMessageThemeColors[type]
      const classes = getMessageTypeClasses(type)
      const statusToken = MESSAGE_STATUS_TOKENS[type]

      expect(scheme.bg).toBe('bg-[var(--tiger-surface,#ffffff)]')
      expect(scheme.border).toBe('border-[var(--tiger-border,#e5e7eb)]')
      expect(scheme.text).toContain(statusToken)
      expect(scheme.icon).toContain(statusToken)

      expect(scheme.bg).toContain('--tiger-surface')
      expect(scheme.border).toContain('--tiger-border')

      for (const hex of OLD_MESSAGE_BG_HEXES) {
        expect(scheme.bg).not.toContain(hex)
        expect(scheme.border).not.toContain(hex)
      }
      for (const hex of OLD_MESSAGE_INK_HEXES) {
        expect(scheme.text).not.toContain(hex)
        expect(scheme.icon).not.toContain(hex)
      }

      expect(classes).toEqual(scheme)
    }
  })

  it('keeps Message loading on surface-muted + text, not a light pastel hex', () => {
    const loading = defaultMessageThemeColors.loading
    const classes = getMessageTypeClasses('loading')

    expect(loading.bg).toBe('bg-[var(--tiger-surface-muted,#f9fafb)]')
    expect(loading.border).toContain('--tiger-border')
    expect(loading.text).toContain('--tiger-text')
    expect(loading.icon).toContain('--tiger-text-muted')

    expect(loading.bg).toContain('--tiger-surface-muted')
    expect(loading.bg).not.toContain('#f3f4f6')
    for (const hex of OLD_MESSAGE_BG_HEXES) {
      expect(loading.bg).not.toContain(hex)
    }

    expect(classes).toEqual(loading)
  })

  it('pairs Alert type chrome with registered surface + status, not locked pastels', () => {
    for (const type of ALERT_TYPES) {
      const scheme = defaultAlertThemeColors[type]
      const classes = getAlertTypeClasses(type)
      const statusToken = MESSAGE_STATUS_TOKENS[type]

      expect(scheme.bg).toBe('bg-[var(--tiger-surface,#ffffff)]')
      expect(scheme.border).toBe('border-[var(--tiger-border,#e5e7eb)]')
      expect(scheme.bg).not.toContain('--tiger-alert-')
      expect(scheme.border).not.toContain('--tiger-alert-')
      expect(scheme.title).toContain(statusToken)
      expect(scheme.icon).toContain(statusToken)
      expect(scheme.closeButton).toContain(statusToken)
      expect(scheme.focus).toContain(statusToken)
      expect(scheme.description).toContain('--tiger-text-secondary')
      expect(scheme.closeButtonHover).toContain('--tiger-surface-muted')

      expect(scheme.bg).toContain('--tiger-surface')
      expect(scheme.border).toContain('--tiger-border')

      for (const hex of OLD_ALERT_BG_HEXES) {
        expect(scheme.bg).not.toContain(hex)
        expect(scheme.border).not.toContain(hex)
      }
      for (const hex of OLD_MESSAGE_INK_HEXES) {
        expect(scheme.title).not.toContain(hex)
        expect(scheme.icon).not.toContain(hex)
      }
      for (const hex of OLD_ALERT_DESC_HEXES) {
        expect(scheme.description).not.toContain(hex)
      }
      for (const hex of OLD_ALERT_HOVER_HEXES) {
        expect(scheme.closeButtonHover).not.toContain(hex)
      }

      expect(classes).toEqual(scheme)
    }
  })
})
