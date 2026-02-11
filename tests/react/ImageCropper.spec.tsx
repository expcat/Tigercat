/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import React from 'react'
import { ImageCropper } from '@expcat/tigercat-react'

// Mock Image constructor for happy-dom
beforeEach(() => {
  vi.stubGlobal(
    'Image',
    class MockImage {
      naturalWidth = 800
      naturalHeight = 600
      crossOrigin = ''
      src = ''
      onload: (() => void) | null = null

      constructor() {
        setTimeout(() => this.onload?.(), 0)
      }
    }
  )
})

describe('ImageCropper', () => {
  it('shows loading state initially', () => {
    const { container } = render(<ImageCropper src="/test.jpg" />)

    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with required src prop', () => {
    const { container } = render(<ImageCropper src="/test.jpg" />)

    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('applies className', () => {
    const { container } = render(<ImageCropper src="/test.jpg" className="custom-cropper" />)

    expect(container.firstElementChild?.className).toContain('custom-cropper')
  })

  it('has proper aria attributes', () => {
    const { container } = render(<ImageCropper src="/test.jpg" />)

    const el = container.firstElementChild
    expect(el).toHaveAttribute('aria-label', 'Loading image for cropping')
  })

  it('renders with guides prop', () => {
    const { container } = render(<ImageCropper src="/test.jpg" guides />)

    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('renders with aspect ratio', () => {
    const { container } = render(<ImageCropper src="/test.jpg" aspectRatio={16 / 9} />)

    expect(container.firstElementChild).toBeInTheDocument()
  })
})
