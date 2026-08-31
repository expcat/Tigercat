import { describe, expect, it } from 'vitest'
import {
  flattenColorSwatchGroups,
  getColorSwatchCheckTone,
  getColorSwatchOptionKey,
  getNextColorSwatchIndex,
  isColorSwatchSelected,
  normalizeColorSwatchGroups,
  normalizeColorSwatchValue
} from '@expcat/tigercat-core'

describe('color-swatch-utils', () => {
  it('normalizes flat string colors', () => {
    const groups = normalizeColorSwatchGroups(undefined, ['#111111', '#222222'])

    expect(groups[0].colors.map((color) => color.value)).toEqual(['#111111', '#222222'])
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

  it('moves to the next enabled option and wraps', () => {
    const groups = normalizeColorSwatchGroups(undefined, [
      '#111111',
      { value: '#222222', disabled: true },
      '#333333'
    ])

    expect(getNextColorSwatchIndex(groups, 0, 'ArrowRight', 3)).toBe(2)
    expect(getNextColorSwatchIndex(groups, 2, 'ArrowRight', 3)).toBe(0)
    expect(getNextColorSwatchIndex(groups, 0, 'ArrowLeft', 3)).toBe(2)
  })

  it('inverts left/right when dir is rtl', () => {
    const groups = normalizeColorSwatchGroups(undefined, ['#111111', '#222222', '#333333'])

    expect(getNextColorSwatchIndex(groups, 0, 'ArrowRight', 3, 'rtl')).toBe(2)
    expect(getNextColorSwatchIndex(groups, 0, 'ArrowLeft', 3, 'rtl')).toBe(1)
  })

  it('moves down within a group then into the next group same column', () => {
    const groups = normalizeColorSwatchGroups([
      { label: 'A', colors: ['#111111', '#222222', '#333333', '#444444'] },
      { label: 'B', colors: ['#aaaaaa', '#bbbbbb', '#cccccc', '#dddddd', '#eeeeee', '#ffffff'] }
    ])
    const options = flattenColorSwatchGroups(groups)
    const a0 = options.findIndex((option) => option.value === '#111111')
    const b0 = options.findIndex((option) => option.value === '#aaaaaa')
    const a3 = options.findIndex((option) => option.value === '#444444')
    const b3 = options.findIndex((option) => option.value === '#dddddd')

    expect(getNextColorSwatchIndex(groups, a0, 'ArrowDown', 6)).toBe(b0)
    expect(getNextColorSwatchIndex(groups, a3, 'ArrowDown', 6)).toBe(b3)
  })

  it('uses a dark check on light swatches and a light check on dark swatches', () => {
    expect(getColorSwatchCheckTone('#f59e0b')).toBe('dark')
    expect(getColorSwatchCheckTone('#eab308')).toBe('dark')
    expect(getColorSwatchCheckTone('#111111')).toBe('light')
  })

  it('returns -1 when every option is disabled', () => {
    const groups = normalizeColorSwatchGroups(undefined, [{ value: '#111111', disabled: true }])
    expect(getNextColorSwatchIndex(groups, 0, 'ArrowRight', 1)).toBe(-1)
  })
})
