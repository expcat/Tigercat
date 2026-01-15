/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Badge } from '@expcat/tigercat-react'
import { expectNoA11yViolations } from '../utils/react'

describe('Badge', () => {
  it('renders with default props', () => {
    render(<Badge content={5} />)
    const badge = screen.getByText('5')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('role', 'status')
  })

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

  it('applies className to the badge element', () => {
    const { container } = render(<Badge content={5} className="custom-class" />)
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('formats max value as max+', () => {
    render(<Badge content={150} max={99} />)
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('hides when content is 0 and showZero is false', () => {
    const { container } = render(<Badge content={0} showZero={false} />)
    expect(container.querySelector('[role="status"]')).not.toBeInTheDocument()
  })

  it('shows when content is 0 and showZero is true', () => {
    render(<Badge content={0} showZero />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('renders dot type without content', () => {
    const { container } = render(<Badge type="dot" />)
    const badge = container.querySelector('[role="status"]')
    expect(badge).toBeInTheDocument()
    expect(badge?.textContent).toBe('')
    expect(badge).toHaveAttribute('aria-label', 'notification')
  })

  it('uses aria-label for number badges', () => {
    render(<Badge type="number" content={5} />)
    expect(screen.getByLabelText('5 notifications')).toBeInTheDocument()
  })

  it('passes accessibility checks (standalone)', async () => {
    const { container } = render(<Badge content={5} />)
    await expectNoA11yViolations(container)
  })
})
