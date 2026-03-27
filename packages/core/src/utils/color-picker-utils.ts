import { classNames } from './class-names'
import type { ColorPickerSize } from '../types/color-picker'

/* ------------------------------------------------------------------ */
/*  Style constants                                                    */
/* ------------------------------------------------------------------ */

export const colorPickerBaseClasses = 'relative inline-block'

const triggerSizes: Record<ColorPickerSize, string> = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10'
}

export function getColorPickerTriggerClasses(size: ColorPickerSize, disabled: boolean): string {
  return classNames(
    'rounded-lg border transition-all overflow-hidden',
    'border-[var(--tiger-colorpicker-border,var(--tiger-border,#d1d5db))]',
    triggerSizes[size],
    disabled
      ? 'opacity-50 cursor-not-allowed'
      : 'cursor-pointer hover:border-[var(--tiger-colorpicker-border-hover,var(--tiger-primary,#2563eb))]'
  )
}

export const colorPickerPanelClasses = classNames(
  'absolute z-50 mt-1 p-3 rounded-lg shadow-lg',
  'bg-[var(--tiger-colorpicker-panel-bg,var(--tiger-surface,#ffffff))]',
  'border border-[var(--tiger-colorpicker-panel-border,var(--tiger-border,#d1d5db))]'
)

export const colorPickerInputClasses = classNames(
  'w-full rounded border px-2 py-1 text-xs font-mono outline-none',
  'bg-[var(--tiger-colorpicker-input-bg,var(--tiger-surface,#ffffff))]',
  'border-[var(--tiger-colorpicker-input-border,var(--tiger-border,#d1d5db))]',
  'text-[var(--tiger-colorpicker-input-text,var(--tiger-text,#111827))]',
  'focus:border-[var(--tiger-colorpicker-input-focus,var(--tiger-primary,#2563eb))]'
)

export const colorPickerPresetClasses =
  'w-5 h-5 rounded cursor-pointer border border-[var(--tiger-colorpicker-preset-border,var(--tiger-border,#d1d5db))] hover:scale-110 transition-transform'

export const colorPickerSliderTrackClasses =
  'w-full h-3 rounded-full cursor-pointer appearance-none'

/* ------------------------------------------------------------------ */
/*  Color conversion utilities                                         */
/* ------------------------------------------------------------------ */

export interface HsvColor {
  h: number // 0-360
  s: number // 0-100
  v: number // 0-100
}

export interface RgbColor {
  r: number // 0-255
  g: number // 0-255
  b: number // 0-255
}

export function hexToRgb(hex: string): RgbColor {
  const clean = hex.replace('#', '')
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  const num = parseInt(full, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  }
}

export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((v) =>
        Math.max(0, Math.min(255, Math.round(v)))
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  )
}

export function rgbToHsv(r: number, g: number, b: number): HsvColor {
  const rr = r / 255
  const gg = g / 255
  const bb = b / 255
  const max = Math.max(rr, gg, bb)
  const min = Math.min(rr, gg, bb)
  const d = max - min

  let h = 0
  if (d !== 0) {
    if (max === rr) h = ((gg - bb) / d + (gg < bb ? 6 : 0)) * 60
    else if (max === gg) h = ((bb - rr) / d + 2) * 60
    else h = ((rr - gg) / d + 4) * 60
  }

  const s = max === 0 ? 0 : (d / max) * 100
  const v = max * 100

  return { h: Math.round(h), s: Math.round(s), v: Math.round(v) }
}

export function hsvToRgb(h: number, s: number, v: number): RgbColor {
  const ss = s / 100
  const vv = v / 100
  const c = vv * ss
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = vv - c

  let r = 0
  let g = 0
  let b = 0
  if (h < 60) {
    r = c
    g = x
    b = 0
  } else if (h < 120) {
    r = x
    g = c
    b = 0
  } else if (h < 180) {
    r = 0
    g = c
    b = x
  } else if (h < 240) {
    r = 0
    g = x
    b = c
  } else if (h < 300) {
    r = x
    g = 0
    b = c
  } else {
    r = c
    g = 0
    b = x
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  }
}

export function formatColorString(
  r: number,
  g: number,
  b: number,
  format: 'hex' | 'rgb' | 'hsl',
  alpha?: number
): string {
  if (format === 'hex') {
    return rgbToHex(r, g, b)
  }
  if (format === 'rgb') {
    return alpha !== undefined && alpha < 1
      ? `rgba(${r}, ${g}, ${b}, ${alpha})`
      : `rgb(${r}, ${g}, ${b})`
  }
  // hsl
  const hsv = rgbToHsv(r, g, b)
  const { h, s, v: vv } = hsv
  const l = (vv * (200 - s)) / 200
  const sl = l === 0 || l === 100 ? 0 : ((vv - l) / Math.min(l, 100 - l)) * 100
  return alpha !== undefined && alpha < 1
    ? `hsla(${h}, ${Math.round(sl)}%, ${Math.round(l)}%, ${alpha})`
    : `hsl(${h}, ${Math.round(sl)}%, ${Math.round(l)}%)`
}

export function isValidHex(value: string): boolean {
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value)
}
