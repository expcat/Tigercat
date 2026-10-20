/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  createTigerThemeScope,
  defaultTheme,
  vibrantTheme,
  themeConfigToCssVars,
  setCssVarsCached,
  removeCssVarsCached,
  type ThemeChangeEvent,
  type TigerThemeScope
} from '@expcat/tigercat-core'
import type { ThemePreset } from '@expcat/tigercat-core'

function clearRootState(): void {
  document.documentElement.removeAttribute('style')
  document.documentElement.removeAttribute('data-tiger-theme')
  document.documentElement.removeAttribute('data-tiger-theme-scope')
  document.documentElement.removeAttribute('data-tiger-color-scheme')
  document.documentElement.classList.remove('dark')
  document.querySelectorAll('style[data-tiger-theme-style]').forEach((node) => node.remove())
}

/** Stylesheet text written by the live scope(s). */
function scopeCss(): string {
  return Array.from(document.querySelectorAll('style[data-tiger-theme-style]'))
    .map((node) => node.textContent ?? '')
    .join('\n')
}

describe('themes/manager — theme scope', () => {
  let ThemeManager: TigerThemeScope

  beforeEach(() => {
    clearRootState()
    ThemeManager = createTigerThemeScope({
      root: document.documentElement,
      theme: 'default',
      colorScheme: 'light'
    })
    ThemeManager.setColorScheme('light')
    ThemeManager.setTheme('default')
  })

  afterEach(() => {
    ThemeManager.dispose()
    clearRootState()
  })

  // -------------------------------------------------------------------------
  // Built-in presets
  // -------------------------------------------------------------------------

  describe('built-in presets', () => {
    it('auto-registers all built-in presets', () => {
      ThemeManager.getAvailableThemes()
      const names = ThemeManager.getAvailableThemes()
      expect(names).toEqual(
        expect.arrayContaining([
          'default',
          'vibrant',
          'professional',
          'minimal',
          'natural',
          'modern',
          'high-contrast'
        ])
      )
    })

    it('returns a registered preset via getTheme()', () => {
      const preset = ThemeManager.getTheme('default')
      expect(preset).toBeDefined()
      expect(preset!.name).toBe('default')
    })

    it('returns undefined for unknown preset name', () => {
      expect(ThemeManager.getTheme('not-real')).toBeUndefined()
    })

    it('exposes current theme name (defaults to "default")', () => {
      expect(ThemeManager.getCurrentTheme()).toBe('default')
    })
  })

  // -------------------------------------------------------------------------
  // registerTheme / defineTheme
  // -------------------------------------------------------------------------

  describe('registerTheme / defineTheme', () => {
    const customPreset: ThemePreset = {
      name: 'unit-test-custom',
      label: 'Unit Test Custom',
      light: {
        colors: {
          primary: '#ff00ff',
          surface: '#fafafa'
        }
      },
      dark: {
        colors: {
          primary: '#ff66ff',
          surface: '#222222'
        }
      }
    }

    it('registerTheme() adds a preset retrievable by getTheme()', () => {
      ThemeManager.registerTheme(customPreset)
      expect(ThemeManager.getTheme('unit-test-custom')).toBe(customPreset)
      expect(ThemeManager.getAvailableThemes()).toContain('unit-test-custom')
    })

    it('registerTheme() replaces an existing preset with the same name', () => {
      ThemeManager.registerTheme(customPreset)
      const replacement: ThemePreset = {
        ...customPreset,
        light: { colors: { primary: '#000000' } }
      }
      ThemeManager.registerTheme(replacement)
      expect(ThemeManager.getTheme('unit-test-custom')).toBe(replacement)
    })

    it('defineTheme() registers and immediately applies the preset', () => {
      ThemeManager.defineTheme(customPreset)
      expect(ThemeManager.getCurrentTheme()).toBe('unit-test-custom')
      expect(scopeCss()).toContain('--tiger-primary:#ff00ff')
      expect(scopeCss()).toContain('--tiger-primary:#ff66ff')
    })
  })

  // -------------------------------------------------------------------------
  // setTheme
  // -------------------------------------------------------------------------

  describe('setTheme', () => {
    it('switches the current theme and applies its CSS variables', () => {
      ThemeManager.setTheme('vibrant')
      expect(ThemeManager.getCurrentTheme()).toBe('vibrant')
      expect(scopeCss()).toContain(`--tiger-primary:${vibrantTheme.light.colors?.primary}`)
    })

    it('warns and is a no-op for an unregistered theme name', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      ThemeManager.setTheme('does-not-exist')
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('"does-not-exist" is not registered')
      )
      // current theme unchanged
      expect(ThemeManager.getCurrentTheme()).toBe('default')
      warnSpy.mockRestore()
    })

    it('merges missing segments from the default theme when switching presets', () => {
      ThemeManager.defineTheme({
        name: 'with-extra',
        label: 'With extra',
        light: {
          colors: { primary: '#abcdef' },
          radius: { md: '12px' }
        },
        dark: {
          colors: { primary: '#fedcba' }
        }
      })
      expect(scopeCss()).toContain('--tiger-primary:#abcdef')
      expect(scopeCss()).toContain('--tiger-radius-md:12px')
      ThemeManager.defineTheme({
        name: 'without-primary',
        label: 'Without',
        light: { colors: { surface: '#111111' } },
        dark: { colors: { surface: '#000000' } }
      })
      expect(scopeCss()).toContain('--tiger-surface:#111111')
      expect(scopeCss()).toContain(`--tiger-primary:${defaultTheme.light.colors?.primary}`)
      expect(scopeCss()).toContain(`--tiger-radius-md:${defaultTheme.light.radius?.md}`)
    })

    it('setTheme("modern") writes the modern preset on the scope root', () => {
      ThemeManager.setTheme('modern')
      expect(document.documentElement.getAttribute('data-tiger-theme')).toBe('modern')
      expect(document.documentElement.getAttribute('data-tiger-style')).toBeNull()
      expect(scopeCss()).toContain('--tiger-radius-md:12px')
      ThemeManager.setTheme('default')
      expect(document.documentElement.getAttribute('data-tiger-theme')).toBe('default')
      expect(scopeCss()).toContain(`--tiger-radius-md:${defaultTheme.light.radius?.md}`)
    })

    it('keeps default radius when switching the default theme to dark', () => {
      ThemeManager.setTheme('default')
      ThemeManager.setColorScheme('dark')
      expect(scopeCss()).toContain(`--tiger-radius-md:${defaultTheme.dark.radius?.md}`)
      expect(scopeCss()).toContain(`--tiger-primary:${defaultTheme.dark.colors?.primary}`)
    })

    it('maps non-color ThemeConfig sections to runtime CSS variables', () => {
      expect(
        themeConfigToCssVars({
          typography: { fontFamily: 'Inter, sans-serif' },
          radius: { md: '0.75rem' },
          shadows: { md: '0 8px 16px rgb(0 0 0 / 0.2)' },
          spacing: { md: '1rem' },
          motion: { durationBase: '240ms' }
        })
      ).toEqual(
        expect.objectContaining({
          '--tiger-font-family': 'Inter, sans-serif',
          '--tiger-radius-md': '0.75rem',
          '--tiger-shadow-md': '0 8px 16px rgb(0 0 0 / 0.2)',
          '--tiger-spacing-md': '1rem',
          '--tiger-motion-duration-base': '240ms',
          '--tiger-transition-base':
            'color, background-color, border-color, outline-color, text-decoration-color, box-shadow, opacity, transform 240ms cubic-bezier(0.4, 0, 0.2, 1)',
          '--tiger-breakpoint-md': '768px'
        })
      )
    })
  })

  describe('cached CSS variable updates', () => {
    it('skips duplicate setProperty calls and clears cached entries', () => {
      const target = document.createElement('div')
      const setSpy = vi.spyOn(target.style, 'setProperty')
      const removeSpy = vi.spyOn(target.style, 'removeProperty')

      setCssVarsCached(target, { '--tiger-primary': '#123456' })
      setCssVarsCached(target, { '--tiger-primary': '#123456' })
      setCssVarsCached(target, { '--tiger-primary': '#654321' })

      expect(setSpy).toHaveBeenCalledTimes(2)
      expect(target.style.getPropertyValue('--tiger-primary')).toBe('#654321')

      removeCssVarsCached(target, ['--tiger-primary'])

      expect(removeSpy).toHaveBeenCalledWith('--tiger-primary')
      expect(target.style.getPropertyValue('--tiger-primary')).toBe('')
    })
  })

  // -------------------------------------------------------------------------
  // setColorScheme
  // -------------------------------------------------------------------------

  describe('setColorScheme', () => {
    it('forces dark mode and toggles the .dark class on <html>', () => {
      ThemeManager.setColorScheme('dark')
      expect(ThemeManager.getColorScheme()).toBe('dark')
      expect(ThemeManager.getResolvedColorScheme()).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      expect(document.documentElement.style.colorScheme).toBe('dark')
    })

    it('forces light mode and removes the .dark class on <html>', () => {
      ThemeManager.setColorScheme('dark')
      ThemeManager.setColorScheme('light')
      expect(ThemeManager.getColorScheme()).toBe('light')
      expect(ThemeManager.getResolvedColorScheme()).toBe('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(document.documentElement.style.colorScheme).toBe('light')
    })

    it('applies the dark color set when current preset has dark colors', () => {
      ThemeManager.setColorScheme('dark')
      expect(document.documentElement.getAttribute('data-tiger-color-scheme')).toBe('dark')
      expect(scopeCss()).toContain(`--tiger-primary:${defaultTheme.dark.colors?.primary}`)
    })

    it('releases scope-stamped scheme markers when switching back to auto', () => {
      ThemeManager.setColorScheme('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
      ThemeManager.setColorScheme('auto')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(document.documentElement.hasAttribute('data-tiger-color-scheme')).toBe(false)
      expect(document.documentElement.style.colorScheme).toBe('')
    })

    it('dispose restores theme markers and scheme state the scope found', () => {
      document.documentElement.setAttribute('data-tiger-theme', 'outside')
      document.documentElement.classList.add('dark')
      const outerScopeId = document.documentElement.getAttribute('data-tiger-theme-scope')
      const scope = createTigerThemeScope({
        root: document.documentElement,
        theme: 'vibrant',
        colorScheme: 'light'
      })
      scope.apply()
      expect(document.documentElement.getAttribute('data-tiger-theme')).toBe('vibrant')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      scope.dispose()
      expect(document.documentElement.getAttribute('data-tiger-theme')).toBe('outside')
      expect(document.documentElement.getAttribute('data-tiger-theme-scope')).toBe(outerScopeId)
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })
  })

  // -------------------------------------------------------------------------
  // auto color scheme (matchMedia)
  // -------------------------------------------------------------------------

  describe('setColorScheme("auto")', () => {
    let originalMatchMedia: typeof window.matchMedia
    let mediaListeners: Array<(e: MediaQueryListEvent) => void>
    let currentMatches: boolean

    beforeEach(() => {
      mediaListeners = []
      currentMatches = false
      originalMatchMedia = window.matchMedia
      ;(window as unknown as { matchMedia: typeof window.matchMedia }).matchMedia = ((
        query: string
      ) => {
        return {
          matches: currentMatches,
          media: query,
          onchange: null,
          addEventListener: (_: string, listener: (e: MediaQueryListEvent) => void) => {
            mediaListeners.push(listener)
          },
          removeEventListener: (_: string, listener: (e: MediaQueryListEvent) => void) => {
            mediaListeners = mediaListeners.filter((l) => l !== listener)
          },
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => true
        } as unknown as MediaQueryList
      }) as typeof window.matchMedia
    })

    afterEach(() => {
      // restore + reset to a forced light scheme so the next test starts clean.
      ;(window as unknown as { matchMedia: typeof window.matchMedia }).matchMedia =
        originalMatchMedia
      ThemeManager.setColorScheme('light')
    })

    it('resolves to light when prefers-color-scheme: dark is not matched', () => {
      currentMatches = false
      ThemeManager.setColorScheme('auto')
      expect(ThemeManager.getColorScheme()).toBe('auto')
      expect(ThemeManager.getResolvedColorScheme()).toBe('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('does not stamp .dark from prefers-color-scheme while auto', () => {
      currentMatches = true
      ThemeManager.setColorScheme('auto')
      expect(ThemeManager.getResolvedColorScheme()).toBe('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(document.documentElement.hasAttribute('data-tiger-color-scheme')).toBe(false)
    })

    it('reads an existing html dark class when the scheme is auto', () => {
      document.documentElement.classList.add('dark')
      ThemeManager.setColorScheme('auto')
      expect(ThemeManager.getResolvedColorScheme()).toBe('dark')
    })

    it('resolves dark from an ancestor .dark class, matching the scoped stylesheet', () => {
      const host = document.createElement('div')
      document.body.append(host)
      document.documentElement.classList.add('dark')
      const scope = createTigerThemeScope({ root: host, theme: 'vibrant', colorScheme: 'auto' })
      scope.apply()
      expect(scope.getResolvedColorScheme()).toBe('dark')
      scope.setColorScheme('light')
      expect(scope.getResolvedColorScheme()).toBe('light')
      scope.dispose()
      host.remove()
    })

    it('does not subscribe a matchMedia listener for auto', () => {
      ThemeManager.setColorScheme('auto')
      expect(mediaListeners.length).toBe(0)
      ThemeManager.setColorScheme('light')
      expect(mediaListeners.length).toBe(0)
    })
  })

  // -------------------------------------------------------------------------
  // onChange listeners
  // -------------------------------------------------------------------------

  describe('onChange', () => {
    it('notifies listeners when setTheme is called', () => {
      const events: ThemeChangeEvent[] = []
      const unsubscribe = ThemeManager.onChange((e) => events.push(e))

      ThemeManager.setTheme('vibrant')
      expect(events.length).toBeGreaterThanOrEqual(1)
      const last = events[events.length - 1]
      expect(last.theme).toBe('vibrant')
      expect(last.colorScheme).toBe('light')

      unsubscribe()
    })

    it('notifies listeners when setColorScheme is called', () => {
      const events: ThemeChangeEvent[] = []
      const unsubscribe = ThemeManager.onChange((e) => events.push(e))

      ThemeManager.setColorScheme('dark')
      expect(events[events.length - 1].colorScheme).toBe('dark')

      unsubscribe()
    })

    it('returned unsubscribe function stops further notifications', () => {
      const events: ThemeChangeEvent[] = []
      const unsubscribe = ThemeManager.onChange((e) => events.push(e))
      unsubscribe()

      ThemeManager.setTheme('vibrant')
      expect(events).toHaveLength(0)
    })

    it('supports multiple independent listeners', () => {
      const a: ThemeChangeEvent[] = []
      const b: ThemeChangeEvent[] = []
      const ua = ThemeManager.onChange((e) => a.push(e))
      const ub = ThemeManager.onChange((e) => b.push(e))

      ThemeManager.setTheme('professional')
      expect(a.length).toBe(1)
      expect(b.length).toBe(1)

      ua()
      ThemeManager.setTheme('minimal')
      expect(a.length).toBe(1) // unsubscribed
      expect(b.length).toBe(2)

      ub()
    })
  })
})
