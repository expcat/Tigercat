/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { Badge } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolations } from '../utils'

describe('Badge', () => {
  it('renders with default props', () => {
    render(Badge, { props: { content: 5 } })

    const badge = screen.getByText('5')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute('role', 'status')
  })

  it('supports wrapper mode when standalone is false', () => {
    const { container } = renderWithProps(
      Badge,
      { content: 5, standalone: false },
      { slots: { default: '<button>Button</button>' } }
    )

    expect(screen.getByText('Button')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(container.querySelector('.relative')).toBeInTheDocument()
  })

  it('applies className prop to the badge element', () => {
    const { container } = renderWithProps(Badge, { content: 5, className: 'custom-class' })
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('formats max value as max+', () => {
    render(Badge, { props: { content: 150, max: 99 } })
    expect(screen.getByText('99+')).toBeInTheDocument()
  })

  it('hides when content is 0 and showZero is false', () => {
    const { container } = renderWithProps(Badge, { content: 0, showZero: false })
    expect(container.querySelector('[role="status"]')).not.toBeInTheDocument()
  })

  it('shows when content is 0 and showZero is true', () => {
    render(Badge, { props: { content: 0, showZero: true } })
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('renders dot type without content and sets aria-label', () => {
    const { container } = renderWithProps(Badge, { type: 'dot' })
    const badge = container.querySelector('[role="status"]')
    expect(badge).toBeInTheDocument()
    expect(badge?.textContent).toBe('')
    expect(badge).toHaveAttribute('aria-label', 'notification')
  })

  it('passes accessibility checks (standalone)', async () => {
    const { container } = renderWithProps(Badge, { content: 5 })
    await expectNoA11yViolations(container)
  })
})
