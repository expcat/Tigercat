/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { BackTop } from '@expcat/tigercat-vue'
import { expectNoA11yViolations } from '../utils'

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
    const { container } = render(BackTop, {
      props: {
        target: () => scrollContainer
      }
    })

    const button = container.querySelector('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-label', 'Back to top')
    expect(button).toHaveAttribute('type', 'button')
  })

  it('renders custom content via slot', () => {
    render(BackTop, {
      props: {
        target: () => scrollContainer
      },
      slots: { default: '<span data-testid="custom">Custom</span>' }
    })

    const custom = screen.getByTestId('custom')
    expect(custom).toBeInTheDocument()
    expect(custom).toHaveTextContent('Custom')
  })

  it('is hidden when scroll position is below visibilityHeight', async () => {
    const { container } = render(BackTop, {
      props: {
        visibilityHeight: 400,
        target: () => scrollContainer
      }
    })

    scrollContainer.scrollTop = 100
    await fireEvent.scroll(scrollContainer)

    const button = container.querySelector('button')
    expect(button).toHaveClass('opacity-0')
  })

  it('becomes visible when scroll position exceeds visibilityHeight', async () => {
    const { container } = render(BackTop, {
      props: {
        visibilityHeight: 100,
        target: () => scrollContainer
      }
    })

    scrollContainer.scrollTop = 200
    await fireEvent.scroll(scrollContainer)

    const button = container.querySelector('button')
    expect(button).toHaveClass('opacity-100')
  })

  it('emits click event when clicked', async () => {
    const handleClick = vi.fn()

    const { container } = render(BackTop, {
      props: {
        visibilityHeight: 0,
        target: () => scrollContainer
      },
      attrs: {
        onClick: handleClick
      }
    })

    const button = container.querySelector('button')
    expect(button).toBeInTheDocument()

    await fireEvent.click(button!)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('merges custom className', () => {
    const { container } = render(BackTop, {
      props: {
        className: 'custom-class',
        target: () => scrollContainer
      }
    })

    const button = container.querySelector('button')
    expect(button).toHaveClass('custom-class')
    // When target is a custom container (not window), uses sticky positioning
    expect(button).toHaveClass('sticky')
  })

  it('uses fixed positioning when target is window', () => {
    const { container } = render(BackTop, {
      props: {
        target: () => window
      }
    })

    const button = container.querySelector('button')
    expect(button).toHaveClass('fixed')
  })

  it('forwards native attributes', () => {
    const { container } = render(BackTop, {
      props: {
        target: () => scrollContainer
      },
      attrs: {
        'data-testid': 'backtop-btn',
        'aria-label': 'Custom label'
      }
    })

    const button = container.querySelector('button')
    expect(button).toHaveAttribute('data-testid', 'backtop-btn')
    expect(button).toHaveAttribute('aria-label', 'Custom label')
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(BackTop, {
        props: {
          target: () => scrollContainer
        }
      })

      await expectNoA11yViolations(container)
    })

    it('uses custom aria-label when provided', () => {
      const { container } = render(BackTop, {
        props: {
          target: () => scrollContainer
        },
        attrs: {
          'aria-label': 'Scroll to top'
        }
      })

      const button = container.querySelector('button')
      expect(button).toHaveAttribute('aria-label', 'Scroll to top')
    })
  })
})
