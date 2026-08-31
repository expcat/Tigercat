/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { BackTop } from '@expcat/tigercat-react/BackTop'
import { expectNoA11yViolationsIsolated } from '../utils/react'

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
    scrollContainer.remove()
  })

  it('renders with default props', () => {
    const { container } = render(<BackTop target={() => scrollContainer} />)

    const button = container.querySelector('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label', 'Back to top')
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveAttribute('tabindex', '-1')
    expect(button).toHaveAttribute('aria-hidden', 'true')
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

  it('is hidden when scroll position is below visibilityHeight', async () => {
    const { container } = render(<BackTop visibilityHeight={400} target={() => scrollContainer} />)

    scrollContainer.scrollTop = 100
    fireEvent.scroll(scrollContainer)

    const button = container.querySelector('button')
    await waitFor(() => expect(button).toHaveClass('opacity-0'))
  })

  it('becomes visible when scroll position exceeds visibilityHeight', async () => {
    const { container } = render(<BackTop visibilityHeight={100} target={() => scrollContainer} />)

    scrollContainer.scrollTop = 200
    fireEvent.scroll(scrollContainer)

    const button = container.querySelector('button')
    await waitFor(() => expect(button).toHaveClass('opacity-100'))
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
    expect(button).toHaveClass('fixed')
  })

  it('uses fixed positioning when target is window', () => {
    const { container } = render(<BackTop target={() => window} />)

    const button = container.querySelector('button')
    expect(button).toHaveClass('fixed')
  })

  it('supports fixed placement for a custom scroll target', async () => {
    const user = userEvent.setup()
    scrollContainer.scrollTop = 200
    scrollContainer.scrollTo = vi.fn((options?: ScrollToOptions) => {
      scrollContainer.scrollTop = Number(options?.top ?? 0)
    })

    const { container } = render(
      <BackTop
        visibilityHeight={0}
        duration={0}
        target={() => scrollContainer}
        position="fixed"
        placement="bottom-left"
        offset={{ x: 24, y: '2rem' }}
      />
    )

    const button = container.querySelector('button')
    expect(button).toHaveClass('fixed')
    expect(button).toHaveClass('bottom-0')
    expect(button).toHaveClass('start-0')
    expect(button).not.toHaveClass('sticky')
    expect(button?.style.insetInlineStart).toBe('24px')
    expect(button?.style.bottom).toBe('2rem')

    await user.click(button!)
    expect(scrollContainer.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
    expect(scrollContainer.scrollTop).toBe(0)
  })

  it('forwards native attributes', () => {
    const { container } = render(
      <BackTop target={() => scrollContainer} data-testid="backtop-btn" aria-label="Custom label" />
    )

    const button = container.querySelector('button')
    expect(button).toHaveAttribute('data-testid', 'backtop-btn')
    expect(button).toHaveAttribute('aria-label', 'Custom label')
  })

  it('keeps type=button even if rest props pass submit', () => {
    const { container } = render(<BackTop target={() => scrollContainer} type="submit" as never />)
    expect(container.querySelector('button')).toHaveAttribute('type', 'button')
  })

  it('scrolls the resolved target on click', async () => {
    const user = userEvent.setup()
    scrollContainer.scrollTop = 200
    scrollContainer.scrollTo = vi.fn((options?: ScrollToOptions) => {
      scrollContainer.scrollTop = Number(options?.top ?? 0)
    })

    render(<BackTop visibilityHeight={0} duration={0} target={() => scrollContainer} />)
    await user.click(screen.getByRole('button'))
    expect(scrollContainer.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations when visible', async () => {
      const { container } = render(<BackTop visibilityHeight={0} target={() => scrollContainer} />)

      await waitFor(() =>
        expect(container.querySelector('button')).toHaveAttribute('tabindex', '0')
      )
      await expectNoA11yViolationsIsolated(container)
    })

    it('uses custom aria-label when provided', () => {
      const { container } = render(
        <BackTop target={() => scrollContainer} aria-label="Scroll to top" />
      )

      const button = container.querySelector('button')
      expect(button).toHaveAttribute('aria-label', 'Scroll to top')
    })

    it('does not override visible children with the default aria-label', () => {
      render(
        <BackTop visibilityHeight={0} target={() => scrollContainer}>
          顶部
        </BackTop>
      )
      const button = screen.getByRole('button', { name: '顶部' })
      expect(button).not.toHaveAttribute('aria-label', 'Back to top')
    })
  })
})
