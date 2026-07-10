/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { InputGroup, InputGroupAddon, Input, Textarea, InputNumber } from '@expcat/tigercat-react'
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
