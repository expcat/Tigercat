import { describe, it, expect, vi } from 'vitest'
import {
  colGutterClasses,
  getAlignClasses,
  getColGutterClasses,
  getColMergedStyleVars,
  getColOrderStyleVars,
  getColStyleVars,
  getFlexClasses,
  getGutterStyles,
  getJustifyClasses,
  getOffsetClasses,
  getOrderClasses,
  getRowGutterClasses,
  getRowGutterStyleVars,
  getSpanClasses,
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

  it('builds legacy gutter styles for numeric and tuple values', () => {
    expect(getGutterStyles(undefined)).toEqual({})
    expect(getGutterStyles(16)).toEqual({
      rowStyle: {
        marginLeft: '-8px',
        marginRight: '-8px',
        marginTop: '-8px',
        marginBottom: '-8px'
      },
      colStyle: {
        paddingLeft: '8px',
        paddingRight: '8px',
        paddingTop: '8px',
        paddingBottom: '8px'
      }
    })
    expect(getGutterStyles([20, 0])).toEqual({
      rowStyle: { marginLeft: '-10px', marginRight: '-10px' },
      colStyle: { paddingLeft: '10px', paddingRight: '10px' }
    })
    expect(getGutterStyles([0, 12])).toEqual({
      rowStyle: { marginTop: '-6px', marginBottom: '-6px' },
      colStyle: { paddingTop: '6px', paddingBottom: '6px' }
    })
  })

  it('clamps negative gutter CSS variables to zero', () => {
    expect(getRowGutterStyleVars([-8, 12])).toEqual({
      '--tiger-row-gutter-x-half': '0px',
      '--tiger-row-gutter-y-half': '6px'
    })
  })
})

describe('grid col css variable helpers', () => {
  it('creates span and offset variables for numeric values', () => {
    expect(getColStyleVars(12, 6)).toEqual({
      '--tiger-col-span': '50%',
      '--tiger-col-offset': '25%'
    })
    expect(getColStyleVars(0, 0)).toEqual({ '--tiger-col-span': '0%' })
    expect(getColStyleVars()).toEqual({})
  })

  it('creates responsive span and offset variables', () => {
    expect(getColStyleVars({ xs: 24, sm: 12, lg: 6 }, { xs: 0, md: 3, xl: 6 })).toEqual({
      '--tiger-col-span': '100%',
      '--tiger-col-span-sm': '50%',
      '--tiger-col-span-lg': '25%',
      '--tiger-col-offset': '0%',
      '--tiger-col-offset-md': '12.5%',
      '--tiger-col-offset-xl': '25%'
    })
  })

  it('skips invalid span and offset values with warnings', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    expect(getColStyleVars(25, -1)).toEqual({})
    expect(getColStyleVars({ xs: 24, md: 30 }, { xs: 2, lg: -4 })).toEqual({
      '--tiger-col-span': '100%',
      '--tiger-col-offset': '8.333333%'
    })
    expect(warn).toHaveBeenCalledWith('Invalid span value: 25. span should be between 0 and 24.')
    expect(warn).toHaveBeenCalledWith(
      'Invalid offset value: -1. offset should be between 0 and 24.'
    )
    expect(warn).toHaveBeenCalledWith(
      'Invalid span.md value: 30. span.md should be between 0 and 24.'
    )
    expect(warn).toHaveBeenCalledWith(
      'Invalid offset.lg value: -4. offset.lg should be between 0 and 24.'
    )

    warn.mockRestore()
  })

  it('creates order variables for numeric and responsive values', () => {
    expect(getColOrderStyleVars()).toEqual({})
    expect(getColOrderStyleVars(3)).toEqual({ '--tiger-col-order': '3' })
    expect(getColOrderStyleVars({ xs: 2, md: -1, xl: 5 })).toEqual({
      '--tiger-col-order': '2',
      '--tiger-col-order-md': '-1',
      '--tiger-col-order-xl': '5'
    })
  })

  it('merges span, offset, order, and flex variables in one pass', () => {
    expect(getColMergedStyleVars(8, 4, 2, '1_1_auto')).toEqual({
      '--tiger-col-span': '33.333333%',
      '--tiger-col-offset': '16.666667%',
      '--tiger-col-order': '2',
      '--tiger-col-flex': '1 1 auto'
    })
    expect(getColMergedStyleVars(undefined, undefined, undefined, 1)).toEqual({
      '--tiger-col-flex': '1'
    })
  })

  it('returns static classes for span, offset, order, and flex controls', () => {
    expect(getSpanClasses(undefined)).toBe('w-full')
    expect(getSpanClasses(12)).toContain('w-[var(--tiger-col-span)]')
    expect(getOffsetClasses(undefined)).toBe('')
    expect(getOffsetClasses(0)).toBe('')
    expect(getOffsetClasses({ xs: 0, md: 0 })).toBe('')
    expect(getOffsetClasses({ md: 2 })).toContain('ml-[var(--tiger-col-offset)]')
    expect(getOrderClasses(undefined)).toBe('')
    expect(getOrderClasses(0)).toContain('order-[var(--tiger-col-order)]')
    expect(getFlexClasses(undefined)).toBe('')
    expect(getFlexClasses('auto')).toContain('flex-[var(--tiger-col-flex)]')
  })
})

describe('grid row alignment helpers', () => {
  it('maps align and justify values to Tailwind classes', () => {
    expect(getAlignClasses('top')).toBe('items-start')
    expect(getAlignClasses('middle')).toBe('items-center')
    expect(getAlignClasses('bottom')).toBe('items-end')
    expect(getAlignClasses('stretch')).toBe('items-stretch')
    expect(getJustifyClasses('start')).toBe('justify-start')
    expect(getJustifyClasses('end')).toBe('justify-end')
    expect(getJustifyClasses('center')).toBe('justify-center')
    expect(getJustifyClasses('space-around')).toBe('justify-around')
    expect(getJustifyClasses('space-between')).toBe('justify-between')
    expect(getJustifyClasses('space-evenly')).toBe('justify-evenly')
  })
})
