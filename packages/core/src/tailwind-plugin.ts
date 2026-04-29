import plugin from 'tailwindcss/plugin'
import type { PluginAPI } from 'tailwindcss/plugin'
import type { ThemePreset, ThemeSemanticColors } from './types/theme'
import { THEME_CSS_VARS } from './theme'
import {
  MODERN_BASE_TOKENS_LIGHT,
  MODERN_BASE_TOKENS_DARK,
  MODERN_OVERRIDE_TOKENS_LIGHT,
  MODERN_OVERRIDE_TOKENS_DARK,
  MODERN_REDUCED_MOTION_TOKENS
} from './themes/modern/tokens'

/**
 * Default theme colors for Tigercat
 */
export const tigercatTheme = {
  // Primary
  '--tiger-primary': '#2563eb',
  '--tiger-primary-hover': '#1d4ed8',
  '--tiger-primary-active': '#1e40af',
  '--tiger-primary-disabled': '#93c5fd',
  // Secondary
  '--tiger-secondary': '#4b5563',
  '--tiger-secondary-hover': '#374151',
  '--tiger-secondary-active': '#1f2937',
  '--tiger-secondary-disabled': '#9ca3af',
  // Background hover states
  '--tiger-outline-bg-hover': '#eff6ff',
  '--tiger-ghost-bg-hover': '#eff6ff',
  // Interaction
  '--tiger-focus-ring': '#2563eb',
  // Surface & background
  '--tiger-surface': '#ffffff',
  '--tiger-surface-muted': '#f9fafb',
  '--tiger-surface-raised': '#ffffff',
  // Text
  '--tiger-text': '#111827',
  '--tiger-text-secondary': '#6b7280',
  '--tiger-text-disabled': '#d1d5db',
  // Border
  '--tiger-border': '#e5e7eb',
  '--tiger-border-strong': '#9ca3af',
  // Status
  '--tiger-success': '#16a34a',
  '--tiger-warning': '#d97706',
  '--tiger-error': '#dc2626',
  '--tiger-info': '#3b82f6',
  // Chart palette
  '--tiger-chart-1': '#2563eb',
  '--tiger-chart-2': '#16a34a',
  '--tiger-chart-3': '#d97706',
  '--tiger-chart-4': '#a855f7',
  '--tiger-chart-5': '#0ea5e9',
  '--tiger-chart-6': '#ef4444'
}

/**
 * Dark mode theme overrides
 */
export const tigercatDarkTheme: Record<string, string> = {
  '--tiger-primary': '#60a5fa',
  '--tiger-primary-hover': '#93c5fd',
  '--tiger-primary-active': '#bfdbfe',
  '--tiger-primary-disabled': '#1e40af',
  '--tiger-secondary': '#9ca3af',
  '--tiger-secondary-hover': '#d1d5db',
  '--tiger-secondary-active': '#e5e7eb',
  '--tiger-secondary-disabled': '#4b5563',
  '--tiger-outline-bg-hover': '#1e3a5f',
  '--tiger-ghost-bg-hover': '#1e3a5f',
  '--tiger-focus-ring': '#60a5fa',
  '--tiger-surface': '#111827',
  '--tiger-surface-muted': '#1f2937',
  '--tiger-surface-raised': '#1f2937',
  '--tiger-text': '#f9fafb',
  '--tiger-text-secondary': '#d1d5db',
  '--tiger-text-disabled': '#4b5563',
  '--tiger-border': '#374151',
  '--tiger-border-strong': '#6b7280',
  '--tiger-success': '#4ade80',
  '--tiger-warning': '#fbbf24',
  '--tiger-error': '#f87171',
  '--tiger-info': '#60a5fa',
  '--tiger-chart-1': '#60a5fa',
  '--tiger-chart-2': '#4ade80',
  '--tiger-chart-3': '#fbbf24',
  '--tiger-chart-4': '#c084fc',
  '--tiger-chart-5': '#38bdf8',
  '--tiger-chart-6': '#f87171'
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
    }
  })
})

// ---------------------------------------------------------------------------
// Configurable plugin factory (v0.7.0+)
// ---------------------------------------------------------------------------

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
      }
    })

    if (options.modern) {
      addBase({
        '[data-tiger-style="modern"]': MODERN_OVERRIDE_TOKENS_LIGHT,
        '.dark[data-tiger-style="modern"], [data-tiger-style="modern"].dark':
          MODERN_OVERRIDE_TOKENS_DARK,
        '@media (prefers-reduced-motion: reduce)': {
          ':root, [data-tiger-style="modern"]': MODERN_REDUCED_MOTION_TOKENS
        }
      })
    }
  })
}

export default tigercatPlugin
