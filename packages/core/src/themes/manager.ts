/**
 * ThemeManager — runtime theme & color-scheme management.
 *
 * Responsibilities:
 *  1. Register / retrieve preset themes
 *  2. Apply a theme by converting ThemeConfig → CSS custom-properties
 *  3. Manage light / dark / auto colour schemes (including prefers-color-scheme)
 *  4. Notify listeners on theme or color-scheme change
 *
 * @module themes/manager
 * @since 0.7.0
 */

import type { ThemeConfig, ThemePreset, ColorScheme } from '../types/theme'
import {
  THEME_CSS_VARS,
  removeCssVarsCached,
  semanticColorsToCssVars,
  setCssVarsCached
} from '../theme-runtime'
import { isBrowser } from '../utils/env'
import { devWarn } from '../utils/dev-warn'
import { defaultTheme } from './default/theme'
import { vibrantTheme } from './vibrant/theme'
import { professionalTheme } from './professional/theme'
import { minimalTheme } from './minimal/theme'
import { naturalTheme } from './natural/theme'
import { modernTheme } from './modern/theme'
import { highContrastTheme } from './high-contrast/theme'
import {
  MODERN_BASE_TOKENS_DARK,
  MODERN_BASE_TOKENS_LIGHT,
  MODERN_OVERRIDE_TOKENS_DARK,
  MODERN_OVERRIDE_TOKENS_LIGHT
} from './modern/tokens'

const builtInPresets = [
  defaultTheme,
  vibrantTheme,
  professionalTheme,
  minimalTheme,
  naturalTheme,
  modernTheme,
  highContrastTheme
]

/**
 * Merge a preset segment onto the default theme for the same scheme.
 * Missing colors / radius / motion / etc. fall back to `base`.
 */
export function mergeThemeConfig(base: ThemeConfig = {}, override: ThemeConfig = {}): ThemeConfig {
  return {
    colors: { ...base.colors, ...override.colors },
    typography: { ...base.typography, ...override.typography },
    radius: { ...base.radius, ...override.radius },
    shadows: { ...base.shadows, ...override.shadows },
    spacing: { ...base.spacing, ...override.spacing },
    motion: { ...base.motion, ...override.motion }
  }
}

/** Resolve a preset's light or dark config with default-theme fallbacks. */
export function resolvePresetThemeConfig(
  preset: ThemePreset | undefined,
  scheme: 'light' | 'dark',
  fallback: ThemePreset = defaultTheme
): ThemeConfig {
  return mergeThemeConfig(fallback[scheme], preset?.[scheme] ?? {})
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

export const THEME_CONFIG_CSS_VARS = {
  typography: {
    fontFamily: '--tiger-font-family',
    fontFamilyMono: '--tiger-font-family-mono',
    fontSizeBase: '--tiger-font-size-base',
    fontSizeSm: '--tiger-font-size-sm',
    fontSizeLg: '--tiger-font-size-lg',
    fontWeightNormal: '--tiger-font-weight-normal',
    fontWeightMedium: '--tiger-font-weight-medium',
    fontWeightSemibold: '--tiger-font-weight-semibold',
    fontWeightBold: '--tiger-font-weight-bold',
    lineHeightNormal: '--tiger-line-height-normal',
    lineHeightTight: '--tiger-line-height-tight'
  },
  radius: {
    none: '--tiger-radius-none',
    sm: '--tiger-radius-sm',
    md: '--tiger-radius-md',
    lg: '--tiger-radius-lg',
    xl: '--tiger-radius-xl',
    full: '--tiger-radius-full'
  },
  shadows: {
    xs: '--tiger-shadow-xs',
    sm: '--tiger-shadow-sm',
    md: '--tiger-shadow-md',
    lg: '--tiger-shadow-lg',
    xl: '--tiger-shadow-xl'
  },
  spacing: {
    xs: '--tiger-spacing-xs',
    sm: '--tiger-spacing-sm',
    md: '--tiger-spacing-md',
    lg: '--tiger-spacing-lg',
    xl: '--tiger-spacing-xl'
  },
  motion: {
    durationFast: '--tiger-motion-duration-quick',
    durationBase: '--tiger-motion-duration-base',
    durationSlow: '--tiger-motion-duration-relaxed',
    easing: '--tiger-motion-ease-standard'
  }
} as const

const THEME_TRANSITION_CSS_VARS = {
  durationFast: '--tiger-transition-quick',
  durationBase: '--tiger-transition-base',
  durationSlow: '--tiger-transition-emphasized'
} as const

export function themeConfigToCssVars(config: ThemeConfig): Record<string, string> {
  const vars: Record<string, string> = {
    ...semanticColorsToCssVars(config.colors)
  }

  for (const section of ['typography', 'radius', 'shadows', 'spacing', 'motion'] as const) {
    const values = config[section]
    if (!values) continue
    const varNames = THEME_CONFIG_CSS_VARS[section]
    for (const [key, value] of Object.entries(values)) {
      const varName = varNames[key as keyof typeof varNames]
      if (varName && value) vars[varName] = value
    }
  }

  const motion = config.motion
  if (motion) {
    const easing = motion.easing ?? 'cubic-bezier(0.4, 0, 0.2, 1)'
    if (motion.durationBase) {
      vars[THEME_TRANSITION_CSS_VARS.durationBase] = `all ${motion.durationBase} ${easing}`
    }
    if (motion.durationFast) {
      vars[THEME_TRANSITION_CSS_VARS.durationFast] = `all ${motion.durationFast} ${easing}`
    }
    if (motion.durationSlow) {
      vars[THEME_TRANSITION_CSS_VARS.durationSlow] = `transform ${motion.durationSlow} ${easing}`
    }
  }

  return vars
}

function extraThemeVarNames(): string[] {
  return [
    ...Object.values(THEME_TRANSITION_CSS_VARS),
    ...Object.keys(MODERN_BASE_TOKENS_LIGHT),
    ...Object.keys(MODERN_BASE_TOKENS_DARK),
    ...Object.keys(MODERN_OVERRIDE_TOKENS_LIGHT),
    ...Object.keys(MODERN_OVERRIDE_TOKENS_DARK)
  ]
}

function clearThemeConfig(target: HTMLElement): void {
  removeCssVarsCached(target, [
    ...Object.values(THEME_CSS_VARS),
    ...Object.values(THEME_CONFIG_CSS_VARS.typography),
    ...Object.values(THEME_CONFIG_CSS_VARS.radius),
    ...Object.values(THEME_CONFIG_CSS_VARS.shadows),
    ...Object.values(THEME_CONFIG_CSS_VARS.spacing),
    ...Object.values(THEME_CONFIG_CSS_VARS.motion),
    ...extraThemeVarNames()
  ])
}

function resolveSystemDark(): boolean {
  if (!isBrowser()) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// ---------------------------------------------------------------------------
// ThemeChangeEvent
// ---------------------------------------------------------------------------

export interface ThemeChangeEvent {
  theme: string
  colorScheme: 'light' | 'dark'
}

export type ThemeChangeListener = (event: ThemeChangeEvent) => void

// ---------------------------------------------------------------------------
// ThemeManager class
// ---------------------------------------------------------------------------

class ThemeManagerImpl {
  private presets = new Map<string, ThemePreset>()
  private currentThemeName = 'default'
  private colorScheme: ColorScheme = 'light'
  private resolvedDark = false
  private listeners: ThemeChangeListener[] = []
  private mediaQuery: MediaQueryList | null = null
  private mediaHandler: ((e: MediaQueryListEvent) => void) | null = null
  private builtInsRegistered = false

  /** Register shipped presets. Safe to call more than once. */
  registerBuiltIns(): void {
    if (this.builtInsRegistered) return
    for (const preset of builtInPresets) {
      if (!this.presets.has(preset.name)) {
        this.presets.set(preset.name, preset)
      }
    }
    this.builtInsRegistered = true
  }

  // -----------------------------------------------------------------------
  // Theme registration
  // -----------------------------------------------------------------------

  /** Register a preset theme. Replaces any existing preset with the same name. */
  registerTheme(preset: ThemePreset): void {
    this.registerBuiltIns()
    this.presets.set(preset.name, preset)
  }

  /** Get a registered preset by name. */
  getTheme(name: string): ThemePreset | undefined {
    this.registerBuiltIns()
    return this.presets.get(name)
  }

  /** List all registered preset names. */
  getAvailableThemes(): string[] {
    this.registerBuiltIns()
    return Array.from(this.presets.keys())
  }

  /** Get the currently active theme name. */
  getCurrentTheme(): string {
    return this.currentThemeName
  }

  /** Get the resolved (effective) color scheme — always 'light' or 'dark'. */
  getResolvedColorScheme(): 'light' | 'dark' {
    return this.resolvedDark ? 'dark' : 'light'
  }

  // -----------------------------------------------------------------------
  // Applying themes
  // -----------------------------------------------------------------------

  /**
   * Switch to a registered preset theme.
   * If the name is not registered the call is a no-op.
   */
  setTheme(name: string): void {
    this.registerBuiltIns()
    if (!this.presets.has(name)) {
      devWarn(`ThemeManager.setTheme.${name}`, `[Tigercat] Theme "${name}" is not registered.`)
      return
    }
    this.currentThemeName = name
    this.apply()
  }

  /**
   * Define and immediately apply a custom theme at runtime.
   * Registers the theme, then switches to it.
   */
  defineTheme(preset: ThemePreset): void {
    this.registerTheme(preset)
    this.setTheme(preset.name)
  }

  /**
   * Set the colour scheme strategy.
   * - `'light'` / `'dark'` — force a specific mode
   * - `'auto'` — follow `prefers-color-scheme` media query
   *
   * Pass `{ applyResolved: false }` with `'auto'` to attach the media listener
   * without applying the current system preference. ConfigProvider uses that
   * on first paint so SSR (light) does not flash `.dark` during hydrate.
   */
  setColorScheme(scheme: ColorScheme, options?: { applyResolved?: boolean }): void {
    this.colorScheme = scheme

    if (scheme === 'auto') {
      this.startWatchingMedia()
      if (options?.applyResolved === false) {
        return
      }
      this.resolvedDark = resolveSystemDark()
    } else {
      this.stopWatchingMedia()
      this.resolvedDark = scheme === 'dark'
    }

    this.apply()
  }

  /** Get the current color scheme setting (may be 'auto'). */
  getColorScheme(): ColorScheme {
    return this.colorScheme
  }

  // -----------------------------------------------------------------------
  // Listeners
  // -----------------------------------------------------------------------

  /** Subscribe to theme/colour-scheme changes. Returns an unsubscribe function. */
  onChange(listener: ThemeChangeListener): () => void {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  // -----------------------------------------------------------------------
  // Internal
  // -----------------------------------------------------------------------

  private apply(): void {
    this.registerBuiltIns()
    if (!isBrowser()) return

    const root = document.documentElement
    const preset = this.presets.get(this.currentThemeName)
    const scheme = this.resolvedDark ? 'dark' : 'light'
    const config = resolvePresetThemeConfig(preset, scheme)

    // Replace the previous inline theme with the merged config so missing
    // segments fall back to the default theme instead of disappearing.
    clearThemeConfig(root)

    const isModern = this.currentThemeName === 'modern'
    const extra = isModern
      ? this.resolvedDark
        ? MODERN_OVERRIDE_TOKENS_DARK
        : MODERN_OVERRIDE_TOKENS_LIGHT
      : {}
    setCssVarsCached(root, { ...themeConfigToCssVars(config), ...extra })

    if (isModern) {
      root.setAttribute('data-tiger-style', 'modern')
    } else {
      root.removeAttribute('data-tiger-style')
    }

    // Toggle `.dark` class on <html>
    if (this.resolvedDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    root.style.colorScheme = this.resolvedDark ? 'dark' : 'light'

    this.notify()
  }

  private notify(): void {
    const event: ThemeChangeEvent = {
      theme: this.currentThemeName,
      colorScheme: this.resolvedDark ? 'dark' : 'light'
    }
    for (const listener of this.listeners) {
      listener(event)
    }
  }

  private startWatchingMedia(): void {
    if (!isBrowser()) return
    if (this.mediaQuery) return // already watching

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    this.mediaHandler = (e: MediaQueryListEvent) => {
      this.resolvedDark = e.matches
      this.apply()
    }
    this.mediaQuery.addEventListener('change', this.mediaHandler)
  }

  private stopWatchingMedia(): void {
    if (this.mediaQuery && this.mediaHandler) {
      this.mediaQuery.removeEventListener('change', this.mediaHandler)
    }
    this.mediaQuery = null
    this.mediaHandler = null
  }
}

/**
 * Singleton ThemeManager instance.
 *
 * @example
 * ```ts
 * import { ThemeManager } from '@expcat/tigercat-core'
 *
 * ThemeManager.setTheme('vibrant')
 * ThemeManager.setColorScheme('auto')
 *
 * ThemeManager.onChange(({ theme, colorScheme }) => {
 *   console.log(`Switched to ${theme} (${colorScheme})`)
 * })
 * ```
 */
export const ThemeManager = new ThemeManagerImpl()

/** Explicitly register built-in presets. ThemeManager methods also call this. */
export function registerBuiltInThemes(): void {
  ThemeManager.registerBuiltIns()
}
