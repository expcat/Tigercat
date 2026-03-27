/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import { InputGroup, InputGroupAddon } from '@expcat/tigercat-react'
import { expectNoA11yViolations } from '../utils/react'

describe('InputGroup', () => {
  it('renders with role="group"', () => {
    render(<InputGroup>content</InputGroup>)
    expect(screen.getByRole('group')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <InputGroup>
        <span>child1</span>
        <span>child2</span>
      </InputGroup>
    )
    const group = screen.getByRole('group')
    expect(group.children.length).toBe(2)
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

  it('applies base classes', () => {
    render(<InputGroup>content</InputGroup>)
    const group = screen.getByRole('group')
    expect(group.className).toContain('inline-flex')
  })

  it('accepts different sizes', () => {
    const sizes = ['sm', 'md', 'lg'] as const
    for (const size of sizes) {
      const { unmount } = render(<InputGroup size={size}>content</InputGroup>)
      expect(screen.getByRole('group')).toBeInTheDocument()
      unmount()
    }
  })
})

describe('InputGroupAddon', () => {
  it('renders addon content', () => {
    render(<InputGroupAddon>@</InputGroupAddon>)
    expect(screen.getByText('@')).toBeInTheDocument()
  })

  it('renders as span element', () => {
    const { container } = render(<InputGroupAddon>prefix</InputGroupAddon>)
    expect(container.querySelector('span')).toBeInTheDocument()
  })

  it('applies addon classes', () => {
    const { container } = render(<InputGroupAddon>$</InputGroupAddon>)
    const span = container.querySelector('span')!
    expect(span.className).toContain('inline-flex')
    expect(span.className).toContain('items-center')
  })

  it('merges custom className', () => {
    const { container } = render(<InputGroupAddon className="addon-extra">icon</InputGroupAddon>)
    const span = container.querySelector('span')!
    expect(span.className).toContain('addon-extra')
  })

  describe('a11y', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <InputGroup>
          <input type="text" aria-label="Search" />
        </InputGroup>
      )
      await expectNoA11yViolations(container)
    })
  })
})
