/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { h } from 'vue'
import { ButtonGroup, Button } from '@expcat/tigercat-vue'
import { expectNoA11yViolations } from '../utils'

describe('ButtonGroup', () => {
  describe('rendering', () => {
    it('renders children buttons', () => {
      render(ButtonGroup, {
        slots: {
          default: () => [
            h(Button, null, () => 'A'),
            h(Button, null, () => 'B'),
            h(Button, null, () => 'C')
          ]
        }
      })
      expect(screen.getByText('A')).toBeTruthy()
      expect(screen.getByText('B')).toBeTruthy()
      expect(screen.getByText('C')).toBeTruthy()
    })

    it('renders with role="group"', () => {
      const { container } = render(ButtonGroup, {
        slots: { default: () => h(Button, null, () => 'Ok') }
      })
      expect(container.querySelector('[role="group"]')).toBeTruthy()
    })

    it('renders as a div element', () => {
      const { container } = render(ButtonGroup, {
        slots: { default: () => 'content' }
      })
      expect(container.firstElementChild!.tagName).toBe('DIV')
    })
  })

  describe('layout', () => {
    it('applies horizontal classes by default', () => {
      const { container } = render(ButtonGroup, {
        slots: { default: () => 'content' }
      })
      const el = container.firstElementChild!
      expect(el.className).toContain('flex-row')
      expect(el.className).not.toContain('flex-col')
    })

    it('applies vertical classes when vertical prop is true', () => {
      const { container } = render(ButtonGroup, {
        props: { vertical: true },
        slots: { default: () => 'content' }
      })
      const el = container.firstElementChild!
      expect(el.className).toContain('flex-col')
    })

    it('applies base inline-flex class', () => {
      const { container } = render(ButtonGroup, {
        slots: { default: () => 'content' }
      })
      expect(container.firstElementChild!.className).toContain('inline-flex')
    })
  })

  describe('size', () => {
    it('accepts size prop without error', () => {
      const { container } = render(ButtonGroup, {
        props: { size: 'sm' },
        slots: { default: () => h(Button, null, () => 'Small') }
      })
      expect(container.firstElementChild).toBeTruthy()
    })

    it('accepts lg size', () => {
      const { container } = render(ButtonGroup, {
        props: { size: 'lg' },
        slots: { default: () => h(Button, null, () => 'Large') }
      })
      expect(container.firstElementChild).toBeTruthy()
    })
  })

  describe('className', () => {
    it('merges custom className', () => {
      const { container } = render(ButtonGroup, {
        props: { className: 'my-group' },
        slots: { default: () => 'content' }
      })
      expect(container.firstElementChild!.className).toContain('my-group')
    })

    it('merges attrs.class', () => {
      const { container } = render(ButtonGroup, {
        attrs: { class: 'extra-class' },
        slots: { default: () => 'content' }
      })
      expect(container.firstElementChild!.className).toContain('extra-class')
    })
  })

  describe('attrs passthrough', () => {
    it('passes data attributes', () => {
      const { container } = render(ButtonGroup, {
        attrs: { 'data-testid': 'my-group', 'aria-label': 'Actions' },
        slots: { default: () => 'content' }
      })
      const el = container.firstElementChild!
      expect(el.getAttribute('data-testid')).toBe('my-group')
      expect(el.getAttribute('aria-label')).toBe('Actions')
    })
  })

  describe('a11y', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(ButtonGroup, {
        attrs: { 'aria-label': 'Button group' },
        slots: {
          default: () => [h(Button, null, () => 'A'), h(Button, null, () => 'B')]
        }
      })
      await expectNoA11yViolations(container)
    })
  })
})
