/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  generateAvatarColor,
  getInitials,
  isCssPaintValue,
  resolveAvatarName,
  resolveAvatarPaint
} from '@expcat/tigercat-core'

describe('getInitials', () => {
  it('returns a no-space token of length <= 2 as-is (uppercased)', () => {
    expect(getInitials('TC')).toBe('TC')
    expect(getInitials('tc')).toBe('TC')
    expect(getInitials('A')).toBe('A')
    expect(getInitials('张三')).toBe('张三')
  })

  it('returns the first letter of a longer Latin token, including diacritics', () => {
    expect(getInitials('Alice')).toBe('A')
    expect(getInitials('José')).toBe('J')
    expect(getInitials('Müller')).toBe('M')
    expect(getInitials('Åsa')).toBe('Å')
  })

  it('keeps two CJK characters from a longer unspaced name', () => {
    expect(getInitials('司马懿')).toBe('司马')
  })

  it('returns first letters of the first two words', () => {
    expect(getInitials('John Doe')).toBe('JD')
  })

  it('returns empty for blank input', () => {
    expect(getInitials('')).toBe('')
    expect(getInitials('   ')).toBe('')
  })
})

describe('avatar paint', () => {
  it('treats hex, rgb, and var() as CSS paint', () => {
    expect(isCssPaintValue('#3b82f6')).toBe(true)
    expect(isCssPaintValue('rgb(59, 130, 246)')).toBe(true)
    expect(isCssPaintValue('var(--tiger-primary)')).toBe(true)
    expect(isCssPaintValue('bg-blue-500')).toBe(false)
  })

  it('puts hex on style, not class', () => {
    const paint = resolveAvatarPaint('#3b82f6', 'bg', 'bg-fallback')
    expect(paint.style?.backgroundColor).toBe('#3b82f6')
    expect(paint.className).toBeUndefined()
  })

  it('hashes a name to a canonical semantic fill', () => {
    const a = generateAvatarColor('Jane Doe')
    const b = generateAvatarColor('Jane Doe')
    expect(a).toBe(b)
    expect(a).toContain('--tiger-')
    expect(a).not.toContain('--tiger-avatar-color')
  })
})

describe('resolveAvatarName', () => {
  it('uses text as the name when alt is missing', () => {
    expect(resolveAvatarName({ text: 'Jane Doe' }).computedLabel).toBe('Jane Doe')
    expect(resolveAvatarName({ text: 'Jane Doe' }).isDecorative).toBe(false)
  })

  it('is decorative when no name is present', () => {
    expect(resolveAvatarName({}).isDecorative).toBe(true)
  })
})
