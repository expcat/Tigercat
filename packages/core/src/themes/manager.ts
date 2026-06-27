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

import type { ThemeConfig, ThemePreset, ThemeSemanticColors, ColorScheme } from '../types/theme'
import { THEME_CSS_VARS, removeCssVarsCached, setCssVarsCached } from '../theme-runtime'
import { isBrowser } from '../utils/env'

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
    durationFast: '--tiger-duration-fast',
    durationBase: '--tiger-duration-base',
    durationSlow: '--tiger-duration-slow',
    easing: '--tiger-easing'
  }
} as const

export function themeConfigToCssVars(config: ThemeConfig): Record<string, string> {
  const vars: Record<string, string> = {}

  if (config.colors) {
    for (const [key, value] of Object.entries(config.colors)) {
      const varName = THEME_CSS_VARS[key as keyof ThemeSemanticColors]
      if (varName && value) vars[varName] = value
    }
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

  return vars
}

function clearThemeConfig(target: HTMLElement): void {
  removeCssVarsCached(target, [
    ...Object.values(THEME_CSS_VARS),
    ...Object.values(THEME_CONFIG_CSS_VARS.typography),
    ...Object.values(THEME_CONFIG_CSS_VARS.radius),
    ...Object.values(THEME_CONFIG_CSS_VARS.shadows),
    ...Object.values(THEME_CONFIG_CSS_VARS.spacing),
    ...Object.values(THEME_CONFIG_CSS_VARS.motion)
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

  // -----------------------------------------------------------------------
  // Theme registration
  // -----------------------------------------------------------------------

  /** Register a preset theme. Replaces any existing preset with the same name. */
  registerTheme(preset: ThemePreset): void {
    this.presets.set(preset.name, preset)
  }

  /** Get a registered preset by name. */
  getTheme(name: string): ThemePreset | undefined {
    return this.presets.get(name)
  }

  /** List all registered preset names. */
  getAvailableThemes(): string[] {
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
    if (!this.presets.has(name)) {
      console.warn(`[Tigercat] Theme "${name}" is not registered.`)
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
   */
  setColorScheme(scheme: ColorScheme): void {
    this.colorScheme = scheme

    if (scheme === 'auto') {
      this.startWatchingMedia()
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
    if (!isBrowser()) return

    const root = document.documentElement
    const preset = this.presets.get(this.currentThemeName)

    // Clear previous inline variables so preset defaults flow through
    clearThemeConfig(root)

    if (preset) {
      const config = this.resolvedDark ? preset.dark : preset.light
      setCssVarsCached(root, themeConfigToCssVars(config))
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
