/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { render, fireEvent, waitFor, screen } from '@testing-library/vue'
import { ImagePreview } from '@expcat/tigercat-vue/ImagePreview'
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
    expect(screen.getByRole('button', { name: labels.previousImageAriaLabel }).className).toContain(
      'tiger-image-preview-nav--prev'
    )
    expect(screen.getByRole('button', { name: labels.closePreviewAriaLabel }).className).toContain(
      'tiger-image-preview-close'
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

  it('does not close after the open preview is unmounted', async () => {
    const onClose = vi.fn()
    const { unmount } = render(ImagePreview, {
      props: { open: true, images, 'onUpdate:open': onClose }
    })
    unmount()
    const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
    document.dispatchEvent(event)
    expect(onClose).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)
  })

  it('requests the next index without leaving a controlled currentIndex', async () => {
    const { emitted } = render(ImagePreview, {
      props: { open: true, images, currentIndex: 1 }
    })
    const img = document.querySelector('[role="dialog"] img') as HTMLImageElement
    expect(img).toHaveAttribute('src', '/img2.jpg')
    await fireEvent.click(screen.getByRole('button', { name: labels.nextImageAriaLabel }))
    expect(emitted()['update:currentIndex']?.[0]).toEqual([2])
    expect(img).toHaveAttribute('src', '/img2.jpg')
    expect(screen.getByRole('button', { name: labels.nextImageAriaLabel })).toBeEnabled()
    await fireEvent.click(screen.getByRole('button', { name: labels.nextImageAriaLabel }))
    expect(emitted()['update:currentIndex']?.[1]).toEqual([2])
    expect(img).toHaveAttribute('src', '/img2.jpg')
  })

  it('navigates uncontrolled images with buttons and loops at the ends', async () => {
    const { emitted } = render(ImagePreview, { props: { open: true, images } })
    const img = document.querySelector('[role="dialog"] img') as HTMLImageElement
    await fireEvent.click(screen.getByRole('button', { name: labels.nextImageAriaLabel }))
    expect(emitted()['update:currentIndex']?.[0]).toEqual([1])
    expect(img).toHaveAttribute('src', '/img2.jpg')
    await fireEvent.click(screen.getByRole('button', { name: labels.nextImageAriaLabel }))
    expect(img).toHaveAttribute('src', '/img3.jpg')
    await fireEvent.click(screen.getByRole('button', { name: labels.nextImageAriaLabel }))
    expect(emitted()['update:currentIndex']?.at(-1)).toEqual([0])
    expect(img).toHaveAttribute('src', '/img1.jpg')
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
    const dialog = img.closest('[role="dialog"]') as HTMLElement
    Object.defineProperty(img, 'offsetWidth', { configurable: true, value: 400 })
    Object.defineProperty(img, 'offsetHeight', { configurable: true, value: 400 })
    Object.defineProperty(dialog, 'clientWidth', { configurable: true, value: 200 })
    Object.defineProperty(dialog, 'clientHeight', { configurable: true, value: 200 })
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

  it('rebinds swipe when images or touchSwipeable change while open', async () => {
    const swipe = async (node: HTMLElement) => {
      await fireEvent.pointerDown(node, {
        pointerId: 7,
        clientX: 180,
        clientY: 60,
        pointerType: 'touch'
      })
      await fireEvent.pointerMove(document, { pointerId: 7, clientX: 80, clientY: 66 })
      await fireEvent.pointerUp(document, { pointerId: 7, clientX: 80, clientY: 66 })
    }

    const grown = render(ImagePreview, { props: { open: true, images: ['/a.jpg'] } })
    await grown.rerender({ open: true, images: ['/a.jpg', '/b.jpg'] })
    const grownImg = document.querySelector('[role="dialog"] img') as HTMLImageElement
    await swipe(grownImg)
    expect(grown.emitted()['update:currentIndex']?.[0]).toEqual([1])
    expect(grownImg).toHaveAttribute('src', '/b.jpg')
    grown.unmount()

    const locked = render(ImagePreview, {
      props: { open: true, images, touchSwipeable: true }
    })
    await locked.rerender({ open: true, images, touchSwipeable: false })
    const lockedImg = document.querySelector('[role="dialog"] img') as HTMLImageElement
    await swipe(lockedImg)
    expect(locked.emitted()['update:currentIndex']).toBeFalsy()
    expect(lockedImg).toHaveAttribute('src', '/img1.jpg')
  })

  it('keeps open, navigate, and reset scale inside minScale and maxScale', async () => {
    const { emitted } = render(ImagePreview, {
      props: { open: true, images, minScale: 2, maxScale: 3 }
    })
    const img = () => document.querySelector('[role="dialog"] img') as HTMLImageElement
    const scaleOf = () => Number(/scale\(([^)]+)\)/.exec(img().style.transform)?.[1])
    expect(scaleOf()).toBeGreaterThanOrEqual(2)
    expect(scaleOf()).toBeLessThanOrEqual(3)

    await fireEvent.click(screen.getByRole('button', { name: labels.nextImageAriaLabel }))
    expect(scaleOf()).toBeGreaterThanOrEqual(2)
    expect(scaleOf()).toBeLessThanOrEqual(3)

    await fireEvent.click(screen.getByRole('button', { name: labels.zoomInAriaLabel }))
    await fireEvent.click(screen.getByRole('button', { name: labels.resetAriaLabel }))
    expect(scaleOf()).toBeGreaterThanOrEqual(2)
    expect(scaleOf()).toBeLessThanOrEqual(3)
    const changes = (emitted()['scale-change'] ?? []) as unknown[][]
    expect(changes.some((entry) => entry[0] === 1)).toBe(false)
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

  it('hides nav and emits update:open on close', async () => {
    const { emitted } = render(ImagePreview, {
      props: {
        open: true,
        images,
        minScale: 1,
        maxScale: 1,
        showNav: false
      }
    })
    expect(document.querySelector('[data-tiger-image-preview]')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: labels.previousImageAriaLabel })
    ).not.toBeInTheDocument()
    await fireEvent.click(screen.getByRole('button', { name: labels.closePreviewAriaLabel }))
    expect(emitted()['update:open']?.[0]).toEqual([false])
  })
})
