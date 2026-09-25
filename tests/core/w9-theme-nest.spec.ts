/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, expect, it } from 'vitest'
import { resolveAnchoredOverlayTarget } from '@expcat/tigercat-core'
import {
  createTigerThemeScope,
  nearestThemeRoot,
  themeConfigOwnCssVars
} from '../../packages/core/src/themes/manager'
import { minimalTheme } from '../../packages/core/src/themes/minimal/theme'

describe('nested theme roots', () => {
  afterEach(() => {
    document.body.replaceChildren()
    document.head.querySelectorAll('style[data-tiger-theme-style]').forEach((node) => node.remove())
  })

  it('finds the nearest theme root and keeps parent variables', () => {
    const parent = document.createElement('div')
    const child = document.createElement('div')
    const leaf = document.createElement('span')
    parent.append(child)
    child.append(leaf)
    document.body.append(parent)

    const parentScope = createTigerThemeScope({ root: parent, theme: 'default' })
    parentScope.apply()
    parent.style.setProperty('--tiger-font-family', 'ParentFont')

    const childScope = createTigerThemeScope({
      root: child,
      nested: true,
      theme: 'minimal'
    })
    childScope.apply()

    expect(nearestThemeRoot(leaf)).toBe(child)
    expect(nearestThemeRoot(parent)).toBe(parent)
    expect(parent.style.getPropertyValue('--tiger-font-family')).toBe('ParentFont')
    expect(child.style.getPropertyValue('--tiger-font-family')).toBe('')
    expect(child.style.getPropertyValue('--tiger-primary')).toBe(minimalTheme.light.colors?.primary)
    const css = document.head.querySelector('style[data-tiger-theme-style]')?.textContent ?? ''
    expect(css).toContain('background-color:var(--tiger-surface)')
    expect(css).toContain('color:var(--tiger-text)')
    expect(themeConfigOwnCssVars(minimalTheme.light)).not.toHaveProperty('--tiger-font-family')

    childScope.dispose()
    parentScope.dispose()
  })

  it('sends a portal to the nearest theme root instead of documentElement', () => {
    const theme = document.createElement('section')
    theme.setAttribute('data-tiger-theme-scope', 'nested')
    const button = document.createElement('button')
    theme.append(button)
    document.body.append(theme)

    expect(resolveAnchoredOverlayTarget(button)).toBe(theme)
    expect(resolveAnchoredOverlayTarget(button)).not.toBe(document.documentElement)
  })
})
