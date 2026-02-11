/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { ImagePreview } from '@expcat/tigercat-vue'
import { expectNoA11yViolations } from '../utils'

describe('ImagePreview', () => {
  const images = ['/img1.jpg', '/img2.jpg', '/img3.jpg']

  it('renders nothing when not visible', () => {
    const { container } = render(ImagePreview, {
      props: {
        visible: false,
        images
      }
    })

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument()
  })

  it('renders preview dialog when visible', () => {
    render(ImagePreview, {
      props: {
        visible: true,
        images
      }
    })

    // Teleported to body
    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('displays current image', () => {
    render(ImagePreview, {
      props: {
        visible: true,
        images,
        currentIndex: 1
      }
    })

    const img = document.querySelector('[role="dialog"] img')
    expect(img).toHaveAttribute('src', '/img2.jpg')
  })

  it('renders navigation buttons for multiple images', () => {
    render(ImagePreview, {
      props: {
        visible: true,
        images
      }
    })

    const prevBtn = document.querySelector('[aria-label="Previous image"]')
    const nextBtn = document.querySelector('[aria-label="Next image"]')
    expect(prevBtn).toBeInTheDocument()
    expect(nextBtn).toBeInTheDocument()
  })

  it('disables prev button on first image', () => {
    render(ImagePreview, {
      props: {
        visible: true,
        images,
        currentIndex: 0
      }
    })

    const prevBtn = document.querySelector('[aria-label="Previous image"]')
    expect(prevBtn).toHaveAttribute('disabled')
  })

  it('disables next button on last image', () => {
    render(ImagePreview, {
      props: {
        visible: true,
        images,
        currentIndex: 2
      }
    })

    const nextBtn = document.querySelector('[aria-label="Next image"]')
    expect(nextBtn).toHaveAttribute('disabled')
  })

  it('renders toolbar with zoom buttons', () => {
    render(ImagePreview, {
      props: {
        visible: true,
        images
      }
    })

    expect(document.querySelector('[aria-label="Zoom in"]')).toBeInTheDocument()
    expect(document.querySelector('[aria-label="Zoom out"]')).toBeInTheDocument()
    expect(document.querySelector('[aria-label="Reset"]')).toBeInTheDocument()
  })

  it('renders close button', () => {
    render(ImagePreview, {
      props: {
        visible: true,
        images
      }
    })

    expect(document.querySelector('[aria-label="Close preview"]')).toBeInTheDocument()
  })

  it('emits update:visible on close button click', async () => {
    const { emitted } = render(ImagePreview, {
      props: {
        visible: true,
        images
      }
    })

    const closeBtn = document.querySelector('[aria-label="Close preview"]') as HTMLElement
    await fireEvent.click(closeBtn)

    expect(emitted()['update:visible']).toBeTruthy()
    expect(emitted()['update:visible'][0]).toEqual([false])
  })

  it('shows image counter for multiple images', () => {
    render(ImagePreview, {
      props: {
        visible: true,
        images,
        currentIndex: 1
      }
    })

    const counter = document.body.textContent
    expect(counter).toContain('2 / 3')
  })

  it('does not show navigation for single image', () => {
    render(ImagePreview, {
      props: {
        visible: true,
        images: ['/single.jpg']
      }
    })

    expect(document.querySelector('[aria-label="Previous image"]')).not.toBeInTheDocument()
    expect(document.querySelector('[aria-label="Next image"]')).not.toBeInTheDocument()
  })
})
