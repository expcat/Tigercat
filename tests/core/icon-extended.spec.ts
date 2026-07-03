/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { iconNames, extendedIcons, rocketIcon, gridIcon, chartPieIcon } from '@expcat/tigercat-core'

describe('extended icons', () => {
  it('exposes standalone stroke definitions usable via the Icon `icon` prop', () => {
    expect(Object.keys(extendedIcons).length).toBeGreaterThan(50)
    for (const def of [rocketIcon, gridIcon, extendedIcons['sort-ascending']]) {
      expect(def.viewBox).toBe('0 0 24 24')
      expect(def.mode).toBe('stroke')
      expect(def.paths.length).toBeGreaterThan(0)
    }
    // Multi-path glyph survives the definition shape.
    expect(chartPieIcon.paths.length).toBe(2)
  })

  it('maps record keys to the same exported constants', () => {
    expect(extendedIcons.rocket).toBe(rocketIcon)
    expect(extendedIcons.grid).toBe(gridIcon)
    expect(extendedIcons['chart-pie']).toBe(chartPieIcon)
  })

  it('stays out of the global registry so component bundles keep their size', () => {
    for (const name of ['grid', 'rocket', 'sort-ascending', 'cart', 'play']) {
      expect(iconNames).not.toContain(name)
    }
  })
})
