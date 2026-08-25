/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import { getInitials } from '@expcat/tigercat-core'

describe('getInitials', () => {
  it('returns a no-space token of length <= 2 as-is (uppercased)', () => {
    expect(getInitials('TC')).toBe('TC')
    expect(getInitials('tc')).toBe('TC')
    expect(getInitials('A')).toBe('A')
    expect(getInitials('张三')).toBe('张三')
  })

  it('returns the first letter of a longer ASCII token', () => {
    expect(getInitials('Alice')).toBe('A')
  })

  it('returns first letters of the first two words', () => {
    expect(getInitials('John Doe')).toBe('JD')
  })

  it('returns empty for blank input', () => {
    expect(getInitials('')).toBe('')
    expect(getInitials('   ')).toBe('')
  })
})
