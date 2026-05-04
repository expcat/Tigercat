import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  createTigercatPlugin,
  MODERN_BASE_TOKENS_LIGHT,
  MODERN_OVERRIDE_TOKENS_LIGHT,
  MODERN_OVERRIDE_TOKENS_DARK
} from '@expcat/tigercat-core'

/**
 * Phase 1C — modern theme interaction.
 *
 * These tests cover the runtime triggering path of the opt-in modern token
 * layer: with the plugin's CSS injected into the document, toggling
 * `data-tiger-style="modern"` on the documentElement must flip the value of
 * the relevant CSS custom properties that components consume via
 * `var(--tiger-radius-md, ...)` etc.
 */

type CssBlock = Record<string, string>

interface PluginCapture {
  rules: Record<string, CssBlock | { [media: string]: CssBlock }>
}

type AddBaseFn = (rule: Record<string, unknown>) => void
type PluginCallback = (api: { addBase: AddBaseFn }) => void
type PluginInstance = { handler: PluginCallback }

function captureRules(p: PluginInstance | { handler?: PluginCallback }): PluginCapture {
  const rules: PluginCapture['rules'] = {}
  const addBase: AddBaseFn = (rule) => {
    for (const [selector, body] of Object.entries(rule)) {
      // Last-write-wins to match Tailwind's addBase merge behaviour.
      ;(rules as Record<string, unknown>)[selector] = body as CssBlock
    }
  }
  const handler = (p as PluginInstance).handler
  if (typeof handler === 'function') {
    handler({ addBase })
  }
  return { rules }
}

function blockToCss(block: CssBlock): string {
  return Object.entries(block)
    .map(([k, v]) => `${k}: ${v};`)
    .join(' ')
}

function rulesToCssText(capture: PluginCapture): string {
  const out: string[] = []
  for (const [selector, body] of Object.entries(capture.rules)) {
    if (selector.startsWith('@media')) {
      const inner = body as Record<string, CssBlock>
      const innerCss = Object.entries(inner)
        .map(([sel, decls]) => `${sel} { ${blockToCss(decls)} }`)
        .join(' ')
      out.push(`${selector} { ${innerCss} }`)
    } else {
      out.push(`${selector} { ${blockToCss(body as CssBlock)} }`)
    }
  }
  return out.join('\n')
}

function injectStyle(id: string, css: string): HTMLStyleElement {
  const style = document.createElement('style')
  style.id = id
  style.textContent = css
  document.head.appendChild(style)
  return style
}

describe('Modern theme — interaction (data-tiger-style="modern")', () => {
  let styleEl: HTMLStyleElement | null = null

  beforeEach(() => {
    const capture = captureRules(createTigercatPlugin({ modern: true }) as PluginInstance)
    styleEl = injectStyle('tigercat-modern-test', rulesToCssText(capture))
  })

  afterEach(() => {
    styleEl?.remove()
    styleEl = null
    document.documentElement.removeAttribute('data-tiger-style')
    document.documentElement.classList.remove('dark')
  })

  it('without data-tiger-style, :root resolves to base (v1.0.x) token values', () => {
    const styles = getComputedStyle(document.documentElement)
    expect(styles.getPropertyValue('--tiger-radius-md').trim()).toBe(
      MODERN_BASE_TOKENS_LIGHT['--tiger-radius-md']
    )
    expect(styles.getPropertyValue('--tiger-blur-glass').trim()).toBe(
      MODERN_BASE_TOKENS_LIGHT['--tiger-blur-glass']
    )
  })

  it('setting data-tiger-style="modern" on <html> flips radius / blur / shadow tokens', () => {
    document.documentElement.setAttribute('data-tiger-style', 'modern')
    const styles = getComputedStyle(document.documentElement)
    expect(styles.getPropertyValue('--tiger-radius-md').trim()).toBe(
      MODERN_OVERRIDE_TOKENS_LIGHT['--tiger-radius-md']
    )
    expect(styles.getPropertyValue('--tiger-radius-lg').trim()).toBe(
      MODERN_OVERRIDE_TOKENS_LIGHT['--tiger-radius-lg']
    )
    expect(styles.getPropertyValue('--tiger-blur-glass').trim()).toBe(
      MODERN_OVERRIDE_TOKENS_LIGHT['--tiger-blur-glass']
    )
    expect(styles.getPropertyValue('--tiger-shadow-glass').trim()).toBe(
      MODERN_OVERRIDE_TOKENS_LIGHT['--tiger-shadow-glass']
    )
  })

  it('removing data-tiger-style restores base tokens (round-trip)', () => {
    document.documentElement.setAttribute('data-tiger-style', 'modern')
    document.documentElement.removeAttribute('data-tiger-style')
    const styles = getComputedStyle(document.documentElement)
    expect(styles.getPropertyValue('--tiger-radius-md').trim()).toBe(
      MODERN_BASE_TOKENS_LIGHT['--tiger-radius-md']
    )
  })

  it('combined .dark + data-tiger-style="modern" resolves dark override shadows', () => {
    document.documentElement.classList.add('dark')
    document.documentElement.setAttribute('data-tiger-style', 'modern')
    const styles = getComputedStyle(document.documentElement)
    expect(styles.getPropertyValue('--tiger-shadow-glass').trim()).toBe(
      MODERN_OVERRIDE_TOKENS_DARK['--tiger-shadow-glass']
    )
  })

  it('attribute selector can also activate the override on a sub-tree', () => {
    const subtree = document.createElement('div')
    subtree.setAttribute('data-tiger-style', 'modern')
    document.body.appendChild(subtree)
    try {
      const styles = getComputedStyle(subtree)
      expect(styles.getPropertyValue('--tiger-radius-md').trim()).toBe(
        MODERN_OVERRIDE_TOKENS_LIGHT['--tiger-radius-md']
      )
    } finally {
      subtree.remove()
    }
  })
})

describe('Modern theme — component class consumption stays token-stable', () => {
  beforeEach(() => {
    const capture = captureRules(createTigercatPlugin({ modern: true }) as PluginInstance)
    injectStyle('tigercat-modern-test-2', rulesToCssText(capture))
  })

  afterEach(() => {
    document.getElementById('tigercat-modern-test-2')?.remove()
    document.documentElement.removeAttribute('data-tiger-style')
  })

  it('component-side class strings keep referencing var(--tiger-radius-md, ...) regardless of style', async () => {
    const { ChatWindow } = await import('@expcat/tigercat-react')
    const { render } = await import('@testing-library/react')
    const React = await import('react')

    const { container, rerender } = render(React.createElement(ChatWindow, { messages: [] }))
    const root = container.querySelector('.tiger-chat-window') as HTMLElement
    expect(root).toBeTruthy()
    const baseClass = root.className
    expect(baseClass).toContain('rounded-[var(--tiger-radius-md,0.5rem)]')

    document.documentElement.setAttribute('data-tiger-style', 'modern')
    rerender(React.createElement(ChatWindow, { messages: [] }))
    const rootAfter = container.querySelector('.tiger-chat-window') as HTMLElement
    // Class references the same CSS variable — only the resolved value
    // changes via the cascade, not the className itself.
    expect(rootAfter.className).toBe(baseClass)
  })
})
