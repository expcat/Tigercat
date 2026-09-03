/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/vue'
import { ref } from 'vue'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { ImageCropper } from '@expcat/tigercat-vue/ImageCropper'
import type { ImageCropperRef } from '@expcat/tigercat-vue/ImageCropper'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { expectNoA11yViolationsIsolated } from '../utils'
import { MockResizeObserver } from '../utils/mock-observers'

beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    value: 800
  })
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    value: 600
  })

  vi.stubGlobal(
    'Image',
    class MockImage {
      naturalWidth = 800
      naturalHeight = 600
      src = ''
      onload: (() => void) | null = null
      onerror: (() => void) | null = null

      constructor() {
        setTimeout(() => {
          if (this.src.includes('fail') || this.src.includes('invalid')) {
            this.onerror?.()
            return
          }
          this.onload?.()
        }, 0)
      }
    }
  )
})

const renderLoadedCropper = async (options: Parameters<typeof render>[1]) => {
  const result = render(ImageCropper, options)
  await waitFor(() =>
    expect(
      result.container.querySelector('[data-image-cropper-status="ready"]')
    ).toBeInTheDocument()
  )
  return result
}

describe('ImageCropper', () => {
  it('shows loading state initially', () => {
    const { container } = render(ImageCropper, { props: { src: '/test.jpg' } })
    expect(container.querySelector('[data-image-cropper-status="loading"]')).toBeInTheDocument()
  })

  it('applies className', () => {
    const { container } = render(ImageCropper, {
      props: { src: '/test.jpg', className: 'custom-cropper' }
    })
    expect(container.firstElementChild?.className).toContain('custom-cropper')
  })

  it('forwards id onto the root', () => {
    const { container } = render(ImageCropper, {
      props: { src: '/test.jpg' },
      attrs: { id: 'crop-root', 'data-demo': 'yes' }
    })
    expect(container.firstElementChild).toHaveAttribute('id', 'crop-root')
    expect(container.firstElementChild).toHaveAttribute('data-demo', 'yes')
  })

  it('uses the loading name from locale while the image is pending', () => {
    const { container } = render({
      components: { ConfigProvider, ImageCropper },
      setup() {
        return { zhCN }
      },
      template: `
        <ConfigProvider :locale="zhCN">
          <ImageCropper src="/test.jpg" />
        </ConfigProvider>
      `
    })
    expect(container.querySelector('[data-image-cropper]')).toHaveAttribute(
      'aria-label',
      '正在加载待裁剪图片'
    )
  })

  it('shows an error when the image fails to load', async () => {
    const { container } = render(ImageCropper, { props: { src: '/fail.jpg' } })
    await waitFor(() =>
      expect(container.querySelector('[data-image-cropper-status="error"]')).toBeInTheDocument()
    )
    expect(container.querySelector('[role="group"]')).not.toBeInTheDocument()
  })

  it('treats invalid intrinsic dimensions as a failed load', async () => {
    vi.stubGlobal(
      'Image',
      class InvalidImage {
        naturalWidth = 0
        naturalHeight = Number.POSITIVE_INFINITY
        onload: (() => void) | null = null
        onerror: (() => void) | null = null

        set src(_value: string) {
          this.onload?.()
        }
      }
    )

    const { container } = render(ImageCropper, { props: { src: '/invalid.jpg' } })
    await waitFor(() =>
      expect(container.querySelector('[data-image-cropper-status="error"]')).toBeInTheDocument()
    )
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/)
  })

  it('renders with guides prop', async () => {
    const { container } = await renderLoadedCropper({
      props: { src: '/test.jpg', guides: true }
    })
    expect(container.querySelectorAll('[data-guide="true"]')).toHaveLength(4)
  })

  it('moves crop area with pointer drag and clamps to image bounds', async () => {
    const { container, emitted } = await renderLoadedCropper({
      props: { src: '/test.jpg' }
    })

    const moveArea = container.querySelector('[data-crop-move]') as HTMLElement
    await fireEvent.pointerDown(moveArea, { pointerId: 1, clientX: 100, clientY: 100, button: 0 })
    await fireEvent.pointerMove(document, { pointerId: 1, clientX: 140, clientY: 130 })
    await fireEvent.pointerUp(document, { pointerId: 1 })

    expect(emitted()['crop-change'].at(-1)).toEqual([{ x: 120, y: 90, width: 640, height: 480 }])

    await fireEvent.pointerDown(moveArea, { pointerId: 1, clientX: 140, clientY: 130, button: 0 })
    await fireEvent.pointerMove(document, { pointerId: 1, clientX: -1000, clientY: -1000 })
    await fireEvent.pointerUp(document, { pointerId: 1 })

    expect(emitted()['crop-change'].at(-1)).toEqual([{ x: 0, y: 0, width: 640, height: 480 }])
  })

  it('stops resizing after pointercancel', async () => {
    const { container, emitted } = await renderLoadedCropper({
      props: { src: '/test.jpg' }
    })
    const handle = container.querySelector('[data-crop-handle="e"]') as HTMLElement
    await fireEvent.pointerDown(handle, { pointerId: 1, clientX: 640, clientY: 300, button: 0 })
    const before = emitted()['crop-change']?.length ?? 0
    await fireEvent.pointerCancel(document, { pointerId: 1 })
    await fireEvent.pointerMove(document, { pointerId: 1, clientX: 700, clientY: 300 })
    expect(emitted()['crop-change']?.length ?? 0).toBe(before)
  })

  it('resizes crop area with a handle and preserves aspect ratio', async () => {
    const { container, emitted } = await renderLoadedCropper({
      props: { src: '/test.jpg', aspectRatio: 1 }
    })

    const handle = container.querySelector('[data-crop-handle="e"]') as HTMLElement
    await fireEvent.pointerDown(handle, { pointerId: 1, clientX: 640, clientY: 300, button: 0 })
    await fireEvent.pointerMove(document, { pointerId: 1, clientX: 680, clientY: 300 })
    await fireEvent.pointerUp(document, { pointerId: 1 })

    const last = emitted()['crop-change'].at(-1)?.[0] as {
      width: number
      height: number
      x: number
    }
    expect(last.width).toBe(last.height)
    expect(last.x).toBe(160)
  })

  it('moves crop area with keyboard and shift acceleration', async () => {
    const { container, emitted } = await renderLoadedCropper({
      props: { src: '/test.jpg' }
    })

    const moveArea = container.querySelector('[data-crop-move]') as HTMLElement
    await fireEvent.keyDown(moveArea, { key: 'ArrowRight' })
    expect(emitted()['crop-change'].at(-1)).toEqual([{ x: 81, y: 60, width: 640, height: 480 }])

    await fireEvent.keyDown(moveArea, { key: 'ArrowDown', shiftKey: true })
    expect(emitted()['crop-change'].at(-1)).toEqual([{ x: 81, y: 70, width: 640, height: 480 }])
  })

  it('does not emit ready again when only aspectRatio changes', async () => {
    const onReady = vi.fn()
    const { rerender, emitted } = await renderLoadedCropper({
      props: { src: '/test.jpg', aspectRatio: 1, onReady }
    })
    expect(emitted().ready).toHaveLength(1)
    await rerender({ src: '/test.jpg', aspectRatio: 16 / 9, onReady })
    expect(emitted().ready).toHaveLength(1)
  })

  it('returns a blob from getCropResult after load', async () => {
    const cropper = ref<ImageCropperRef | null>(null)
    const { container } = render({
      components: { ImageCropper },
      setup() {
        return { cropper }
      },
      template: `<ImageCropper ref="cropper" src="/test.jpg" />`
    })
    await waitFor(() =>
      expect(container.querySelector('[data-image-cropper-status="ready"]')).toBeInTheDocument()
    )
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: vi.fn()
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,xx')
    HTMLCanvasElement.prototype.toBlob = ((cb: BlobCallback, _type?: string, _quality?: number) => {
      cb(new Blob(['x'], { type: 'image/png' }))
    }) as typeof HTMLCanvasElement.prototype.toBlob

    const result = await cropper.value!.getCropResult()
    expect(result.blob).toBeInstanceOf(Blob)
    expect(result.cropRect.width).toBeGreaterThan(0)
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations on the loaded cropper', async () => {
      const { container } = render({
        components: { ConfigProvider, ImageCropper },
        setup() {
          return { zhCN }
        },
        template: `
          <ConfigProvider :locale="zhCN">
            <ImageCropper src="/test.jpg" />
          </ConfigProvider>
        `
      })
      await waitFor(() =>
        expect(container.querySelector('[data-image-cropper-status="ready"]')).toBeInTheDocument()
      )
      expect(container.querySelector('[role="group"]')).toHaveAttribute('aria-label', '图片裁剪器')
      await expectNoA11yViolationsIsolated(container)
    })
  })

  it('hides guides when guides is false', async () => {
    const { container } = await renderLoadedCropper({
      props: { src: '/test.jpg', guides: false }
    })
    expect(container.querySelectorAll('[data-guide="true"]')).toHaveLength(0)
  })

  it('uses unique SVG mask ids for multiple instances', async () => {
    const { container } = await renderLoadedCropper({
      props: { src: '/a.jpg' }
    })
    const second = render(ImageCropper, { props: { src: '/b.jpg' } })
    await waitFor(() =>
      expect(second.container.querySelector('[data-image-cropper-status="ready"]')).toBeTruthy()
    )

    const masks = [
      ...(Array.from(container.querySelectorAll('mask')) as SVGMaskElement[]),
      ...(Array.from(second.container.querySelectorAll('mask')) as SVGMaskElement[])
    ].map((mask) => mask.id)
    expect(masks).toHaveLength(2)
    expect(new Set(masks).size).toBe(2)
  })

  describe('size host layout', () => {
    beforeEach(() => {
      MockResizeObserver.reset()
      vi.stubGlobal('ResizeObserver', MockResizeObserver)
    })

    it('does not write the fitted bitmap size onto the observed host', async () => {
      const { container } = await renderLoadedCropper({ props: { src: '/test.jpg' } })
      const host = container.querySelector('[data-image-cropper]') as HTMLElement
      const stage = container.querySelector('[data-image-cropper-stage]') as HTMLElement
      expect(host.style.width).toBe('')
      expect(host.style.height).toBe('')
      expect(stage.style.width).toBe('800px')
      expect(stage.style.height).toBe('600px')
    })

    it('ignores a collapsed host so the bitmap does not snap to intrinsic size', async () => {
      const { container, emitted } = await renderLoadedCropper({ props: { src: '/test.jpg' } })
      const host = container.querySelector('[data-image-cropper]') as HTMLElement
      const stage = container.querySelector('[data-image-cropper-stage]') as HTMLElement
      await waitFor(() => expect(MockResizeObserver.instances.length).toBeGreaterThan(0))
      const before = emitted()['crop-change']?.length ?? 0
      Object.defineProperty(host, 'clientWidth', { configurable: true, value: 0 })
      Object.defineProperty(host, 'clientHeight', { configurable: true, value: 0 })
      MockResizeObserver.instances[0].trigger(0, 0)
      expect(stage.style.width).toBe('800px')
      expect(stage.style.height).toBe('600px')
      expect(emitted()['crop-change']?.length ?? 0).toBe(before)
    })

    it('remaps the crop when the host actually narrows', async () => {
      const { container, emitted } = await renderLoadedCropper({ props: { src: '/test.jpg' } })
      const host = container.querySelector('[data-image-cropper]') as HTMLElement
      await waitFor(() => expect(MockResizeObserver.instances.length).toBeGreaterThan(0))
      Object.defineProperty(host, 'clientWidth', { configurable: true, value: 400 })
      MockResizeObserver.instances[0].trigger(400, 300)
      await waitFor(() =>
        expect(container.querySelector('[data-image-cropper-stage]')).toHaveStyle({
          width: '400px',
          height: '300px'
        })
      )
      expect(emitted()['crop-change'].at(-1)).toEqual([{ x: 40, y: 30, width: 320, height: 240 }])
    })
  })
})
