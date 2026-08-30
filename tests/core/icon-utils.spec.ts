/**
 * @vitest-environment node
 */

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import {
  ICON_STROKE_WIDTH,
  closeIconPathStrokeWidth,
  getSvgDefaultAttrs,
  icon24StrokeWidth,
  iconSvgDefaultStrokeWidth,
  mergeChildSvgAttrs,
  resolveIconPaintMode,
  resolveIconSize,
  resolveIconSvgAttrs,
  resolveIconWrapperStyle,
  resetDevWarnCache,
  toVueSvgAttrs,
  warnUnknownIconName
} from '@expcat/tigercat-core'

describe('icon svg construction', () => {
  it('uses one stroke width for named, children, close, and status icons', () => {
    expect(ICON_STROKE_WIDTH).toBe(1.5)
    expect(iconSvgDefaultStrokeWidth).toBe(ICON_STROKE_WIDTH)
    expect(closeIconPathStrokeWidth).toBe(ICON_STROKE_WIDTH)
    expect(icon24StrokeWidth).toBe(ICON_STROKE_WIDTH)
  })

  it('treats missing mode as stroke and fill mode as fill without stroke paint', () => {
    expect(resolveIconPaintMode(undefined)).toBe('stroke')
    expect(resolveIconPaintMode('stroke')).toBe('stroke')
    expect(resolveIconPaintMode('fill')).toBe('fill')

    const stroke = resolveIconSvgAttrs({ mode: undefined })
    expect(stroke.fill).toBe('none')
    expect(stroke.stroke).toBe('currentColor')
    expect(stroke.strokeWidth).toBe(ICON_STROKE_WIDTH)
    expect(stroke['aria-hidden']).toBe('true')
    expect(stroke.focusable).toBe('false')

    const fill = resolveIconSvgAttrs({ mode: 'fill', viewBox: '0 0 32 32' })
    expect(fill.fill).toBe('currentColor')
    expect(fill.stroke).toBe('none')
    expect(fill.strokeWidth).toBeUndefined()
    expect(fill.viewBox).toBe('0 0 32 32')
  })

  it('builds default attrs from getSvgDefaultAttrs', () => {
    const defaults = getSvgDefaultAttrs()
    expect(defaults.xmlns).toBe('http://www.w3.org/2000/svg')
    expect(defaults.viewBox).toBe('0 0 24 24')
    expect(defaults.fill).toBe('none')
    expect(defaults.stroke).toBe('currentColor')
    expect(getSvgDefaultAttrs(20).viewBox).toBe('0 0 20 20')
  })

  it('lets child svg attrs win and still hides the glyph from AT', () => {
    const merged = mergeChildSvgAttrs({
      viewBox: '0 0 20 20',
      fill: 'currentColor',
      stroke: 'none'
    })
    expect(merged.viewBox).toBe('0 0 20 20')
    expect(merged.fill).toBe('currentColor')
    expect(merged.stroke).toBe('none')
    expect(merged['aria-hidden']).toBe('true')
    expect(merged.focusable).toBe('false')
  })

  it('maps camelCase paint keys for Vue', () => {
    const vueAttrs = toVueSvgAttrs(resolveIconSvgAttrs({ mode: 'stroke' }))
    expect(vueAttrs['stroke-width']).toBe(ICON_STROKE_WIDTH)
    expect(vueAttrs['stroke-linecap']).toBe('round')
    expect(vueAttrs.strokeWidth).toBeUndefined()
  })
})

describe('resolveIconSize', () => {
  it('falls back to md for unknown sizes', () => {
    expect(resolveIconSize('sm')).toBe('sm')
    expect(resolveIconSize('xl')).toBe('xl')
    expect(resolveIconSize(undefined)).toBe('md')
    expect(resolveIconSize('xxl')).toBe('md')
  })
})

describe('resolveIconWrapperStyle', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    resetDevWarnCache()
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  it('does not write color when the prop is omitted', () => {
    expect(resolveIconWrapperStyle(undefined, { color: 'red' })).toEqual({ color: 'red' })
    expect(resolveIconWrapperStyle(undefined)).toBeUndefined()
  })

  it('lets an explicit color win and warns when style.color differs', () => {
    expect(resolveIconWrapperStyle('#00f', { color: 'red' })).toEqual({ color: '#00f' })
    expect(warnSpy).toHaveBeenCalledWith(
      '[Tigercat] Icon color and style.color differ; color wins.'
    )
  })
})

describe('warnUnknownIconName', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    resetDevWarnCache()
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  it('warns once per unknown name', () => {
    warnUnknownIconName('not-a-real-icon')
    warnUnknownIconName('not-a-real-icon')
    expect(warnSpy).toHaveBeenCalledTimes(1)
    expect(warnSpy).toHaveBeenCalledWith(
      '[Tigercat] Icon name "not-a-real-icon" is not registered.'
    )
  })
})
