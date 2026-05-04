/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/vue'
import { ImageCropper } from '@expcat/tigercat-vue'

// Mock Image constructor for happy-dom
const mockImageInstances: Array<{
  onload?: () => void
  src?: string
  naturalWidth: number
  naturalHeight: number
  crossOrigin?: string
}> = []

beforeEach(() => {
  mockImageInstances.length = 0
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
        mockImageInstances.push(this)
        // Simulate async load
        setTimeout(() => this.onload?.(), 0)
      }
    }
  )
})

const renderLoadedCropper = async (options: Parameters<typeof render>[1]) => {
  const result = render(ImageCropper, options)
  await waitFor(() =>
    expect(result.container.querySelector('[role="application"]')).toBeInTheDocument()
  )
  return result
}

describe('ImageCropper', () => {
  it('shows loading state initially', () => {
    const { container } = render(ImageCropper, {
      props: {
        src: '/test.jpg'
      }
    })

    // Should show loading spinner
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('renders with required src prop', () => {
    const { container } = render(ImageCropper, {
      props: {
        src: '/test.jpg'
      }
    })

    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('applies className', () => {
    const { container } = render(ImageCropper, {
      props: {
        src: '/test.jpg',
        className: 'custom-cropper'
      }
    })

    expect(container.firstElementChild?.className).toContain('custom-cropper')
  })

  it('has proper aria attributes', () => {
    const { container } = render(ImageCropper, {
      props: {
        src: '/test.jpg'
      }
    })

    const el = container.firstElementChild
    expect(el).toHaveAttribute('aria-label', 'Loading image for cropping')
  })

  it('renders with guides prop', () => {
    const { container } = render(ImageCropper, {
      props: {
        src: '/test.jpg',
        guides: true
      }
    })

    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('renders with aspect ratio', () => {
    const { container } = render(ImageCropper, {
      props: {
        src: '/test.jpg',
        aspectRatio: 16 / 9
      }
    })

    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('moves crop area with mouse drag and clamps to image bounds', async () => {
    const { container, emitted } = await renderLoadedCropper({
      props: {
        src: '/test.jpg'
      }
    })

    const moveArea = container.querySelector('[aria-label="Move crop area"]') as HTMLElement
    await fireEvent.mouseDown(moveArea, { clientX: 100, clientY: 100, button: 0 })
    await fireEvent.mouseMove(document, { clientX: 140, clientY: 130 })
    await fireEvent.mouseUp(document)

    expect(emitted()['crop-change'].at(-1)).toEqual([{ x: 120, y: 90, width: 640, height: 480 }])

    await fireEvent.mouseDown(moveArea, { clientX: 140, clientY: 130, button: 0 })
    await fireEvent.mouseMove(document, { clientX: -1000, clientY: -1000 })
    await fireEvent.mouseUp(document)

    expect(emitted()['crop-change'].at(-1)).toEqual([{ x: 0, y: 0, width: 640, height: 480 }])
  })

  it('resizes crop area with a handle and preserves aspect ratio', async () => {
    const { container, emitted } = await renderLoadedCropper({
      props: {
        src: '/test.jpg',
        aspectRatio: 1
      }
    })

    const handle = container.querySelector('[aria-label="Resize crop area e"]') as HTMLElement
    await fireEvent.mouseDown(handle, { clientX: 640, clientY: 300, button: 0 })
    await fireEvent.mouseMove(document, { clientX: 680, clientY: 300 })
    await fireEvent.mouseUp(document)

    expect(emitted()['crop-change'].at(-1)).toEqual([{ x: 160, y: 60, width: 520, height: 520 }])
  })

  it('moves crop area with keyboard and shift acceleration', async () => {
    const { container, emitted } = await renderLoadedCropper({
      props: {
        src: '/test.jpg'
      }
    })

    const moveArea = container.querySelector('[aria-label="Move crop area"]') as HTMLElement
    await fireEvent.keyDown(moveArea, { key: 'ArrowRight' })
    expect(emitted()['crop-change'].at(-1)).toEqual([{ x: 81, y: 60, width: 640, height: 480 }])

    await fireEvent.keyDown(moveArea, { key: 'ArrowDown', shiftKey: true })
    expect(emitted()['crop-change'].at(-1)).toEqual([{ x: 81, y: 70, width: 640, height: 480 }])
  })

  it('resizes crop area with keyboard and respects min width', async () => {
    const { container, emitted } = await renderLoadedCropper({
      props: {
        src: '/test.jpg',
        minWidth: 630
      }
    })

    const handle = container.querySelector('[aria-label="Resize crop area e"]') as HTMLElement
    await fireEvent.keyDown(handle, { key: 'ArrowLeft', shiftKey: true })
    await fireEvent.keyDown(handle, { key: 'ArrowLeft', shiftKey: true })

    expect(emitted()['crop-change'].at(-1)).toEqual([{ x: 80, y: 60, width: 630, height: 480 }])
  })

  it('moves crop area with touch drag', async () => {
    const { container, emitted } = await renderLoadedCropper({
      props: {
        src: '/test.jpg'
      }
    })

    const moveArea = container.querySelector('[aria-label="Move crop area"]') as HTMLElement
    await fireEvent.touchStart(moveArea, { touches: [{ clientX: 100, clientY: 100 }] })
    await fireEvent.touchMove(document, { touches: [{ clientX: 125, clientY: 115 }] })
    await fireEvent.touchEnd(document)

    expect(emitted()['crop-change'].at(-1)).toEqual([{ x: 105, y: 75, width: 640, height: 480 }])
  })
})
