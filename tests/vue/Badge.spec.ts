/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { Badge } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

describe('Badge', () => {
  it('renders string content', () => {
    render(Badge, { props: { content: 'NEW' } })
    expect(screen.getByText('NEW')).toBeInTheDocument()
  })

  it('applies className prop', () => {
    const { container } = renderWithProps(Badge, { content: 5, className: 'custom-class' })
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  // --- Variants ---
  it('applies variant classes', () => {
    const { container } = renderWithProps(Badge, { content: 1, variant: 'success' })
    const badge = container.querySelector('[role="status"]')
    expect(badge?.className).toContain('bg-')
  })

  // --- Sizes ---
  it.each(['sm', 'md', 'lg'] as const)('renders size="%s"', (size) => {
    const { container } = renderWithProps(Badge, { content: 1, size })
    expect(container.querySelector('[role="status"]')).toBeInTheDocument()
  })

  // --- Types ---
  it('renders dot type without content', () => {
    const { container } = renderWithProps(Badge, { type: 'dot' })
    const badge = container.querySelector('[role="status"]')
    expect(badge).toBeInTheDocument()
    expect(badge?.textContent).toBe('')
    expect(badge).toHaveAttribute('aria-label', 'notification')
  })
  // --- Max value ---
  it('formats max value as max+', () => {
    render(Badge, { props: { content: 150, max: 99 } })
    expect(screen.getByText('99+')).toBeInTheDocument()
  })
  // --- Show zero ---
  it('hides when content is 0 and showZero is false', () => {
    const { container } = renderWithProps(Badge, { content: 0, showZero: false })
    expect(container.querySelector('[role="status"]')).not.toBeInTheDocument()
  })
  // --- Wrapper mode ---
  it('supports wrapper mode when standalone is false', () => {
    const { container } = renderWithProps(
      Badge,
      { content: 5, standalone: false },
      { slots: { default: '<button>Button</button>' } }
    )
    expect(screen.getByText('Button')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(container.querySelector('.relative')).toBeInTheDocument()
  }) // --- Aria labels ---
  it('uses aria-label for number badges', () => {
    render(Badge, { props: { content: 5 } })
    expect(screen.getByLabelText('5 notifications')).toBeInTheDocument()
  })

  // --- Accessibility ---
  it('passes accessibility checks (standalone)', async () => {
    const { container } = renderWithProps(Badge, { content: 5 })
    await expectNoA11yViolationsIsolated(container)
  })
})
