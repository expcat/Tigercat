import plugin from 'tailwindcss/plugin'
import type { PluginAPI } from 'tailwindcss/plugin'
import type { ThemePreset, ThemeSemanticColors } from './types/theme'
import { THEME_CSS_VARS } from './theme-runtime'
import {
  MODERN_BASE_TOKENS_LIGHT,
  MODERN_BASE_TOKENS_DARK,
  MODERN_OVERRIDE_TOKENS_LIGHT,
  MODERN_OVERRIDE_TOKENS_DARK,
  MODERN_REDUCED_MOTION_TOKENS
} from './themes/modern/tokens'
import { defaultThemeDarkColors, defaultThemeLightColors } from './themes/default/theme'

function presetToVars(colors: Partial<ThemeSemanticColors>): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const [key, value] of Object.entries(colors)) {
    const varName = THEME_CSS_VARS[key as keyof ThemeSemanticColors]
    if (varName && value) {
      vars[varName] = value
    }
  }
  return vars
}

/** Default theme colors for Tigercat. */
export const tigercatTheme = presetToVars(defaultThemeLightColors)

/** Dark mode theme overrides. */
export const tigercatDarkTheme = presetToVars(defaultThemeDarkColors)

const tigercatDirectionBase = {
  '[dir="rtl"] .tiger-rtl-mirror, [data-tiger-dir="rtl"] .tiger-rtl-mirror': {
    transform: 'scaleX(-1)'
  },
  '[dir="rtl"] .tiger-text-start, [data-tiger-dir="rtl"] .tiger-text-start': {
    textAlign: 'right'
  },
  '[dir="rtl"] .tiger-text-end, [data-tiger-dir="rtl"] .tiger-text-end': {
    textAlign: 'left'
  },
  '[dir="rtl"] .tiger-flex-row, [data-tiger-dir="rtl"] .tiger-flex-row': {
    flexDirection: 'row-reverse'
  }
}

const tigercatReducedMotionBase = {
  '@media (prefers-reduced-motion: reduce)': {
    ':root, [data-tiger-style="modern"]': MODERN_REDUCED_MOTION_TOKENS,
    '.tiger-motion-aware, .tiger-motion-aware::before, .tiger-motion-aware::after, [data-tiger-motion]':
      {
        animationDuration: '0ms',
        animationDelay: '0ms',
        transitionDuration: '0ms',
        transitionDelay: '0ms',
        scrollBehavior: 'auto'
      }
  }
}

/**
 * Tailwind CSS plugin for Tigercat
 * Injects the default CSS variables into the root scope
 */
export const tigercatPlugin = plugin(function ({ addBase }: PluginAPI) {
  addBase({
    ':root': { ...tigercatTheme, ...MODERN_BASE_TOKENS_LIGHT },
    '.dark': { ...tigercatDarkTheme, ...MODERN_BASE_TOKENS_DARK },
    // Remove browser default focus outline on interactive SVG elements
    'svg [tabindex], svg [role="button"]': {
      outline: 'none'
    },
    ...tigercatDirectionBase,
    ...tigercatReducedMotionBase
  })
})

export interface TigercatPluginOptions {
  /** A ThemePreset object to use instead of the built-in default */
  preset?: ThemePreset
  /**
   * Enable the opt-in "modern" token layer.
   *
   * When `true`, the plugin emits `[data-tiger-style="modern"]` (and the
   * dark counterpart) blocks that override radius / shadow / glass /
   * gradient / motion tokens with the modern values, plus a
   * `prefers-reduced-motion` rule that collapses motion durations.
   *
   * Activate it on a page by setting `data-tiger-style="modern"` on `<html>`
   * or any ancestor element of your Tigercat tree.
   *
   * @default false
   */
  modern?: boolean
}

/**
 * Configurable Tailwind CSS plugin for Tigercat.
 *
 * @example
 * ```ts
 * import { createTigercatPlugin, vibrantTheme, modernTheme } from '@expcat/tigercat-core'
 *
 * export default {
 *   plugins: [
 *     createTigercatPlugin({ preset: vibrantTheme }),
 *     // or enable the modern visual style:
 *     createTigercatPlugin({ preset: modernTheme, modern: true })
 *   ]
 * }
 * ```
 */
export function createTigercatPlugin(options: TigercatPluginOptions = {}) {
  return plugin(function ({ addBase }: PluginAPI) {
    const preset = options.preset

    const lightVars = preset?.light?.colors ? presetToVars(preset.light.colors) : tigercatTheme

    const darkVars = preset?.dark?.colors ? presetToVars(preset.dark.colors) : tigercatDarkTheme

    addBase({
      ':root': { ...lightVars, ...MODERN_BASE_TOKENS_LIGHT },
      '.dark': { ...darkVars, ...MODERN_BASE_TOKENS_DARK },
      'svg [tabindex], svg [role="button"]': {
        outline: 'none'
      },
      ...tigercatDirectionBase,
      ...tigercatReducedMotionBase
    })

    if (options.modern) {
      addBase({
        '[data-tiger-style="modern"]': MODERN_OVERRIDE_TOKENS_LIGHT,
        '.dark[data-tiger-style="modern"], [data-tiger-style="modern"].dark':
          MODERN_OVERRIDE_TOKENS_DARK
      })
    }
  })
}

export default tigercatPlugin
