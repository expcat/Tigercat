/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { h } from 'vue'
import { Kbd } from '@expcat/tigercat-vue/Kbd'
import { expectNoA11yViolationsIsolated } from '../utils'

function getRoot(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-kbd]') as HTMLElement
}

describe('Kbd', () => {
  describe('Rendering', () => {
    it('renders a native kbd element with slot content', () => {
      const { container } = render(Kbd, { slots: { default: 'Esc' } })
      const root = getRoot(container)
      expect(root.tagName).toBe('KBD')
      expect(root).toHaveTextContent('Esc')
      expect(root.getAttribute('role')).toBeNull()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('renders a single key from the keys string prop', () => {
      const { container } = render(Kbd, { props: { keys: 'Enter' } })
      expect(getRoot(container)).toHaveTextContent('Enter')
      expect(getRoot(container).querySelector('[data-kbd-key]')).toHaveTextContent('Enter')
    })

    it('renders a readable combo from the keys array', () => {
      const { container } = render(Kbd, { props: { keys: ['Ctrl', 'K'] } })
      const root = getRoot(container)
      expect(root).toHaveTextContent('Ctrl + K')
      const keyLabels = [...root.querySelectorAll('[data-kbd-key]')].map((node) => node.textContent)
      expect(keyLabels).toEqual(['Ctrl', 'K'])
      expect(root.querySelectorAll('kbd[data-kbd-key]')).toHaveLength(2)
    })

    it('appends the default slot after keys', () => {
      const { container } = render(Kbd, {
        props: { keys: ['Ctrl'] },
        slots: { default: 'K' }
      })
      expect(getRoot(container)).toHaveTextContent('Ctrl + K')
    })
  })

  describe('separator', () => {
    it('uses a custom separator between combo keys', () => {
      const { container } = render(Kbd, {
        props: { keys: ['Alt', 'Tab'], separator: 'then' }
      })
      expect(getRoot(container)).toHaveTextContent('Alt then Tab')
    })
  })

  describe('size and variant', () => {
    it.each(['sm', 'md', 'lg'] as const)('renders size="%s"', (size) => {
      const { container } = render(Kbd, {
        props: { size },
        slots: { default: size }
      })
      expect(getRoot(container)).toHaveAttribute('data-kbd-size', size)
    })

    it('renders the subtle variant without becoming interactive', () => {
      const { container } = render(Kbd, {
        props: { variant: 'subtle', keys: ['Ctrl', 'S'] }
      })
      const root = getRoot(container)
      expect(root).toHaveAttribute('data-kbd-variant', 'subtle')
      expect(root.getAttribute('role')).toBeNull()
      expect(root.tabIndex).toBe(-1)
    })
  })

  describe('attrs integration', () => {
    it('merges attrs class, className, and style onto the root kbd', () => {
      const { container } = render(Kbd, {
        props: { className: 'from-prop', style: { color: 'red' } },
        attrs: { class: 'from-attr', id: 'shortcut' },
        slots: { default: 'K' }
      })
      const root = getRoot(container)
      expect(root.id).toBe('shortcut')
      expect(root.className).toContain('from-prop')
      expect(root.className).toContain('from-attr')
      expect(root.className).toContain('tiger-kbd')
      expect(root.style.color).toBe('red')
    })

    it('forwards native attributes', () => {
      const { container } = render(Kbd, {
        attrs: { title: 'Escape', 'aria-label': 'Escape key' },
        slots: { default: 'Esc' }
      })
      const root = getRoot(container)
      expect(root).toHaveAttribute('title', 'Escape')
      expect(root).toHaveAttribute('aria-label', 'Escape key')
    })
  })

  describe('a11y', () => {
    it('exposes native kbd semantics without interactive roles', async () => {
      const { container } = render(Kbd, {
        props: { keys: ['Ctrl', 'K'] }
      })
      const root = getRoot(container)
      expect(root.tagName).toBe('KBD')
      expect(root.querySelector('[role]')).toBeNull()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
      await expectNoA11yViolationsIsolated(container)
    })

    it('passes a11y checks for slot content and the subtle variant', async () => {
      const { container } = render({
        render: () =>
          h('div', [
            h(Kbd, null, { default: () => 'Esc' }),
            h(Kbd, { variant: 'subtle', keys: ['Shift', 'Enter'] })
          ])
      })
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('boundary', () => {
    it('renders an empty kbd when keys and slot are both empty', () => {
      const { container } = render(Kbd, { props: { keys: [] } })
      const root = getRoot(container)
      expect(root.tagName).toBe('KBD')
      expect(root.textContent).toBe('')
    })

    it('renders special characters as text, not HTML', () => {
      const { container } = render(Kbd, { props: { keys: ['<Ctrl>', '&'] } })
      const root = getRoot(container)
      expect(root).toHaveTextContent('<Ctrl> + &')
      expect(root.innerHTML).not.toContain('<ctrl>')
    })

    it('ignores blank keys in a combo', () => {
      const { container } = render(Kbd, { props: { keys: ['', '  ', 'S'] } })
      expect(getRoot(container)).toHaveTextContent('S')
      expect(getRoot(container).querySelectorAll('[data-kbd-key]')).toHaveLength(1)
    })
  })
})
