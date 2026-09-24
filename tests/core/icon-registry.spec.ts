/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, it, expect } from 'vitest'
import {
  iconRegistry,
  iconNames,
  createIconRegistry,
  getIconDefinition,
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
    expect(iconNames).toContain('dashboard')
    expect(iconNames).toContain('users')
    expect(iconNames).toContain('fullscreen')
    expect(iconNames).toContain('ticket')
    expect(iconNames).toContain('bolt')
    expect(iconNames).toContain('database')
    expect(iconNames).toContain('chart-bar')
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

  it('registers application-level names without overwriting built-ins', () => {
    const registry = createIconRegistry()
    const custom = { viewBox: '0 0 24 24', paths: ['M4 4h16v16H4z'], mode: 'stroke' as const }
    registry.register('ticket-custom', custom)
    expect(getIconDefinition('ticket-custom', registry)).toEqual(custom)
    registry.register('close', custom)
    expect(getIconDefinition('close', registry)).toBe(iconRegistry.close)
    registry.unregister('ticket-custom')
    expect(getIconDefinition('ticket-custom', registry)).toBeUndefined()
    registry.dispose()
    expect(registry.customNames()).toEqual([])
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

  it('puts custom spacing on the body class', () => {
    const cls = getDrawerBodyClasses('p-0', false)
    expect(cls).toContain('p-0')
    expect(cls).not.toContain('px-6')
  })

  it('merges a custom body class', () => {
    expect(getDrawerBodyClasses('custom-body')).toContain('custom-body')
  })
})
