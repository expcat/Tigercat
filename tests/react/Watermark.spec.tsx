/**
 * @vitest-environment happy-dom
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Watermark } from '@expcat/tigercat-react'

describe('Watermark', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders children and watermark overlay', () => {
    render(
      <Watermark content="Secret" className="custom-watermark" data-testid="watermark">
        <span>Protected content</span>
      </Watermark>
    )

    const wrapper = screen.getByTestId('watermark')
    const overlay = wrapper.querySelector('[data-watermark="true"]')

    expect(screen.getByText('Protected content')).toBeInTheDocument()
    expect(wrapper).toHaveClass('relative')
    expect(wrapper).toHaveClass('custom-watermark')
    expect(overlay).toHaveAttribute('aria-hidden', 'true')
    expect(overlay).toHaveStyle({
      position: 'absolute',
      pointerEvents: 'none',
      backgroundRepeat: 'repeat'
    })
  })
})
