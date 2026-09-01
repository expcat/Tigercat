import plugin from 'tailwindcss/plugin'
import type { PluginAPI } from 'tailwindcss/plugin'
import type { ThemePreset } from './types/theme'
import {
  MODERN_BASE_TOKENS_LIGHT,
  MODERN_BASE_TOKENS_DARK,
  MODERN_OVERRIDE_TOKENS_LIGHT,
  MODERN_OVERRIDE_TOKENS_DARK,
  MODERN_REDUCED_MOTION_TOKENS
} from './themes/modern/tokens'
import { defaultTheme } from './themes/default/theme'
import { modernTheme } from './themes/modern/theme'
import { resolvePresetThemeConfig, themeConfigToCssVars } from './themes/manager'
import { alertCountdownBaseStyles } from './utils/alert-utils'
import { cartesianChartAnimationBaseStyles } from './utils/chart/color'
import { loadingAnimationBaseStyles } from './utils/loading-utils'

function cssVarsForPreset(preset: ThemePreset | undefined, scheme: 'light' | 'dark') {
  return themeConfigToCssVars(resolvePresetThemeConfig(preset ?? defaultTheme, scheme))
}

/** Default theme CSS variables for Tigercat (colors + radius/type/motion). */
export const tigercatTheme = cssVarsForPreset(defaultTheme, 'light')

/** Dark mode theme overrides. */
export const tigercatDarkTheme = cssVarsForPreset(defaultTheme, 'dark')

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
    // Extra (glass/gradient/motion-name) tokens first; the preset wins on
    // shared names such as --tiger-radius-md so plugin output matches ThemeManager.
    ':root': { ...MODERN_BASE_TOKENS_LIGHT, ...tigercatTheme },
    '.dark': { ...MODERN_BASE_TOKENS_DARK, ...tigercatDarkTheme },
    ...tigercatDirectionBase,
    ...tigercatReducedMotionBase,
    '[data-tiger-style="modern"]': MODERN_OVERRIDE_TOKENS_LIGHT,
    '.dark[data-tiger-style="modern"], [data-tiger-style="modern"].dark':
      MODERN_OVERRIDE_TOKENS_DARK,
    ...alertCountdownBaseStyles,
    ...loadingAnimationBaseStyles,
    ...cartesianChartAnimationBaseStyles
  })
})

export interface TigercatPluginOptions {
  /** A ThemePreset object to use instead of the built-in default */
  preset?: ThemePreset
  /**
   * Use the modern preset at `:root` (same as `{ preset: modernTheme }`).
   * `ThemeManager.setTheme('modern')` is the runtime equivalent and also
   * sets `data-tiger-style="modern"`.
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
    const preset = options.preset ?? (options.modern ? modernTheme : defaultTheme)
    const modern = options.modern === true || preset.name === 'modern'
    const lightVars = cssVarsForPreset(preset, 'light')
    const darkVars = cssVarsForPreset(preset, 'dark')

    addBase({
      ':root': {
        ...MODERN_BASE_TOKENS_LIGHT,
        ...lightVars,
        ...(modern ? MODERN_OVERRIDE_TOKENS_LIGHT : {})
      },
      '.dark': {
        ...MODERN_BASE_TOKENS_DARK,
        ...darkVars,
        ...(modern ? MODERN_OVERRIDE_TOKENS_DARK : {})
      },
      ...tigercatDirectionBase,
      ...tigercatReducedMotionBase,
      ...alertCountdownBaseStyles,
      ...loadingAnimationBaseStyles,
      ...cartesianChartAnimationBaseStyles
    })

    // Always emit the attribute layer so existing `data-tiger-style="modern"`
    // markup and ThemeManager.setTheme('modern') stay equivalent.
    addBase({
      '[data-tiger-style="modern"]': MODERN_OVERRIDE_TOKENS_LIGHT,
      '.dark[data-tiger-style="modern"], [data-tiger-style="modern"].dark':
        MODERN_OVERRIDE_TOKENS_DARK
    })
  })
}

export default tigercatPlugin
