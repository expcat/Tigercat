/**
 * @vitest-environment happy-dom
 */

import { render, fireEvent, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ImageAnnotation } from '@expcat/tigercat-vue'
import type { ImageAnnotation as CoreImageAnnotation } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils'

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

const renderLoadedAnnotation = async (options: Parameters<typeof render>[1]) => {
  const result = render(ImageAnnotation, options)
  await waitFor(() => expect(result.getByLabelText('Image annotation canvas')).toBeInTheDocument())
  return result
}

describe('ImageAnnotation', () => {
  it('shows loading state before image is ready', () => {
    const { getByLabelText } = render(ImageAnnotation, { props: { src: '/scene.jpg' } })
    expect(getByLabelText('Loading image for annotation')).toBeInTheDocument()
  })

  it('renders toolbar tools and image canvas', async () => {
    const { getByRole, getByLabelText } = await renderLoadedAnnotation({
      props: { src: '/scene.jpg' }
    })

    expect(getByRole('button', { name: 'Rectangle' })).toHaveAttribute('aria-pressed', 'false')
    expect(getByLabelText('Image annotation canvas')).toBeInTheDocument()
  })

  it('switches drawing tools', async () => {
    const { getByRole, emitted } = await renderLoadedAnnotation({ props: { src: '/scene.jpg' } })

    await fireEvent.click(getByRole('button', { name: 'Rectangle' }))

    expect(getByRole('button', { name: 'Rectangle' })).toHaveAttribute('aria-pressed', 'true')
    expect(emitted()['tool-change']).toEqual([['rectangle']])
  })

  it('draws rectangle annotations with normalized coordinates', async () => {
    const { getByRole, getByLabelText, emitted } = await renderLoadedAnnotation({
      props: { src: '/scene.jpg' }
    })

    await fireEvent.click(getByRole('button', { name: 'Rectangle' }))
    const canvas = getByLabelText('Image annotation canvas')
    await fireEvent.mouseDown(canvas, { clientX: 80, clientY: 60 })
    await fireEvent.mouseMove(document, { clientX: 240, clientY: 180 })
    await fireEvent.mouseUp(document, { clientX: 240, clientY: 180 })

    const [annotations, meta] = emitted().change.at(-1) as [CoreImageAnnotation[], unknown]
    expect(annotations[0]).toMatchObject({ id: 'rectangle-1', type: 'rectangle', x: 0.1, y: 0.1 })
    expect('width' in annotations[0] ? annotations[0].width : 0).toBeCloseTo(0.2)
    expect('height' in annotations[0] ? annotations[0].height : 0).toBeCloseTo(0.2)
    expect(meta).toMatchObject({ type: 'add', annotation: annotations[0] })
  })

  it('renders existing annotations and selects one', async () => {
    const annotations: CoreImageAnnotation[] = [
      { id: 'face', type: 'rectangle', x: 0.1, y: 0.1, width: 0.2, height: 0.2, label: 'Face' }
    ]
    const { getByRole, getByText, emitted } = await renderLoadedAnnotation({
      props: { src: '/scene.jpg', modelValue: annotations }
    })

    await fireEvent.click(getByRole('button', { name: 'Face, rectangle annotation' }))

    expect(getByText('Face')).toBeInTheDocument()
    expect(emitted().select.at(-1)).toEqual([annotations[0]])
  })

  it('removes selected annotations', async () => {
    const annotations: CoreImageAnnotation[] = [
      { id: 'face', type: 'rectangle', x: 0.1, y: 0.1, width: 0.2, height: 0.2 }
    ]
    const { getByRole, emitted } = await renderLoadedAnnotation({
      props: { src: '/scene.jpg', defaultValue: annotations }
    })

    await fireEvent.click(getByRole('button', { name: 'rectangle annotation' }))
    await fireEvent.click(getByRole('button', { name: 'Delete' }))

    expect(emitted().change.at(-1)).toEqual([
      [],
      {
        type: 'remove',
        annotation: annotations[0]
      }
    ])
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
    const { container } = await renderLoadedAnnotation({
      props: { src: '/scene.jpg', modelValue: annotations }
    })

    expect(container.querySelectorAll('path')).toHaveLength(2)
  })

  it('has no accessibility violations', async () => {
    const { container } = await renderLoadedAnnotation({ props: { src: '/scene.jpg' } })
    await expectNoA11yViolationsIsolated(container)
  })
})
