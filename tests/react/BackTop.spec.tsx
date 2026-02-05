/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { BackTop } from '@expcat/tigercat-react'
import { expectNoA11yViolations } from '../utils/react'

describe('BackTop', () => {
  let scrollContainer: HTMLDivElement

  beforeEach(() => {
    scrollContainer = document.createElement('div')
    scrollContainer.style.height = '200px'
    scrollContainer.style.overflow = 'auto'
    scrollContainer.innerHTML = '<div style="height: 2000px"></div>'
    document.body.appendChild(scrollContainer)
  })

  afterEach(() => {
    document.body.removeChild(scrollContainer)
  })

  it('renders with default props', () => {
    const { container } = render(<BackTop target={() => scrollContainer} />)

    const button = container.querySelector('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label', 'Back to top')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('renders custom children', () => {
    render(
      <BackTop target={() => scrollContainer}>
        <span data-testid="custom">Custom</span>
      </BackTop>
    )

    const custom = screen.getByTestId('custom')
    expect(custom).toBeInTheDocument()
    expect(custom).toHaveTextContent('Custom')
  })

  it('is hidden when scroll position is below visibilityHeight', () => {
    const { container } = render(<BackTop visibilityHeight={400} target={() => scrollContainer} />)

    scrollContainer.scrollTop = 100

    const button = container.querySelector('button')
    expect(button).toHaveClass('opacity-0')
  })

  it('becomes visible when scroll position exceeds visibilityHeight', async () => {
    const { container } = render(<BackTop visibilityHeight={100} target={() => scrollContainer} />)

    scrollContainer.scrollTop = 200
    fireEvent.scroll(scrollContainer)

    const button = container.querySelector('button')
    expect(button).toHaveClass('opacity-100')
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<BackTop visibilityHeight={0} target={() => scrollContainer} onClick={handleClick} />)

    const button = screen.getByRole('button')
    await user.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('merges custom className', () => {
    const { container } = render(
      <BackTop target={() => scrollContainer} className="custom-class" />
    )

    const button = container.querySelector('button')
    expect(button).toHaveClass('custom-class')
    // When target is a custom container (not window), uses sticky positioning
    expect(button).toHaveClass('sticky')
  })

  it('uses fixed positioning when target is window', () => {
    const { container } = render(<BackTop target={() => window} />)

    const button = container.querySelector('button')
    expect(button).toHaveClass('fixed')
  })

  it('forwards native attributes', () => {
    const { container } = render(
      <BackTop target={() => scrollContainer} data-testid="backtop-btn" aria-label="Custom label" />
    )

    const button = container.querySelector('button')
    expect(button).toHaveAttribute('data-testid', 'backtop-btn')
    expect(button).toHaveAttribute('aria-label', 'Custom label')
  })

  it('uses custom visibilityHeight', async () => {
    const { container } = render(<BackTop visibilityHeight={50} target={() => scrollContainer} />)

    scrollContainer.scrollTop = 60
    fireEvent.scroll(scrollContainer)

    const button = container.querySelector('button')
    expect(button).toHaveClass('opacity-100')
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<BackTop target={() => scrollContainer} />)

      await expectNoA11yViolations(container)
    })

    it('has proper aria-label for screen readers', () => {
      const { container } = render(<BackTop target={() => scrollContainer} />)

      const button = container.querySelector('button')
      expect(button).toHaveAttribute('aria-label', 'Back to top')
    })

    it('uses custom aria-label when provided', () => {
      const { container } = render(
        <BackTop target={() => scrollContainer} aria-label="Scroll to top" />
      )

      const button = container.querySelector('button')
      expect(button).toHaveAttribute('aria-label', 'Scroll to top')
    })
  })
})
