/**
 * @vitest-environment happy-dom
 */

import { render, fireEvent, waitFor } from '@testing-library/vue'
import { h } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ImageAnnotation } from '@expcat/tigercat-vue/ImageAnnotation'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import type { ImageAnnotation as CoreImageAnnotation } from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
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

async function drawBox(
  canvas: HTMLElement,
  from: { x: number; y: number },
  to: { x: number; y: number }
) {
  await fireEvent.pointerDown(canvas, {
    clientX: from.x,
    clientY: from.y,
    button: 0,
    pointerId: 1
  })
  await fireEvent.pointerMove(document, { clientX: to.x, clientY: to.y, pointerId: 1 })
  await fireEvent.pointerUp(document, { clientX: to.x, clientY: to.y, pointerId: 1 })
}

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
    await drawBox(canvas, { x: 80, y: 60 }, { x: 240, y: 180 })

    const [annotations, meta] = emitted().change.at(-1) as [CoreImageAnnotation[], unknown]
    expect(annotations[0]).toMatchObject({ type: 'rectangle', x: 0.1, y: 0.1 })
    expect(annotations[0].id).not.toBe('')
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

    await fireEvent.pointerDown(getByRole('option', { name: 'Face, Rectangle annotation' }))

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

    await fireEvent.pointerDown(getByRole('option', { name: 'Rectangle annotation' }))
    await fireEvent.click(getByRole('button', { name: 'Delete' }))

    expect(emitted().change.at(-1)).toEqual([
      [],
      {
        type: 'remove',
        annotation: annotations[0]
      }
    ])
  })

  it('selects an annotation with Enter/Space on its shape (C20-3)', async () => {
    const annotations: CoreImageAnnotation[] = [
      { id: 'face', type: 'rectangle', x: 0.1, y: 0.1, width: 0.2, height: 0.2, label: 'Face' }
    ]
    const { getByRole, emitted } = await renderLoadedAnnotation({
      props: { src: '/scene.jpg', modelValue: annotations }
    })
    const shape = getByRole('option', { name: 'Face, Rectangle annotation' })
    await fireEvent.keyDown(shape, { key: 'Enter' })
    expect(emitted().select?.at(-1)).toEqual([annotations[0]])

    await fireEvent.keyDown(shape, { key: ' ' })
    expect(emitted().select?.at(-1)).toEqual([annotations[0]])
  })

  it('removes the focused editable annotation with Delete (C20-3)', async () => {
    const annotations: CoreImageAnnotation[] = [
      { id: 'face', type: 'rectangle', x: 0.1, y: 0.1, width: 0.2, height: 0.2 }
    ]
    const { getByRole, emitted } = await renderLoadedAnnotation({
      props: { src: '/scene.jpg', defaultValue: annotations }
    })
    const shape = getByRole('option', { name: 'Rectangle annotation' })
    await fireEvent.keyDown(shape, { key: 'Delete' })
    expect(emitted().change.at(-1)).toEqual([[], { type: 'remove', annotation: annotations[0] }])
  })

  it('does not remove via keyboard when readonly (C20-3)', async () => {
    const annotations: CoreImageAnnotation[] = [
      { id: 'face', type: 'rectangle', x: 0.1, y: 0.1, width: 0.2, height: 0.2 }
    ]
    const { getByRole, emitted } = await renderLoadedAnnotation({
      props: { src: '/scene.jpg', modelValue: annotations, readonly: true }
    })
    const shape = getByRole('option', { name: 'Rectangle annotation' })
    await fireEvent.keyDown(shape, { key: 'Delete' })
    expect(emitted().change).toBeUndefined()
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

  describe('Edge Cases and Boundary', () => {
    it('emits ready after the image loads', async () => {
      const { emitted } = await renderLoadedAnnotation({ props: { src: '/scene.jpg' } })

      expect(emitted().ready).toEqual([[]])
    })

    it('renders custom image alt text', async () => {
      const { getByAltText } = await renderLoadedAnnotation({
        props: { src: '/scene.jpg', alt: 'Floor plan' }
      })

      expect(getByAltText('Floor plan')).toBeInTheDocument()
    })

    it('disables tools and delete when disabled', async () => {
      const { getByRole } = await renderLoadedAnnotation({
        props: { src: '/scene.jpg', disabled: true }
      })

      expect(getByRole('button', { name: 'Rectangle' })).toBeDisabled()
      expect(getByRole('button', { name: 'Delete' })).toBeDisabled()
    })

    it('hides annotation labels when showLabels is false', async () => {
      const annotations: CoreImageAnnotation[] = [
        { id: 'face', type: 'rectangle', x: 0.1, y: 0.1, width: 0.2, height: 0.2, label: 'Face' }
      ]
      const { queryByText } = await renderLoadedAnnotation({
        props: { src: '/scene.jpg', modelValue: annotations, showLabels: false }
      })

      expect(queryByText('Face')).not.toBeInTheDocument()
    })

    it('does not commit rectangles below the minimum size', async () => {
      const { getByRole, getByLabelText, emitted } = await renderLoadedAnnotation({
        props: { src: '/scene.jpg', minSize: 0.1 }
      })

      await fireEvent.click(getByRole('button', { name: 'Rectangle' }))
      const canvas = getByLabelText('Image annotation canvas')
      await drawBox(canvas, { x: 80, y: 60 }, { x: 82, y: 62 })

      expect(emitted().change).toBeUndefined()
    })

    it('commits polygon annotations after three points and Enter', async () => {
      const { getByRole, getByLabelText, emitted } = await renderLoadedAnnotation({
        props: { src: '/scene.jpg' }
      })

      await fireEvent.click(getByRole('button', { name: 'Polygon' }))
      const canvas = getByLabelText('Image annotation canvas')
      await fireEvent.click(canvas, { clientX: 80, clientY: 60 })
      await fireEvent.click(canvas, { clientX: 240, clientY: 60 })
      await fireEvent.click(canvas, { clientX: 240, clientY: 180 })
      await fireEvent.keyDown(canvas, { key: 'Enter' })

      expect(emitted().change.at(-1)?.[0][0]).toMatchObject({ type: 'polygon' })
    })

    it('prevents drawing while readonly', async () => {
      const { getByLabelText, emitted } = await renderLoadedAnnotation({
        props: { src: '/scene.jpg', readonly: true, tool: 'rectangle' }
      })

      const canvas = getByLabelText('Image annotation canvas')
      await drawBox(canvas, { x: 80, y: 60 }, { x: 240, y: 180 })

      expect(emitted().change).toBeUndefined()
    })

    it('draws ellipse annotations', async () => {
      const { getByRole, getByLabelText, emitted } = await renderLoadedAnnotation({
        props: { src: '/scene.jpg' }
      })
      await fireEvent.click(getByRole('button', { name: 'Ellipse' }))
      await drawBox(
        getByLabelText('Image annotation canvas'),
        { x: 160, y: 120 },
        { x: 320, y: 240 }
      )
      expect(emitted().change.at(-1)?.[0][0]).toMatchObject({
        type: 'ellipse',
        width: 0.2,
        height: 0.2
      })
    })

    it('does not collide with an existing rectangle-1 id', async () => {
      const existing: CoreImageAnnotation[] = [
        { id: 'rectangle-1', type: 'rectangle', x: 0.7, y: 0.7, width: 0.1, height: 0.1 }
      ]
      const { getByRole, getByLabelText, emitted } = await renderLoadedAnnotation({
        props: { src: '/scene.jpg', defaultValue: existing }
      })
      await fireEvent.click(getByRole('button', { name: 'Rectangle' }))
      await drawBox(getByLabelText('Image annotation canvas'), { x: 80, y: 60 }, { x: 240, y: 180 })
      const next = emitted().change.at(-1)?.[0] as CoreImageAnnotation[]
      expect(next[1]?.id).not.toBe('rectangle-1')
      expect(next).toHaveLength(2)
    })

    it('shows an error instead of a spinner when src fails', async () => {
      const { getByLabelText, queryByLabelText } = render(ImageAnnotation, {
        props: { src: '/missing.jpg' }
      })
      await waitFor(() =>
        expect(getByLabelText('Failed to load image for annotation')).toBeInTheDocument()
      )
      expect(queryByLabelText('Loading image for annotation')).not.toBeInTheDocument()
    })

    it('does not select shapes when disabled', async () => {
      const annotations: CoreImageAnnotation[] = [
        { id: 'face', type: 'rectangle', x: 0.1, y: 0.1, width: 0.2, height: 0.2 }
      ]
      const { getByRole, emitted } = await renderLoadedAnnotation({
        props: { src: '/scene.jpg', modelValue: annotations, disabled: true }
      })
      await fireEvent.pointerDown(getByRole('option', { name: 'Rectangle annotation' }))
      expect(emitted().select).toBeUndefined()
    })

    it('names the canvas from locale', async () => {
      const { getByLabelText } = render({
        setup: () => () =>
          h(ConfigProvider, { locale: zhCN }, () => h(ImageAnnotation, { src: '/scene.jpg' }))
      })
      await waitFor(() =>
        expect(getByLabelText(zhCN.imageEditor!.annotationCanvasAriaLabel!)).toBeInTheDocument()
      )
    })
  })
})
