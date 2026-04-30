/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { ThemeManager, type ThemeChangeEvent } from '@expcat/tigercat-core'
import type { ThemePreset } from '@expcat/tigercat-core'

const ALL_VAR_NAMES = [
  '--tiger-primary',
  '--tiger-primary-hover',
  '--tiger-surface',
  '--tiger-text',
  '--tiger-border',
  '--tiger-success',
  '--tiger-chart-1'
]

function clearAllInlineVars(): void {
  for (const name of ALL_VAR_NAMES) {
    document.documentElement.style.removeProperty(name)
  }
  document.documentElement.classList.remove('dark')
}

describe('themes/manager — ThemeManager', () => {
  beforeEach(() => {
    // Reset to known state before every test.
    ThemeManager.setColorScheme('light')
    ThemeManager.setTheme('default')
    clearAllInlineVars()
  })

  afterEach(() => {
    clearAllInlineVars()
  })

  // -------------------------------------------------------------------------
  // Built-in presets
  // -------------------------------------------------------------------------

  describe('built-in presets', () => {
    it('auto-registers all 6 built-in presets', () => {
      const names = ThemeManager.getAvailableThemes()
      expect(names).toEqual(
        expect.arrayContaining([
          'default',
          'vibrant',
          'professional',
          'minimal',
          'natural',
          'modern'
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
      expect(document.documentElement.style.getPropertyValue('--tiger-primary')).toBe(
        '#ff00ff'
      )
    })
  })

  // -------------------------------------------------------------------------
  // setTheme
  // -------------------------------------------------------------------------

  describe('setTheme', () => {
    it('switches the current theme and applies its CSS variables', () => {
      ThemeManager.setTheme('vibrant')
      expect(ThemeManager.getCurrentTheme()).toBe('vibrant')
      // vibrant preset must apply *some* primary color
      const primary = document.documentElement.style.getPropertyValue('--tiger-primary')
      expect(primary).not.toBe('')
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

    it('clears previous inline variables when switching themes', () => {
      ThemeManager.defineTheme({
        name: 'with-extra',
        label: 'With extra',
        light: { colors: { primary: '#abcdef' } }
      })
      expect(document.documentElement.style.getPropertyValue('--tiger-primary')).toBe(
        '#abcdef'
      )
      ThemeManager.defineTheme({
        name: 'without-primary',
        label: 'Without',
        light: { colors: { surface: '#111111' } }
      })
      // Previous primary value must have been cleared.
      expect(document.documentElement.style.getPropertyValue('--tiger-primary')).toBe('')
      expect(document.documentElement.style.getPropertyValue('--tiger-surface')).toBe(
        '#111111'
      )
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
    })

    it('forces light mode and removes the .dark class on <html>', () => {
      ThemeManager.setColorScheme('dark')
      ThemeManager.setColorScheme('light')
      expect(ThemeManager.getColorScheme()).toBe('light')
      expect(ThemeManager.getResolvedColorScheme()).toBe('light')
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('applies the dark color set when current preset has dark colors', () => {
      ThemeManager.setColorScheme('dark')
      const primary = document.documentElement.style.getPropertyValue('--tiger-primary')
      // default preset must specify a dark primary; non-empty is enough.
      expect(primary).not.toBe('')
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
          removeEventListener: (
            _: string,
            listener: (e: MediaQueryListEvent) => void
          ) => {
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

    it('resolves to dark when prefers-color-scheme: dark is matched', () => {
      currentMatches = true
      ThemeManager.setColorScheme('auto')
      expect(ThemeManager.getResolvedColorScheme()).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('reacts to a media query change event while in auto mode', () => {
      currentMatches = false
      ThemeManager.setColorScheme('auto')
      expect(ThemeManager.getResolvedColorScheme()).toBe('light')

      // Simulate the OS flipping to dark.
      for (const listener of mediaListeners) {
        listener({ matches: true } as MediaQueryListEvent)
      }
      expect(ThemeManager.getResolvedColorScheme()).toBe('dark')
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('stops listening to the media query after switching back to a fixed scheme', () => {
      ThemeManager.setColorScheme('auto')
      expect(mediaListeners.length).toBeGreaterThan(0)
      ThemeManager.setColorScheme('light')
      expect(mediaListeners.length).toBe(0)
    })

    it('does not double-subscribe when setColorScheme("auto") is called twice', () => {
      ThemeManager.setColorScheme('auto')
      const firstCount = mediaListeners.length
      ThemeManager.setColorScheme('auto')
      expect(mediaListeners.length).toBe(firstCount)
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
