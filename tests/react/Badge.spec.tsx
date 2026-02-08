/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Badge } from '@expcat/tigercat-react'
import { expectNoA11yViolations } from '../utils/react'

describe('Badge', () => {
  // --- Basic rendering ---
  it('renders with default props', () => {
    render(<Badge content={5} />)
    const badge = screen.getByText('5')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('role', 'status')
  })

  it('renders string content', () => {
    render(<Badge content="NEW" />)
    expect(screen.getByText('NEW')).toBeInTheDocument()
  })

  it('applies className', () => {
    const { container } = render(<Badge content={5} className="custom-class" />)
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  // --- Variants ---
  it('applies variant classes', () => {
    const { container } = render(<Badge content={1} variant="success" />)
    const badge = container.querySelector('[role="status"]')
    expect(badge?.className).toContain('bg-')
  })

  // --- Sizes ---
  it.each(['sm', 'md', 'lg'] as const)('renders size="%s"', (size) => {
    const { container } = render(<Badge content={1} size={size} />)
    expect(container.querySelector('[role="status"]')).toBeInTheDocument()
  })

  // --- Types ---
  it('renders dot type without content', () => {
    const { container } = render(<Badge type="dot" />)
    const badge = container.querySelector('[role="status"]')
    expect(badge).toBeInTheDocument()
    expect(badge?.textContent).toBe('')
    expect(badge).toHaveAttribute('aria-label', 'notification')
  })

  it('renders text type with rounded-md', () => {
    const { container } = render(<Badge type="text" content="HOT" />)
    const badge = container.querySelector('[role="status"]')
    expect(badge?.className).toContain('rounded-md')
    expect(badge?.textContent).toBe('HOT')
  })

  // --- Max value ---
  it('formats max value as max+', () => {
    render(<Badge content={150} max={99} />)
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('formats custom max value', () => {
    render(<Badge content={1000} max={999} />)
    expect(screen.getByText('999+')).toBeInTheDocument()
  })

  // --- Show zero ---
  it('hides when content is 0 and showZero is false', () => {
    const { container } = render(<Badge content={0} showZero={false} />)
    expect(container.querySelector('[role="status"]')).not.toBeInTheDocument()
  })

  it('shows when content is 0 and showZero is true', () => {
    render(<Badge content={0} showZero />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  // --- Wrapper mode ---
  it('supports wrapper mode when standalone is false', () => {
    const { container } = render(
      <Badge content={5} standalone={false}>
        <button>Button</button>
      </Badge>
    )
    expect(screen.getByText('Button')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(container.querySelector('.relative')).toBeInTheDocument()
  })

  it('renders only children when hidden in wrapper mode', () => {
    const { container } = render(
      <Badge content={0} standalone={false}>
        <button>Button</button>
      </Badge>
    )
    expect(screen.getByText('Button')).toBeInTheDocument()
    expect(container.querySelector('[role="status"]')).not.toBeInTheDocument()
  })

  // --- Positions ---
  it.each(['top-right', 'top-left', 'bottom-right', 'bottom-left'] as const)(
    'applies position="%s" in wrapper mode',
    (position) => {
      const { container } = render(
        <Badge content={1} standalone={false} position={position}>
          <div>child</div>
        </Badge>
      )
      const badge = container.querySelector('[role="status"]')
      expect(badge?.className).toContain('absolute')
    }
  )

  // --- Aria labels ---
  it('uses aria-label for number badges', () => {
    render(<Badge type="number" content={5} />)
    expect(screen.getByLabelText('5 notifications')).toBeInTheDocument()
  })

  // --- Accessibility ---
  it('passes accessibility checks (standalone)', async () => {
    const { container } = render(<Badge content={5} />)
    await expectNoA11yViolations(container)
  })
})
