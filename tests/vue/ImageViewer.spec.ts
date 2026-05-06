/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { ImageViewer } from '@expcat/tigercat-vue'
import { expectNoA11yViolations } from '../utils'

const images = [
  'https://example.com/a.jpg',
  'https://example.com/b.jpg',
  'https://example.com/c.jpg'
]

describe('ImageViewer', () => {
  describe('Visibility', () => {
    it('renders nothing when open is false', () => {
      const { container } = render(ImageViewer, {
        props: { images, open: false }
      })
      expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument()
    })

    it('renders dialog when open is true', () => {
      render(ImageViewer, {
        props: { images, open: true }
      })
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('renders nothing when images is empty', () => {
      const { container } = render(ImageViewer, {
        props: { images: [], open: true }
      })
      expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument()
    })

    it('has aria-modal true', () => {
      render(ImageViewer, {
        props: { images, open: true }
      })
      expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBe('true')
    })

    it('has aria-label', () => {
      render(ImageViewer, {
        props: { images, open: true }
      })
      expect(screen.getByRole('dialog').getAttribute('aria-label')).toBe('Image viewer')
    })
  })

  describe('Image display', () => {
    it('shows the image at currentIndex', () => {
      render(ImageViewer, {
        props: { images, open: true, currentIndex: 1 }
      })
      const img = screen.getByAltText('Image 2') as HTMLImageElement
      expect(img.src).toContain('b.jpg')
    })

    it('shows first image by default', () => {
      render(ImageViewer, {
        props: { images, open: true }
      })
      const img = screen.getByAltText('Image 1') as HTMLImageElement
      expect(img.src).toContain('a.jpg')
    })
  })

  describe('Counter', () => {
    it('shows counter when showCounter and multiple images', () => {
      render(ImageViewer, {
        props: { images, open: true, showCounter: true }
      })
      expect(screen.getByText('1 / 3')).toBeInTheDocument()
    })

    it('hides counter when showCounter is false', () => {
      render(ImageViewer, {
        props: { images, open: true, showCounter: false }
      })
      expect(screen.queryByText('1 / 3')).not.toBeInTheDocument()
    })

    it('hides counter for single image', () => {
      render(ImageViewer, {
        props: { images: [images[0]], open: true, showCounter: true }
      })
      expect(screen.queryByText('1 / 1')).not.toBeInTheDocument()
    })
  })

  describe('Close button', () => {
    it('renders close button', () => {
      render(ImageViewer, {
        props: { images, open: true }
      })
      const btns = screen.getAllByLabelText('Close')
      expect(btns.length).toBeGreaterThan(0)
    })

    it('emits close event on close button click', async () => {
      const { emitted } = render(ImageViewer, {
        props: { images, open: true }
      })
      const closeBtn = screen.getAllByLabelText('Close').find((el) => el.tagName === 'BUTTON')!
      await fireEvent.click(closeBtn)
      expect(emitted().close).toBeTruthy()
      expect(emitted()['update:open']).toBeTruthy()
      expect(emitted()['update:open'][0]).toEqual([false])
    })
  })

  describe('Navigation', () => {
    it('shows nav buttons when showNav and multiple images', () => {
      render(ImageViewer, {
        props: { images, open: true, showNav: true }
      })
      expect(screen.getAllByLabelText('Previous image').length).toBeGreaterThan(0)
      expect(screen.getAllByLabelText('Next image').length).toBeGreaterThan(0)
    })

    it('hides nav buttons when showNav is false', () => {
      render(ImageViewer, {
        props: { images, open: true, showNav: false }
      })
      expect(screen.queryAllByLabelText('Previous image')).toHaveLength(0)
      expect(screen.queryAllByLabelText('Next image')).toHaveLength(0)
    })

    it('hides nav for single image', () => {
      render(ImageViewer, {
        props: { images: [images[0]], open: true, showNav: true }
      })
      expect(screen.queryAllByLabelText('Previous image')).toHaveLength(0)
    })

    it('emits update:currentIndex on next click', async () => {
      const { emitted } = render(ImageViewer, {
        props: { images, open: true, currentIndex: 0 }
      })
      const nextBtn = screen.getAllByLabelText('Next image').find((el) => el.tagName === 'BUTTON')!
      await fireEvent.click(nextBtn)
      expect(emitted()['update:currentIndex']).toBeTruthy()
      expect(emitted()['update:currentIndex'][0]).toEqual([1])
    })

    it('wraps around on next from last image', async () => {
      const { emitted } = render(ImageViewer, {
        props: { images, open: true, currentIndex: 2 }
      })
      const nextBtn = screen.getAllByLabelText('Next image').find((el) => el.tagName === 'BUTTON')!
      await fireEvent.click(nextBtn)
      expect(emitted()['update:currentIndex'][0]).toEqual([0])
    })

    it('wraps around on prev from first image', async () => {
      const { emitted } = render(ImageViewer, {
        props: { images, open: true, currentIndex: 0 }
      })
      const prevBtn = screen
        .getAllByLabelText('Previous image')
        .find((el) => el.tagName === 'BUTTON')!
      await fireEvent.click(prevBtn)
      expect(emitted()['update:currentIndex'][0]).toEqual([2])
    })
  })

  describe('Toolbar', () => {
    it('shows zoom buttons when zoomable', () => {
      render(ImageViewer, {
        props: { images, open: true, zoomable: true }
      })
      expect(screen.getAllByLabelText('Zoom in').length).toBeGreaterThan(0)
      expect(screen.getAllByLabelText('Zoom out').length).toBeGreaterThan(0)
    })

    it('hides zoom buttons when not zoomable', () => {
      render(ImageViewer, {
        props: { images, open: true, zoomable: false, rotatable: false }
      })
      expect(screen.queryAllByLabelText('Zoom in')).toHaveLength(0)
      expect(screen.queryAllByLabelText('Zoom out')).toHaveLength(0)
    })

    it('shows rotate buttons when rotatable', () => {
      render(ImageViewer, {
        props: { images, open: true, rotatable: true }
      })
      expect(screen.getAllByLabelText('Rotate left').length).toBeGreaterThan(0)
      expect(screen.getAllByLabelText('Rotate right').length).toBeGreaterThan(0)
    })

    it('hides rotate buttons when not rotatable', () => {
      render(ImageViewer, {
        props: { images, open: true, rotatable: false, zoomable: false }
      })
      expect(screen.queryAllByLabelText('Rotate left')).toHaveLength(0)
      expect(screen.queryAllByLabelText('Rotate right')).toHaveLength(0)
    })
  })

  describe('Keyboard', () => {
    it('closes on Escape key', async () => {
      const { emitted } = render(ImageViewer, {
        props: { images, open: true }
      })
      await fireEvent.keyDown(document, { key: 'Escape' })
      expect(emitted().close).toBeTruthy()
    })

    it('navigates on ArrowRight key', async () => {
      const { emitted } = render(ImageViewer, {
        props: { images, open: true, currentIndex: 0 }
      })
      await fireEvent.keyDown(document, { key: 'ArrowRight' })
      expect(emitted()['update:currentIndex']).toBeTruthy()
    })

    it('navigates on ArrowLeft key', async () => {
      const { emitted } = render(ImageViewer, {
        props: { images, open: true, currentIndex: 1 }
      })
      await fireEvent.keyDown(document, { key: 'ArrowLeft' })
      expect(emitted()['update:currentIndex']).toBeTruthy()
    })
  })

  describe('Custom className', () => {
    it('merges custom className', () => {
      render(ImageViewer, {
        props: { images, open: true, className: 'my-viewer' }
      })
      expect(screen.getByRole('dialog').className).toContain('my-viewer')
    })
  })

  describe('a11y', () => {
    it('should have no accessibility violations when open', async () => {
      const { container } = render(ImageViewer, {
        props: { images, open: true }
      })
      await expectNoA11yViolations(container)
    })
  })

  describe('Edge cases', () => {
    it('handles out-of-bounds currentIndex gracefully', () => {
      // currentIndex=10 with only 3 images — should not crash
      const { container } = render(ImageViewer, {
        props: { images, open: true, currentIndex: 10 }
      })
      expect(container.querySelector('[role="dialog"]')).toBeInTheDocument()
    })

    it('does not close on backdrop click when maskClosable=false', async () => {
      const { emitted, getByRole } = render(ImageViewer, {
        props: { images, open: true, maskClosable: false }
      })
      const dialog = getByRole('dialog')
      await fireEvent.click(dialog)
      expect(emitted().close).toBeUndefined()
    })

    it('does not navigate when closed', async () => {
      const { emitted } = render(ImageViewer, {
        props: { images, open: false }
      })
      await fireEvent.keyDown(document, { key: 'ArrowRight' })
      expect(emitted()['update:currentIndex']).toBeUndefined()
    })

    it('zoom in button changes transform', async () => {
      render(ImageViewer, {
        props: { images, open: true, zoomable: true }
      })
      const zoomIn = screen.getAllByLabelText('Zoom in').find((el) => el.tagName === 'BUTTON')!
      const img = screen.getByAltText('Image 1') as HTMLImageElement
      const styleBefore = img.style.transform
      await fireEvent.click(zoomIn)
      // Transform should change after zoom in
      expect(img.style.transform).not.toBe(styleBefore)
    })

    it('rotate right button changes transform', async () => {
      render(ImageViewer, {
        props: { images, open: true, rotatable: true }
      })
      const rotateRight = screen.getAllByLabelText('Rotate right').find((el) => el.tagName === 'BUTTON')!
      const img = screen.getByAltText('Image 1') as HTMLImageElement
      const styleBefore = img.style.transform
      await fireEvent.click(rotateRight)
      expect(img.style.transform).not.toBe(styleBefore)
    })

    it('resets transform when navigating to next image', async () => {
      render(ImageViewer, {
        props: { images, open: true, currentIndex: 0, zoomable: true }
      })
      // Zoom in first
      const zoomIn = screen.getAllByLabelText('Zoom in').find((el) => el.tagName === 'BUTTON')!
      await fireEvent.click(zoomIn)
      // Navigate next
      const next = screen.getAllByLabelText('Next image').find((el) => el.tagName === 'BUTTON')!
      await fireEvent.click(next)
      // New image should have default transform (scale 1)
      const img = screen.getByAltText('Image 2') as HTMLImageElement
      expect(img.style.transform).toContain('scale(1)')
    })
  })
})
