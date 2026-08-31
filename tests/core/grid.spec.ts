import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getAlignClasses,
  getColMergedStyleVars,
  getColOrderStyleVars,
  getColStyleVars,
  getJustifyClasses,
  getRowGutterStyleVars,
  hasGutter,
  resetDevWarnCache,
  resolveActiveGridBreakpoint,
  resolveGutter
} from '@expcat/tigercat-core'

describe('grid gutter css variable helpers', () => {
  it('detects numeric and tuple gutters', () => {
    expect(hasGutter(0)).toBe(false)
    expect(hasGutter(16)).toBe(true)
    expect(hasGutter([0, 0])).toBe(false)
    expect(hasGutter([0, 24])).toBe(true)
  })

  it('keeps a numeric gutter on the horizontal axis only', () => {
    expect(resolveGutter(16)).toEqual({ x: 16, y: 0 })
    expect(getRowGutterStyleVars(16)).toEqual({
      '--tiger-row-gutter-x': '16px'
    })
    expect(getRowGutterStyleVars([16, 24])).toEqual({
      '--tiger-row-gutter-x': '16px',
      '--tiger-row-gutter-y': '24px'
    })
    expect(getRowGutterStyleVars([16, 0])).toEqual({
      '--tiger-row-gutter-x': '16px'
    })
    expect(getRowGutterStyleVars([0, 16])).toEqual({
      '--tiger-row-gutter-y': '16px'
    })
  })

  it('clamps negative gutter CSS variables to zero', () => {
    expect(getRowGutterStyleVars([-8, 12])).toEqual({
      '--tiger-row-gutter-y': '12px'
    })
  })
})

describe('grid col css variable helpers', () => {
  beforeEach(() => resetDevWarnCache())

  it('stores span as grid units and hides span 0', () => {
    expect(getColStyleVars(12, 6)).toEqual({
      '--tiger-col-span': '12',
      '--tiger-col-display-base': 'block',
      '--tiger-col-offset': '6'
    })
    expect(getColStyleVars(0, 0)).toEqual({
      '--tiger-col-span': '0',
      '--tiger-col-display-base': 'none',
      '--tiger-col-offset': '0'
    })
    expect(getColStyleVars()).toEqual({})
  })

  it('writes an explicit 0 offset at larger breakpoints', () => {
    expect(getColStyleVars({ xs: 24, sm: 12, lg: 6 }, { xs: 4, md: 0 })).toEqual({
      '--tiger-col-span': '24',
      '--tiger-col-display-base': 'block',
      '--tiger-col-span-sm': '12',
      '--tiger-col-display-sm': 'block',
      '--tiger-col-span-lg': '6',
      '--tiger-col-display-lg': 'block',
      '--tiger-col-offset': '4',
      '--tiger-col-offset-md': '0'
    })
  })

  it('clamps invalid span and offset values with a single warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    expect(getColStyleVars(25, -1)).toEqual({
      '--tiger-col-span': '24',
      '--tiger-col-display-base': 'block',
      '--tiger-col-offset': '0'
    })

    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('skips span width vars when flex is set', () => {
    expect(getColMergedStyleVars(24, 0, undefined, '120px')).toEqual({
      '--tiger-col-offset': '0',
      '--tiger-col-flex': '120px'
    })
    expect(getColMergedStyleVars(undefined, undefined, undefined, '1_1_auto')).toEqual({
      '--tiger-col-flex': '1 1 auto'
    })
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

describe('grid breakpoint map', () => {
  it('picks the active breakpoint from the theme map, not a hardcoded 768', () => {
    expect(
      resolveActiveGridBreakpoint(800, { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 })
    ).toBe('md')
    expect(
      resolveActiveGridBreakpoint(800, { xs: 0, sm: 640, md: 900, lg: 1024, xl: 1280, '2xl': 1536 })
    ).toBe('sm')
  })
})
