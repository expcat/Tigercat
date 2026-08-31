/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { ImageCropper } from '@expcat/tigercat-react/ImageCropper'
import type { ImageCropperRef } from '@expcat/tigercat-react/ImageCropper'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { expectNoA11yViolationsIsolated } from '../utils/react'

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

const renderLoadedCropper = async (element: React.ReactElement) => {
  const result = render(element)
  await waitFor(() =>
    expect(
      result.container.querySelector('[data-image-cropper-status="ready"]')
    ).toBeInTheDocument()
  )
  return result
}

describe('ImageCropper', () => {
  it('shows loading state initially', () => {
    const { container } = render(<ImageCropper src="/test.jpg" />)
    expect(container.querySelector('[data-image-cropper-status="loading"]')).toBeInTheDocument()
  })

  it('applies className', () => {
    const { container } = render(<ImageCropper src="/test.jpg" className="custom-cropper" />)
    expect(container.firstElementChild?.className).toContain('custom-cropper')
  })

  it('forwards id onto the root', () => {
    const { container } = render(<ImageCropper src="/test.jpg" id="crop-root" data-demo="yes" />)
    expect(container.firstElementChild).toHaveAttribute('id', 'crop-root')
    expect(container.firstElementChild).toHaveAttribute('data-demo', 'yes')
  })

  it('uses the loading name from locale while the image is pending', () => {
    const { container } = render(
      <ConfigProvider locale={zhCN}>
        <ImageCropper src="/test.jpg" />
      </ConfigProvider>
    )
    expect(container.querySelector('[data-image-cropper]')).toHaveAttribute(
      'aria-label',
      '正在加载待裁剪图片'
    )
  })

  it('shows an error when the image fails to load', async () => {
    const { container } = render(<ImageCropper src="/fail.jpg" />)
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

    const { container } = render(<ImageCropper src="/invalid.jpg" />)
    await waitFor(() =>
      expect(container.querySelector('[data-image-cropper-status="error"]')).toBeInTheDocument()
    )
    expect(container.innerHTML).not.toMatch(/NaN|Infinity/)
  })

  it('renders with guides prop', async () => {
    const { container } = await renderLoadedCropper(<ImageCropper src="/test.jpg" guides />)
    expect(container.querySelectorAll('[data-guide="true"]')).toHaveLength(4)
  })

  it('moves crop area with pointer drag and clamps to image bounds', async () => {
    const onCropChange = vi.fn()
    const { container } = await renderLoadedCropper(
      <ImageCropper src="/test.jpg" onCropChange={onCropChange} />
    )

    const moveArea = container.querySelector('[data-crop-move]') as HTMLElement
    fireEvent.pointerDown(moveArea, { pointerId: 1, clientX: 100, clientY: 100, button: 0 })
    fireEvent.pointerMove(document, { pointerId: 1, clientX: 140, clientY: 130 })
    fireEvent.pointerUp(document, { pointerId: 1 })

    expect(onCropChange).toHaveBeenLastCalledWith({ x: 120, y: 90, width: 640, height: 480 })

    fireEvent.pointerDown(moveArea, { pointerId: 1, clientX: 140, clientY: 130, button: 0 })
    fireEvent.pointerMove(document, { pointerId: 1, clientX: -1000, clientY: -1000 })
    fireEvent.pointerUp(document, { pointerId: 1 })

    expect(onCropChange).toHaveBeenLastCalledWith({ x: 0, y: 0, width: 640, height: 480 })
  })

  it('stops resizing after pointercancel', async () => {
    const onCropChange = vi.fn()
    const { container } = await renderLoadedCropper(
      <ImageCropper src="/test.jpg" onCropChange={onCropChange} />
    )
    const handle = container.querySelector('[data-crop-handle="e"]') as HTMLElement
    fireEvent.pointerDown(handle, { pointerId: 1, clientX: 640, clientY: 300, button: 0 })
    onCropChange.mockClear()
    fireEvent.pointerCancel(document, { pointerId: 1 })
    fireEvent.pointerMove(document, { pointerId: 1, clientX: 700, clientY: 300 })
    expect(onCropChange).not.toHaveBeenCalled()
  })

  it('resizes crop area with a handle and preserves aspect ratio', async () => {
    const onCropChange = vi.fn()
    const { container } = await renderLoadedCropper(
      <ImageCropper src="/test.jpg" aspectRatio={1} onCropChange={onCropChange} />
    )

    const handle = container.querySelector('[data-crop-handle="e"]') as HTMLElement
    fireEvent.pointerDown(handle, { pointerId: 1, clientX: 640, clientY: 300, button: 0 })
    fireEvent.pointerMove(document, { pointerId: 1, clientX: 680, clientY: 300 })
    fireEvent.pointerUp(document, { pointerId: 1 })

    const last = onCropChange.mock.calls.at(-1)?.[0] as { width: number; height: number; x: number }
    expect(last.width).toBe(last.height)
    expect(last.x).toBe(160)
  })

  it('moves crop area with keyboard and shift acceleration', async () => {
    const onCropChange = vi.fn()
    const { container } = await renderLoadedCropper(
      <ImageCropper src="/test.jpg" onCropChange={onCropChange} />
    )

    const moveArea = container.querySelector('[data-crop-move]') as HTMLElement
    fireEvent.keyDown(moveArea, { key: 'ArrowRight' })
    expect(onCropChange).toHaveBeenLastCalledWith({ x: 81, y: 60, width: 640, height: 480 })

    fireEvent.keyDown(moveArea, { key: 'ArrowDown', shiftKey: true })
    expect(onCropChange).toHaveBeenLastCalledWith({ x: 81, y: 70, width: 640, height: 480 })
  })

  it('resizes crop area with keyboard and respects min width', async () => {
    const onCropChange = vi.fn()
    const { container } = await renderLoadedCropper(
      <ImageCropper src="/test.jpg" minWidth={630} onCropChange={onCropChange} />
    )

    const handle = container.querySelector('[data-crop-handle="e"]') as HTMLElement
    fireEvent.pointerDown(handle, { pointerId: 1, clientX: 720, clientY: 300, button: 0 })
    fireEvent.pointerMove(document, { pointerId: 1, clientX: 700, clientY: 300 })
    fireEvent.pointerMove(document, { pointerId: 1, clientX: 680, clientY: 300 })
    fireEvent.pointerUp(document, { pointerId: 1 })

    expect(onCropChange).toHaveBeenLastCalledWith({ x: 80, y: 60, width: 630, height: 480 })
  })

  it('does not fire onReady again when only aspectRatio changes', async () => {
    const onReady = vi.fn()
    const { rerender } = await renderLoadedCropper(
      <ImageCropper src="/test.jpg" aspectRatio={1} onReady={onReady} />
    )
    expect(onReady).toHaveBeenCalledTimes(1)
    rerender(<ImageCropper src="/test.jpg" aspectRatio={16 / 9} onReady={onReady} />)
    expect(onReady).toHaveBeenCalledTimes(1)
  })

  it('returns a blob from getCropResult after load', async () => {
    const cropperRef = React.createRef<ImageCropperRef>()
    await renderLoadedCropper(<ImageCropper ref={cropperRef} src="/test.jpg" />)
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      drawImage: vi.fn()
    })) as unknown as typeof HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,xx')
    HTMLCanvasElement.prototype.toBlob = ((cb: BlobCallback, _type?: string, _quality?: number) => {
      cb(new Blob(['x'], { type: 'image/png' }))
    }) as typeof HTMLCanvasElement.prototype.toBlob

    const result = await cropperRef.current!.getCropResult()
    expect(result.blob).toBeInstanceOf(Blob)
    expect(result.cropRect.width).toBeGreaterThan(0)
  })

  it('rejects getCropResult before the image is ready', async () => {
    const cropperRef = React.createRef<ImageCropperRef>()
    render(<ImageCropper ref={cropperRef} src="/test.jpg" />)
    await expect(cropperRef.current!.getCropResult()).rejects.toThrow('Image not loaded')
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations on the loaded cropper', async () => {
      const { container } = await renderLoadedCropper(
        <ConfigProvider locale={zhCN}>
          <ImageCropper src="/test.jpg" />
        </ConfigProvider>
      )
      const root = container.querySelector('[role="group"]')
      expect(root).toHaveAttribute('aria-label', '图片裁剪器')
      expect(container.querySelector('[data-crop-move]')).toHaveAttribute(
        'aria-label',
        '移动裁剪区域'
      )
      await expectNoA11yViolationsIsolated(container)
    })
  })

  it('hides guides when guides is false', async () => {
    const { container } = await renderLoadedCropper(<ImageCropper src="/test.jpg" guides={false} />)
    expect(container.querySelectorAll('[data-guide="true"]')).toHaveLength(0)
  })

  it('uses unique SVG mask ids for multiple instances', async () => {
    const { container } = await renderLoadedCropper(
      <>
        <ImageCropper src="/a.jpg" />
        <ImageCropper src="/b.jpg" />
      </>
    )

    const masks = Array.from(container.querySelectorAll('mask')).map((mask) => mask.id)
    expect(masks).toHaveLength(2)
    expect(new Set(masks).size).toBe(2)
    for (const mask of masks) {
      expect(container.querySelector(`[mask="url(#${mask})"]`)).toBeTruthy()
    }
  })

  it('shows an error when src is missing', async () => {
    const { container } = render(<ImageCropper src="" />)
    await waitFor(() =>
      expect(container.querySelector('[data-image-cropper-status="error"]')).toBeInTheDocument()
    )
  })
})
