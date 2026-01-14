/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Tag } from '@tigercat/vue'
import { renderWithSlots, expectNoA11yViolations } from '../utils'

describe('Tag', () => {
  it('renders content and role="status"', () => {
    render(Tag, {
      slots: {
        default: 'Test Tag'
      }
    })

    const content = screen.getByText('Test Tag')
    expect(content).toBeInTheDocument()
    expect(content.parentElement).toHaveAttribute('role', 'status')
  })

  it('merges attrs.class and props.className', () => {
    const { container } = render(Tag, {
      props: {
        className: 'from-props'
      },
      attrs: {
        class: 'from-attrs'
      },
      slots: {
        default: 'Tag'
      }
    })

    const root = container.querySelector('[role="status"]')
    expect(root).toHaveClass('from-props')
    expect(root).toHaveClass('from-attrs')
  })

  it('does not render close button when closable=false', () => {
    const { container } = render(Tag, {
      props: {
        closable: false
      },
      slots: {
        default: 'Tag'
      }
    })

    expect(container.querySelector('button')).not.toBeInTheDocument()
  })

  it('emits close and removes tag by default', async () => {
    const onClose = vi.fn()

    const { container } = render(Tag, {
      props: {
        closable: true,
        onClose
      },
      slots: {
        default: 'Closable Tag'
      }
    })

    const closeButton = container.querySelector(
      'button[aria-label="Close tag"]'
    ) as HTMLButtonElement | null
    expect(closeButton).toBeInTheDocument()

    await fireEvent.click(closeButton!)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.queryByText('Closable Tag')).not.toBeInTheDocument()
  })

  it('keeps tag visible when close event calls preventDefault()', async () => {
    const onClose = vi.fn((event: MouseEvent) => {
      event.preventDefault()
    })

    const { container } = render(Tag, {
      props: {
        closable: true,
        onClose
      },
      slots: {
        default: 'Closable Tag'
      }
    })

    const closeButton = container.querySelector(
      'button[aria-label="Close tag"]'
    ) as HTMLButtonElement | null
    await fireEvent.click(closeButton!)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Closable Tag')).toBeInTheDocument()
  })

  it('stops propagation when close button is clicked', async () => {
    const onTagClick = vi.fn()

    const { container } = render(Tag, {
      props: {
        closable: true
      },
      slots: {
        default: 'Closable Tag'
      },
      attrs: {
        onClick: onTagClick
      }
    })

    const closeButton = container.querySelector(
      'button[aria-label="Close tag"]'
    ) as HTMLButtonElement | null
    await fireEvent.click(closeButton!)
    expect(onTagClick).not.toHaveBeenCalled()
  })

  it('passes a11y baseline checks', async () => {
    const { container } = renderWithSlots(Tag, {
      default: 'Accessible Tag'
    })

    await expectNoA11yViolations(container)
  })
})
