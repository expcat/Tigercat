import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  ACCENT_STEP_COUNT,
  SHADOW_STEP_COUNT,
  accentScaleCssVars,
  deriveAccentScale
} from '../../packages/core/src/utils/accent-scale'
import {
  ContrastError,
  assertContrast,
  contrastRatio,
  deriveInteractionStates,
  relativeLuminance
} from '../../packages/core/src/utils/contrast'
import { colorSchemeInitScript } from '../../packages/core/src/utils/color-scheme-script'
import { COMPONENT_PARTS, partAttrs, stateAttrs } from '../../packages/core/src/utils/part-state'
import { tigercatSemanticTheme } from '../../packages/core/src/tailwind-plugin'
import { forcedColorsCss } from '../../packages/core/src/themes/forced-colors'
import { containerBreakpointCss } from '../../packages/core/src/utils/container-breakpoints'
import {
  CHART_PALETTE_COUNT,
  STATUS_CHANNELS,
  chartStatusChannel
} from '../../packages/core/src/utils/status-channel'
import { createExportStream } from '../../packages/core/src/utils/data-export-exchange'
import { reviewPreset } from '../../packages/core/src/themes/preset-review'
import {
  defaultTheme,
  defaultThemeKnobs,
  defaultThemeScale
} from '../../packages/core/src/themes/default/theme'
import { vibrantThemeScale } from '../../packages/core/src/themes/vibrant/theme'
import { professionalThemeScale } from '../../packages/core/src/themes/professional/theme'
import { minimalThemeScale } from '../../packages/core/src/themes/minimal/theme'
import { naturalThemeScale } from '../../packages/core/src/themes/natural/theme'
import { modernThemeScale } from '../../packages/core/src/themes/modern/theme'
import { highContrastThemeScale } from '../../packages/core/src/themes/high-contrast/theme'
import { filterUnreadComponentTokens } from '../../packages/core/scripts/check-contrast.mjs'
import { dtcgToPlain, emitCss } from '../../packages/core/scripts/emit-tokens.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')

describe('accent scale', () => {
  it('emits 12 accent steps, 12 neutrals, and 6 shadows from one function', () => {
    const scale = deriveAccentScale('#2563eb', { neutral: '#737373', radius: '6px', density: 1 })
    expect(scale.accent).toHaveLength(ACCENT_STEP_COUNT)
    expect(scale.neutral).toHaveLength(12)
    expect(scale.shadow).toHaveLength(SHADOW_STEP_COUNT)
    const vars = accentScaleCssVars(scale)
    expect(vars['--tiger-accent-1']).toBe(scale.accent[0])
    expect(vars['--tiger-accent-12']).toBe(scale.accent[11])
    expect(vars['--tiger-neutral-12']).toBe(scale.neutral[11])
    expect(vars['--tiger-shadow-6']).toBe(scale.shadow[5])
    expect(vars['--tiger-radius']).toBe(scale.radius.base)
  })

  it('builds every named preset with deriveAccentScale', () => {
    expect(defaultThemeScale).toEqual(
      deriveAccentScale(defaultThemeKnobs.accent, {
        neutral: defaultThemeKnobs.neutral,
        radius: defaultThemeKnobs.radius,
        density: defaultThemeKnobs.density
      })
    )
    for (const scale of [
      vibrantThemeScale,
      professionalThemeScale,
      minimalThemeScale,
      naturalThemeScale,
      modernThemeScale,
      highContrastThemeScale
    ]) {
      expect(scale.accent).toHaveLength(12)
      expect(scale.shadow).toHaveLength(6)
    }
  })
})

describe('contrast', () => {
  it('computes luminance and rejects a failing pair', () => {
    expect(relativeLuminance('#000000')).toBe(0)
    expect(contrastRatio('#000000', '#ffffff')).toBeGreaterThan(4.5)
    const states = deriveInteractionStates('#2563eb')
    expect(states.hover).not.toBe(states.solid)
    expect(states.foreground === '#000000' || states.foreground === '#ffffff').toBe(true)
    expect(() => assertContrast('#777777', '#888888', 4.5)).toThrow(ContrastError)
  })
})

describe('color scheme script', () => {
  it('embeds the storage key and does not document.write styles', () => {
    const script = colorSchemeInitScript({
      storageKey: 'tiger-mode',
      nonce: 'abc',
      attribute: 'data-tiger-color-scheme'
    })
    expect(script).toContain('tiger-mode')
    expect(script).toContain('nonce="abc"')
    expect(script).not.toContain('document.write')
  })
})

describe('part and state contract', () => {
  it('returns scope, part, and state attributes', () => {
    expect(partAttrs('Select', 'trigger')).toEqual({
      'data-tiger-part': 'trigger',
      'data-tiger-scope': 'Select'
    })
    expect(stateAttrs('open')).toEqual({ 'data-state': 'open' })
    expect(COMPONENT_PARTS.Button).toContain('root')
    expect(COMPONENT_PARTS.Tabs).toContain('panel')
  })
})

describe('semantic tailwind theme', () => {
  it('maps surface, muted, line, and radius to token variables', () => {
    expect(tigercatSemanticTheme.colors.surface).toBe('var(--tiger-surface)')
    expect(tigercatSemanticTheme.colors.muted).toBe('var(--tiger-text-secondary)')
    expect(tigercatSemanticTheme.colors.line).toBe('var(--tiger-border)')
    expect(tigercatSemanticTheme.borderRadius.md).toBe('var(--tiger-radius-md)')
  })
})

describe('forced colors', () => {
  it('includes forced-colors and CanvasText', () => {
    const css = readFileSync(join(root, 'packages/core/src/themes/forced-colors.css'), 'utf8')
    expect(css).toContain('forced-colors')
    expect(css).toContain('CanvasText')
    expect(forcedColorsCss).toContain('forced-colors')
    expect(forcedColorsCss).toContain('CanvasText')
  })
})

describe('container breakpoints', () => {
  it('uses container queries and the token breakpoint names', () => {
    const css = containerBreakpointCss()
    expect(css).toContain('@container')
    expect(css).toContain('container-type: inline-size')
    for (const name of ['xs', 'sm', 'md', 'lg', 'xl', '2xl']) {
      expect(css).toContain(name)
    }
  })
})

describe('status channels', () => {
  it('matches the chart palette length', () => {
    expect(STATUS_CHANNELS).toHaveLength(CHART_PALETTE_COUNT)
    expect(STATUS_CHANNELS).toHaveLength(6)
    expect(chartStatusChannel(0).line).toBe('solid')
    expect(chartStatusChannel(1).line).toBe('dashed')
  })
})

describe('export stream', () => {
  it('chunks rows and rejects an invalid chunk size', () => {
    const chunks = [...createExportStream([1, 2, 3, 4, 5], { chunkSize: 2 })]
    expect(chunks).toEqual([[1, 2], [3, 4], [5]])
    expect(() => [...createExportStream([1], { chunkSize: 0 })]).toThrow(/chunkSize/)
  })
})

describe('preset review', () => {
  it('flags an empty preset and accepts the default theme', () => {
    expect(reviewPreset({})).toEqual([
      'missing accent steps',
      'missing radius base',
      'missing density',
      'missing shadow steps'
    ])
    expect(reviewPreset(defaultTheme)).toEqual([])
  })
})

describe('unread component tokens', () => {
  it('does not keep component tokens nothing reads', () => {
    expect(filterUnreadComponentTokens({ button: { bg: '#fff' }, ghost: { bg: '#000' } })).toEqual(
      {}
    )
  })
})

describe('dtcg emitter', () => {
  it('round-trips a typed token to css variables', () => {
    const dtcg = {
      color: { brand: { $value: '#2563eb', $type: 'color' } },
      radius: { base: { $value: '6px', $type: 'dimension' } }
    }
    expect(dtcgToPlain(dtcg)).toEqual({ color: { brand: '#2563eb' }, radius: { base: '6px' } })
    const css = emitCss(dtcg)
    expect(css).toContain('--tiger-color-brand: #2563eb;')
    expect(css).toContain('--tiger-radius-base: 6px;')
  })
})
