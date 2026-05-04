/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { render as renderReact, screen as reactScreen } from '@testing-library/react'
import { render as renderVue, screen as vueScreen } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { createTigercatPlugin, MODERN_OVERRIDE_TOKENS_LIGHT } from '@expcat/tigercat-core'
import {
  Button as ReactButton,
  Card as ReactCard,
  Input as ReactInput
} from '@expcat/tigercat-react'
import { Button as VueButton, Card as VueCard, Input as VueInput } from '@expcat/tigercat-vue'

type CssBlock = Record<string, string>
type AddBaseFn = (rule: Record<string, unknown>) => void
type PluginCallback = (api: { addBase: AddBaseFn }) => void
type PluginInstance = { handler: PluginCallback }

function captureRules(plugin: PluginInstance | { handler?: PluginCallback }) {
  const rules: Record<string, CssBlock | Record<string, CssBlock>> = {}
  const addBase: AddBaseFn = (rule) => {
    for (const [selector, body] of Object.entries(rule)) {
      rules[selector] = body as CssBlock | Record<string, CssBlock>
    }
  }

  const handler = (plugin as PluginInstance).handler
  if (typeof handler === 'function') {
    handler({ addBase })
  }

  return rules
}

function blockToCss(block: CssBlock): string {
  return Object.entries(block)
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ')
}

function rulesToCssText(rules: Record<string, CssBlock | Record<string, CssBlock>>): string {
  const css: string[] = []

  for (const [selector, body] of Object.entries(rules)) {
    if (selector.startsWith('@media')) {
      const innerCss = Object.entries(body as Record<string, CssBlock>)
        .map(([innerSelector, declarations]) => `${innerSelector} { ${blockToCss(declarations)} }`)
        .join(' ')
      css.push(`${selector} { ${innerCss} }`)
    } else {
      css.push(`${selector} { ${blockToCss(body as CssBlock)} }`)
    }
  }

  return css.join('\n')
}

function injectModernStyle(): HTMLStyleElement {
  const style = document.createElement('style')
  style.id = 'tigercat-modern-style-components-test'
  style.textContent = rulesToCssText(captureRules(createTigercatPlugin({ modern: true })))
  document.head.appendChild(style)
  return style
}

function expectModernScope(element: HTMLElement): void {
  const styles = getComputedStyle(element)

  expect(styles.getPropertyValue('--tiger-radius-md').trim()).toBe(
    MODERN_OVERRIDE_TOKENS_LIGHT['--tiger-radius-md']
  )
  expect(styles.getPropertyValue('--tiger-radius-lg').trim()).toBe(
    MODERN_OVERRIDE_TOKENS_LIGHT['--tiger-radius-lg']
  )
  expect(styles.getPropertyValue('--tiger-transition-base').trim()).toBe(
    'all 200ms cubic-bezier(0.2, 0, 0, 1)'
  )
}

function expectButtonModernClasses(button: HTMLElement): void {
  expect(button.className).toContain('rounded-[var(--tiger-radius-md,0.5rem)]')
  expect(button.className).toContain('[transition:var(--tiger-transition-base')
  expect(button.className).toContain('bg-[var(--tiger-primary,#2563eb)]')
}

function expectInputModernClasses(input: HTMLElement): void {
  expect(input.className).toContain('rounded-[var(--tiger-radius-md,0.5rem)]')
  expect(input.className).toContain('bg-[var(--tiger-surface,#ffffff)]')
  expect(input.className).toContain('border-[var(--tiger-border,#e5e7eb)]')
}

function expectCardModernClasses(card: HTMLElement): void {
  expect(card.className).toContain('rounded-[var(--tiger-radius-lg,0.75rem)]')
  expect(card.className).toContain('bg-[var(--tiger-surface,#ffffff)]')
  expect(card.className).toContain('border-[var(--tiger-border,#e5e7eb)]')
}

describe('modern style component regression', () => {
  let styleEl: HTMLStyleElement | null = null

  beforeEach(() => {
    styleEl = injectModernStyle()
  })

  afterEach(() => {
    styleEl?.remove()
    styleEl = null
  })

  it('triggers modern tokens for React Button, Input and Card class consumption', () => {
    renderReact(
      <div data-tiger-style="modern" data-testid="modern-react-scope">
        <ReactButton>Modern React button</ReactButton>
        <ReactInput aria-label="modern react input" placeholder="Modern input" />
        <ReactCard data-testid="modern-react-card" variant="elevated" hoverable={true}>
          Modern React card
        </ReactCard>
      </div>
    )

    const scope = reactScreen.getByTestId('modern-react-scope')
    const button = reactScreen.getByRole('button', { name: 'Modern React button' })
    const input = reactScreen.getByLabelText('modern react input')
    const card = reactScreen.getByTestId('modern-react-card')

    expectModernScope(scope)
    expectButtonModernClasses(button)
    expectInputModernClasses(input)
    expectCardModernClasses(card)
  })

  it('triggers modern tokens for Vue Button, Input and Card class consumption', () => {
    const Demo = defineComponent({
      setup() {
        return () =>
          h('div', { 'data-tiger-style': 'modern', 'data-testid': 'modern-vue-scope' }, [
            h(VueButton, null, { default: () => 'Modern Vue button' }),
            h(VueInput, { 'aria-label': 'modern vue input', placeholder: 'Modern input' }),
            h(
              VueCard,
              { variant: 'elevated', hoverable: true, 'data-testid': 'modern-vue-card' },
              { default: () => 'Modern Vue card' }
            )
          ])
      }
    })

    renderVue(Demo)
    const scope = vueScreen.getByTestId('modern-vue-scope')
    const button = vueScreen.getByRole('button', { name: 'Modern Vue button' })
    const input = vueScreen.getByLabelText('modern vue input')
    const card = vueScreen.getByTestId('modern-vue-card')

    expectModernScope(scope)
    expectButtonModernClasses(button)
    expectInputModernClasses(input)
    expectCardModernClasses(card)
  })
})
