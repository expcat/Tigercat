/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { CropUpload } from '@expcat/tigercat-react'

describe('CropUpload', () => {
  it('renders trigger button', () => {
    render(<CropUpload />)

    const trigger = screen.getByRole('button')
    expect(trigger).toBeInTheDocument()
  })

  it('displays default text', () => {
    render(<CropUpload />)

    expect(screen.getByText('选择图片')).toBeInTheDocument()
  })

  it('supports custom children', () => {
    render(
      <CropUpload>
        <span>Custom Trigger</span>
      </CropUpload>
    )

    expect(screen.getByText('Custom Trigger')).toBeInTheDocument()
  })

  it('has hidden file input', () => {
    const { container } = render(<CropUpload />)

    const input = container.querySelector('input[type="file"]')
    expect(input).toBeInTheDocument()
    expect(input).not.toBeVisible()
  })

  it('applies accept filter', () => {
    const { container } = render(<CropUpload accept="image/png" />)

    const input = container.querySelector('input[type="file"]')
    expect(input).toHaveAttribute('accept', 'image/png')
  })

  it('disables trigger when disabled', () => {
    render(<CropUpload disabled />)

    const trigger = screen.getByRole('button')
    expect(trigger).toHaveAttribute('aria-disabled', 'true')
  })

  it('opens file input on click', async () => {
    const user = userEvent.setup()
    const { container } = render(<CropUpload />)

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const clickSpy = vi.spyOn(input, 'click')

    await user.click(screen.getByRole('button'))
    expect(clickSpy).toHaveBeenCalled()
  })

  it('opens file input on Enter key', async () => {
    const user = userEvent.setup()
    const { container } = render(<CropUpload />)

    const input = container.querySelector('input[type="file"]') as HTMLInputElement
    const clickSpy = vi.spyOn(input, 'click')

    screen.getByRole('button').focus()
    await user.keyboard('{Enter}')
    expect(clickSpy).toHaveBeenCalled()
  })
})
