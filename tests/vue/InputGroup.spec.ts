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
import { expectNoA11yViolations } from '../utils'

describe('InputGroup', () => {
  it('is a group only when it has an accessible name', () => {
    const unnamed = render(InputGroup, { slots: { default: 'content' } })
    expect(screen.queryByRole('group')).toBeNull()
    unnamed.unmount()
    render(InputGroup, {
      attrs: { 'aria-label': 'Search' },
      slots: { default: 'content' }
    })
    expect(screen.getByRole('group', { name: 'Search' })).toBeInTheDocument()
  })

  it('applies compact mode classes', () => {
    render(InputGroup, {
      props: { compact: true },
      attrs: { 'aria-label': 'Compact' },
      slots: { default: 'content' }
    })
    const group = screen.getByRole('group')
    expect(group.className).toContain('rounded-none')
    expect(group.className).toContain('data-tiger-chrome')
  })

  it('merges custom className', () => {
    render(InputGroup, {
      props: { className: 'my-custom-class' },
      attrs: { 'aria-label': 'Custom' },
      slots: { default: 'content' }
    })
    expect(screen.getByRole('group').className).toContain('my-custom-class')
  })

  it('passes through HTML attributes', () => {
    render(InputGroup, {
      attrs: { 'data-testid': 'my-group', id: 'test-group', 'aria-label': 'Attrs' },
      slots: { default: 'content' }
    })
    expect(screen.getByTestId('my-group')).toBeInTheDocument()
    expect(screen.getByTestId('my-group').id).toBe('test-group')
  })

  it('passes size to child inputs that do not set their own size', () => {
    const { getByLabelText } = render(InputGroup, {
      props: { size: 'lg' },
      attrs: { 'aria-label': 'Sized' },
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
      attrs: { 'aria-label': 'Focus' },
      slots: { default: 'content' }
    })
    const group = screen.getByRole('group')
    expect(group.className).toContain('focus-within')
    expect(group.className).not.toContain('[&>*:focus]:z-10')
  })

  it('joins compact Input chrome on the group-child root, not a nested capsule', () => {
    render(InputGroup, {
      props: { compact: true },
      attrs: { 'aria-label': 'Query' },
      slots: {
        default: () => [h(Input, { 'aria-label': 'q' }), h('button', { type: 'button' }, 'Go')]
      }
    })
    const group = screen.getByRole('group')
    const first = group.firstElementChild as HTMLElement
    const last = group.lastElementChild as HTMLElement
    const input = screen.getByLabelText('q')

    expect(first).toBe(input.parentElement)
    expect(first).toHaveAttribute('data-tiger-chrome')
    expect(first.className).toContain('border')
    expect(input.className).not.toContain('rounded-[var(--tiger-radius-md')
    expect(last.tagName).toBe('BUTTON')
  })

  it('keeps compact Textarea as the chrome group child when showCount is off', () => {
    render(InputGroup, {
      props: { compact: true },
      attrs: { 'aria-label': 'Notes' },
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
    expect(textarea).toHaveAttribute('data-tiger-chrome')
    expect(textarea.parentElement).toBe(group)
  })

  it('still marks chrome when showCount wraps extras below the field', () => {
    render(InputGroup, {
      props: { compact: true },
      attrs: { 'aria-label': 'Counted' },
      slots: {
        default: () => [
          h(InputGroupAddon, null, () => 'https://'),
          h(Input, { 'aria-label': 'host', showCount: true, modelValue: 'ex' })
        ]
      }
    })
    const group = screen.getByRole('group')
    expect(group.querySelectorAll('[data-tiger-chrome]').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('2')).toBeInTheDocument()
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
        attrs: { 'aria-label': 'Search field' },
        slots: {
          default: () => h(Input, { 'aria-label': 'Search' })
        }
      })
      await expectNoA11yViolations(container)
    })
  })
})
