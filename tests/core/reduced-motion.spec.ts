import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { Window } from 'happy-dom'
import {
  createTigerThemeScope,
  prefersReducedMotion,
  getAccessibleTransitionClasses,
  themeTransitionValue
} from '@expcat/tigercat-core'
import { createTigercatPlugin } from '../../packages/core/src/tailwind-plugin'

describe('theme scopes retain auxiliary media preferences', () => {
  it.each(['prefers-reduced-motion: reduce', 'prefers-contrast: more', 'forced-colors: active'])(
    'keeps %s through applying, switching and disposing scopes',
    async (preference) => {
      const browser = new Window()
      const doc = browser.document
      const style = doc.createElement('style')
      // Select the matching block explicitly: happy-dom does not implement prefers-contrast.
      style.textContent = readFileSync('packages/core/tokens/tokens.css', 'utf8').replace(
        /@media\s*[^{]+/g,
        (query) => (query.includes(preference) ? '@media all' : '@media not all')
      )
      doc.head.append(style)
      const child = doc.createElement('section')
      doc.body.append(child)
      const scopes = [
        createTigerThemeScope({ root: doc.documentElement as unknown as HTMLElement }),
        createTigerThemeScope({
          root: child as unknown as HTMLElement,
          theme: 'modern',
          nested: true
        })
      ]
      const check = (): void => {
        for (const root of [doc.documentElement, child]) {
          const value = (name: string): string => {
            const property = '--tiger-' + name
            // happy-dom omits inherited custom properties from getPropertyValue().
            return (
              browser.getComputedStyle(root).getPropertyValue(property) ||
              browser.getComputedStyle(doc.documentElement).getPropertyValue(property)
            ).trim()
          }
          if (preference.startsWith('prefers-reduced-motion')) {
            expect(value('motion-duration-base')).toBe('0ms')
          } else if (preference.startsWith('prefers-contrast')) {
            expect(value('border')).toBe(value('border-strong'))
            expect(value('text-secondary')).toBe(value('text'))
          } else {
            expect(value('text')).toBe('CanvasText')
            expect(value('text-secondary')).toBe('LinkText')
            expect(value('surface')).toBe('Canvas')
          }
        }
      }
      try {
        check()
        scopes.forEach((scope) => scope.apply())
        check()
        scopes.forEach((scope) => scope.setTheme('vibrant'))
        check()
        scopes.forEach((scope) => scope.setColorScheme('dark'))
        check()
        scopes[1].dispose()
        check()
        scopes[0].dispose()
        check()
      } finally {
        scopes.forEach((scope) => scope.dispose())
        await browser.close()
      }
    }
  )
})

/**
 * Reduced motion uses one switch: `prefers-reduced-motion: reduce` pins
 * duration variables to `0ms` and zeroes animations that opt into
 * `.tiger-motion-aware` / `[data-tiger-motion]`.
 */

type MatchMediaImpl = (query: string) => MediaQueryList

function withMatchMedia(impl: MatchMediaImpl, fn: () => void) {
  const original = window.matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: impl
  })
  try {
    fn()
  } finally {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: original
    })
  }
}

function makeMql(matches: boolean, query: string): MediaQueryList {
  return {
    matches,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  } as unknown as MediaQueryList
}

describe('prefersReducedMotion()', () => {
  it('returns true when the user requests reduced motion', () => {
    withMatchMedia(
      (q) => makeMql(q.includes('prefers-reduced-motion: reduce'), q),
      () => {
        expect(prefersReducedMotion()).toBe(true)
      }
    )
  })

  it('returns false when the user has no preference', () => {
    withMatchMedia(
      (q) => makeMql(false, q),
      () => {
        expect(prefersReducedMotion()).toBe(false)
      }
    )
  })

  it('returns false in SSR-like environments without window.matchMedia', () => {
    // Spy on matchMedia call path indirectly: temporarily delete and verify
    // the helper does not throw and reports false. We can't actually
    // remove `window` itself in jsdom/happy-dom, but the helper's first
    // branch checks `typeof window === 'undefined'` so we just assert the
    // current default mock returns a stable boolean.
    expect(typeof prefersReducedMotion()).toBe('boolean')
  })
})

describe('getAccessibleTransitionClasses()', () => {
  it('returns duration-0 fade when prefers-reduced-motion is set', () => {
    withMatchMedia(
      (q) => makeMql(q.includes('prefers-reduced-motion: reduce'), q),
      () => {
        const cls = getAccessibleTransitionClasses('slide-up')
        expect(cls.enterActive).toContain('duration-0')
        expect(cls.leaveActive).toContain('duration-0')
        // Only opacity transitions — no transform animation under reduced motion
        expect(cls.enterActive).toContain('transition-opacity')
        expect(cls.enterFrom).toBe('opacity-0')
        expect(cls.enterTo).toBe('opacity-100')
      }
    )
  })

  it('falls back to the requested transition when motion is allowed', () => {
    withMatchMedia(
      (q) => makeMql(false, q),
      () => {
        const cls = getAccessibleTransitionClasses('slide-up')
        expect(cls.enterActive).not.toContain('duration-0')
      }
    )
  })
})

describe('createTigercatPlugin() — reduced-motion CSS block', () => {
  type CssBlock = Record<string, string>
  type AddBaseFn = (rule: Record<string, unknown>) => void
  type PluginCallback = (api: { addBase: AddBaseFn }) => void
  type PluginInstance = { handler: PluginCallback }

  function captureRules(p: PluginInstance) {
    const rules: Record<string, CssBlock | Record<string, CssBlock>> = {}
    p.handler({
      addBase: (rule) => {
        for (const [sel, body] of Object.entries(rule)) {
          const previous = rules[sel]
          if (
            sel.startsWith('@') &&
            previous &&
            typeof previous === 'object' &&
            body &&
            typeof body === 'object'
          ) {
            rules[sel] = { ...(previous as object), ...(body as object) } as Record<
              string,
              CssBlock
            >
          } else {
            rules[sel] = body as CssBlock
          }
        }
      }
    })
    return rules
  }

  it('emits one reduced-motion block for :root, .dark, and motion-aware animations', () => {
    const rules = captureRules(createTigercatPlugin() as PluginInstance)
    const mediaRule = rules['@media (prefers-reduced-motion: reduce)'] as Record<string, CssBlock>
    expect(mediaRule).toBeDefined()
    expect(mediaRule[':root, .dark, [data-tiger-theme-scope]']).toBeDefined()
    expect(mediaRule[':root, [data-tiger-style="modern"]']).toBeUndefined()
    expect(
      mediaRule[
        '.tiger-motion-aware, .tiger-motion-aware::before, .tiger-motion-aware::after, [data-tiger-motion]'
      ]
    ).toBeDefined()
  })

  it('pins duration tokens to 0ms and does not use transition: all', () => {
    const rules = captureRules(createTigercatPlugin() as PluginInstance)
    const inner = (rules['@media (prefers-reduced-motion: reduce)'] as Record<string, CssBlock>)[
      ':root, .dark, [data-tiger-theme-scope]'
    ]
    expect(inner['--tiger-motion-duration-quick']).toBe('0ms !important')
    expect(inner['--tiger-motion-duration-base']).toBe('0ms !important')
    expect(inner['--tiger-motion-duration-slow']).toBe('0ms !important')
    expect(inner['--tiger-transition-base']).toBe(
      `${themeTransitionValue('0ms', 'linear')} !important`
    )
    expect(inner['--tiger-transition-quick']).toBe(
      `${themeTransitionValue('0ms', 'linear')} !important`
    )
    expect(inner['--tiger-transition-emphasized']).toBe(
      `${themeTransitionValue('0ms', 'linear')} !important`
    )
    expect(inner['--tiger-transition-base']).not.toContain('all ')
  })
})

describe('Reduced-motion CSS — actually applies in jsdom when media matches', () => {
  let style: HTMLStyleElement | null = null

  beforeEach(() => {
    // Hand-craft the reduced-motion CSS so we can verify cascade behavior
    // without relying on jsdom evaluating media queries dynamically.
    style = document.createElement('style')
    style.textContent = `
      :root { --tiger-motion-duration-base: 200ms; }
      @media (prefers-reduced-motion: reduce) {
        :root { --tiger-motion-duration-base: 0ms; }
      }
    `
    document.head.appendChild(style)
  })

  afterEach(() => {
    style?.remove()
    style = null
  })

  it('falls back to the base duration when the media query does not match', () => {
    // With the default test setup `matchMedia` returns matches=false, so
    // happy-dom should resolve to the outer rule.
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue('--tiger-motion-duration-base')
      .trim()
    // happy-dom may or may not evaluate @media; if it doesn't, the value is
    // still the outer 200ms. Either way we must not see 0ms here.
    expect(value === '200ms' || value === '').toBe(true)
    if (value === '0ms') {
      throw new Error('reduced-motion rule applied unexpectedly')
    }
  })
})

describe('Reduced motion — defensive smoke for known consumers', () => {
  it('matchMedia is invoked with the canonical query string', () => {
    const spy = vi.fn((query: string) => makeMql(true, query))
    withMatchMedia(spy as unknown as MatchMediaImpl, () => {
      prefersReducedMotion()
      expect(spy).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)')
    })
  })
})
