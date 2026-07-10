/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { h } from 'vue'
import { render, screen } from '@testing-library/vue'
import { InputGroup, InputGroupAddon, Input, Textarea, InputNumber } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

describe('InputGroup', () => {
  it('renders with role="group"', () => {
    render(InputGroup, {
      slots: { default: 'content' }
    })
    expect(screen.getByRole('group')).toBeInTheDocument()
  })
  it('applies compact mode classes', () => {
    render(InputGroup, {
      props: { compact: true },
      slots: { default: 'content' }
    })
    const group = screen.getByRole('group')
    expect(group.className).toContain('rounded-none')
  })
  it('merges custom className', () => {
    render(InputGroup, {
      props: { className: 'my-custom-class' },
      slots: { default: 'content' }
    })
    const group = screen.getByRole('group')
    expect(group.className).toContain('my-custom-class')
  })

  it('passes through HTML attributes', () => {
    render(InputGroup, {
      attrs: { 'data-testid': 'my-group', id: 'test-group' },
      slots: { default: 'content' }
    })
    expect(screen.getByTestId('my-group')).toBeInTheDocument()
    expect(screen.getByTestId('my-group').id).toBe('test-group')
  })
  it('passes size to child inputs that do not set their own size', () => {
    const { getByLabelText } = render(InputGroup, {
      props: { size: 'lg' },
      slots: {
        default: () => [
          h(Input, { 'aria-label': 'plain input' }),
          h(Textarea, { 'aria-label': 'plain textarea' }),
          h(InputNumber, { 'aria-label': 'plain number' })
        ]
      }
    })

    expect(getByLabelText('plain input').className).toContain('py-3')
    expect(getByLabelText('plain textarea').className).toContain('py-3')
    expect(screen.getByRole('spinbutton').className).toContain('text-lg')
  })
})

describe('InputGroupAddon', () => {
  it('renders addon content', () => {
    render(InputGroupAddon, {
      slots: { default: '@' }
    })
    expect(screen.getByText('@')).toBeInTheDocument()
  })
  describe('a11y', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(InputGroup, {
        slots: { default: 'content' }
      })
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {})
})
