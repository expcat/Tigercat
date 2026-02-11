/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { Image } from '@expcat/tigercat-vue'
import { expectNoA11yViolations } from '../utils'

describe('Image', () => {
  it('renders image with src and alt', () => {
    const { container } = render(Image, {
      props: {
        src: '/test.jpg',
        alt: 'Test image',
        width: 200,
        height: 150
      }
    })

    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', '/test.jpg')
    expect(img).toHaveAttribute('alt', 'Test image')
  })

  it('applies object-fit class based on fit prop', () => {
    const { container } = render(Image, {
      props: {
        src: '/test.jpg',
        fit: 'contain'
      }
    })

    const img = container.querySelector('img')
    expect(img?.className).toContain('object-contain')
  })

  it('shows error placeholder when image fails to load', async () => {
    const { container } = render(Image, {
      props: {
        src: '/broken.jpg',
        alt: 'Broken image',
        preview: false
      }
    })

    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    await fireEvent.error(img as Element)

    // Should show error state (svg icon)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('uses fallback src when image fails', async () => {
    const { container } = render(Image, {
      props: {
        src: '/broken.jpg',
        fallbackSrc: '/fallback.jpg',
        alt: 'Image'
      }
    })

    const img = container.querySelector('img')
    expect(img).toHaveAttribute('src', '/broken.jpg')
    await fireEvent.error(img as Element)

    const newImg = container.querySelector('img')
    expect(newImg).toHaveAttribute('src', '/fallback.jpg')
  })

  it('renders as button role when preview is enabled', () => {
    const { container } = render(Image, {
      props: {
        src: '/test.jpg',
        preview: true
      }
    })

    const wrapper = container.firstElementChild
    expect(wrapper).toHaveAttribute('role', 'button')
    expect(wrapper).toHaveAttribute('tabindex', '0')
  })

  it('does not render as button when preview is disabled', () => {
    const { container } = render(Image, {
      props: {
        src: '/test.jpg',
        preview: false
      }
    })

    const wrapper = container.firstElementChild
    expect(wrapper).not.toHaveAttribute('role')
  })

  it('applies width and height styles', () => {
    const { container } = render(Image, {
      props: {
        src: '/test.jpg',
        width: 300,
        height: '200px'
      }
    })

    const wrapper = container.firstElementChild as HTMLElement
    expect(wrapper.style.width).toBe('300px')
    expect(wrapper.style.height).toBe('200px')
  })

  it('merges className', () => {
    const { container } = render(Image, {
      props: {
        src: '/test.jpg',
        className: 'custom-image'
      }
    })

    const wrapper = container.firstElementChild
    expect(wrapper?.className).toContain('custom-image')
  })

  it('emits load event when image loads', async () => {
    const { container, emitted } = render(Image, {
      props: {
        src: '/test.jpg'
      }
    })

    const img = container.querySelector('img')
    await fireEvent.load(img as Element)

    expect(emitted()).toHaveProperty('load')
  })

  it('emits error event when image fails', async () => {
    const { container, emitted } = render(Image, {
      props: {
        src: '/broken.jpg',
        preview: false
      }
    })

    const img = container.querySelector('img')
    await fireEvent.error(img as Element)

    expect(emitted()).toHaveProperty('error')
  })

  it('passes accessibility checks', async () => {
    const { container } = render(Image, {
      props: {
        src: '/test.jpg',
        alt: 'Accessible image',
        preview: false
      }
    })

    await expectNoA11yViolations(container)
  })
})
