import { describe, expect, it } from 'vitest'
import {
  defaultColorSwatchGroups,
  flattenColorSwatchGroups,
  getColorSwatchButtonClasses,
  getColorSwatchCheckClasses,
  getColorSwatchOptionKey,
  getNextColorSwatchIndex,
  isColorSwatchSelected,
  normalizeColorSwatchGroups,
  normalizeColorSwatchValue
} from '@expcat/tigercat-core'

describe('color-swatch-utils', () => {
  it('normalizes default groups when no colors are provided', () => {
    const groups = normalizeColorSwatchGroups()

    expect(groups).toHaveLength(defaultColorSwatchGroups.length)
    expect(groups[0].colors[0]).toMatchObject({ value: '#ef4444', label: '#ef4444' })
  })

  it('normalizes flat string colors', () => {
    const groups = normalizeColorSwatchGroups(undefined, ['#111111', '#222222'])

    expect(groups).toEqual([
      {
        label: undefined,
        colors: [
          { value: '#111111', label: '#111111', groupIndex: 0, index: 0 },
          { value: '#222222', label: '#222222', groupIndex: 0, index: 1 }
        ]
      }
    ])
  })

  it('keeps custom group labels and disabled options', () => {
    const groups = normalizeColorSwatchGroups([
      { label: 'Brand', colors: [{ value: '#123456', label: 'Brand blue', disabled: true }] }
    ])

    expect(groups[0].label).toBe('Brand')
    expect(groups[0].colors[0]).toMatchObject({
      value: '#123456',
      label: 'Brand blue',
      disabled: true
    })
  })

  it('flattens groups and builds stable keys', () => {
    const options = flattenColorSwatchGroups(
      normalizeColorSwatchGroups([{ colors: ['#111111'] }, { colors: ['#222222'] }])
    )

    expect(options.map(getColorSwatchOptionKey)).toEqual(['0-0-#111111', '1-0-#222222'])
  })

  it('normalizes values for selected comparisons', () => {
    expect(normalizeColorSwatchValue(' #ABCDEF ')).toBe('#abcdef')
    expect(isColorSwatchSelected('#ABCDEF', ' #abcdef ')).toBe(true)
    expect(isColorSwatchSelected('#ABCDEF', undefined)).toBe(false)
  })

  it('moves to the next enabled option by arrow key', () => {
    const options = flattenColorSwatchGroups(
      normalizeColorSwatchGroups(undefined, [
        '#111111',
        { value: '#222222', disabled: true },
        '#333333'
      ])
    )

    expect(getNextColorSwatchIndex(options, 0, 'ArrowRight', 3)).toBe(2)
    expect(getNextColorSwatchIndex(options, 2, 'ArrowLeft', 3)).toBe(0)
  })

  it('supports vertical and boundary keyboard navigation', () => {
    const options = flattenColorSwatchGroups(
      normalizeColorSwatchGroups(undefined, ['#111111', '#222222', '#333333', '#444444'])
    )

    expect(getNextColorSwatchIndex(options, 0, 'ArrowDown', 2)).toBe(2)
    expect(getNextColorSwatchIndex(options, 3, 'Home', 2)).toBe(0)
    expect(getNextColorSwatchIndex(options, 0, 'End', 2)).toBe(3)
  })

  it('returns -1 when every option is disabled', () => {
    const options = flattenColorSwatchGroups(
      normalizeColorSwatchGroups(undefined, [{ value: '#111111', disabled: true }])
    )

    expect(getNextColorSwatchIndex(options, 0, 'ArrowRight', 1)).toBe(-1)
  })

  it('provides size and state classes', () => {
    expect(getColorSwatchButtonClasses('sm', true, false)).toContain('h-6 w-6')
    expect(getColorSwatchButtonClasses('md', false, true)).toContain('cursor-not-allowed')
    expect(getColorSwatchCheckClasses('lg')).toContain('h-5 w-5')
  })
})
