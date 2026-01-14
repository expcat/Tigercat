/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Alert } from '@tigercat/vue'
import { renderWithProps, renderWithSlots, expectNoA11yViolations } from '../utils'

const closeButtonSelector = 'button[aria-label="Close alert"]'

describe('Alert', () => {
  it('renders title and description', () => {
    renderWithProps(Alert, {
      title: 'Alert Title',
      description: 'Alert description'
    })

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Alert Title')).toBeInTheDocument()
    expect(screen.getByText('Alert description')).toBeInTheDocument()
  })

  it('renders slots for title/description', () => {
    renderWithSlots(
      Alert,
      {
        title: 'Custom Title',
        description: 'Custom Description'
      },
      {
        type: 'info'
      }
    )

    expect(screen.getByText('Custom Title')).toBeInTheDocument()
    expect(screen.getByText('Custom Description')).toBeInTheDocument()
  })

  it('renders default slot content when no title/description', () => {
    renderWithSlots(Alert, {
      default: 'Default content'
    })

    expect(screen.getByText('Default content')).toBeInTheDocument()
  })

  it('hides icon when showIcon is false', () => {
    const { container } = renderWithProps(Alert, {
      title: 'Alert',
      showIcon: false
    })

    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('merges className and attrs.class', () => {
    const { container } = renderWithProps(
      Alert,
      {
        title: 'Alert',
        className: 'custom-class'
      },
      {
        attrs: {
          class: 'attrs-class'
        }
      }
    )

    const alert = container.querySelector('[role="alert"]')
    expect(alert).toBeInTheDocument()
    expect(alert).toHaveClass('custom-class')
    expect(alert).toHaveClass('attrs-class')
  })

  it('emits close and hides by default when clicked', async () => {
    const onClose = vi.fn()

    const { container } = render(Alert, {
      props: {
        title: 'Closable Alert',
        closable: true,
        onClose
      }
    })

    const closeButton = container.querySelector(closeButtonSelector)
    expect(closeButton).toBeInTheDocument()

    if (closeButton) {
      await fireEvent.click(closeButton)
    }

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(container.querySelector('[role="alert"]')).not.toBeInTheDocument()
  })

  it('does not hide if close handler prevents default', async () => {
    const onClose = vi.fn((event: MouseEvent) => event.preventDefault())

    const { container } = render(Alert, {
      props: {
        title: 'Closable Alert',
        closable: true,
        onClose
      }
    })

    const closeButton = container.querySelector(closeButtonSelector)
    expect(closeButton).toBeInTheDocument()

    if (closeButton) {
      await fireEvent.click(closeButton)
    }

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(container.querySelector('[role="alert"]')).toBeInTheDocument()
  })

  it('has no a11y violations', async () => {
    const { container } = renderWithProps(Alert, {
      title: 'Accessible Alert',
      description: 'This is an accessible alert',
      closable: true
    })

    await expectNoA11yViolations(container)
  })
})
