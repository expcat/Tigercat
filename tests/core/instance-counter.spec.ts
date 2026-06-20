import { describe, it, expect } from 'vitest'
import { createInstanceCounter } from '@expcat/tigercat-core'

describe('createInstanceCounter', () => {
  it('starts at 1 on the first call', () => {
    const next = createInstanceCounter()
    expect(next()).toBe(1)
  })

  it('increments monotonically on each call', () => {
    const next = createInstanceCounter()
    expect(next()).toBe(1)
    expect(next()).toBe(2)
    expect(next()).toBe(3)
  })

  describe('Edge Cases', () => {
    it('keeps independent counters isolated', () => {
      const a = createInstanceCounter()
      const b = createInstanceCounter()
      expect(a()).toBe(1)
      expect(a()).toBe(2)
      expect(b()).toBe(1)
    })

    it('produces a fresh sequence for each created counter', () => {
      const first = createInstanceCounter()
      first()
      first()
      const second = createInstanceCounter()
      expect(second()).toBe(1)
    })
  })
})
