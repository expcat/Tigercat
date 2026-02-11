/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/vue'
import { ImageCropper } from '@expcat/tigercat-vue'

// Mock Image constructor for happy-dom
const mockImageInstances: Array<{
  onload?: () => void
  src?: string
  naturalWidth: number
  naturalHeight: number
  crossOrigin?: string
}> = []

beforeEach(() => {
  mockImageInstances.length = 0
  vi.stubGlobal(
    'Image',
    class MockImage {
      naturalWidth = 800
      naturalHeight = 600
      crossOrigin = ''
      src = ''
      onload: (() => void) | null = null

      constructor() {
        mockImageInstances.push(this)
        // Simulate async load
        setTimeout(() => this.onload?.(), 0)
      }
    }
  )
})

describe('ImageCropper', () => {
  it('shows loading state initially', () => {
    const { container } = render(ImageCropper, {
      props: {
        src: '/test.jpg'
      }
    })

    // Should show loading spinner
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with required src prop', () => {
    const { container } = render(ImageCropper, {
      props: {
        src: '/test.jpg'
      }
    })

    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('applies className', () => {
    const { container } = render(ImageCropper, {
      props: {
        src: '/test.jpg',
        className: 'custom-cropper'
      }
    })

    expect(container.firstElementChild?.className).toContain('custom-cropper')
  })

  it('has proper aria attributes', () => {
    const { container } = render(ImageCropper, {
      props: {
        src: '/test.jpg'
      }
    })

    const el = container.firstElementChild
    expect(el).toHaveAttribute('aria-label', 'Loading image for cropping')
  })

  it('renders with guides prop', () => {
    const { container } = render(ImageCropper, {
      props: {
        src: '/test.jpg',
        guides: true
      }
    })

    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('renders with aspect ratio', () => {
    const { container } = render(ImageCropper, {
      props: {
        src: '/test.jpg',
        aspectRatio: 16 / 9
      }
    })

    expect(container.firstElementChild).toBeInTheDocument()
  })
})
