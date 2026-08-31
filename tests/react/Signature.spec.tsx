/**
 * @vitest-environment happy-dom
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import React, { createRef, useState } from 'react'
import { Signature, type SignatureRef } from '@expcat/tigercat-react/Signature'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { Form } from '@expcat/tigercat-react/Form'
import { FormItem } from '@expcat/tigercat-react/FormItem'
import {
  signatureStrokesToSvg,
  signatureSvgToDataUrl,
  signatureValueToStrokes
} from '@expcat/tigercat-core'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { jaJP } from '@expcat/tigercat-core/locales/ja-JP'
import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { expectNoA11yViolations } from '../utils/react'

const createContextMock = () =>
  ({
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    lineCap: '',
    lineJoin: ''
  }) as unknown as CanvasRenderingContext2D

beforeEach(() => {
  vi.restoreAllMocks()
  Object.defineProperty(HTMLCanvasElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({ left: 0, top: 0, width: 480, height: 180, right: 480, bottom: 180 })
  })
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(createContextMock())
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,test')
})

const ensurePointerCaptureMethods = () => {
  const proto = HTMLElement.prototype
  if (typeof proto.setPointerCapture !== 'function') {
    proto.setPointerCapture = function () {}
  }
  if (typeof proto.releasePointerCapture !== 'function') {
    proto.releasePointerCapture = function () {}
  }
}

const spyPointerCapture = () => {
  ensurePointerCaptureMethods()
  return {
    setPointerCapture: vi
      .spyOn(HTMLElement.prototype, 'setPointerCapture')
      .mockImplementation(() => {}),
    releasePointerCapture: vi
      .spyOn(HTMLElement.prototype, 'releasePointerCapture')
      .mockImplementation(() => {})
  }
}

const pad = () => screen.getByRole('textbox')

const drawSignature = (canvas: HTMLElement, pointerId = 1) => {
  fireEvent.pointerDown(canvas, { pointerId, clientX: 10, clientY: 20 })
  fireEvent.pointerMove(canvas, { pointerId, clientX: 30, clientY: 40 })
  fireEvent.pointerUp(canvas, { pointerId, clientX: 30, clientY: 40 })
}

const sampleValue = signatureSvgToDataUrl(
  signatureStrokesToSvg(
    [
      {
        color: '#0f766e',
        lineWidth: 3,
        points: [
          { x: 10, y: 20 },
          { x: 30, y: 40 }
        ]
      }
    ],
    { width: 280, height: 140 }
  )
)

describe('Signature', () => {
  it('renders a signature pad and toolbar', () => {
    render(<Signature />)
    expect(pad()).toBeInTheDocument()
    expect(screen.getByRole('button', { name: enUS.signature.undoText })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: enUS.common.clearText })).toBeInTheDocument()
  })

  it('applies custom dimensions, label, and className', () => {
    const { container } = render(
      <Signature width={320} height={120} ariaLabel="Approve" className="custom-signature" />
    )
    const canvas = screen.getByRole('textbox', { name: 'Approve' }) as HTMLCanvasElement
    expect(canvas).toHaveAttribute('width', '320')
    expect(canvas).toHaveAttribute('height', '120')
    expect(container.querySelector('.custom-signature')).toBeInTheDocument()
  })

  it('emits begin, change, and end callbacks after drawing', () => {
    const onBegin = vi.fn()
    const onChange = vi.fn()
    const onEnd = vi.fn()
    render(
      <Signature width={480} height={180} onBegin={onBegin} onChange={onChange} onEnd={onEnd} />
    )

    drawSignature(pad())

    expect(onBegin).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onEnd).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toContain('data:image/svg+xml')
    expect(onChange.mock.calls[0][1]).toMatchObject({ empty: false, exportType: 'image/png' })
  })

  it('round-trips svg values onto the pad', () => {
    render(<Signature width={280} height={140} value={sampleValue} />)
    expect(signatureValueToStrokes(sampleValue).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: enUS.common.clearText })).not.toBeDisabled()
  })

  it('does not draw while disabled', () => {
    const onChange = vi.fn()
    render(<Signature disabled onChange={onChange} />)

    drawSignature(pad())

    expect(onChange).not.toHaveBeenCalled()
    expect(pad()).toHaveAttribute('aria-disabled', 'true')
    expect(pad()).toHaveAttribute('tabIndex', '-1')
  })

  it('does not draw while readonly and stays focusable', () => {
    const onChange = vi.fn()
    const { container } = render(<Signature readonly value={sampleValue} onChange={onChange} />)

    drawSignature(pad())

    expect(onChange).not.toHaveBeenCalled()
    expect(pad()).toHaveAttribute('aria-readonly', 'true')
    expect(pad()).not.toHaveAttribute('aria-disabled')
    expect(pad()).toHaveAttribute('tabIndex', '0')
  })

  it('keeps the clear button disabled while empty', () => {
    render(<Signature />)
    expect(screen.getByRole('button', { name: enUS.common.clearText })).toBeDisabled()
  })

  it('clears to an empty string, not a blank image', () => {
    const onChange = vi.fn()
    render(<Signature width={480} height={180} onChange={onChange} />)
    drawSignature(pad())

    fireEvent.click(screen.getByRole('button', { name: enUS.common.clearText }))

    expect(onChange.mock.calls.at(-1)?.[0]).toBe('')
    expect(onChange.mock.calls.at(-1)?.[1]).toMatchObject({ empty: true })
  })

  it('undoes the last stroke', () => {
    const onChange = vi.fn()
    render(<Signature width={480} height={180} onChange={onChange} />)
    drawSignature(pad())
    fireEvent.click(screen.getByRole('button', { name: enUS.signature.undoText }))
    expect(onChange.mock.calls.at(-1)?.[0]).toBe('')
  })

  it('calls onClear when cleared via toolbar button', () => {
    const onClear = vi.fn()
    render(<Signature width={480} height={180} onClear={onClear} />)
    drawSignature(pad())

    fireEvent.click(screen.getByRole('button', { name: enUS.common.clearText }))

    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('clears drawn strokes with Delete', () => {
    const onChange = vi.fn()
    render(<Signature width={480} height={180} onChange={onChange} />)
    drawSignature(pad())

    fireEvent.keyDown(pad(), { key: 'Delete' })

    expect(onChange.mock.calls.at(-1)?.[0]).toBe('')
  })

  it('exposes imperative ref methods', () => {
    const ref = createRef<SignatureRef>()
    render(<Signature ref={ref} width={480} height={180} />)
    drawSignature(pad())

    expect(ref.current?.isEmpty()).toBe(false)
    expect(ref.current?.toSVG()).toContain('<svg')
    expect(ref.current?.toDataURL('image/svg+xml')).toContain('data:image/svg+xml')
    act(() => {
      ref.current?.clear()
    })
    expect(ref.current?.isEmpty()).toBe(true)
  })

  it('maps pointer coordinates through the canvas display rect', () => {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ left: 10, top: 20, width: 200, height: 100, right: 210, bottom: 120 })
    })
    const onChange = vi.fn()
    render(<Signature width={100} height={50} onChange={onChange} />)

    fireEvent.pointerDown(pad(), { pointerId: 1, clientX: 110, clientY: 70 })
    fireEvent.pointerUp(pad(), { pointerId: 1 })

    expect(onChange.mock.calls[0][1].strokes[0].points[0]).toMatchObject({ x: 50, y: 25 })
  })

  it('uses custom pen color and line width', () => {
    const onChange = vi.fn()
    render(
      <Signature width={480} height={180} penColor="#dc2626" lineWidth={6} onChange={onChange} />
    )

    drawSignature(pad())

    expect(onChange.mock.calls[0][1].strokes[0]).toMatchObject({ color: '#dc2626', lineWidth: 6 })
  })

  it('hides the toolbar when clearable is false', () => {
    render(<Signature clearable={false} />)
    expect(screen.queryByRole('button', { name: enUS.common.clearText })).not.toBeInTheDocument()
  })

  it('captures the pointer on pointerdown', () => {
    const { setPointerCapture } = spyPointerCapture()
    render(<Signature width={480} height={180} />)

    fireEvent.pointerDown(pad(), { pointerId: 1, clientX: 10, clientY: 20 })

    expect(setPointerCapture).toHaveBeenCalledWith(1)
  })

  it('does not capture the pointer while disabled', () => {
    const { setPointerCapture } = spyPointerCapture()
    render(<Signature disabled />)

    fireEvent.pointerDown(pad(), { pointerId: 1, clientX: 10, clientY: 20 })

    expect(setPointerCapture).not.toHaveBeenCalled()
  })

  it('ignores a second pointer while the first stroke is active', () => {
    const onChange = vi.fn()
    render(<Signature width={480} height={180} onChange={onChange} />)
    fireEvent.pointerDown(pad(), { pointerId: 1, clientX: 10, clientY: 20 })
    fireEvent.pointerMove(pad(), { pointerId: 2, clientX: 90, clientY: 90 })
    fireEvent.pointerUp(pad(), { pointerId: 1, clientX: 10, clientY: 20 })
    const points = onChange.mock.calls[0][1].strokes[0].points
    expect(points.some((point: { x: number }) => point.x === 90)).toBe(false)
  })

  it('finishes the stroke on document pointerup after leaving the pad', () => {
    const onBegin = vi.fn()
    const onChange = vi.fn()
    const onEnd = vi.fn()
    render(
      <Signature width={480} height={180} onBegin={onBegin} onChange={onChange} onEnd={onEnd} />
    )

    fireEvent.pointerDown(pad(), { pointerId: 1, clientX: 10, clientY: 20 })
    fireEvent.pointerMove(document, { pointerId: 1, clientX: 30, clientY: 40 })
    fireEvent.pointerUp(document, { pointerId: 1 })

    expect(onBegin).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  it('finishes the stroke only once when pointerup follows capture', () => {
    spyPointerCapture()
    const onChange = vi.fn()
    const onEnd = vi.fn()
    render(<Signature width={480} height={180} onChange={onChange} onEnd={onEnd} />)

    fireEvent.pointerDown(pad(), { pointerId: 1, clientX: 10, clientY: 20 })
    fireEvent.pointerMove(pad(), { pointerId: 1, clientX: 30, clientY: 40 })
    fireEvent.pointerUp(pad(), { pointerId: 1 })
    fireEvent.lostPointerCapture(pad())
    fireEvent.pointerUp(document, { pointerId: 1 })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  it('exports raster from an offscreen canvas at logical size', () => {
    const widths: number[] = []
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(function (
      this: HTMLCanvasElement
    ) {
      widths.push(this.width)
      return 'data:image/png;base64,test'
    })
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 2 })
    const ref = createRef<SignatureRef>()
    render(<Signature ref={ref} width={100} height={50} />)
    drawSignature(pad())
    ref.current?.toDataURL('image/png')
    expect(widths.at(-1)).toBe(100)
  })

  it('writes a string into FormItem and treats clear as empty', async () => {
    const validator = vi.fn((value: unknown) => (value ? undefined : 'required'))
    const onChange = vi.fn()
    function Harness() {
      return (
        <Form>
          <FormItem name="sign" label="Sign" rules={[{ validator }]}>
            <Signature width={480} height={180} onChange={onChange} />
          </FormItem>
        </Form>
      )
    }
    render(<Harness />)
    expect(pad()).toHaveAttribute('id')
    drawSignature(pad())
    await waitFor(() => expect(onChange).toHaveBeenCalled())
    expect(onChange.mock.calls.at(-1)?.[0]).toContain('data:image/svg+xml')
    const clearButton = screen.getByRole('button', { name: enUS.common.clearText })
    await waitFor(() => expect(clearButton).not.toBeDisabled())
    fireEvent.click(clearButton)
    await waitFor(() => expect(onChange.mock.calls.at(-1)?.[0]).toBe(''))
  })

  it('does not treat moving focus to Clear as a field blur', async () => {
    const validator = vi.fn(() => undefined)
    render(
      <Form>
        <FormItem name="sign" label="Sign" rules={[{ validator, trigger: 'blur' }]}>
          <Signature width={480} height={180} />
        </FormItem>
      </Form>
    )
    drawSignature(pad())
    validator.mockClear()
    pad().focus()
    fireEvent.blur(pad(), {
      relatedTarget: screen.getByRole('button', { name: enUS.common.clearText })
    })
    expect(validator).not.toHaveBeenCalled()
  })

  it('uses official locale objects for pad name and clear', () => {
    render(
      <ConfigProvider locale={zhTW}>
        <Signature />
      </ConfigProvider>
    )
    expect(screen.getByRole('textbox', { name: zhTW.signature?.ariaLabel })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: zhTW.common?.clearText })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: zhTW.signature?.undoText })).toBeInTheDocument()
  })

  it('uses ja-JP locale objects', () => {
    render(
      <ConfigProvider locale={jaJP}>
        <Signature />
      </ConfigProvider>
    )
    expect(screen.getByRole('textbox', { name: jaJP.signature?.ariaLabel })).toBeInTheDocument()
  })

  describe('Accessibility', () => {
    it('has no accessibility violations for an empty pad', async () => {
      const { container } = render(<Signature />)
      await expectNoA11yViolations(container)
    })

    it('has no accessibility violations for a readonly signed pad', async () => {
      const { container } = render(<Signature readonly value={sampleValue} />)
      await expectNoA11yViolations(container)
    })

    it('has no accessibility violations when invalid', async () => {
      const { container } = render(<Signature status="error" />)
      expect(pad()).toHaveAttribute('aria-invalid', 'true')
      await expectNoA11yViolations(container)
    })
  })
})
