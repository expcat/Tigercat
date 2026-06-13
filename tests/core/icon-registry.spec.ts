/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import {
  iconRegistry,
  iconNames,
  getIconDefinition,
  resolveCardPadding,
  getDrawerBodyClasses
} from '@expcat/tigercat-core'

describe('icon registry', () => {
  it('exposes built-in icon names', () => {
    expect(iconNames.length).toBeGreaterThan(20)
    expect(iconNames).toContain('check')
    expect(iconNames).toContain('close')
    expect(iconNames).toContain('search')
    // Common application glyphs added for app-shell usage.
    expect(iconNames).toContain('home')
    expect(iconNames).toContain('bell')
    expect(iconNames).toContain('logout')
    expect(iconNames).toContain('map-pin')
  })

  it('supports multi-path glyphs (map-pin pin + dot)', () => {
    expect(getIconDefinition('map-pin')?.paths.length).toBe(2)
  })

  it('every definition has a viewBox, at least one path, and a render mode', () => {
    for (const name of iconNames) {
      const def = iconRegistry[name]
      expect(def.viewBox).toMatch(/^0 0 \d+ \d+$/)
      expect(def.paths.length).toBeGreaterThan(0)
      expect(def.paths.every((d) => typeof d === 'string' && d.length > 0)).toBe(true)
      expect(['stroke', 'fill']).toContain(def.mode)
    }
  })

  it('getIconDefinition returns a definition for known names', () => {
    expect(getIconDefinition('check')).toBe(iconRegistry.check)
  })

  it('getIconDefinition returns undefined for unknown names', () => {
    expect(getIconDefinition('definitely-not-an-icon')).toBeUndefined()
  })
})

describe('resolveCardPadding', () => {
  it('returns the size-based padding by default', () => {
    expect(resolveCardPadding('sm', undefined)).toBe('p-3')
    expect(resolveCardPadding('md', undefined)).toBe('p-4')
    expect(resolveCardPadding('lg', undefined)).toBe('p-6')
    expect(resolveCardPadding('md', true)).toBe('p-4')
  })

  it('returns undefined when padding is false', () => {
    expect(resolveCardPadding('md', false)).toBeUndefined()
  })

  it('returns a custom padding class when provided', () => {
    expect(resolveCardPadding('md', 'p-8')).toBe('p-8')
  })
})

describe('getDrawerBodyClasses bodyPadding', () => {
  it('uses the default padding when unset', () => {
    expect(getDrawerBodyClasses()).toContain('px-6 py-4')
  })

  it('removes padding when false', () => {
    const cls = getDrawerBodyClasses(undefined, false)
    expect(cls).not.toContain('px-6')
    expect(cls).not.toContain('py-4')
  })

  it('applies a custom padding class', () => {
    expect(getDrawerBodyClasses(undefined, 'p-0')).toContain('p-0')
  })

  it('merges a custom body class', () => {
    expect(getDrawerBodyClasses('custom-body')).toContain('custom-body')
  })
})
