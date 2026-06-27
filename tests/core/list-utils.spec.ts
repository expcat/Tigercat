import { describe, expect, it } from 'vitest'
import { getGridColumnClasses } from '@expcat/tigercat-core'

describe('list-utils', () => {
  it('returns scan-safe static grid column classes', () => {
    expect(getGridColumnClasses(3, undefined, 4, 6, 8, 10, 12)).toBe(
      'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12'
    )
  })

  it('uses xs as the base class and ignores invalid values', () => {
    expect(getGridColumnClasses(3, 2, -1, Number.NaN, 99, 4.9)).toBe(
      'grid-cols-2 xl:grid-cols-4'
    )
  })
})
