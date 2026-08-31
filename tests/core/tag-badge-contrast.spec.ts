/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import { STATUS_MIX_HUE_PERCENT, runtimeThemeDark, runtimeThemeLight } from '@expcat/tigercat-core'

function hexToRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '')
  const expanded =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value
  const num = parseInt(expanded, 16)
  return [(num >> 16) & 0xff, (num >> 8) & 0xff, num & 0xff]
}

function srgbChannelToLinear(c: number): number {
  const v = c / 255
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  return (
    0.2126 * srgbChannelToLinear(r) +
    0.7152 * srgbChannelToLinear(g) +
    0.0722 * srgbChannelToLinear(b)
  )
}

function contrastRatio(fg: string, bg: string): number {
  const L1 = relativeLuminance(hexToRgb(fg))
  const L2 = relativeLuminance(hexToRgb(bg))
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1]
  return (hi + 0.05) / (lo + 0.05)
}

function mixHex(hue: string, toward: string, towardPercent: number): string {
  const t = towardPercent / 100
  const [hr, hg, hb] = hexToRgb(hue)
  const [tr, tg, tb] = hexToRgb(toward)
  const r = Math.round(hr + (tr - hr) * t)
  const g = Math.round(hg + (tg - hg) * t)
  const b = Math.round(hb + (tb - hb) * t)
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`
}

const towardText = 100 - STATUS_MIX_HUE_PERCENT

describe('Tag / Badge status contrast', () => {
  const statuses = ['success', 'warning', 'info', 'error', 'primary'] as const

  it.each(statuses)('Tag %s text on muted meets 4.5:1 in light and dark', (status) => {
    const lightHue = runtimeThemeLight.colors[status]
    const darkHue = runtimeThemeDark.colors[status]
    const lightText = mixHex(lightHue, runtimeThemeLight.colors.text, towardText)
    const darkText = mixHex(darkHue, runtimeThemeDark.colors.text, towardText)

    expect(contrastRatio(lightText, runtimeThemeLight.colors.surfaceMuted)).toBeGreaterThanOrEqual(
      4.5
    )
    expect(contrastRatio(darkText, runtimeThemeDark.colors.surfaceMuted)).toBeGreaterThanOrEqual(
      4.5
    )
  })

  it.each(statuses)('Badge %s fill with on-color meets 4.5:1 in light and dark', (status) => {
    const lightHue = runtimeThemeLight.colors[status]
    const darkHue = runtimeThemeDark.colors[status]
    const lightFill = mixHex(lightHue, runtimeThemeLight.colors.text, towardText)
    const darkFill = mixHex(darkHue, runtimeThemeDark.colors.text, towardText)
    const lightOn =
      status === 'error'
        ? runtimeThemeLight.colors.errorForeground
        : runtimeThemeLight.colors.primaryForeground
    const darkOn =
      status === 'error'
        ? runtimeThemeDark.colors.errorForeground
        : runtimeThemeDark.colors.primaryForeground

    expect(contrastRatio(lightOn, lightFill)).toBeGreaterThanOrEqual(4.5)
    expect(contrastRatio(darkOn, darkFill)).toBeGreaterThanOrEqual(4.5)
  })
})
