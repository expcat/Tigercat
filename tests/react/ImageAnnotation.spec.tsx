/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ImageAnnotation } from '@expcat/tigercat-react/ImageAnnotation'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import type { ImageAnnotation as CoreImageAnnotation } from '@expcat/tigercat-core'
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
  SVGElement.prototype.getBoundingClientRect = () =>
    ({ left: 0, top: 0, width: 800, height: 600 }) as DOMRect

  vi.stubGlobal(
    'Image',
    class MockImage {
      naturalWidth = 800
      naturalHeight = 600
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      _src = ''

      set src(value: string) {
        this._src = value
        queueMicrotask(() => {
          if (String(value).includes('missing') || String(value).includes('fail')) {
            this.onerror?.()
          } else {
            this.onload?.()
          }
        })
      }

      get src() {
        return this._src
      }
    }
  )
})

function drawBox(
  canvas: HTMLElement,
  from: { x: number; y: number },
  to: { x: number; y: number }
) {
  fireEvent.pointerDown(canvas, {
    clientX: from.x,
    clientY: from.y,
    button: 0,
    pointerId: 1
  })
  fireEvent.pointerMove(document, { clientX: to.x, clientY: to.y, pointerId: 1 })
  fireEvent.pointerUp(document, { clientX: to.x, clientY: to.y, pointerId: 1 })
}

const renderLoadedAnnotation = async (element: React.ReactElement) => {
  const result = render(element)
  await waitFor(() => expect(result.getByLabelText('Image annotation canvas')).toBeInTheDocument())
  return result
}

describe('ImageAnnotation', () => {
  it('shows loading state before image is ready', () => {
    const { getByLabelText } = render(<ImageAnnotation src="/scene.jpg" />)
    expect(getByLabelText('Loading image for annotation')).toBeInTheDocument()
  })

  it('renders toolbar tools and image canvas', async () => {
    const { getByRole, getByLabelText } = await renderLoadedAnnotation(
      <ImageAnnotation src="/scene.jpg" />
    )

    expect(getByRole('button', { name: 'Rectangle' })).toHaveAttribute('aria-pressed', 'false')
    expect(getByLabelText('Image annotation canvas')).toBeInTheDocument()
  })

  it('switches drawing tools', async () => {
    const onToolChange = vi.fn()
    const { getByRole } = await renderLoadedAnnotation(
      <ImageAnnotation src="/scene.jpg" onToolChange={onToolChange} />
    )

    fireEvent.click(getByRole('button', { name: 'Rectangle' }))

    expect(getByRole('button', { name: 'Rectangle' })).toHaveAttribute('aria-pressed', 'true')
    expect(onToolChange).toHaveBeenCalledWith('rectangle')
  })

  it('draws rectangle annotations with normalized coordinates', async () => {
    const onChange = vi.fn()
    const { getByRole, getByLabelText } = await renderLoadedAnnotation(
      <ImageAnnotation src="/scene.jpg" onChange={onChange} />
    )

    fireEvent.click(getByRole('button', { name: 'Rectangle' }))
    const canvas = getByLabelText('Image annotation canvas')
    drawBox(canvas, { x: 80, y: 60 }, { x: 240, y: 180 })

    const [annotations, meta] = onChange.mock.lastCall as [CoreImageAnnotation[], unknown]
    expect(annotations[0]).toMatchObject({ type: 'rectangle', x: 0.1, y: 0.1 })
    expect(annotations[0].id).not.toBe('')
    expect('width' in annotations[0] ? annotations[0].width : 0).toBeCloseTo(0.2)
    expect('height' in annotations[0] ? annotations[0].height : 0).toBeCloseTo(0.2)
    expect(meta).toMatchObject({ type: 'add', annotation: annotations[0] })
  })

  it('draws ellipse annotations', async () => {
    const onChange = vi.fn()
    const { getByRole, getByLabelText } = await renderLoadedAnnotation(
      <ImageAnnotation src="/scene.jpg" onChange={onChange} />
    )

    fireEvent.click(getByRole('button', { name: 'Ellipse' }))
    const canvas = getByLabelText('Image annotation canvas')
    drawBox(canvas, { x: 160, y: 120 }, { x: 320, y: 240 })

    expect(onChange.mock.lastCall[0][0]).toMatchObject({ type: 'ellipse', width: 0.2, height: 0.2 })
  })

  it('renders existing annotations and selects one', async () => {
    const onSelect = vi.fn()
    const annotations: CoreImageAnnotation[] = [
      { id: 'face', type: 'rectangle', x: 0.1, y: 0.1, width: 0.2, height: 0.2, label: 'Face' }
    ]
    const { getByRole, getByText } = await renderLoadedAnnotation(
      <ImageAnnotation src="/scene.jpg" value={annotations} onSelect={onSelect} />
    )

    fireEvent.pointerDown(getByRole('option', { name: 'Face, Rectangle annotation' }))

    expect(getByText('Face')).toBeInTheDocument()
    expect(onSelect).toHaveBeenCalledWith(annotations[0])
  })

  it('removes selected annotations', async () => {
    const onChange = vi.fn()
    const annotations: CoreImageAnnotation[] = [
      { id: 'face', type: 'rectangle', x: 0.1, y: 0.1, width: 0.2, height: 0.2 }
    ]
    const { getByRole } = await renderLoadedAnnotation(
      <ImageAnnotation src="/scene.jpg" defaultValue={annotations} onChange={onChange} />
    )

    fireEvent.pointerDown(getByRole('option', { name: 'Rectangle annotation' }))
    fireEvent.click(getByRole('button', { name: 'Delete' }))

    expect(onChange).toHaveBeenLastCalledWith([], {
      type: 'remove',
      annotation: annotations[0]
    })
  })

  it('selects an annotation with Enter/Space on its shape (C20-3)', async () => {
    const onSelect = vi.fn()
    const annotations: CoreImageAnnotation[] = [
      { id: 'face', type: 'rectangle', x: 0.1, y: 0.1, width: 0.2, height: 0.2, label: 'Face' }
    ]
    const { getByRole } = await renderLoadedAnnotation(
      <ImageAnnotation src="/scene.jpg" value={annotations} onSelect={onSelect} />
    )
    const shape = getByRole('option', { name: 'Face, Rectangle annotation' })
    fireEvent.keyDown(shape, { key: 'Enter' })
    expect(onSelect).toHaveBeenLastCalledWith(annotations[0])

    onSelect.mockClear()
    fireEvent.keyDown(shape, { key: ' ' })
    expect(onSelect).toHaveBeenLastCalledWith(annotations[0])
  })

  it('removes the focused editable annotation with Delete (C20-3)', async () => {
    const onChange = vi.fn()
    const annotations: CoreImageAnnotation[] = [
      { id: 'face', type: 'rectangle', x: 0.1, y: 0.1, width: 0.2, height: 0.2 }
    ]
    const { getByRole } = await renderLoadedAnnotation(
      <ImageAnnotation src="/scene.jpg" defaultValue={annotations} onChange={onChange} />
    )
    const shape = getByRole('option', { name: 'Rectangle annotation' })
    fireEvent.keyDown(shape, { key: 'Delete' })
    expect(onChange).toHaveBeenLastCalledWith([], { type: 'remove', annotation: annotations[0] })
  })

  it('does not remove via keyboard when readonly (C20-3)', async () => {
    const onChange = vi.fn()
    const annotations: CoreImageAnnotation[] = [
      { id: 'face', type: 'rectangle', x: 0.1, y: 0.1, width: 0.2, height: 0.2 }
    ]
    const { getByRole } = await renderLoadedAnnotation(
      <ImageAnnotation src="/scene.jpg" value={annotations} readonly onChange={onChange} />
    )
    const shape = getByRole('option', { name: 'Rectangle annotation' })
    fireEvent.keyDown(shape, { key: 'Delete' })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('renders polygon and freehand annotations', async () => {
    const annotations: CoreImageAnnotation[] = [
      {
        id: 'poly',
        type: 'polygon',
        points: [
          { x: 0.1, y: 0.1 },
          { x: 0.3, y: 0.1 },
          { x: 0.3, y: 0.3 }
        ]
      },
      {
        id: 'draw',
        type: 'freehand',
        points: [
          { x: 0.5, y: 0.5 },
          { x: 0.6, y: 0.6 }
        ]
      }
    ]
    const { container } = await renderLoadedAnnotation(
      <ImageAnnotation src="/scene.jpg" value={annotations} />
    )

    expect(container.querySelectorAll('path')).toHaveLength(2)
  })

  it('has no accessibility violations', async () => {
    const { container } = await renderLoadedAnnotation(<ImageAnnotation src="/scene.jpg" />)
    await expectNoA11yViolationsIsolated(container)
  })

  describe('Edge Cases and Boundary', () => {
    it('calls onReady after the image loads', async () => {
      const onReady = vi.fn()
      await renderLoadedAnnotation(<ImageAnnotation src="/scene.jpg" onReady={onReady} />)

      expect(onReady).toHaveBeenCalledOnce()
    })

    it('renders custom image alt text', async () => {
      const { getByAltText } = await renderLoadedAnnotation(
        <ImageAnnotation src="/scene.jpg" alt="Floor plan" />
      )

      expect(getByAltText('Floor plan')).toBeInTheDocument()
    })

    it('disables tools and delete when disabled', async () => {
      const { getByRole } = await renderLoadedAnnotation(
        <ImageAnnotation src="/scene.jpg" disabled />
      )

      expect(getByRole('button', { name: 'Rectangle' })).toBeDisabled()
      expect(getByRole('button', { name: 'Delete' })).toBeDisabled()
    })

    it('hides annotation labels when showLabels is false', async () => {
      const annotations: CoreImageAnnotation[] = [
        { id: 'face', type: 'rectangle', x: 0.1, y: 0.1, width: 0.2, height: 0.2, label: 'Face' }
      ]
      const { queryByText } = await renderLoadedAnnotation(
        <ImageAnnotation src="/scene.jpg" value={annotations} showLabels={false} />
      )

      expect(queryByText('Face')).not.toBeInTheDocument()
    })

    it('does not commit rectangles below the minimum size', async () => {
      const onChange = vi.fn()
      const { getByRole, getByLabelText } = await renderLoadedAnnotation(
        <ImageAnnotation src="/scene.jpg" minSize={0.1} onChange={onChange} />
      )

      fireEvent.click(getByRole('button', { name: 'Rectangle' }))
      const canvas = getByLabelText('Image annotation canvas')
      drawBox(canvas, { x: 80, y: 60 }, { x: 82, y: 62 })

      expect(onChange).not.toHaveBeenCalled()
    })

    it('commits polygon annotations after three points and Enter', async () => {
      const onChange = vi.fn()
      const { getByRole, getByLabelText } = await renderLoadedAnnotation(
        <ImageAnnotation src="/scene.jpg" onChange={onChange} />
      )

      fireEvent.click(getByRole('button', { name: 'Polygon' }))
      const canvas = getByLabelText('Image annotation canvas')
      fireEvent.click(canvas, { clientX: 80, clientY: 60 })
      fireEvent.click(canvas, { clientX: 240, clientY: 60 })
      fireEvent.click(canvas, { clientX: 240, clientY: 180 })
      fireEvent.keyDown(canvas, { key: 'Enter' })

      expect(onChange.mock.lastCall[0][0]).toMatchObject({ type: 'polygon' })
    })

    it('prevents drawing while readonly', async () => {
      const onChange = vi.fn()
      const { getByLabelText } = await renderLoadedAnnotation(
        <ImageAnnotation src="/scene.jpg" readonly tool="rectangle" onChange={onChange} />
      )

      const canvas = getByLabelText('Image annotation canvas')
      drawBox(canvas, { x: 80, y: 60 }, { x: 240, y: 180 })

      expect(onChange).not.toHaveBeenCalled()
    })

    it('does not collide with an existing rectangle-1 id', async () => {
      const onChange = vi.fn()
      const existing: CoreImageAnnotation[] = [
        { id: 'rectangle-1', type: 'rectangle', x: 0.7, y: 0.7, width: 0.1, height: 0.1 }
      ]
      const { getByRole, getByLabelText } = await renderLoadedAnnotation(
        <ImageAnnotation src="/scene.jpg" defaultValue={existing} onChange={onChange} />
      )
      fireEvent.click(getByRole('button', { name: 'Rectangle' }))
      drawBox(getByLabelText('Image annotation canvas'), { x: 80, y: 60 }, { x: 240, y: 180 })
      const next = onChange.mock.lastCall[0] as CoreImageAnnotation[]
      expect(next[1]?.id).not.toBe('rectangle-1')
      expect(next).toHaveLength(2)
    })

    it('stops drawing after pointercancel', async () => {
      const onChange = vi.fn()
      const { getByRole, getByLabelText } = await renderLoadedAnnotation(
        <ImageAnnotation src="/scene.jpg" onChange={onChange} />
      )
      fireEvent.click(getByRole('button', { name: 'Rectangle' }))
      const canvas = getByLabelText('Image annotation canvas')
      fireEvent.pointerDown(canvas, { clientX: 80, clientY: 60, button: 0, pointerId: 1 })
      fireEvent.pointerCancel(document, { clientX: 80, clientY: 60, pointerId: 1 })
      fireEvent.pointerMove(document, { clientX: 240, clientY: 180, pointerId: 1 })
      fireEvent.pointerUp(document, { clientX: 240, clientY: 180, pointerId: 1 })
      expect(onChange).not.toHaveBeenCalled()
    })

    it('names the canvas from locale', async () => {
      const { getByLabelText } = render(
        <ConfigProvider locale={zhCN}>
          <ImageAnnotation src="/scene.jpg" />
        </ConfigProvider>
      )
      await waitFor(() =>
        expect(getByLabelText(zhCN.imageEditor!.annotationCanvasAriaLabel!)).toBeInTheDocument()
      )
    })

    it('shows an error instead of a spinner when src fails', async () => {
      const { getByLabelText, queryByLabelText } = render(<ImageAnnotation src="/missing.jpg" />)
      await waitFor(() =>
        expect(getByLabelText('Failed to load image for annotation')).toBeInTheDocument()
      )
      expect(queryByLabelText('Loading image for annotation')).not.toBeInTheDocument()
    })

    it('does not select shapes when disabled', async () => {
      const onSelect = vi.fn()
      const annotations: CoreImageAnnotation[] = [
        { id: 'face', type: 'rectangle', x: 0.1, y: 0.1, width: 0.2, height: 0.2 }
      ]
      const { getByRole } = await renderLoadedAnnotation(
        <ImageAnnotation src="/scene.jpg" value={annotations} disabled onSelect={onSelect} />
      )
      fireEvent.pointerDown(getByRole('option', { name: 'Rectangle annotation' }))
      expect(onSelect).not.toHaveBeenCalled()
    })

    it('keeps a controlled selectedId when onSelect is ignored', async () => {
      const annotations: CoreImageAnnotation[] = [
        { id: 'face', type: 'rectangle', x: 0.1, y: 0.1, width: 0.2, height: 0.2 },
        { id: 'other', type: 'ellipse', x: 0.5, y: 0.5, width: 0.1, height: 0.1 }
      ]
      const { getByRole } = await renderLoadedAnnotation(
        <ImageAnnotation src="/scene.jpg" value={annotations} selectedId="face" />
      )
      fireEvent.pointerDown(getByRole('option', { name: 'Ellipse annotation' }))
      expect(getByRole('option', { name: 'Rectangle annotation' })).toHaveAttribute(
        'aria-selected',
        'true'
      )
    })

    it('discards a freehand draft on Escape', async () => {
      const onChange = vi.fn()
      const { getByRole, getByLabelText } = await renderLoadedAnnotation(
        <ImageAnnotation src="/scene.jpg" onChange={onChange} />
      )
      fireEvent.click(getByRole('button', { name: 'Freehand' }))
      const canvas = getByLabelText('Image annotation canvas')
      fireEvent.pointerDown(canvas, { clientX: 80, clientY: 60, button: 0, pointerId: 1 })
      fireEvent.pointerMove(document, { clientX: 240, clientY: 180, pointerId: 1 })
      fireEvent.keyDown(canvas, { key: 'Escape' })
      fireEvent.pointerUp(document, { clientX: 240, clientY: 180, pointerId: 1 })
      expect(onChange).not.toHaveBeenCalled()
    })
  })
})
