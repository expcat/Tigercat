/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { Image } from '@expcat/tigercat-react'
import { expectNoA11yViolations } from '../utils/react'

describe('Image', () => {
  it('renders image with src and alt', () => {
    const { container } = render(
      <Image src="/test.jpg" alt="Test image" width={200} height={150} />
    )

    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/test.jpg')
    expect(img).toHaveAttribute('alt', 'Test image')
  })

  it('applies object-fit class based on fit prop', () => {
    const { container } = render(<Image src="/test.jpg" fit="contain" />)

    const img = container.querySelector('img')
    expect(img?.className).toContain('object-contain')
  })

  it('shows error placeholder when image fails to load', () => {
    const { container } = render(<Image src="/broken.jpg" alt="Broken" preview={false} />)

    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    fireEvent.error(img as Element)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('uses fallback src when image fails', () => {
    const { container } = render(
      <Image src="/broken.jpg" fallbackSrc="/fallback.jpg" alt="Image" />
    )

    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', '/broken.jpg')
    fireEvent.error(img as Element)

    const newImg = container.querySelector('img')
    expect(newImg).toHaveAttribute('src', '/fallback.jpg')
  })

  it('renders as button role when preview is enabled', () => {
    const { container } = render(<Image src="/test.jpg" preview />)

    const wrapper = container.firstElementChild
    expect(wrapper).toHaveAttribute('role', 'button')
    expect(wrapper).toHaveAttribute('tabindex', '0')
  })

  it('does not render as button when preview is disabled', () => {
    const { container } = render(<Image src="/test.jpg" preview={false} />)

    const wrapper = container.firstElementChild
    expect(wrapper).not.toHaveAttribute('role')
  })

  it('applies width and height styles', () => {
    const { container } = render(<Image src="/test.jpg" width={300} height="200px" />)

    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.width).toBe('300px')
    expect(wrapper.style.height).toBe('200px')
  })

  it('merges className', () => {
    const { container } = render(<Image src="/test.jpg" className="custom-image" />)

    const wrapper = container.firstElementChild
    expect(wrapper?.className).toContain('custom-image')
  })

  it('renders custom error content', () => {
    const { container } = render(
      <Image
        src="/broken.jpg"
        preview={false}
        errorRender={<div data-testid="custom-error">Error!</div>}
      />
    )

    const img = container.querySelector('img')
    fireEvent.error(img as Element)

    expect(container.querySelector('[data-testid="custom-error"]')).toBeInTheDocument()
  })

  it('passes accessibility checks', async () => {
    const { container } = render(<Image src="/test.jpg" alt="Accessible image" preview={false} />)
    await expectNoA11yViolations(container)
  })
})
