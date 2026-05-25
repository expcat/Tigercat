/**
 * @vitest-environment happy-dom
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/vue'
import { Signature } from '@expcat/tigercat-vue'
import { expectNoA11yViolationsIsolated } from '../utils'

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

const drawSignature = async (canvas: HTMLElement) => {
  await fireEvent.pointerDown(canvas, { clientX: 10, clientY: 20 })
  await fireEvent.pointerMove(canvas, { clientX: 30, clientY: 40 })
  await fireEvent.pointerUp(canvas)
}

describe('Signature', () => {
  it('renders a signature canvas and clear button', () => {
    render(Signature)
    expect(screen.getByRole('img', { name: 'Signature pad' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear' })).toBeInTheDocument()
  })

  it('applies custom dimensions, label, and className', () => {
    const { container } = render(Signature, {
      props: { width: 320, height: 120, ariaLabel: 'Approve', className: 'custom-signature' }
    })
    const canvas = screen.getByRole('img', { name: 'Approve' }) as HTMLCanvasElement
    expect(canvas).toHaveAttribute('width', '320')
    expect(canvas).toHaveAttribute('height', '120')
    expect(container.querySelector('.custom-signature')).toBeInTheDocument()
  })

  it('emits begin, change, and end events after drawing', async () => {
    const { emitted } = render(Signature)

    await drawSignature(screen.getByRole('img'))

    expect(emitted().begin).toHaveLength(1)
    expect(emitted().change).toHaveLength(1)
    expect(emitted().end).toHaveLength(1)
    expect(emitted().change[0][0]).toMatchObject({ empty: false, exportType: 'image/png' })
  })

  it('emits update:modelValue after drawing', async () => {
    const { emitted } = render(Signature, { props: { modelValue: '' } })

    await drawSignature(screen.getByRole('img'))

    expect(emitted()['update:modelValue'][0][0]).toBe('data:image/png;base64,test')
  })

  it('exports svg payloads when exportType is svg', async () => {
    const { emitted } = render(Signature, { props: { exportType: 'image/svg+xml' } })

    await drawSignature(screen.getByRole('img'))

    const payload = emitted().change[0][0] as { value: string }
    expect(payload.value).toContain('data:image/svg+xml')
    expect(decodeURIComponent(payload.value)).toContain('M 10 20 L 30 40')
  })

  it('does not draw while disabled', async () => {
    const { emitted } = render(Signature, { props: { disabled: true } })

    await drawSignature(screen.getByRole('img'))

    expect(emitted().change).toBeUndefined()
    expect(screen.getByRole('img')).toHaveAttribute('aria-disabled', 'true')
  })

  it('does not draw while readonly', async () => {
    const { emitted } = render(Signature, { props: { readonly: true } })

    await drawSignature(screen.getByRole('img'))

    expect(emitted().change).toBeUndefined()
  })

  it('keeps the clear button disabled while empty', () => {
    render(Signature)
    expect(screen.getByRole('button', { name: 'Clear' })).toBeDisabled()
  })

  it('clears drawn strokes with the toolbar button', async () => {
    const { emitted } = render(Signature)
    await drawSignature(screen.getByRole('img'))

    await fireEvent.click(screen.getByRole('button', { name: 'Clear' }))

    expect(emitted().clear).toHaveLength(1)
    expect(emitted().change.at(-1)?.[0]).toMatchObject({ empty: true })
  })

  it('clears drawn strokes with Backspace', async () => {
    const { emitted } = render(Signature)
    const canvas = screen.getByRole('img')
    await drawSignature(canvas)

    await fireEvent.keyDown(canvas, { key: 'Backspace' })

    expect(emitted().change.at(-1)?.[0]).toMatchObject({ empty: true })
  })

  it('maps pointer coordinates through the canvas display rect', async () => {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ left: 10, top: 20, width: 200, height: 100, right: 210, bottom: 120 })
    })
    const { emitted } = render(Signature, {
      props: { width: 100, height: 50, exportType: 'image/svg+xml' }
    })

    await fireEvent.pointerDown(screen.getByRole('img'), { clientX: 110, clientY: 70 })
    await fireEvent.pointerUp(screen.getByRole('img'))

    expect(emitted().change[0][0].strokes[0].points[0]).toMatchObject({ x: 50, y: 25 })
  })

  it('uses custom pen color and line width', async () => {
    const { emitted } = render(Signature, { props: { penColor: '#dc2626', lineWidth: 6 } })

    await drawSignature(screen.getByRole('img'))

    expect(emitted().change[0][0].strokes[0]).toMatchObject({ color: '#dc2626', lineWidth: 6 })
  })

  it('hides the toolbar when clearable is false', () => {
    render(Signature, { props: { clearable: false } })
    expect(screen.queryByRole('button', { name: 'Clear' })).not.toBeInTheDocument()
  })

  it('exports png with configured quality', async () => {
    const toDataURL = vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL')
    const { emitted } = render(Signature, { props: { exportType: 'image/jpeg', quality: 0.7 } })

    await drawSignature(screen.getByRole('img'))

    expect(toDataURL).toHaveBeenCalledWith('image/jpeg', 0.7)
    expect(emitted().change[0][0].value).toBe('data:image/png;base64,test')
  })

  it('forwards attrs to the root element', () => {
    const { container } = render(Signature, { attrs: { 'data-testid': 'signature-root' } })
    expect(container.querySelector('[data-testid="signature-root"]')).toBeInTheDocument()
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Signature)
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      expect(() => render(Signature)).not.toThrow()
    })
  })
})
