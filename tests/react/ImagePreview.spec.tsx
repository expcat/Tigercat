/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, waitFor, screen } from '@testing-library/react'
import React, { useState } from 'react'
import { ImagePreview } from '@expcat/tigercat-react/ImagePreview'
import { ImageViewer } from '@expcat/tigercat-react/ImageViewer'
import { Modal } from '@expcat/tigercat-react/Modal'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { getImageViewerLabels } from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { expectNoA11yViolationsIsolated } from '../utils/react'

const labels = getImageViewerLabels()
const images = ['/img1.jpg', '/img2.jpg', '/img3.jpg']

describe('ImagePreview', () => {
  it('renders nothing when closed', () => {
    render(<ImagePreview open={false} images={images} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders a modal dialog when open', () => {
    render(<ImagePreview open images={images} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-label', labels.previewDialogAriaLabel)
  })

  it('locks body scroll while open and restores it on close', () => {
    const { unmount } = render(<ImagePreview open images={images} />)
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('does not unlock a Modal when a closed preview mounts', () => {
    render(
      <>
        <Modal open title="Underneath">
          Still locked
        </Modal>
        <ImagePreview open={false} images={images} />
      </>
    )
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('emits close and hides the dialog when the gallery is emptied', () => {
    const onOpenChange = vi.fn()
    const { rerender } = render(<ImagePreview open images={images} onOpenChange={onOpenChange} />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    rerender(<ImagePreview open images={[]} onOpenChange={onOpenChange} />)
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('clamps currentIndex to the last image', () => {
    render(<ImagePreview open images={images} currentIndex={9} />)
    expect(document.querySelector('[role="dialog"] img')).toHaveAttribute('src', '/img3.jpg')
    expect(screen.getByText('3 / 3')).toBeInTheDocument()
  })

  it('uses per-item alt and locale fallback', () => {
    const { rerender } = render(<ImagePreview open images={[{ src: '/cat.jpg', alt: 'Cat' }]} />)
    expect(document.querySelector('[role="dialog"] img')).toHaveAttribute('alt', 'Cat')

    rerender(<ImagePreview open images={['/dog.jpg']} />)
    expect(document.querySelector('[role="dialog"] img')).toHaveAttribute(
      'alt',
      labels.previewImageAriaLabel.replace('{index}', '1').replace('{total}', '1')
    )
  })

  it('reads chrome names from the locale object', () => {
    const zhLabels = getImageViewerLabels(zhCN)
    render(
      <ConfigProvider locale={zhCN}>
        <ImagePreview open images={images} />
      </ConfigProvider>
    )
    expect(screen.getByRole('button', { name: zhLabels.closePreviewAriaLabel })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: zhLabels.previousImageAriaLabel })
    ).toBeInTheDocument()
  })

  it('places previous at inline-start and close at inline-end', () => {
    render(<ImagePreview open images={images} />)
    expect(screen.getByRole('button', { name: labels.previousImageAriaLabel }).className).toMatch(
      /inset-inline-start/
    )
    expect(screen.getByRole('button', { name: labels.closePreviewAriaLabel }).className).toMatch(
      /inset-inline-end/
    )
  })

  it('closes from the close button, Escape, and the mask', () => {
    const onOpenChange = vi.fn()
    const { rerender } = render(<ImagePreview open images={images} onOpenChange={onOpenChange} />)
    fireEvent.click(screen.getByRole('button', { name: labels.closePreviewAriaLabel }))
    expect(onOpenChange).toHaveBeenCalledWith(false)

    onOpenChange.mockClear()
    rerender(<ImagePreview open images={images} onOpenChange={onOpenChange} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onOpenChange).toHaveBeenCalledWith(false)

    onOpenChange.mockClear()
    rerender(<ImagePreview open images={images} onOpenChange={onOpenChange} />)
    fireEvent.click(document.querySelector('[role="dialog"] [aria-hidden="true"]') as HTMLElement)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('does not close from the mask when maskClosable is false', () => {
    const onOpenChange = vi.fn()
    render(<ImagePreview open images={images} maskClosable={false} onOpenChange={onOpenChange} />)
    fireEvent.click(document.querySelector('[role="dialog"] [aria-hidden="true"]') as HTMLElement)
    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('navigates with buttons and arrow keys and stops at the ends', () => {
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
    fireEvent.click(screen.getByRole('button', { name: labels.nextImageAriaLabel }))
    expect(onCurrentIndexChange).toHaveBeenCalledWith(2)
    expect(img).toHaveAttribute('src', '/img3.jpg')
    expect(screen.getByRole('button', { name: labels.nextImageAriaLabel })).toBeDisabled()

    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(onCurrentIndexChange).toHaveBeenLastCalledWith(2)

    fireEvent.click(screen.getByRole('button', { name: labels.previousImageAriaLabel }))
    expect(onCurrentIndexChange).toHaveBeenCalledWith(1)
  })

  it('does not listen to arrows when showNav is false', () => {
    const onCurrentIndexChange = vi.fn()
    render(
      <ImagePreview
        open
        images={images}
        showNav={false}
        onCurrentIndexChange={onCurrentIndexChange}
      />
    )
    expect(
      screen.queryByRole('button', { name: labels.previousImageAriaLabel })
    ).not.toBeInTheDocument()
    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(onCurrentIndexChange).not.toHaveBeenCalled()
  })

  it('zooms from the toolbar and keyboard', () => {
    const onScaleChange = vi.fn()
    render(<ImagePreview open images={images} onScaleChange={onScaleChange} />)
    const img = document.querySelector('[role="dialog"] img') as HTMLImageElement

    fireEvent.click(screen.getByRole('button', { name: labels.zoomInAriaLabel }))
    expect(onScaleChange).toHaveBeenCalledWith(1.5)
    expect(img.style.transform).toContain('scale(1.5)')

    fireEvent.keyDown(document, { key: '-' })
    expect(img.style.transform).toContain('scale(1)')
  })

  it('applies a small wheel delta without jumping to max scale', () => {
    render(<ImagePreview open images={images} />)
    const img = document.querySelector('[role="dialog"] img') as HTMLImageElement
    fireEvent.wheel(screen.getByRole('dialog'), { deltaY: -20 })
    const afterWheel = Number(/scale\(([^)]+)\)/.exec(img.style.transform)?.[1] ?? '1')
    expect(afterWheel).toBeGreaterThan(1)
    expect(afterWheel).toBeLessThan(1.5)
  })

  it('disables zoom buttons at the scale bounds', () => {
    render(<ImagePreview open images={['/a.jpg']} minScale={1} maxScale={1} />)
    expect(screen.getByRole('button', { name: labels.zoomInAriaLabel })).toBeDisabled()
    expect(screen.getByRole('button', { name: labels.zoomOutAriaLabel })).toBeDisabled()
  })

  it('keeps panning after the pointer leaves the bitmap', () => {
    render(<ImagePreview open images={['/solo.jpg']} />)
    const img = document.querySelector('[role="dialog"] img') as HTMLImageElement
    fireEvent.pointerDown(img, {
      pointerId: 1,
      button: 0,
      clientX: 10,
      clientY: 10,
      pointerType: 'mouse'
    })
    fireEvent.pointerMove(document, { pointerId: 1, clientX: 40, clientY: 50 })
    expect(img.style.transform).toContain('translate(30px, 40px)')
    fireEvent.pointerCancel(document, { pointerId: 1 })
    fireEvent.pointerMove(document, { pointerId: 1, clientX: 80, clientY: 90 })
    expect(img.style.transform).toContain('translate(30px, 40px)')
  })

  it('swipes to the next image at base scale', () => {
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
    fireEvent.pointerDown(img, {
      pointerId: 7,
      clientX: 180,
      clientY: 60,
      pointerType: 'touch'
    })
    fireEvent.pointerMove(document, { pointerId: 7, clientX: 80, clientY: 66 })
    fireEvent.pointerUp(document, { pointerId: 7, clientX: 80, clientY: 66 })
    expect(onCurrentIndexChange).toHaveBeenCalledWith(2)
  })

  it('resets transform when the image changes and when reopened', () => {
    function Harness() {
      const [open, setOpen] = useState(true)
      const [currentIndex, setCurrentIndex] = useState(0)
      return (
        <>
          <button type="button" onClick={() => setCurrentIndex(1)}>
            next-item
          </button>
          <button type="button" onClick={() => setOpen((value) => !value)}>
            toggle
          </button>
          <ImagePreview open={open} images={images} currentIndex={currentIndex} />
        </>
      )
    }
    render(<Harness />)
    fireEvent.click(screen.getByRole('button', { name: labels.zoomInAriaLabel }))
    fireEvent.click(screen.getByRole('button', { name: 'next-item' }))
    expect(
      (document.querySelector('[role="dialog"] img') as HTMLImageElement).style.transform
    ).toContain('scale(1)')
    fireEvent.click(screen.getByRole('button', { name: labels.zoomInAriaLabel }))
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }))
    fireEvent.click(screen.getByRole('button', { name: 'toggle' }))
    expect(
      (document.querySelector('[role="dialog"] img') as HTMLImageElement).style.transform
    ).toContain('scale(1)')
  })

  it('moves focus into the dialog and keeps one name on the close button', async () => {
    render(<ImagePreview open images={images} />)
    const dialog = screen.getByRole('dialog')
    await waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true)
    })
    expect(screen.getAllByRole('button', { name: labels.closePreviewAriaLabel })).toHaveLength(1)
  })

  it('has no axe violations on an open gallery', async () => {
    render(<ImagePreview open images={images} />)
    await expectNoA11yViolationsIsolated(document.body)
  })

  it('shares one dialog tree with ImageViewer, including minZoom mapping', () => {
    const onClose = vi.fn()
    const onOpenChange = vi.fn()
    render(
      <ImageViewer
        open
        images={images}
        minZoom={1}
        maxZoom={1}
        showNav={false}
        onClose={onClose}
        onOpenChange={onOpenChange}
      />
    )
    expect(screen.getByRole('dialog')).toHaveAttribute('data-tiger-image-preview')
    expect(
      screen.queryByRole('button', { name: labels.previousImageAriaLabel })
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: labels.zoomInAriaLabel })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: labels.closePreviewAriaLabel }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
