import { describe, it, expect } from 'vitest'
import {
  colGutterClasses,
  getColGutterClasses,
  getRowGutterClasses,
  getRowGutterStyleVars,
  hasGutter,
  rowGutterClasses
} from '@expcat/tigercat-core'

describe('grid gutter css variable helpers', () => {
  it('detects numeric and tuple gutters', () => {
    expect(hasGutter(0)).toBe(false)
    expect(hasGutter(16)).toBe(true)
    expect(hasGutter([0, 0])).toBe(false)
    expect(hasGutter([0, 24])).toBe(true)
  })

  it('creates row gutter CSS variables once on Row', () => {
    expect(getRowGutterStyleVars(16)).toEqual({
      '--tiger-row-gutter-x-half': '8px',
      '--tiger-row-gutter-y-half': '8px'
    })

    expect(getRowGutterStyleVars([16, 24])).toEqual({
      '--tiger-row-gutter-x-half': '8px',
      '--tiger-row-gutter-y-half': '12px'
    })
  })

  it('returns static Row and Col gutter classes only when needed', () => {
    expect(getRowGutterClasses(0)).toBe('')
    expect(getColGutterClasses(0)).toBe('')
    expect(getRowGutterClasses(16)).toBe(rowGutterClasses)
    expect(getColGutterClasses(16)).toBe(colGutterClasses)
  })
})
