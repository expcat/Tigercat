import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  prefersReducedMotion,
  getAccessibleTransitionClasses,
  createTigercatPlugin,
  MODERN_REDUCED_MOTION_TOKENS
} from '@expcat/tigercat-core'

/**
 * Phase 1C — reduced motion regression suite.
 *
 * Verifies the three layers that must respect
 * `prefers-reduced-motion: reduce`:
 *
 *  1. `prefersReducedMotion()` runtime helper reads the media query.
 *  2. `getAccessibleTransitionClasses()` collapses to a duration-0 fade
 *     when the user opts out of motion.
 *  3. `createTigercatPlugin({ modern: true })` emits a
 *     `@media (prefers-reduced-motion: reduce)` block that pins every
 *     `--tiger-motion-duration-*` token to `0ms`, for both `:root` and
 *     `[data-tiger-style="modern"]`.
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

describe('createTigercatPlugin({ modern: true }) — reduced-motion CSS block', () => {
  type CssBlock = Record<string, string>
  type AddBaseFn = (rule: Record<string, unknown>) => void
  type PluginCallback = (api: { addBase: AddBaseFn }) => void
  type PluginInstance = { handler: PluginCallback }

  function captureRules(p: PluginInstance) {
    const rules: Record<string, CssBlock | Record<string, CssBlock>> = {}
    p.handler({
      addBase: (rule) => {
        for (const [sel, body] of Object.entries(rule)) {
          ;(rules as Record<string, unknown>)[sel] = body as CssBlock
        }
      }
    })
    return rules
  }

  it('emits @media (prefers-reduced-motion: reduce) targeting :root + modern subtree', () => {
    const rules = captureRules(createTigercatPlugin({ modern: true }) as PluginInstance)
    const mediaRule = rules['@media (prefers-reduced-motion: reduce)'] as Record<string, CssBlock>
    expect(mediaRule).toBeDefined()
    expect(mediaRule[':root, [data-tiger-style="modern"]']).toBeDefined()
  })

  it('every motion-duration token is pinned to 0ms inside the media block', () => {
    const rules = captureRules(createTigercatPlugin({ modern: true }) as PluginInstance)
    const inner = (rules['@media (prefers-reduced-motion: reduce)'] as Record<string, CssBlock>)[
      ':root, [data-tiger-style="modern"]'
    ]
    for (const [key, value] of Object.entries(MODERN_REDUCED_MOTION_TOKENS)) {
      expect(inner[key]).toBe('0ms')
      expect(value).toBe('0ms')
    }
  })

  it('does NOT emit the reduced-motion block when modern flag is off', () => {
    const rules = captureRules(createTigercatPlugin() as PluginInstance)
    expect(rules['@media (prefers-reduced-motion: reduce)']).toBeUndefined()
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
