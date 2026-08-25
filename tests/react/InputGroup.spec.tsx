/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { Input } from '@expcat/tigercat-react/Input'
import { InputGroup, InputGroupAddon } from '@expcat/tigercat-react/InputGroup'
import { InputNumber } from '@expcat/tigercat-react/InputNumber'
import { Textarea } from '@expcat/tigercat-react/Textarea'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('InputGroup', () => {
  it('renders with role="group"', () => {
    render(<InputGroup>content</InputGroup>)
    expect(screen.getByRole('group')).toBeInTheDocument()
  })
  it('applies compact mode classes', () => {
    render(<InputGroup compact>content</InputGroup>)
    const group = screen.getByRole('group')
    expect(group.className).toContain('rounded-none')
  })

  it('applies spaced mode when not compact', () => {
    render(<InputGroup compact={false}>content</InputGroup>)
    const group = screen.getByRole('group')
    expect(group.className).toContain('gap-2')
  })

  it('merges custom className', () => {
    render(<InputGroup className="custom-class">content</InputGroup>)
    const group = screen.getByRole('group')
    expect(group.className).toContain('custom-class')
  })

  it('passes through HTML attributes', () => {
    render(
      <InputGroup data-testid="my-group" id="test">
        content
      </InputGroup>
    )
    expect(screen.getByTestId('my-group')).toBeInTheDocument()
    expect(screen.getByTestId('my-group').id).toBe('test')
  })
  it('passes size to child inputs that do not set their own size', () => {
    render(
      <InputGroup size="lg">
        <Input aria-label="plain input" />
        <Textarea aria-label="plain textarea" />
        <InputNumber aria-label="plain number" />
      </InputGroup>
    )

    expect(screen.getByLabelText('plain input').className).toContain('py-3')
    expect(screen.getByLabelText('plain textarea').className).toContain('py-3')
    expect(screen.getByRole('spinbutton').className).toContain('text-lg')
  })

  it('uses focus-within so nested field focus raises compact z-index', () => {
    render(<InputGroup compact>content</InputGroup>)
    const group = screen.getByRole('group')
    expect(group.className).toContain('focus-within')
    expect(group.className).not.toContain('[&>*:focus]:z-10')
  })

  it('joins compact Input chrome on the group-child root, not a nested capsule', () => {
    render(
      <InputGroup compact>
        <Input aria-label="q" />
        <button type="button">Go</button>
      </InputGroup>
    )
    const group = screen.getByRole('group')
    const first = group.firstElementChild as HTMLElement
    const last = group.lastElementChild as HTMLElement
    const input = screen.getByLabelText('q')

    expect(group.className).toContain('[&>*:first-child]:!rounded-r-none')
    expect(group.className).toContain('[&>*:last-child]:!rounded-l-none')
    expect(first).toBe(input.parentElement)
    expect(first.className).toContain('border')
    expect(first.className).toContain('rounded-[var(--tiger-radius-md')
    expect(input.className).not.toContain('rounded-[var(--tiger-radius-md')
    expect(last.tagName).toBe('BUTTON')
    expect(last).toBe(group.lastElementChild)
  })

  it('makes compact Textarea the chrome group child when showCount is off', () => {
    render(
      <InputGroup compact>
        <Textarea aria-label="notes" />
        <button type="button">Go</button>
      </InputGroup>
    )
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
    render(<InputGroupAddon>@</InputGroupAddon>)
    expect(screen.getByText('@')).toBeInTheDocument()
  })
  describe('a11y', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <InputGroup>
          <input type="text" aria-label="Search" />
        </InputGroup>
      )
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
