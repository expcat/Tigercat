import { describe, it, expect } from 'vitest'
import {
  colorPickerBaseClasses,
  getColorPickerTriggerClasses,
  colorPickerPanelClasses,
  colorPickerInputClasses,
  colorPickerPresetClasses,
  colorPickerSliderTrackClasses,
  hexToRgb,
  rgbToHex,
  rgbToHsv,
  hsvToRgb,
  formatColorString,
  isValidHex
} from '@expcat/tigercat-core'
import type { ColorPickerSize } from '@expcat/tigercat-core'

describe('color-picker-utils — class generators', () => {
  it('colorPickerBaseClasses is the inline-block wrapper', () => {
    expect(colorPickerBaseClasses).toBe('relative inline-block')
  })

  it('getColorPickerTriggerClasses includes radius/border token + size + enabled affordance', () => {
    const sizes: Array<[ColorPickerSize, string]> = [
      ['sm', 'w-6 h-6'],
      ['md', 'w-8 h-8'],
      ['lg', 'w-10 h-10']
    ]
    for (const [size, sizeFragment] of sizes) {
      const cls = getColorPickerTriggerClasses(size, false)
      expect(cls).toContain('rounded-[var(--tiger-radius-md,0.5rem)]')
      expect(cls).toContain('border')
      expect(cls).toContain('overflow-hidden')
      expect(cls).toContain(sizeFragment)
      expect(cls).toContain('cursor-pointer')
      expect(cls).toContain('hover:border-[var(--tiger-colorpicker-border-hover,var(--tiger-primary,#2563eb))]')
      expect(cls).not.toContain('opacity-50')
      expect(cls).not.toContain('cursor-not-allowed')
    }
  })

  it('getColorPickerTriggerClasses applies disabled affordance', () => {
    const cls = getColorPickerTriggerClasses('md', true)
    expect(cls).toContain('opacity-50')
    expect(cls).toContain('cursor-not-allowed')
    expect(cls).not.toContain('cursor-pointer')
    expect(cls).not.toContain('hover:border-')
  })

  it('panel/input/preset/slider class strings expose theme tokens', () => {
    expect(colorPickerPanelClasses).toContain('rounded-[var(--tiger-radius-md,0.5rem)]')
    expect(colorPickerPanelClasses).toContain('var(--tiger-colorpicker-panel-bg')
    expect(colorPickerPanelClasses).toContain('var(--tiger-colorpicker-panel-border')

    expect(colorPickerInputClasses).toContain('font-mono')
    expect(colorPickerInputClasses).toContain('var(--tiger-colorpicker-input-bg')
    expect(colorPickerInputClasses).toContain('focus:border-[var(--tiger-colorpicker-input-focus')

    expect(colorPickerPresetClasses).toContain('w-5 h-5')
    expect(colorPickerPresetClasses).toContain('hover:scale-110')

    expect(colorPickerSliderTrackClasses).toContain('rounded-full')
    expect(colorPickerSliderTrackClasses).toContain('appearance-none')
  })
})

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
})

describe('color-picker-utils — rgbToHex', () => {
  it('formats integer rgb as lowercase 6-digit #hex', () => {
    expect(rgbToHex(255, 136, 0)).toBe('#ff8800')
    expect(rgbToHex(0, 0, 0)).toBe('#000000')
    expect(rgbToHex(255, 255, 255)).toBe('#ffffff')
  })

  it('rounds float channels to nearest integer', () => {
    expect(rgbToHex(127.4, 127.6, 127.5)).toBe('#7f8080')
  })

  it('clamps out-of-range channels to [0, 255]', () => {
    expect(rgbToHex(-10, 300, 128)).toBe('#00ff80')
  })
})

describe('color-picker-utils — rgbToHsv', () => {
  it('returns h=0,s=0 for grayscale (max === min)', () => {
    expect(rgbToHsv(0, 0, 0)).toEqual({ h: 0, s: 0, v: 0 })
    expect(rgbToHsv(128, 128, 128)).toEqual({ h: 0, s: 0, v: 50 })
    expect(rgbToHsv(255, 255, 255)).toEqual({ h: 0, s: 0, v: 100 })
  })

  it('computes hue when red is max', () => {
    expect(rgbToHsv(255, 0, 0)).toEqual({ h: 0, s: 100, v: 100 })
  })

  it('computes hue when green is max', () => {
    expect(rgbToHsv(0, 255, 0)).toEqual({ h: 120, s: 100, v: 100 })
  })

  it('computes hue when blue is max', () => {
    expect(rgbToHsv(0, 0, 255)).toEqual({ h: 240, s: 100, v: 100 })
  })

  it('handles red max with green < blue (negative hue branch wraps via +6)', () => {
    // gg < bb so it should wrap into 300-360 range
    const result = rgbToHsv(255, 0, 128)
    expect(result.h).toBeGreaterThanOrEqual(300)
    expect(result.h).toBeLessThanOrEqual(360)
    expect(result.s).toBe(100)
    expect(result.v).toBe(100)
  })
})

describe('color-picker-utils — hsvToRgb', () => {
  it('round-trips primary colors via rgbToHsv → hsvToRgb', () => {
    const cases: Array<[number, number, number]> = [
      [255, 0, 0],
      [0, 255, 0],
      [0, 0, 255],
      [255, 255, 0],
      [0, 255, 255],
      [255, 0, 255]
    ]
    for (const [r, g, b] of cases) {
      const hsv = rgbToHsv(r, g, b)
      const back = hsvToRgb(hsv.h, hsv.s, hsv.v)
      expect(back).toEqual({ r, g, b })
    }
  })

  it('covers all 6 hue sectors', () => {
    // h<60 sector — red→yellow
    expect(hsvToRgb(30, 100, 100)).toEqual({ r: 255, g: 128, b: 0 })
    // 60-120 — yellow→green
    expect(hsvToRgb(90, 100, 100)).toEqual({ r: 128, g: 255, b: 0 })
    // 120-180 — green→cyan
    expect(hsvToRgb(150, 100, 100)).toEqual({ r: 0, g: 255, b: 128 })
    // 180-240 — cyan→blue
    expect(hsvToRgb(210, 100, 100)).toEqual({ r: 0, g: 128, b: 255 })
    // 240-300 — blue→magenta
    expect(hsvToRgb(270, 100, 100)).toEqual({ r: 128, g: 0, b: 255 })
    // 300-360 — magenta→red
    expect(hsvToRgb(330, 100, 100)).toEqual({ r: 255, g: 0, b: 128 })
  })

  it('returns black for v=0 regardless of hue/saturation', () => {
    expect(hsvToRgb(180, 100, 0)).toEqual({ r: 0, g: 0, b: 0 })
  })

  it('returns gray for s=0', () => {
    expect(hsvToRgb(0, 0, 50)).toEqual({ r: 128, g: 128, b: 128 })
  })
})

describe('color-picker-utils — formatColorString', () => {
  it('formats hex regardless of alpha', () => {
    expect(formatColorString(255, 136, 0, 'hex')).toBe('#ff8800')
    expect(formatColorString(255, 136, 0, 'hex', 0.5)).toBe('#ff8800')
  })

  it('formats rgb without alpha when alpha is undefined or >= 1', () => {
    expect(formatColorString(255, 136, 0, 'rgb')).toBe('rgb(255, 136, 0)')
    expect(formatColorString(255, 136, 0, 'rgb', 1)).toBe('rgb(255, 136, 0)')
  })

  it('formats rgba when alpha < 1', () => {
    expect(formatColorString(255, 136, 0, 'rgb', 0.5)).toBe('rgba(255, 136, 0, 0.5)')
    expect(formatColorString(0, 0, 0, 'rgb', 0)).toBe('rgba(0, 0, 0, 0)')
  })

  it('formats hsl without alpha', () => {
    const result = formatColorString(255, 0, 0, 'hsl')
    expect(result).toMatch(/^hsl\(0, \d+%, \d+%\)$/)
  })

  it('formats hsla when alpha < 1', () => {
    const result = formatColorString(255, 0, 0, 'hsl', 0.3)
    expect(result).toMatch(/^hsla\(0, \d+%, \d+%, 0\.3\)$/)
  })

  it('hsl handles black (l=0 branch)', () => {
    expect(formatColorString(0, 0, 0, 'hsl')).toBe('hsl(0, 0%, 0%)')
  })

  it('hsl handles white (l=100 branch)', () => {
    expect(formatColorString(255, 255, 255, 'hsl')).toBe('hsl(0, 0%, 100%)')
  })
})

describe('color-picker-utils — isValidHex', () => {
  it('accepts 3- and 6-digit hex with or without #', () => {
    expect(isValidHex('#fff')).toBe(true)
    expect(isValidHex('fff')).toBe(true)
    expect(isValidHex('#ffffff')).toBe(true)
    expect(isValidHex('FFFFFF')).toBe(true)
    expect(isValidHex('#aB3')).toBe(true)
  })

  it('rejects invalid lengths and non-hex characters', () => {
    expect(isValidHex('')).toBe(false)
    expect(isValidHex('#')).toBe(false)
    expect(isValidHex('#ff')).toBe(false)
    expect(isValidHex('#ffff')).toBe(false)
    expect(isValidHex('#fffffff')).toBe(false)
    expect(isValidHex('#zzz')).toBe(false)
    expect(isValidHex('rgb(0,0,0)')).toBe(false)
  })
})
