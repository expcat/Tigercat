/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import { ImagePreview } from '@expcat/tigercat-react'

describe('ImagePreview', () => {
  const images = ['/img1.jpg', '/img2.jpg', '/img3.jpg']

  it('renders nothing when not visible', () => {
    render(<ImagePreview visible={false} images={images} />)

    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument()
  })

  it('renders preview dialog when visible', () => {
    render(<ImagePreview visible images={images} />)

    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
  })

  it('displays current image', () => {
    render(<ImagePreview visible images={images} currentIndex={1} />)

    const img = document.querySelector('[role="dialog"] img')
    expect(img).toHaveAttribute('src', '/img2.jpg')
  })

  it('renders navigation buttons for multiple images', () => {
    render(<ImagePreview visible images={images} />)

    expect(document.querySelector('[aria-label="Previous image"]')).toBeInTheDocument()
    expect(document.querySelector('[aria-label="Next image"]')).toBeInTheDocument()
  })

  it('disables prev button on first image', () => {
    render(<ImagePreview visible images={images} currentIndex={0} />)

    const prevBtn = document.querySelector('[aria-label="Previous image"]')
    expect(prevBtn).toHaveAttribute('disabled')
  })

  it('disables next button on last image', () => {
    render(<ImagePreview visible images={images} currentIndex={2} />)

    const nextBtn = document.querySelector('[aria-label="Next image"]')
    expect(nextBtn).toHaveAttribute('disabled')
  })

  it('renders toolbar with zoom buttons', () => {
    render(<ImagePreview visible images={images} />)

    expect(document.querySelector('[aria-label="Zoom in"]')).toBeInTheDocument()
    expect(document.querySelector('[aria-label="Zoom out"]')).toBeInTheDocument()
    expect(document.querySelector('[aria-label="Reset"]')).toBeInTheDocument()
  })

  it('renders close button', () => {
    render(<ImagePreview visible images={images} />)

    expect(document.querySelector('[aria-label="Close preview"]')).toBeInTheDocument()
  })

  it('calls onVisibleChange on close button click', () => {
    const onVisibleChange = vi.fn()
    render(<ImagePreview visible images={images} onVisibleChange={onVisibleChange} />)

    const closeBtn = document.querySelector('[aria-label="Close preview"]') as HTMLElement
    fireEvent.click(closeBtn)

    expect(onVisibleChange).toHaveBeenCalledWith(false)
  })

  it('shows image counter for multiple images', () => {
    render(<ImagePreview visible images={images} currentIndex={1} />)

    expect(document.body.textContent).toContain('2 / 3')
  })

  it('does not show navigation for single image', () => {
    render(<ImagePreview visible images={['/single.jpg']} />)

    expect(document.querySelector('[aria-label="Previous image"]')).not.toBeInTheDocument()
    expect(document.querySelector('[aria-label="Next image"]')).not.toBeInTheDocument()
  })
})

// vi needs to be imported
import { vi } from 'vitest'
