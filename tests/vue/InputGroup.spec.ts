/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { h } from 'vue'
import { render, screen } from '@testing-library/vue'
import { Input } from '@expcat/tigercat-vue/Input'
import { InputGroup, InputGroupAddon } from '@expcat/tigercat-vue/InputGroup'
import { InputNumber } from '@expcat/tigercat-vue/InputNumber'
import { Textarea } from '@expcat/tigercat-vue/Textarea'
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

  it('uses focus-within so nested field focus raises compact z-index', () => {
    render(InputGroup, {
      props: { compact: true },
      slots: { default: 'content' }
    })
    const group = screen.getByRole('group')
    expect(group.className).toContain('focus-within')
    expect(group.className).not.toContain('[&>*:focus]:z-10')
  })

  it('joins compact Input chrome on the group-child root, not a nested capsule', () => {
    render(InputGroup, {
      props: { compact: true },
      slots: {
        default: () => [h(Input, { 'aria-label': 'q' }), h('button', { type: 'button' }, 'Go')]
      }
    })
    const group = screen.getByRole('group')
    const first = group.firstElementChild as HTMLElement
    const last = group.lastElementChild as HTMLElement
    const input = screen.getByLabelText('q')

    expect(group.className).toContain(':first-child:not(:last-child)')
    expect(group.className).toContain(':last-child:not(:first-child)')
    expect(first).toBe(input.parentElement)
    expect(first.className).toContain('border')
    expect(first.className).toContain('rounded-[var(--tiger-radius-md')
    expect(input.className).not.toContain('rounded-[var(--tiger-radius-md')
    expect(last.tagName).toBe('BUTTON')
    expect(last).toBe(group.lastElementChild)
  })

  it('makes compact Textarea the chrome group child when showCount is off', () => {
    render(InputGroup, {
      props: { compact: true },
      slots: {
        default: () => [
          h(Textarea, { 'aria-label': 'notes' }),
          h('button', { type: 'button' }, 'Go')
        ]
      }
    })
    const group = screen.getByRole('group')
    const textarea = screen.getByLabelText('notes')
    expect(group.firstElementChild).toBe(textarea)
    expect(textarea.className).toContain('border')
    expect(textarea.className).toContain('rounded-[var(--tiger-radius-md')
    expect(textarea.parentElement).toBe(group)
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
})
