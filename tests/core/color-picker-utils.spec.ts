import { describe, it, expect } from 'vitest'
import {
  formatColorString,
  formatHsva,
  hexToRgb,
  hsvaFromSvPointer,
  hsvToRgb,
  isColorPickerEmpty,
  isValidHex,
  parseColorInput,
  parseColorParts,
  parseColorToHsva,
  rgbToHex,
  rgbToHex8,
  rgbToHsv,
  seedColorPickerHsva
} from '@expcat/tigercat-core'

describe('color-picker-utils — hexToRgb', () => {
  it('parses 6-digit hex with leading #', () => {
    expect(hexToRgb('#ff8800')).toEqual({ r: 255, g: 136, b: 0 })
  })

  it('parses 6-digit hex without #', () => {
    expect(hexToRgb('00ff00')).toEqual({ r: 0, g: 255, b: 0 })
  })

  it('expands 3-digit shorthand', () => {
    expect(hexToRgb('#f80')).toEqual({ r: 255, g: 136, b: 0 })
    expect(hexToRgb('#000')).toEqual({ r: 0, g: 0, b: 0 })
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 })
  })

  it('parses 8-digit hex RGB channels', () => {
    expect(hexToRgb('#ff880080')).toEqual({ r: 255, g: 136, b: 0 })
  })
})

describe('color-picker-utils — rgbToHex', () => {
  it('formats integer rgb as lowercase 6-digit #hex', () => {
    expect(rgbToHex(255, 136, 0)).toBe('#ff8800')
    expect(rgbToHex(0, 0, 0)).toBe('#000000')
    expect(rgbToHex(255, 255, 255)).toBe('#ffffff')
  })

  it('writes 8-digit hex when alpha is below 1', () => {
    expect(rgbToHex8(255, 0, 0, 0.5)).toBe('#ff000080')
  })
})

describe('color-picker-utils — rgbToHsv / hsvToRgb', () => {
  it('returns h=0,s=0 for grayscale', () => {
    expect(rgbToHsv(0, 0, 0)).toEqual({ h: 0, s: 0, v: 0 })
    expect(rgbToHsv(128, 128, 128)).toEqual({ h: 0, s: 0, v: 50 })
  })

  it('round-trips primary colors', () => {
    const cases: Array<[number, number, number]> = [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255]
    ]
    for (const [r, g, b] of cases) {
      const hsv = rgbToHsv(r, g, b)
      expect(hsvToRgb(hsv.h, hsv.s, hsv.v)).toEqual({ r, g, b })
    }
  })
})

describe('color-picker-utils — format / parse', () => {
  it('keeps hex format when alpha is requested but opaque', () => {
    expect(formatColorString(37, 99, 235, 'hex', 1)).toBe('#2563eb')
  })

  it('emits 8-digit hex for transparent hex format', () => {
    expect(formatColorString(37, 99, 235, 'hex', 0.5)).toBe('#2563eb80')
  })

  it('emits rgb/rgba in the requested format', () => {
    expect(formatColorString(255, 0, 0, 'rgb')).toBe('rgb(255, 0, 0)')
    expect(formatColorString(255, 0, 0, 'rgb', 0.5)).toBe('rgba(255, 0, 0, 0.5)')
  })

  it('parses 4/8-digit hex alpha', () => {
    expect(parseColorParts('#f008')?.a).toBeCloseTo(0x88 / 255)
    expect(parseColorParts('#ff000080')?.a).toBeCloseTo(0x80 / 255)
  })

  it('parses space-separated rgb and hsl with slash alpha', () => {
    expect(parseColorParts('rgb(255 0 0 / 0.5)')).toMatchObject({ r: 255, g: 0, b: 0, a: 0.5 })
    const hsl = parseColorParts('hsl(0 100% 50% / 0.4)')
    expect(hsl?.a).toBe(0.4)
    expect(hsl?.r).toBe(255)
  })

  it('expands 3-digit hex and formats in the requested format', () => {
    expect(parseColorInput('#fff')).toBe('#ffffff')
    expect(parseColorInput('#f00', 'rgb')).toBe('rgb(255, 0, 0)')
  })

  it('formats typed rgb input as rgb when format is rgb', () => {
    expect(parseColorInput('rgb(255, 0, 0)', 'rgb')).toBe('rgb(255, 0, 0)')
  })

  it('returns null for empty or invalid input', () => {
    expect(parseColorParts('')).toBeNull()
    expect(parseColorInput('not-a-color')).toBeNull()
    expect(isColorPickerEmpty('')).toBe(true)
    expect(isColorPickerEmpty(undefined)).toBe(true)
    expect(isColorPickerEmpty('#000000')).toBe(false)
  })
})

describe('color-picker-utils — HSV source of truth', () => {
  it('maps a plane click to s>0 so gray can become chromatic', () => {
    const next = hsvaFromSvPointer(80, 20, { left: 0, top: 0, width: 100, height: 100 }, 200, 1)
    expect(next.s).toBeGreaterThan(0)
    expect(next.v).toBeGreaterThan(0)
    expect(next.h).toBe(200)
    const formatted = formatHsva(next, 'rgb', false)
    expect(formatted.startsWith('rgb(')).toBe(true)
    expect(parseColorToHsva(formatted)?.s).toBeGreaterThan(0)
  })

  it('seeds empty as a usable HSVA without treating it as committed black', () => {
    const seeded = seedColorPickerHsva('')
    expect(seeded.s).toBeGreaterThan(0)
    expect(parseColorToHsva('')).toBeNull()
  })
})

describe('color-picker-utils — isValidHex', () => {
  it('accepts 3, 4, 6, and 8 digit hex', () => {
    expect(isValidHex('#fff')).toBe(true)
    expect(isValidHex('#ffff')).toBe(true)
    expect(isValidHex('#ffffff')).toBe(true)
    expect(isValidHex('#ffffffff')).toBe(true)
  })

  it('rejects junk', () => {
    expect(isValidHex('#ff')).toBe(false)
    expect(isValidHex('rgb(0,0,0)')).toBe(false)
  })
})
