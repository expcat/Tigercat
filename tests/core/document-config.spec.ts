/**
 * @vitest-environment happy-dom
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createDocumentConfigHandle, readDocumentOwnerLocale } from '@expcat/tigercat-core'

function resetDocument(): void {
  document.documentElement.removeAttribute('dir')
  document.documentElement.removeAttribute('data-tiger-dir')
  document.documentElement.removeAttribute('lang')
  document.documentElement.removeAttribute('data-tiger-theme')
  document.documentElement.removeAttribute('data-tiger-color-scheme')
  document.documentElement.removeAttribute('data-tiger-theme-scope')
  document.documentElement.classList.remove('dark')
  document.querySelectorAll('style[data-tiger-theme-style]').forEach((node) => node.remove())
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

    const handle = createDocumentConfigHandle()
    handle.apply({ theme: 'minimal', direction: 'rtl' })

    expect(handle.themeScope.getCurrentTheme()).toBe('minimal')
    expect(document.documentElement.getAttribute('dir')).toBe('rtl')

    handle.dispose()

    expect(document.documentElement.getAttribute('data-tiger-theme')).toBeNull()
    expect(document.documentElement.getAttribute('dir')).toBe('ltr')
  })

  it('keeps each owner locale and reads the current owner', () => {
    const first = createDocumentConfigHandle()
    first.setLocale({ common: { okText: '第一' } })
    const second = createDocumentConfigHandle()
    second.setLocale({ common: { okText: '第二' } })

    expect(readDocumentOwnerLocale()?.common?.okText).toBe('第二')

    second.dispose()
    expect(readDocumentOwnerLocale()?.common?.okText).toBe('第一')

    first.dispose()
    expect(readDocumentOwnerLocale()).toBeUndefined()
  })

  it('re-applies the remaining sibling instead of restoring the baseline', () => {
    const first = createDocumentConfigHandle()
    first.apply({ direction: 'rtl', theme: 'vibrant' })
    const second = createDocumentConfigHandle()
    second.apply({ direction: 'ltr', theme: 'minimal' })

    expect(document.documentElement.getAttribute('dir')).toBe('ltr')
    expect(second.themeScope.getCurrentTheme()).toBe('minimal')

    second.dispose()

    expect(document.documentElement.getAttribute('dir')).toBe('rtl')
    expect(first.themeScope.getCurrentTheme()).toBe('vibrant')

    first.dispose()

    expect(document.documentElement.getAttribute('dir')).toBeNull()
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

    it('auto does not stamp .dark and dispose restores the previous class', () => {
      const handle = createDocumentConfigHandle()
      handle.apply({ colorScheme: 'auto' })

      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(handle.themeScope.getColorScheme()).toBe('auto')

      handle.dispose()
      expect(document.documentElement.classList.contains('dark')).toBe(false)
      expect(mediaListeners).toEqual([])
    })
  })
})
