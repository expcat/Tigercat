/**
 * @vitest-environment happy-dom
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  createDocumentConfigHandle,
  resetDocumentConfigScope,
  ThemeManager
} from '@expcat/tigercat-core'

function resetDocument(): void {
  resetDocumentConfigScope()
  ThemeManager.setTheme('default')
  ThemeManager.setColorScheme('light')
  document.documentElement.removeAttribute('dir')
  document.documentElement.removeAttribute('data-tiger-dir')
  document.documentElement.removeAttribute('lang')
  document.documentElement.removeAttribute('data-tiger-style')
  document.documentElement.classList.remove('dark')
}

describe('document config ownership', () => {
  beforeEach(() => {
    resetDocument()
  })

  afterEach(() => {
    resetDocument()
  })

  it('restores theme and dir when the last owner disposes', () => {
    document.documentElement.setAttribute('dir', 'ltr')
    ThemeManager.setTheme('default')

    const handle = createDocumentConfigHandle()
    handle.apply({ theme: 'minimal', direction: 'rtl' })

    expect(ThemeManager.getCurrentTheme()).toBe('minimal')
    expect(document.documentElement.getAttribute('dir')).toBe('rtl')

    handle.dispose()

    expect(ThemeManager.getCurrentTheme()).toBe('default')
    expect(document.documentElement.getAttribute('dir')).toBe('ltr')
  })

  it('re-applies the remaining sibling instead of restoring the baseline', () => {
    const first = createDocumentConfigHandle()
    first.apply({ direction: 'rtl', theme: 'vibrant' })
    const second = createDocumentConfigHandle()
    second.apply({ direction: 'ltr', theme: 'minimal' })

    expect(document.documentElement.getAttribute('dir')).toBe('ltr')
    expect(ThemeManager.getCurrentTheme()).toBe('minimal')

    first.dispose()

    expect(document.documentElement.getAttribute('dir')).toBe('ltr')
    expect(ThemeManager.getCurrentTheme()).toBe('minimal')

    second.dispose()

    expect(document.documentElement.getAttribute('dir')).toBeNull()
    expect(ThemeManager.getCurrentTheme()).toBe('default')
  })

  it('does not write dir when the owner never set a direction', () => {
    document.documentElement.setAttribute('dir', 'rtl')
    const handle = createDocumentConfigHandle()
    handle.apply({ theme: 'vibrant' })

    expect(document.documentElement.getAttribute('dir')).toBe('rtl')

    handle.dispose()

    expect(document.documentElement.getAttribute('dir')).toBe('rtl')
  })

  describe('colorScheme auto', () => {
    let originalMatchMedia: typeof window.matchMedia
    let mediaListeners: Array<(e: MediaQueryListEvent) => void>
    let currentMatches: boolean

    beforeEach(() => {
      mediaListeners = []
      currentMatches = true
      originalMatchMedia = window.matchMedia
      window.matchMedia = ((query: string) =>
        ({
          matches: currentMatches,
          media: query,
          onchange: null,
          addEventListener: (_: string, listener: (e: MediaQueryListEvent) => void) => {
            mediaListeners.push(listener)
          },
          removeEventListener: (_: string, listener: (e: MediaQueryListEvent) => void) => {
            mediaListeners = mediaListeners.filter((item) => item !== listener)
          },
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => true
        }) as unknown as MediaQueryList) as typeof window.matchMedia
    })

    afterEach(() => {
      window.matchMedia = originalMatchMedia
    })

    it('stops the media listener after dispose so later changes do not toggle .dark', () => {
      const handle = createDocumentConfigHandle()
      handle.apply({ colorScheme: 'auto' }, { hydrateAuto: true })

      expect(document.documentElement.classList.contains('dark')).toBe(false)

      handle.dispose()
      expect(ThemeManager.getColorScheme()).toBe('light')

      for (const listener of mediaListeners) {
        listener({ matches: true } as MediaQueryListEvent)
      }

      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })
})
