/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ImageAnnotation } from '@expcat/tigercat-react'
import type { ImageAnnotation as CoreImageAnnotation } from '@expcat/tigercat-core'
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
      src = ''
      onload: (() => void) | null = null

      constructor() {
        setTimeout(() => this.onload?.(), 0)
      }
    }
  )
})

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
    fireEvent.mouseDown(canvas, { clientX: 80, clientY: 60 })
    fireEvent.mouseMove(document, { clientX: 240, clientY: 180 })
    fireEvent.mouseUp(document, { clientX: 240, clientY: 180 })

    const [annotations, meta] = onChange.mock.lastCall as [CoreImageAnnotation[], unknown]
    expect(annotations[0]).toMatchObject({ id: 'rectangle-1', type: 'rectangle', x: 0.1, y: 0.1 })
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
    fireEvent.mouseDown(canvas, { clientX: 160, clientY: 120 })
    fireEvent.mouseUp(document, { clientX: 320, clientY: 240 })

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

    fireEvent.click(getByRole('button', { name: 'Face, rectangle annotation' }))

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

    fireEvent.click(getByRole('button', { name: 'rectangle annotation' }))
    fireEvent.click(getByRole('button', { name: 'Delete' }))

    expect(onChange).toHaveBeenLastCalledWith([], {
      type: 'remove',
      annotation: annotations[0]
    })
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
})
