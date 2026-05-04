/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import { ImagePreview } from '@expcat/tigercat-react'

describe('ImagePreview', () => {
  const images = ['/img1.jpg', '/img2.jpg', '/img3.jpg']

  it('renders nothing when not visible', () => {
    render(<ImagePreview open={false} images={images} />)

    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument()
  })

  it('renders preview dialog when visible', () => {
    render(<ImagePreview open images={images} />)

    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('displays current image', () => {
    render(<ImagePreview open images={images} currentIndex={1} />)

    const img = document.querySelector('[role="dialog"] img')
    expect(img).toHaveAttribute('src', '/img2.jpg')
  })

  it('renders navigation buttons for multiple images', () => {
    render(<ImagePreview open images={images} />)

    expect(document.querySelector('[aria-label="Previous image"]')).toBeInTheDocument()
    expect(document.querySelector('[aria-label="Next image"]')).toBeInTheDocument()
  })

  it('disables prev button on first image', () => {
    render(<ImagePreview open images={images} currentIndex={0} />)

    const prevBtn = document.querySelector('[aria-label="Previous image"]')
    expect(prevBtn).toHaveAttribute('disabled')
  })

  it('disables next button on last image', () => {
    render(<ImagePreview open images={images} currentIndex={2} />)

    const nextBtn = document.querySelector('[aria-label="Next image"]')
    expect(nextBtn).toHaveAttribute('disabled')
  })

  it('renders toolbar with zoom buttons', () => {
    render(<ImagePreview open images={images} />)

    expect(document.querySelector('[aria-label="Zoom in"]')).toBeInTheDocument()
    expect(document.querySelector('[aria-label="Zoom out"]')).toBeInTheDocument()
    expect(document.querySelector('[aria-label="Rotate left"]')).toBeInTheDocument()
    expect(document.querySelector('[aria-label="Rotate right"]')).toBeInTheDocument()
    expect(document.querySelector('[aria-label="Reset"]')).toBeInTheDocument()
  })

  it('renders close button', () => {
    render(<ImagePreview open images={images} />)

    expect(document.querySelector('[aria-label="Close preview"]')).toBeInTheDocument()
  })

  it('calls onOpenChange on close button click', () => {
    const onOpenChange = vi.fn()
    render(<ImagePreview open images={images} onOpenChange={onOpenChange} />)

    const closeBtn = document.querySelector('[aria-label="Close preview"]') as HTMLElement
    fireEvent.click(closeBtn)

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('calls onOpenChange when Escape is pressed', () => {
    const onOpenChange = vi.fn()
    render(<ImagePreview open images={images} onOpenChange={onOpenChange} />)

    fireEvent.keyDown(document, { key: 'Escape' })

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('updates current image from navigation button clicks', () => {
    const onCurrentIndexChange = vi.fn()
    render(
      <ImagePreview
        open
        images={images}
        currentIndex={1}
        onCurrentIndexChange={onCurrentIndexChange}
      />
    )

    const img = document.querySelector('[role="dialog"] img') as HTMLImageElement
    fireEvent.click(document.querySelector('[aria-label="Next image"]') as HTMLElement)

    expect(onCurrentIndexChange).toHaveBeenCalledWith(2)
    expect(img).toHaveAttribute('src', '/img3.jpg')

    fireEvent.click(document.querySelector('[aria-label="Previous image"]') as HTMLElement)

    expect(onCurrentIndexChange).toHaveBeenCalledWith(1)
    expect(img).toHaveAttribute('src', '/img2.jpg')
  })

  it('updates current image from keyboard navigation', () => {
    const onCurrentIndexChange = vi.fn()
    render(<ImagePreview open images={images} onCurrentIndexChange={onCurrentIndexChange} />)

    const img = document.querySelector('[role="dialog"] img') as HTMLImageElement
    fireEvent.keyDown(document, { key: 'ArrowRight' })

    expect(onCurrentIndexChange).toHaveBeenCalledWith(1)
    expect(img).toHaveAttribute('src', '/img2.jpg')

    fireEvent.keyDown(document, { key: 'ArrowLeft' })

    expect(onCurrentIndexChange).toHaveBeenCalledWith(0)
    expect(img).toHaveAttribute('src', '/img1.jpg')
  })

  it('updates zoom and rotation from toolbar actions and reset', () => {
    const onScaleChange = vi.fn()
    render(<ImagePreview open images={images} onScaleChange={onScaleChange} />)

    const img = document.querySelector('[role="dialog"] img') as HTMLImageElement

    fireEvent.click(document.querySelector('[aria-label="Zoom in"]') as HTMLElement)
    expect(onScaleChange).toHaveBeenCalledWith(1.5)
    expect(img.style.transform).toContain('scale(1.5)')

    fireEvent.click(document.querySelector('[aria-label="Rotate right"]') as HTMLElement)
    expect(img.style.transform).toContain('rotate(90deg)')

    fireEvent.click(document.querySelector('[aria-label="Rotate left"]') as HTMLElement)
    expect(img.style.transform).toContain('rotate(0deg)')

    fireEvent.click(document.querySelector('[aria-label="Reset"]') as HTMLElement)
    expect(onScaleChange).toHaveBeenCalledWith(1)
    expect(img.style.transform).toContain('translate(0px, 0px) scale(1) rotate(0deg)')
  })

  it('shows image counter for multiple images', () => {
    render(<ImagePreview open images={images} currentIndex={1} />)

    expect(document.body.textContent).toContain('2 / 3')
  })

  it('does not show navigation for single image', () => {
    render(<ImagePreview open images={['/single.jpg']} />)

    expect(document.querySelector('[aria-label="Previous image"]')).not.toBeInTheDocument()
    expect(document.querySelector('[aria-label="Next image"]')).not.toBeInTheDocument()
  })
})
