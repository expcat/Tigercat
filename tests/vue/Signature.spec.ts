/**
 * @vitest-environment happy-dom
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { Signature } from '@expcat/tigercat-vue/Signature'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { Form } from '@expcat/tigercat-vue/Form'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { signatureStrokesToSvg, signatureSvgToDataUrl } from '@expcat/tigercat-core'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { jaJP } from '@expcat/tigercat-core/locales/ja-JP'
import { enUS } from '@expcat/tigercat-core/locales/en-US'
import { expectNoA11yViolations } from '../utils'

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

const drawSignature = async (canvas: HTMLElement, pointerId = 1) => {
  await fireEvent.pointerDown(canvas, { pointerId, clientX: 10, clientY: 20 })
  await fireEvent.pointerMove(canvas, { pointerId, clientX: 30, clientY: 40 })
  await fireEvent.pointerUp(canvas, { pointerId, clientX: 30, clientY: 40 })
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
    render(Signature, { props: { width: 480, height: 180 } })
    expect(pad()).toBeInTheDocument()
    expect(screen.getByRole('button', { name: enUS.signature.undoText })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: enUS.common.clearText })).toBeInTheDocument()
  })

  it('applies custom dimensions, label, and className', () => {
    const { container } = render(Signature, {
      props: { width: 320, height: 120, ariaLabel: 'Approve', className: 'custom-signature' }
    })
    const canvas = screen.getByRole('textbox', { name: 'Approve' }) as HTMLCanvasElement
    expect(canvas).toHaveAttribute('width', '320')
    expect(canvas).toHaveAttribute('height', '120')
    expect(container.querySelector('.custom-signature')).toBeInTheDocument()
  })

  it('emits begin, change, and end events after drawing', async () => {
    const { emitted } = render(Signature, { props: { width: 480, height: 180 } })

    await drawSignature(pad())

    expect(emitted().begin).toHaveLength(1)
    expect(emitted().change).toHaveLength(1)
    expect(emitted().end).toHaveLength(1)
    expect(emitted().change[0][0]).toContain('data:image/svg+xml')
    expect(emitted().change[0][1]).toMatchObject({ empty: false, exportType: 'image/png' })
  })

  it('emits update:modelValue after drawing', async () => {
    const { emitted } = render(Signature, { props: { width: 480, height: 180 } })

    await drawSignature(pad())

    expect(emitted()['update:modelValue'][0][0]).toContain('data:image/svg+xml')
    expect(emitted().input[0][0]).toContain('data:image/svg+xml')
  })

  it('round-trips svg values onto the pad', () => {
    render(Signature, { props: { width: 280, height: 140, modelValue: sampleValue } })
    expect(screen.getByRole('button', { name: enUS.common.clearText })).not.toBeDisabled()
  })

  it('does not draw while disabled', async () => {
    const { emitted } = render(Signature, { props: { disabled: true, width: 480 } })

    await drawSignature(pad())

    expect(emitted().change).toBeUndefined()
    expect(pad()).toHaveAttribute('aria-disabled', 'true')
  })

  it('does not draw while readonly and stays focusable', async () => {
    const { container, emitted } = render(Signature, {
      props: { readonly: true, modelValue: sampleValue, width: 280, height: 140 }
    })

    await drawSignature(pad())

    expect(emitted().change).toBeUndefined()
    expect(pad()).toHaveAttribute('aria-readonly', 'true')
    expect(pad()).not.toHaveAttribute('aria-disabled')
  })

  it('clears to an empty string, not a blank image', async () => {
    const { emitted } = render(Signature, { props: { width: 480, height: 180 } })
    await drawSignature(pad())

    await fireEvent.click(screen.getByRole('button', { name: enUS.common.clearText }))

    expect(emitted().change.at(-1)?.[0]).toBe('')
    expect(emitted().change.at(-1)?.[1]).toMatchObject({ empty: true })
  })

  it('clears drawn strokes with Delete', async () => {
    const { emitted } = render(Signature, { props: { width: 480, height: 180 } })
    await drawSignature(pad())
    await fireEvent.keyDown(pad(), { key: 'Delete' })
    expect(emitted().change.at(-1)?.[0]).toBe('')
  })

  it('maps pointer coordinates through the canvas display rect', async () => {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ left: 10, top: 20, width: 200, height: 100, right: 210, bottom: 120 })
    })
    const { emitted } = render(Signature, { props: { width: 100, height: 50 } })

    await fireEvent.pointerDown(pad(), { pointerId: 1, clientX: 110, clientY: 70 })
    await fireEvent.pointerUp(pad(), { pointerId: 1 })

    expect(emitted().change[0][1].strokes[0].points[0]).toMatchObject({ x: 50, y: 25 })
  })

  it('uses custom pen color and line width', async () => {
    const { emitted } = render(Signature, {
      props: { width: 480, height: 180, penColor: '#dc2626', lineWidth: 6 }
    })

    await drawSignature(pad())

    expect(emitted().change[0][1].strokes[0]).toMatchObject({ color: '#dc2626', lineWidth: 6 })
  })

  it('hides the toolbar when clearable is false', () => {
    render(Signature, { props: { clearable: false } })
    expect(screen.queryByRole('button', { name: enUS.common.clearText })).not.toBeInTheDocument()
  })

  it('forwards attrs to the root element', () => {
    const { container } = render(Signature, { attrs: { 'data-testid': 'signature-root' } })
    expect(container.querySelector('[data-testid="signature-root"]')).toBeInTheDocument()
  })

  it('captures the pointer on pointerdown', async () => {
    const { setPointerCapture } = spyPointerCapture()
    render(Signature, { props: { width: 480 } })

    await fireEvent.pointerDown(pad(), { pointerId: 1, clientX: 10, clientY: 20 })

    expect(setPointerCapture).toHaveBeenCalledWith(1)
  })

  it('finishes the stroke on document pointerup after leaving the pad', async () => {
    const { emitted } = render(Signature, { props: { width: 480, height: 180 } })

    await fireEvent.pointerDown(pad(), { pointerId: 1, clientX: 10, clientY: 20 })
    await fireEvent.pointerMove(document, { pointerId: 1, clientX: 30, clientY: 40 })
    await fireEvent.pointerUp(document, { pointerId: 1 })

    expect(emitted().begin).toHaveLength(1)
    expect(emitted().change).toHaveLength(1)
    expect(emitted().end).toHaveLength(1)
  })

  it('finishes the stroke on lostpointercapture', async () => {
    const { emitted } = render(Signature, { props: { width: 480, height: 180 } })

    await fireEvent.pointerDown(pad(), { pointerId: 1, clientX: 10, clientY: 20 })
    await fireEvent.lostPointerCapture(pad())

    expect(emitted().change).toHaveLength(1)
    expect(emitted().end).toHaveLength(1)
  })

  it('writes a string into FormItem and treats clear as empty', async () => {
    const validator = vi.fn((value: unknown) => (value ? undefined : 'required'))
    const onChange = vi.fn()
    const Wrapper = defineComponent({
      setup() {
        return () =>
          h(Form, null, () =>
            h(FormItem, { name: 'sign', label: 'Sign', rules: [{ validator }] }, () =>
              h(Signature, { width: 480, height: 180, onChange })
            )
          )
      }
    })
    render(Wrapper)
    expect(pad().id).toBeTruthy()
    await drawSignature(pad())
    await waitFor(() => expect(onChange).toHaveBeenCalled())
    expect(onChange.mock.calls.at(-1)?.[0]).toContain('data:image/svg+xml')
    const clearButton = screen.getByRole('button', { name: enUS.common.clearText })
    await waitFor(() => expect(clearButton).not.toBeDisabled())
    await fireEvent.click(clearButton)
    await waitFor(() => expect(onChange.mock.calls.at(-1)?.[0]).toBe(''))
  })

  it('uses official locale objects for pad name and clear', () => {
    const Wrapper = defineComponent({
      setup() {
        return () => h(ConfigProvider, { locale: zhTW }, () => h(Signature))
      }
    })
    render(Wrapper)
    expect(screen.getByRole('textbox', { name: zhTW.signature?.ariaLabel })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: zhTW.common?.clearText })).toBeInTheDocument()
  })

  it('uses ja-JP locale objects', () => {
    const Wrapper = defineComponent({
      setup() {
        return () => h(ConfigProvider, { locale: jaJP }, () => h(Signature))
      }
    })
    render(Wrapper)
    expect(screen.getByRole('textbox', { name: jaJP.signature?.ariaLabel })).toBeInTheDocument()
  })

  describe('Accessibility', () => {
    it('has no accessibility violations for an empty pad', async () => {
      const { container } = render(Signature)
      await expectNoA11yViolations(container)
    })

    it('has no accessibility violations for a readonly signed pad', async () => {
      const { container } = render(Signature, {
        props: { readonly: true, modelValue: sampleValue }
      })
      await expectNoA11yViolations(container)
    })
  })
})
