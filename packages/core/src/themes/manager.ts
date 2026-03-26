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

import type { ThemePreset, ThemeSemanticColors, ColorScheme } from '../types/theme'
import { THEME_CSS_VARS } from '../theme'

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function applyColors(colors: Partial<ThemeSemanticColors>, target: HTMLElement): void {
  for (const [key, value] of Object.entries(colors)) {
    const varName = THEME_CSS_VARS[key as keyof ThemeSemanticColors]
    if (varName && value) {
      target.style.setProperty(varName, value)
    }
  }
}

function clearColors(target: HTMLElement): void {
  for (const varName of Object.values(THEME_CSS_VARS)) {
    target.style.removeProperty(varName)
  }
}

function resolveSystemDark(): boolean {
  if (typeof window === 'undefined') return false
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
    if (typeof document === 'undefined') return

    const root = document.documentElement
    const preset = this.presets.get(this.currentThemeName)

    // Clear previous inline variables so preset defaults flow through
    clearColors(root)

    if (preset) {
      const config = this.resolvedDark ? preset.dark : preset.light
      if (config.colors) {
        applyColors(config.colors, root)
      }
    }

    // Toggle `.dark` class on <html>
    if (this.resolvedDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

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
    if (typeof window === 'undefined') return
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
