/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, afterEach } from 'vitest'
import { createElement } from 'react'
import { render } from '@testing-library/react'
import { ChatWindow } from '@expcat/tigercat-react/ChatWindow'
import { createTigerThemeScope, defaultTheme, modernTheme } from '@expcat/tigercat-core'
import { createTigercatPlugin } from '../../packages/core/src/tailwind-plugin'

type CssBlock = Record<string, string>
type AddBaseFn = (rule: Record<string, unknown>) => void
type PluginCallback = (api: { addBase: AddBaseFn }) => void
type PluginInstance = { handler: PluginCallback }

function captureRules(p: PluginInstance) {
  const rules: Record<string, CssBlock> = {}
  p.handler({
    addBase: (rule) => {
      for (const [selector, body] of Object.entries(rule)) {
        if (!selector.startsWith('@') && body && typeof body === 'object') {
          rules[selector] = body as CssBlock
        }
      }
    }
  })
  return rules
}

describe('Modern theme preset application', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('style')
    document.documentElement.removeAttribute('data-tiger-theme')
    document.documentElement.removeAttribute('data-tiger-theme-scope')
    document.documentElement.classList.remove('dark')
    document.querySelectorAll('style[data-tiger-theme-style]').forEach((node) => node.remove())
  })

  it('default plugin :root stays on the default preset', () => {
    const rules = captureRules(createTigercatPlugin() as PluginInstance)
    expect(rules[':root']?.['--tiger-radius-md']).toBe(defaultTheme.light.radius?.md)
    expect(rules['[data-tiger-style="modern"]']).toBeUndefined()
  })

  it('preset option writes modern radius at :root', () => {
    const rules = captureRules(createTigercatPlugin({ preset: modernTheme }) as PluginInstance)
    expect(rules[':root']?.['--tiger-radius-md']).toBe('12px')
    expect(rules[':root']?.['--tiger-radius-lg']).toBe('16px')
  })

  it('setTheme("modern") writes the preset on the document and dispose restores it', () => {
    const scope = createTigerThemeScope()
    scope.setTheme('modern')
    expect(document.documentElement.getAttribute('data-tiger-theme')).toBe('modern')
    expect(document.documentElement.style.getPropertyValue('--tiger-radius-md').trim()).toBe('12px')
    expect(document.documentElement.getAttribute('data-tiger-style')).toBeNull()

    scope.setTheme('default')
    expect(document.documentElement.getAttribute('data-tiger-theme')).toBe('default')
    expect(document.documentElement.style.getPropertyValue('--tiger-radius-md').trim()).toBe(
      defaultTheme.light.radius?.md
    )
    scope.dispose()
  })
})

describe('Modern theme — component class consumption stays token-stable', () => {
  it('component class strings keep referencing var(--tiger-radius-md)', () => {
    const { container } = render(createElement(ChatWindow, { messages: [] }))
    const root = container.querySelector('.tiger-chat-window') as HTMLElement
    expect(root).toBeTruthy()
    expect(root.className).toContain('rounded-[var(--tiger-radius-md)]')
    expect(root.className).not.toContain('data-tiger-style')
  })
})
