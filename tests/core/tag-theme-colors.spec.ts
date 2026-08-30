/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  defaultTagThemeColors,
  getKbdRootClasses,
  getKbdVariantClasses,
  getTagVariantClasses
} from '@expcat/tigercat-core'

describe('Tag / Kbd default theme pair', () => {
  it('pairs default Tag bg with registered surface-muted and text, not fill or the old light hex', () => {
    const { bg, text } = defaultTagThemeColors.default
    const classes = getTagVariantClasses('default')

    expect(bg).toBe('bg-[var(--tiger-surface-muted,#f9fafb)]')
    expect(text).toBe('text-[var(--tiger-text,#111827)]')

    expect(bg).toContain('--tiger-surface-muted')
    expect(bg).not.toContain('--tiger-fill')
    expect(bg).not.toContain('#f3f4f6')

    expect(classes).toContain(bg)
    expect(classes).toContain(text)
    expect(classes).toContain('--tiger-surface-muted')
    expect(classes).toContain('--tiger-text')
    expect(classes).not.toContain('--tiger-fill')
    expect(classes).not.toContain('#f3f4f6')
  })

  it('lets Kbd default inherit the Tag default bg/text pair', () => {
    const tagDefault = getTagVariantClasses('default')
    const kbdDefault = getKbdVariantClasses()
    const kbdRoot = getKbdRootClasses()

    expect(getKbdVariantClasses('default')).toBe(tagDefault)
    expect(kbdDefault).toBe(tagDefault)
    expect(kbdRoot).toContain(tagDefault)
    expect(kbdDefault).toContain('--tiger-surface-muted')
    expect(kbdDefault).toContain('--tiger-text')
    expect(kbdDefault).not.toContain('--tiger-fill')
    expect(kbdDefault).not.toContain('#f3f4f6')
    expect(kbdRoot).not.toContain('--tiger-fill')
    expect(kbdRoot).not.toContain('#f3f4f6')
  })
})
