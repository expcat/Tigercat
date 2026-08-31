/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { render, fireEvent, waitFor, screen } from '@testing-library/vue'
import { ImagePreview } from '@expcat/tigercat-vue/ImagePreview'
import { ImageViewer } from '@expcat/tigercat-vue/ImageViewer'
import { Modal } from '@expcat/tigercat-vue/Modal'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { getImageViewerLabels } from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { expectNoA11yViolationsIsolated } from '../utils'

const labels = getImageViewerLabels()
const images = ['/img1.jpg', '/img2.jpg', '/img3.jpg']

describe('ImagePreview', () => {
  it('renders nothing when closed', () => {
    render(ImagePreview, { props: { open: false, images } })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders a modal dialog when open', () => {
    render(ImagePreview, { props: { open: true, images } })
    const dialog = document.querySelector('[role="dialog"]')
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-label', labels.previewDialogAriaLabel)
  })

  it('locks body scroll while open and restores it on unmount', () => {
    const { unmount } = render(ImagePreview, { props: { open: true, images } })
    expect(document.body.style.overflow).toBe('hidden')
    unmount()
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('does not unlock a Modal when a closed preview mounts', () => {
    render({
      setup() {
        return () => [
          h(Modal, { open: true, title: 'Underneath' }, () => 'Still locked'),
          h(ImagePreview, { open: false, images })
        ]
      }
    })
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('emits close and hides the dialog when the gallery is emptied', async () => {
    const { emitted, rerender } = render(ImagePreview, {
      props: { open: true, images }
    })
    expect(document.querySelector('[role="dialog"]')).toBeInTheDocument()
    await rerender({ open: true, images: [] })
    expect(emitted()['update:open']?.some((payload) => payload[0] === false)).toBe(true)
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument()
  })

  it('clamps currentIndex to the last image', () => {
    render(ImagePreview, { props: { open: true, images, currentIndex: 9 } })
    expect(document.querySelector('[role="dialog"] img')).toHaveAttribute('src', '/img3.jpg')
    expect(document.body.textContent).toContain('3 / 3')
  })

  it('uses per-item alt and locale fallback', async () => {
    const { rerender } = render(ImagePreview, {
      props: { open: true, images: [{ src: '/cat.jpg', alt: 'Cat' }] }
    })
    expect(document.querySelector('[role="dialog"] img')).toHaveAttribute('alt', 'Cat')
    await rerender({ open: true, images: ['/dog.jpg'] })
    expect(document.querySelector('[role="dialog"] img')).toHaveAttribute(
      'alt',
      labels.previewImageAriaLabel.replace('{index}', '1').replace('{total}', '1')
    )
  })

  it('reads chrome names from the locale object', () => {
    const zhLabels = getImageViewerLabels(zhCN)
    render({
      setup() {
        return () =>
          h(ConfigProvider, { locale: zhCN }, () => h(ImagePreview, { open: true, images }))
      }
    })
    expect(screen.getByRole('button', { name: zhLabels.closePreviewAriaLabel })).toBeInTheDocument()
  })

  it('places previous at inline-start and close at inline-end', () => {
    render(ImagePreview, { props: { open: true, images } })
    expect(screen.getByRole('button', { name: labels.previousImageAriaLabel }).className).toMatch(
      /inset-inline-start/
    )
    expect(screen.getByRole('button', { name: labels.closePreviewAriaLabel }).className).toMatch(
      /inset-inline-end/
    )
  })

  it('closes from the close button, Escape, and the mask', async () => {
    const { emitted } = render(ImagePreview, { props: { open: true, images } })
    await fireEvent.click(screen.getByRole('button', { name: labels.closePreviewAriaLabel }))
    expect(emitted()['update:open']?.[0]).toEqual([false])

    await fireEvent.keyDown(document, { key: 'Escape' })
    expect(emitted()['update:open']?.length).toBeGreaterThan(1)

    await fireEvent.click(
      document.querySelector('[role="dialog"] [aria-hidden="true"]') as HTMLElement
    )
    expect(emitted()['update:open']?.length).toBeGreaterThan(2)
  })

  it('navigates with buttons and stops at the ends', async () => {
    const { emitted } = render(ImagePreview, {
      props: { open: true, images, currentIndex: 1 }
    })
    const img = document.querySelector('[role="dialog"] img') as HTMLImageElement
    await fireEvent.click(screen.getByRole('button', { name: labels.nextImageAriaLabel }))
    expect(emitted()['update:currentIndex']?.[0]).toEqual([2])
    expect(img).toHaveAttribute('src', '/img3.jpg')
    expect(screen.getByRole('button', { name: labels.nextImageAriaLabel })).toBeDisabled()
  })

  it('does not listen to arrows when showNav is false', async () => {
    const { emitted } = render(ImagePreview, {
      props: { open: true, images, showNav: false }
    })
    expect(
      screen.queryByRole('button', { name: labels.previousImageAriaLabel })
    ).not.toBeInTheDocument()
    await fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(emitted()['update:currentIndex']).toBeFalsy()
  })

  it('zooms from the toolbar and a small wheel delta', async () => {
    const { emitted } = render(ImagePreview, { props: { open: true, images } })
    const img = document.querySelector('[role="dialog"] img') as HTMLImageElement
    await fireEvent.click(screen.getByRole('button', { name: labels.zoomInAriaLabel }))
    expect(emitted()['scale-change']?.[0]).toEqual([1.5])
    expect(img.style.transform).toContain('scale(1.5)')

    await fireEvent.wheel(document.querySelector('[role="dialog"]') as HTMLElement, { deltaY: -20 })
    const afterWheel = Number(/scale\(([^)]+)\)/.exec(img.style.transform)?.[1])
    expect(afterWheel).toBeGreaterThan(1)
    expect(afterWheel).toBeLessThan(2)
  })

  it('keeps panning after the pointer leaves the bitmap', async () => {
    render(ImagePreview, { props: { open: true, images: ['/solo.jpg'] } })
    const img = document.querySelector('[role="dialog"] img') as HTMLImageElement
    await fireEvent.pointerDown(img, {
      pointerId: 1,
      button: 0,
      clientX: 10,
      clientY: 10,
      pointerType: 'mouse'
    })
    await fireEvent.pointerMove(document, { pointerId: 1, clientX: 40, clientY: 50 })
    expect(img.style.transform).toContain('translate(30px, 40px)')
    await fireEvent.pointerCancel(document, { pointerId: 1 })
    await fireEvent.pointerMove(document, { pointerId: 1, clientX: 80, clientY: 90 })
    expect(img.style.transform).toContain('translate(30px, 40px)')
  })

  it('resets transform when the image changes', async () => {
    const Harness = defineComponent({
      setup() {
        const currentIndex = ref(0)
        return () => [
          h(
            'button',
            {
              type: 'button',
              onClick: () => {
                currentIndex.value = 1
              }
            },
            'next-item'
          ),
          h(ImagePreview, { open: true, images, currentIndex: currentIndex.value })
        ]
      }
    })
    render(Harness)
    await fireEvent.click(screen.getByRole('button', { name: labels.zoomInAriaLabel }))
    await fireEvent.click(screen.getByRole('button', { name: 'next-item' }))
    expect(
      (document.querySelector('[role="dialog"] img') as HTMLImageElement).style.transform
    ).toContain('scale(1)')
  })

  it('moves focus into the dialog and keeps one name on the close button', async () => {
    render(ImagePreview, { props: { open: true, images } })
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement
    await waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true)
    })
    expect(screen.getAllByRole('button', { name: labels.closePreviewAriaLabel })).toHaveLength(1)
  })

  it('has no axe violations on an open gallery', async () => {
    render(ImagePreview, { props: { open: true, images } })
    await expectNoA11yViolationsIsolated(document.body)
  })

  it('shares one dialog tree with ImageViewer', async () => {
    const { emitted } = render(ImageViewer, {
      props: {
        open: true,
        images,
        minZoom: 1,
        maxZoom: 1,
        showNav: false
      }
    })
    expect(document.querySelector('[data-tiger-image-preview]')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: labels.previousImageAriaLabel })
    ).not.toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: labels.closePreviewAriaLabel }))
    expect(emitted()['update:open']?.[0]).toEqual([false])
    expect(emitted().close?.[0]).toEqual([])
  })
})
