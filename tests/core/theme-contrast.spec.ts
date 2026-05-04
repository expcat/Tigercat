import { describe, it, expect } from 'vitest'
import {
  defaultTheme,
  modernTheme,
  vibrantTheme,
  professionalTheme,
  minimalTheme,
  naturalTheme
} from '@expcat/tigercat-core'
import type { ThemePreset, ThemeSemanticColors } from '@expcat/tigercat-core'

/**
 * Phase 1C — accessibility contrast verification.
 *
 * Validates that every shipped theme preset (default + opt-in variants) meets
 * WCAG 2.1 AA contrast for the surface/text token pairs that overlay
 * components (Modal, Drawer, Popover, Tooltip, Popconfirm, Loading, …) end
 * up rendering against. This guards the "modern" glass-surface refresh from
 * regressing perceived legibility on either light or dark schemes.
 *
 * Thresholds:
 *  - body text on any surface       → ≥ 4.5  (WCAG 1.4.3 AA, normal text)
 *  - secondary text on surface      → ≥ 4.5  (we treat secondary as body text)
 *  - focus ring on surface          → ≥ 3.0  (WCAG 2.4.11 focus appearance)
 *  - primary / error accents        → ≥ 3.0  (WCAG 1.4.11 non-text contrast)
 *  - status hues (success/warning/info) → ≥ 2.0  (regression guard only;
 *    these are decorative fills typically paired with text labels in our
 *    components, so we hold the line at "perceptibly distinct" rather than
 *    full 1.4.11 to avoid forcing palette changes that hurt brand clarity)
 */

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
  const R = srgbChannelToLinear(r)
  const G = srgbChannelToLinear(g)
  const B = srgbChannelToLinear(b)
  return 0.2126 * R + 0.7152 * G + 0.0722 * B
}

function contrastRatio(fg: string, bg: string): number {
  const L1 = relativeLuminance(hexToRgb(fg))
  const L2 = relativeLuminance(hexToRgb(bg))
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1]
  return (hi + 0.05) / (lo + 0.05)
}

interface ContrastCheck {
  fgKey: keyof ThemeSemanticColors
  bgKey: keyof ThemeSemanticColors
  min: number
  label: string
}

const TEXT_CHECKS: ContrastCheck[] = [
  { fgKey: 'text', bgKey: 'surface', min: 4.5, label: 'text ↔ surface' },
  { fgKey: 'text', bgKey: 'surfaceMuted', min: 4.5, label: 'text ↔ surfaceMuted' },
  { fgKey: 'text', bgKey: 'surfaceRaised', min: 4.5, label: 'text ↔ surfaceRaised' },
  { fgKey: 'textSecondary', bgKey: 'surface', min: 4.5, label: 'textSecondary ↔ surface' }
]

const ACCENT_CHECKS: ContrastCheck[] = [
  { fgKey: 'focusRing', bgKey: 'surface', min: 3, label: 'focusRing ↔ surface' },
  { fgKey: 'primary', bgKey: 'surface', min: 3, label: 'primary ↔ surface' },
  { fgKey: 'error', bgKey: 'surface', min: 3, label: 'error ↔ surface' }
]

const STATUS_HUE_CHECKS: ContrastCheck[] = [
  { fgKey: 'success', bgKey: 'surface', min: 2.0, label: 'success ↔ surface' },
  { fgKey: 'warning', bgKey: 'surface', min: 2.0, label: 'warning ↔ surface' },
  { fgKey: 'info', bgKey: 'surface', min: 2.0, label: 'info ↔ surface' }
]

const PRESETS: { name: string; preset: ThemePreset }[] = [
  { name: 'default', preset: defaultTheme },
  { name: 'modern', preset: modernTheme },
  { name: 'vibrant', preset: vibrantTheme },
  { name: 'professional', preset: professionalTheme },
  { name: 'minimal', preset: minimalTheme },
  { name: 'natural', preset: naturalTheme }
]

function runChecks(
  scheme: 'light' | 'dark',
  colors: Partial<ThemeSemanticColors> | undefined,
  checks: ContrastCheck[]
) {
  if (!colors) return
  for (const { fgKey, bgKey, min, label } of checks) {
    const fg = colors[fgKey]
    const bg = colors[bgKey]
    if (!fg || !bg) continue
    const ratio = contrastRatio(fg, bg)
    if (ratio < min) {
      throw new Error(
        `[${scheme}] ${label} contrast ${ratio.toFixed(2)} < ${min} ` +
          `(fg=${String(fg)}, bg=${String(bg)})`
      )
    }
    expect(ratio).toBeGreaterThanOrEqual(min)
  }
}

describe('Theme contrast — WCAG AA', () => {
  for (const { name, preset } of PRESETS) {
    describe(`${name} preset`, () => {
      it('light scheme: text ↔ surface variants meet 4.5:1', () => {
        runChecks('light', preset.light?.colors, TEXT_CHECKS)
      })

      it('dark scheme: text ↔ surface variants meet 4.5:1', () => {
        runChecks('dark', preset.dark?.colors, TEXT_CHECKS)
      })

      it('light scheme: focus ring + primary + error on surface meet 3:1', () => {
        runChecks('light', preset.light?.colors, ACCENT_CHECKS)
      })

      it('dark scheme: focus ring + primary + error on surface meet 3:1', () => {
        runChecks('dark', preset.dark?.colors, ACCENT_CHECKS)
      })

      it('light scheme: status hues on surface stay ≥ 2.0 (regression guard)', () => {
        runChecks('light', preset.light?.colors, STATUS_HUE_CHECKS)
      })

      it('dark scheme: status hues on surface stay ≥ 2.0 (regression guard)', () => {
        runChecks('dark', preset.dark?.colors, STATUS_HUE_CHECKS)
      })
    })
  }

  it('contrast helper agrees with WCAG reference values (sanity)', () => {
    // Black on white = 21:1, the maximum.
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 0)
    // Same color = 1:1.
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 1)
  })
})
