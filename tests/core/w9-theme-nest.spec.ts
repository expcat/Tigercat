/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, expect, it } from 'vitest'
import { resolveAnchoredOverlayTarget } from '@expcat/tigercat-core'
import {
  createTigerThemeScope,
  nearestThemeRoot,
  themeConfigOwnCssVars,
  THEME_TRANSITION_PROPERTIES
} from '../../packages/core/src/themes/manager'
import { minimalTheme } from '../../packages/core/src/themes/minimal/theme'
import { modernTheme } from '../../packages/core/src/themes/modern/theme'

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
    const childScopeId = child.getAttribute('data-tiger-theme-scope')
    const childCss =
      document.head.querySelector(`style[data-tiger-theme-style="${childScopeId}"]`)?.textContent ??
      ''
    expect(childCss).toContain(`--tiger-primary:${minimalTheme.light.colors?.primary}`)
    expect(childCss).toContain('background-color:var(--tiger-surface)')
    expect(childCss).toContain('color:var(--tiger-text)')
    expect(themeConfigOwnCssVars(minimalTheme.light)).not.toHaveProperty('--tiger-font-family')

    childScope.dispose()
    parentScope.dispose()
  })

  it('derives nested transition shorthands for the motion durations a layer sets', () => {
    const vars = themeConfigOwnCssVars(modernTheme.light)
    expect(vars['--tiger-transition-quick']).toBe(
      `${THEME_TRANSITION_PROPERTIES} 150ms cubic-bezier(0.2, 0, 0, 1)`
    )
    expect(vars['--tiger-transition-base']).toBe(
      `${THEME_TRANSITION_PROPERTIES} 200ms cubic-bezier(0.2, 0, 0, 1)`
    )
    // Unset duration keys keep inheriting the parent shorthand.
    expect(themeConfigOwnCssVars({ motion: { durationBase: '240ms' } })).not.toHaveProperty(
      '--tiger-transition-quick'
    )
    // A layer without its own easing composes against the inherited easing variable.
    expect(
      themeConfigOwnCssVars({ motion: { durationBase: '240ms' } })['--tiger-transition-base']
    ).toBe(`${THEME_TRANSITION_PROPERTIES} 240ms var(--tiger-motion-ease-standard)`)
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
