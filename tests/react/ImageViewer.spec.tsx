/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { ImageViewer } from '@expcat/tigercat-react'
import { expectNoA11yViolations } from '../utils/react'

const images = [
  'https://example.com/a.jpg',
  'https://example.com/b.jpg',
  'https://example.com/c.jpg'
]

describe('ImageViewer', () => {
  describe('Visibility', () => {
    it('renders nothing when open is false', () => {
      const { container } = render(<ImageViewer images={images} open={false} />)
      expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument()
    })

    it('renders dialog when open is true', () => {
      render(<ImageViewer images={images} open />)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('renders nothing when images is empty', () => {
      const { container } = render(<ImageViewer images={[]} open />)
      expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument()
    })

    it('has aria-modal true', () => {
      render(<ImageViewer images={images} open />)
      expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBe('true')
    })

    it('has aria-label', () => {
      render(<ImageViewer images={images} open />)
      expect(screen.getByRole('dialog').getAttribute('aria-label')).toBe('Image viewer')
    })
  })

  describe('Image display', () => {
    it('shows the image at currentIndex', () => {
      render(<ImageViewer images={images} open currentIndex={1} />)
      const img = screen.getByAltText('Image 2') as HTMLImageElement
      expect(img.src).toContain('b.jpg')
    })

    it('shows first image by default', () => {
      render(<ImageViewer images={images} open />)
      const img = screen.getByAltText('Image 1') as HTMLImageElement
      expect(img.src).toContain('a.jpg')
    })
  })

  describe('Counter', () => {
    it('shows counter when showCounter and multiple images', () => {
      render(<ImageViewer images={images} open showCounter />)
      expect(screen.getByText('1 / 3')).toBeInTheDocument()
    })

    it('hides counter when showCounter is false', () => {
      render(<ImageViewer images={images} open showCounter={false} />)
      expect(screen.queryByText('1 / 3')).not.toBeInTheDocument()
    })

    it('hides counter for single image', () => {
      render(<ImageViewer images={[images[0]]} open showCounter />)
      expect(screen.queryByText('1 / 1')).not.toBeInTheDocument()
    })
  })

  describe('Close button', () => {
    it('renders close button', () => {
      render(<ImageViewer images={images} open />)
      expect(screen.getAllByLabelText('Close').length).toBeGreaterThan(0)
    })

    it('calls onClose on close button click', async () => {
      const onClose = vi.fn()
      render(<ImageViewer images={images} open onClose={onClose} />)
      const closeBtn = screen.getAllByLabelText('Close').find((el) => el.tagName === 'BUTTON')!
      await fireEvent.click(closeBtn)
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Navigation', () => {
    it('shows nav buttons when showNav and multiple images', () => {
      render(<ImageViewer images={images} open showNav />)
      expect(screen.getAllByLabelText('Previous image').length).toBeGreaterThan(0)
      expect(screen.getAllByLabelText('Next image').length).toBeGreaterThan(0)
    })

    it('hides nav buttons when showNav is false', () => {
      render(<ImageViewer images={images} open showNav={false} />)
      expect(screen.queryAllByLabelText('Previous image')).toHaveLength(0)
      expect(screen.queryAllByLabelText('Next image')).toHaveLength(0)
    })

    it('hides nav for single image', () => {
      render(<ImageViewer images={[images[0]]} open showNav />)
      expect(screen.queryAllByLabelText('Previous image')).toHaveLength(0)
    })

    it('calls onIndexChange on next click', async () => {
      const onIndexChange = vi.fn()
      render(<ImageViewer images={images} open currentIndex={0} onIndexChange={onIndexChange} />)
      const nextBtn = screen.getAllByLabelText('Next image').find((el) => el.tagName === 'BUTTON')!
      await fireEvent.click(nextBtn)
      expect(onIndexChange).toHaveBeenCalledWith(1)
    })

    it('wraps around on next from last image', async () => {
      const onIndexChange = vi.fn()
      render(<ImageViewer images={images} open currentIndex={2} onIndexChange={onIndexChange} />)
      const nextBtn = screen.getAllByLabelText('Next image').find((el) => el.tagName === 'BUTTON')!
      await fireEvent.click(nextBtn)
      expect(onIndexChange).toHaveBeenCalledWith(0)
    })

    it('wraps around on prev from first image', async () => {
      const onIndexChange = vi.fn()
      render(<ImageViewer images={images} open currentIndex={0} onIndexChange={onIndexChange} />)
      const prevBtn = screen
        .getAllByLabelText('Previous image')
        .find((el) => el.tagName === 'BUTTON')!
      await fireEvent.click(prevBtn)
      expect(onIndexChange).toHaveBeenCalledWith(2)
    })
  })

  describe('Toolbar', () => {
    it('shows zoom buttons when zoomable', () => {
      render(<ImageViewer images={images} open zoomable />)
      expect(screen.getAllByLabelText('Zoom in').length).toBeGreaterThan(0)
      expect(screen.getAllByLabelText('Zoom out').length).toBeGreaterThan(0)
    })

    it('hides zoom buttons when not zoomable', () => {
      render(<ImageViewer images={images} open zoomable={false} rotatable={false} />)
      expect(screen.queryAllByLabelText('Zoom in')).toHaveLength(0)
    })

    it('shows rotate buttons when rotatable', () => {
      render(<ImageViewer images={images} open rotatable />)
      expect(screen.getAllByLabelText('Rotate left').length).toBeGreaterThan(0)
      expect(screen.getAllByLabelText('Rotate right').length).toBeGreaterThan(0)
    })

    it('hides rotate buttons when not rotatable', () => {
      render(<ImageViewer images={images} open rotatable={false} zoomable={false} />)
      expect(screen.queryAllByLabelText('Rotate left')).toHaveLength(0)
    })
  })

  describe('Keyboard', () => {
    it('closes on Escape key', async () => {
      const onClose = vi.fn()
      render(<ImageViewer images={images} open onClose={onClose} />)
      await act(() => {
        fireEvent.keyDown(document, { key: 'Escape' })
      })
      expect(onClose).toHaveBeenCalled()
    })

    it('navigates on ArrowRight key', async () => {
      const onIndexChange = vi.fn()
      render(<ImageViewer images={images} open currentIndex={0} onIndexChange={onIndexChange} />)
      await act(() => {
        fireEvent.keyDown(document, { key: 'ArrowRight' })
      })
      expect(onIndexChange).toHaveBeenCalled()
    })

    it('navigates on ArrowLeft key', async () => {
      const onIndexChange = vi.fn()
      render(<ImageViewer images={images} open currentIndex={1} onIndexChange={onIndexChange} />)
      await act(() => {
        fireEvent.keyDown(document, { key: 'ArrowLeft' })
      })
      expect(onIndexChange).toHaveBeenCalled()
    })
  })

  describe('Custom className', () => {
    it('merges custom className', () => {
      render(<ImageViewer images={images} open className="my-viewer" />)
      expect(screen.getByRole('dialog').className).toContain('my-viewer')
    })
  })

  describe('a11y', () => {
    it('should have no accessibility violations when open', async () => {
      const { container } = render(<ImageViewer images={images} open />)
      await expectNoA11yViolations(container)
    })
  })
})
