/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { render as renderReact, screen as reactScreen } from '@testing-library/react'
import { render as renderVue, screen as vueScreen } from '@testing-library/vue'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import { createTigerThemeScope, modernTheme } from '@expcat/tigercat-core'
import { Button as ReactButton } from '@expcat/tigercat-react/Button'
import { Card as ReactCard } from '@expcat/tigercat-react/Card'
import { Input as ReactInput } from '@expcat/tigercat-react/Input'
import { Button as VueButton } from '@expcat/tigercat-vue/Button'
import { Card as VueCard } from '@expcat/tigercat-vue/Card'
import { Input as VueInput } from '@expcat/tigercat-vue/Input'

function expectModernScope(element: HTMLElement): void {
  const scope = createTigerThemeScope({ root: element })
  scope.setTheme('modern')
  expect(element.getAttribute('data-tiger-theme')).toBe('modern')
  expect(element.style.getPropertyValue('--tiger-radius-md').trim()).toBe(modernTheme.light.radius?.md)
  expect(element.style.getPropertyValue('--tiger-radius-lg').trim()).toBe(modernTheme.light.radius?.lg)
  expect(element.style.getPropertyValue('--tiger-transition-base')).toContain('200ms')
  expect(element.style.getPropertyValue('--tiger-transition-base')).not.toContain('all ')
  expect(element.getAttribute('data-tiger-style')).toBeNull()
  scope.dispose()
}

function expectButtonModernClasses(button: HTMLElement): void {
  expect(button.className).toContain('rounded-[var(--tiger-radius-md)]')
  expect(button.className).toContain('[transition:var(--tiger-transition-base')
  expect(button.className).toContain('bg-[var(--tiger-primary)]')
}

function expectInputModernClasses(input: HTMLElement): void {
  const chrome = input.parentElement
  expect(chrome).not.toBeNull()
  expect(chrome!.className).toContain('rounded-[var(--tiger-radius-md)]')
  expect(chrome!.className).toContain('bg-[var(--tiger-surface)]')
  expect(chrome!.className).toContain('border-[var(--tiger-border)]')
  expect(input.className).not.toContain('rounded-[var(--tiger-radius-md)]')
  expect(input.className).not.toContain('bg-[var(--tiger-surface)]')
  expect(input.className).not.toContain('border-[var(--tiger-border)]')
}

function expectCardModernClasses(card: HTMLElement): void {
  expect(card.className).toContain('rounded-[var(--tiger-radius-lg)]')
  expect(card.className).toContain('bg-[var(--tiger-surface)]')
  expect(card.className).toContain('border-[var(--tiger-border)]')
}

describe('modern style component regression', () => {
  afterEach(() => {
    document.querySelectorAll('style[data-tiger-theme-style]').forEach((node) => node.remove())
  })

  it('triggers modern tokens for React Button, Input and Card class consumption', () => {
    renderReact(
      <div data-testid="modern-react-scope">
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
          h('div', { 'data-testid': 'modern-vue-scope' }, [
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
