/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import { ImageCropper } from '@expcat/tigercat-react'

// Mock Image constructor for happy-dom
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
      crossOrigin = ''
      src = ''
      onload: (() => void) | null = null

      constructor() {
        setTimeout(() => this.onload?.(), 0)
      }
    }
  )
})

const renderLoadedCropper = async (element: React.ReactElement) => {
  const result = render(element)
  await waitFor(() =>
    expect(result.container.querySelector('[role="application"]')).toBeInTheDocument()
  )
  return result
}

describe('ImageCropper', () => {
  it('shows loading state initially', () => {
    const { container } = render(<ImageCropper src="/test.jpg" />)

    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with required src prop', () => {
    const { container } = render(<ImageCropper src="/test.jpg" />)

    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('applies className', () => {
    const { container } = render(<ImageCropper src="/test.jpg" className="custom-cropper" />)

    expect(container.firstElementChild?.className).toContain('custom-cropper')
  })

  it('has proper aria attributes', () => {
    const { container } = render(<ImageCropper src="/test.jpg" />)

    const el = container.firstElementChild
    expect(el).toHaveAttribute('aria-label', 'Loading image for cropping')
  })

  it('renders with guides prop', () => {
    const { container } = render(<ImageCropper src="/test.jpg" guides />)

    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('renders with aspect ratio', () => {
    const { container } = render(<ImageCropper src="/test.jpg" aspectRatio={16 / 9} />)

    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('moves crop area with mouse drag and clamps to image bounds', async () => {
    const onCropChange = vi.fn()
    const { container } = await renderLoadedCropper(
      <ImageCropper src="/test.jpg" onCropChange={onCropChange} />
    )

    const moveArea = container.querySelector('[aria-label="Move crop area"]') as HTMLElement
    fireEvent.mouseDown(moveArea, { clientX: 100, clientY: 100, button: 0 })
    fireEvent.mouseMove(document, { clientX: 140, clientY: 130 })
    fireEvent.mouseUp(document)

    expect(onCropChange).toHaveBeenLastCalledWith({ x: 120, y: 90, width: 640, height: 480 })

    fireEvent.mouseDown(moveArea, { clientX: 140, clientY: 130, button: 0 })
    fireEvent.mouseMove(document, { clientX: -1000, clientY: -1000 })
    fireEvent.mouseUp(document)

    expect(onCropChange).toHaveBeenLastCalledWith({ x: 0, y: 0, width: 640, height: 480 })
  })

  it('resizes crop area with a handle and preserves aspect ratio', async () => {
    const onCropChange = vi.fn()
    const { container } = await renderLoadedCropper(
      <ImageCropper src="/test.jpg" aspectRatio={1} onCropChange={onCropChange} />
    )

    const handle = container.querySelector('[aria-label="Resize crop area e"]') as HTMLElement
    fireEvent.mouseDown(handle, { clientX: 640, clientY: 300, button: 0 })
    fireEvent.mouseMove(document, { clientX: 680, clientY: 300 })
    fireEvent.mouseUp(document)

    expect(onCropChange).toHaveBeenLastCalledWith({ x: 160, y: 60, width: 520, height: 520 })
  })

  it('moves crop area with keyboard and shift acceleration', async () => {
    const onCropChange = vi.fn()
    const { container } = await renderLoadedCropper(
      <ImageCropper src="/test.jpg" onCropChange={onCropChange} />
    )

    const moveArea = container.querySelector('[aria-label="Move crop area"]') as HTMLElement
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

    const handle = container.querySelector('[aria-label="Resize crop area e"]') as HTMLElement
    fireEvent.keyDown(handle, { key: 'ArrowLeft', shiftKey: true })
    fireEvent.keyDown(handle, { key: 'ArrowLeft', shiftKey: true })

    expect(onCropChange).toHaveBeenLastCalledWith({ x: 80, y: 60, width: 630, height: 480 })
  })

  it('moves crop area with touch drag', async () => {
    const onCropChange = vi.fn()
    const { container } = await renderLoadedCropper(
      <ImageCropper src="/test.jpg" onCropChange={onCropChange} />
    )

    const moveArea = container.querySelector('[aria-label="Move crop area"]') as HTMLElement
    fireEvent.touchStart(moveArea, { touches: [{ clientX: 100, clientY: 100 }] })
    fireEvent.touchMove(document, { touches: [{ clientX: 125, clientY: 115 }] })
    fireEvent.touchEnd(document)

    expect(onCropChange).toHaveBeenLastCalledWith({ x: 105, y: 75, width: 640, height: 480 })
  })
})
