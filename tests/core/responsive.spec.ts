import { describe, expect, it } from 'vitest'
import { resolveResponsiveValue } from '@expcat/tigercat-core'

describe('resolveResponsiveValue', () => {
  it('returns the value directly when it is not an object', () => {
    expect(resolveResponsiveValue(3, 1024, 1)).toBe(3)
  })

  it('resolves xs breakpoint (width < 640)', () => {
    expect(resolveResponsiveValue({ xs: 1, md: 2, lg: 3 }, 500, 1)).toBe(1)
  })

  it('resolves md breakpoint (768 <= width < 1024)', () => {
    expect(resolveResponsiveValue({ xs: 1, md: 2, lg: 3 }, 800, 1)).toBe(2)
  })

  it('resolves lg breakpoint (1024 <= width < 1280)', () => {
    expect(resolveResponsiveValue({ xs: 1, md: 2, lg: 3 }, 1100, 1)).toBe(3)
  })

  it('resolves xxl breakpoint (width >= 1536)', () => {
    expect(resolveResponsiveValue({ xs: 1, xxl: 6 }, 1600, 1)).toBe(6)
  })

  it('falls back to nearest smaller breakpoint', () => {
    expect(resolveResponsiveValue({ xs: 1, lg: 4 }, 800, 1)).toBe(1)
  })

  it('returns fallback when no breakpoint matches', () => {
    expect(resolveResponsiveValue({}, 500, 5)).toBe(5)
  })

  it('handles null value as non-object', () => {
    expect(resolveResponsiveValue(null as unknown as number, 1024, 3)).toBe(null)
  })
})
