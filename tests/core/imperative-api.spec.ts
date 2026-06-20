import { describe, it, expect } from 'vitest'
import { createInstanceIdGenerator, normalizeStringOption } from '@expcat/tigercat-core'

describe('createInstanceIdGenerator', () => {
  it('starts at 1 and increments monotonically', () => {
    const next = createInstanceIdGenerator()
    expect(next()).toBe(1)
    expect(next()).toBe(2)
    expect(next()).toBe(3)
  })

  it('returns independent counters across generators', () => {
    const a = createInstanceIdGenerator()
    const b = createInstanceIdGenerator()
    expect(a()).toBe(1)
    expect(a()).toBe(2)
    // b is unaffected by a's advances
    expect(b()).toBe(1)
    expect(a()).toBe(3)
    expect(b()).toBe(2)
  })
})

describe('normalizeStringOption', () => {
  it('wraps a string into an object under the given key', () => {
    expect(normalizeStringOption('hello', 'content')).toEqual({ content: 'hello' })
  })

  it('passes an object through unchanged', () => {
    const config = { content: 'x', duration: 1000 }
    expect(normalizeStringOption(config, 'content')).toBe(config)
  })
})
