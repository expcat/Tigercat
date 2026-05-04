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
        open: false,
        images
      }
    })

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument()
  })

  it('renders preview dialog when visible', () => {
    render(ImagePreview, {
      props: {
        open: true,
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
        open: true,
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
        open: true,
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
        open: true,
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
        open: true,
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
        open: true,
        images
      }
    })

    expect(document.querySelector('[aria-label="Zoom in"]')).toBeInTheDocument()
    expect(document.querySelector('[aria-label="Zoom out"]')).toBeInTheDocument()
    expect(document.querySelector('[aria-label="Rotate left"]')).toBeInTheDocument()
    expect(document.querySelector('[aria-label="Rotate right"]')).toBeInTheDocument()
    expect(document.querySelector('[aria-label="Reset"]')).toBeInTheDocument()
  })

  it('renders close button', () => {
    render(ImagePreview, {
      props: {
        open: true,
        images
      }
    })

    expect(document.querySelector('[aria-label="Close preview"]')).toBeInTheDocument()
  })

  it('emits update:open on close button click', async () => {
    const { emitted } = render(ImagePreview, {
      props: {
        open: true,
        images
      }
    })

    const closeBtn = document.querySelector('[aria-label="Close preview"]') as HTMLElement
    await fireEvent.click(closeBtn)

    expect(emitted()['update:open']).toBeTruthy()
    expect(emitted()['update:open'][0]).toEqual([false])
  })

  it('emits update:open when Escape is pressed', async () => {
    const { emitted } = render(ImagePreview, {
      props: {
        open: true,
        images
      }
    })

    await fireEvent.keyDown(document, { key: 'Escape' })

    expect(emitted()['update:open']).toBeTruthy()
    expect(emitted()['update:open'][0]).toEqual([false])
  })

  it('updates current image from navigation button clicks', async () => {
    const { emitted } = render(ImagePreview, {
      props: {
        open: true,
        images,
        currentIndex: 1
      }
    })

    const img = document.querySelector('[role="dialog"] img') as HTMLImageElement
    await fireEvent.click(document.querySelector('[aria-label="Next image"]') as HTMLElement)

    expect(emitted()['update:currentIndex'][0]).toEqual([2])
    expect(img).toHaveAttribute('src', '/img3.jpg')

    await fireEvent.click(document.querySelector('[aria-label="Previous image"]') as HTMLElement)

    expect(emitted()['update:currentIndex'][1]).toEqual([1])
    expect(img).toHaveAttribute('src', '/img2.jpg')
  })

  it('updates current image from keyboard navigation', async () => {
    const { emitted } = render(ImagePreview, {
      props: {
        open: true,
        images
      }
    })

    const img = document.querySelector('[role="dialog"] img') as HTMLImageElement
    await fireEvent.keyDown(document, { key: 'ArrowRight' })

    expect(emitted()['update:currentIndex'][0]).toEqual([1])
    expect(img).toHaveAttribute('src', '/img2.jpg')

    await fireEvent.keyDown(document, { key: 'ArrowLeft' })

    expect(emitted()['update:currentIndex'][1]).toEqual([0])
    expect(img).toHaveAttribute('src', '/img1.jpg')
  })

  it('updates zoom and rotation from toolbar actions and reset', async () => {
    const { emitted } = render(ImagePreview, {
      props: {
        open: true,
        images
      }
    })

    const img = document.querySelector('[role="dialog"] img') as HTMLImageElement

    await fireEvent.click(document.querySelector('[aria-label="Zoom in"]') as HTMLElement)
    expect(emitted()['scale-change'][0]).toEqual([1.5])
    expect(img.style.transform).toContain('scale(1.5)')

    await fireEvent.click(document.querySelector('[aria-label="Rotate right"]') as HTMLElement)
    expect(img.style.transform).toContain('rotate(90deg)')

    await fireEvent.click(document.querySelector('[aria-label="Rotate left"]') as HTMLElement)
    expect(img.style.transform).toContain('rotate(0deg)')

    await fireEvent.click(document.querySelector('[aria-label="Reset"]') as HTMLElement)
    expect(emitted()['scale-change'][1]).toEqual([1])
    expect(img.style.transform).toContain('translate(0px, 0px) scale(1) rotate(0deg)')
  })

  it('shows image counter for multiple images', () => {
    render(ImagePreview, {
      props: {
        open: true,
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
        open: true,
        images: ['/single.jpg']
      }
    })

    expect(document.querySelector('[aria-label="Previous image"]')).not.toBeInTheDocument()
    expect(document.querySelector('[aria-label="Next image"]')).not.toBeInTheDocument()
  })
})
