/**
 * @vitest-environment happy-dom
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import React, { createRef } from 'react'
import { Signature, type SignatureRef } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

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

const drawSignature = (canvas: HTMLElement) => {
  fireEvent.pointerDown(canvas, { clientX: 10, clientY: 20 })
  fireEvent.pointerMove(canvas, { clientX: 30, clientY: 40 })
  fireEvent.pointerUp(canvas)
}

describe('Signature', () => {
  it('renders a signature canvas and clear button', () => {
    render(<Signature />)
    expect(screen.getByRole('img', { name: 'Signature pad' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument()
  })

  it('applies custom dimensions, label, and className', () => {
    const { container } = render(
      <Signature width={320} height={120} ariaLabel="Approve" className="custom-signature" />
    )
    const canvas = screen.getByRole('img', { name: 'Approve' }) as HTMLCanvasElement
    expect(canvas).toHaveAttribute('width', '320')
    expect(canvas).toHaveAttribute('height', '120')
    expect(container.querySelector('.custom-signature')).toBeInTheDocument()
  })

  it('emits begin, change, and end callbacks after drawing', () => {
    const onBegin = vi.fn()
    const onChange = vi.fn()
    const onEnd = vi.fn()
    render(<Signature onBegin={onBegin} onChange={onChange} onEnd={onEnd} />)

    drawSignature(screen.getByRole('img'))

    expect(onBegin).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onEnd).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toMatchObject({ empty: false, exportType: 'image/png' })
  })

  it('exports svg payloads when exportType is svg', () => {
    const onChange = vi.fn()
    render(<Signature exportType="image/svg+xml" onChange={onChange} />)

    drawSignature(screen.getByRole('img'))

    expect(onChange.mock.calls[0][0].value).toContain('data:image/svg+xml')
    expect(decodeURIComponent(onChange.mock.calls[0][0].value)).toContain('M 10 20 L 30 40')
  })

  it('does not draw while disabled', () => {
    const onChange = vi.fn()
    render(<Signature disabled onChange={onChange} />)

    drawSignature(screen.getByRole('img'))

    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByRole('img')).toHaveAttribute('aria-disabled', 'true')
  })

  it('does not draw while readonly', () => {
    const onChange = vi.fn()
    render(<Signature readonly onChange={onChange} />)

    drawSignature(screen.getByRole('img'))

    expect(onChange).not.toHaveBeenCalled()
  })

  it('keeps the clear button disabled while empty', () => {
    render(<Signature />)
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled()
  })

  it('clears drawn strokes with the toolbar button', () => {
    const onChange = vi.fn()
    render(<Signature onChange={onChange} />)
    drawSignature(screen.getByRole('img'))

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))

    expect(onChange.mock.calls.at(-1)?.[0]).toMatchObject({ empty: true })
  })

  it('calls onClear when cleared via toolbar button', () => {
    const onClear = vi.fn()
    render(<Signature onClear={onClear} />)
    drawSignature(screen.getByRole('img'))

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))

    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('clears drawn strokes with Delete', () => {
    const onChange = vi.fn()
    const canvas = render(<Signature onChange={onChange} />).container.querySelector('canvas')!
    drawSignature(canvas)

    fireEvent.keyDown(canvas, { key: 'Delete' })

    expect(onChange.mock.calls.at(-1)?.[0]).toMatchObject({ empty: true })
  })

  it('exposes imperative ref methods', () => {
    const ref = createRef<SignatureRef>()
    render(<Signature ref={ref} exportType="image/svg+xml" />)
    const canvas = screen.getByRole('img')
    drawSignature(canvas)

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
    render(<Signature width={100} height={50} exportType="image/svg+xml" onChange={onChange} />)

    fireEvent.pointerDown(screen.getByRole('img'), { clientX: 110, clientY: 70 })
    fireEvent.pointerUp(screen.getByRole('img'))

    expect(onChange.mock.calls[0][0].strokes[0].points[0]).toMatchObject({ x: 50, y: 25 })
  })

  it('uses custom pen color and line width', () => {
    const onChange = vi.fn()
    render(<Signature penColor="#dc2626" lineWidth={6} onChange={onChange} />)

    drawSignature(screen.getByRole('img'))

    expect(onChange.mock.calls[0][0].strokes[0]).toMatchObject({ color: '#dc2626', lineWidth: 6 })
  })

  it('hides the toolbar when clearable is false', () => {
    render(<Signature clearable={false} />)
    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument()
  })

  it('exports png with configured quality', () => {
    const toDataURL = vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL')
    const onChange = vi.fn()
    render(<Signature exportType="image/jpeg" quality={0.7} onChange={onChange} />)

    drawSignature(screen.getByRole('img'))

    expect(toDataURL).toHaveBeenCalledWith('image/jpeg', 0.7)
    expect(onChange.mock.calls[0][0].value).toBe('data:image/png;base64,test')
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Signature />)
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('Edge Cases', () => {})
})
