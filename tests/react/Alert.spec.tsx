/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Alert } from '@expcat/tigercat-react'
import { expectNoA11yViolations } from '../utils/react'

describe('Alert', () => {
  it('renders title and description', () => {
    render(<Alert title="Alert Title" description="Alert description" />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByText('Alert Title')).toBeInTheDocument()
    expect(screen.getByText('Alert description')).toBeInTheDocument()
  })

  it('renders each type with correct icon', () => {
    const types = ['info', 'success', 'warning', 'error'] as const
    for (const type of types) {
      const { container, unmount } = render(<Alert type={type} title={type} />)
      expect(container.querySelector('[role="alert"] svg')).toBeInTheDocument()
      unmount()
    }
  })

  it('renders each size', () => {
    const sizes = ['sm', 'md', 'lg'] as const
    for (const size of sizes) {
      const { unmount } = render(<Alert size={size} title={size} />)
      expect(screen.getByText(size)).toBeInTheDocument()
      unmount()
    }
  })

  it('renders children when no title/description', () => {
    render(<Alert>Default content</Alert>)
    expect(screen.getByText('Default content')).toBeInTheDocument()
  })

  it('renders titleSlot and descriptionSlot overriding props', () => {
    render(
      <Alert
        title="prop title"
        description="prop desc"
        titleSlot={<strong>Slot Title</strong>}
        descriptionSlot={<em>Slot Description</em>}
      />
    )

    expect(screen.getByText('Slot Title')).toBeInTheDocument()
    expect(screen.getByText('Slot Description')).toBeInTheDocument()
    expect(screen.queryByText('prop title')).not.toBeInTheDocument()
    expect(screen.queryByText('prop desc')).not.toBeInTheDocument()
  })

  it('hides icon when showIcon is false', () => {
    const { container } = render(<Alert title="Alert" showIcon={false} />)
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('merges className', () => {
    const { container } = render(<Alert title="Alert" className="custom-class" />)
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('renders close button and hides by default when clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<Alert title="Closable" closable onClose={onClose} />)

    const closeButton = screen.getByLabelText('Close alert')
    await user.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('does not hide if onClose prevents default', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn((event) => event.preventDefault())

    render(<Alert title="Closable" closable onClose={onClose} />)

    const closeButton = screen.getByLabelText('Close alert')
    await user.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('uses custom closeAriaLabel', () => {
    render(<Alert title="Alert" closable closeAriaLabel="关闭" />)
    expect(screen.getByLabelText('关闭')).toBeInTheDocument()
  })

  it('has no a11y violations', async () => {
    const { container } = render(
      <Alert title="Accessible Alert" description="This is an accessible alert" closable />
    )

    await expectNoA11yViolations(container)
  })
})
