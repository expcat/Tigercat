/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, waitFor, act } from '@testing-library/react'
import React, { useState } from 'react'
import { Splitter } from '@expcat/tigercat-react/Splitter'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { expectNoA11yViolations } from '../utils/a11y-helpers'
import { MockResizeObserver } from '../utils/mock-observers'
import { RESIZE_KEYBOARD_STEP } from '@expcat/tigercat-core'

function stubElementSize(width: number, height = 400) {
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
    configurable: true,
    get() {
      return width
    }
  })
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', {
    configurable: true,
    get() {
      return height
    }
  })
}

function paneBox(container: HTMLElement, index: number): HTMLElement {
  return container.querySelector(`[data-pane-index="${index}"]`) as HTMLElement
}

function gutter(container: HTMLElement, index = 0): HTMLElement {
  return container.querySelector(`[data-gutter-index="${index}"]`) as HTMLElement
}

function renderSplitter(props: Record<string, unknown> = {}, children?: React.ReactNode) {
  return render(
    <Splitter sizes={[400, 400]} {...props}>
      {children ?? (
        <>
          <div data-testid="pane-1">Pane 1</div>
          <div data-testid="pane-2">Pane 2</div>
        </>
      )}
    </Splitter>
  )
}

describe('Splitter', () => {
  beforeEach(() => {
    MockResizeObserver.reset()
    vi.stubGlobal('ResizeObserver', MockResizeObserver)
    stubElementSize(804, 400)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('Rendering', () => {
    it('renders a pane per child and a gutter between them', () => {
      const { container } = renderSplitter()
      expect(container.querySelectorAll('[data-pane-index]')).toHaveLength(2)
      expect(container.querySelectorAll('[role="separator"]')).toHaveLength(1)
      expect(container.firstElementChild).toHaveAttribute('data-direction', 'horizontal')
    })

    it('flattens fragments and ignores blank text when counting panes', () => {
      const { container } = render(
        <Splitter sizes={['50%', '50%']}>
          <>
            <div>One</div>
            <div>Two</div>
          </>
        </Splitter>
      )
      expect(container.querySelectorAll('[data-pane-index]')).toHaveLength(2)
      expect(container.querySelectorAll('[role="separator"]')).toHaveLength(1)
    })

    it('renders vertical direction', () => {
      const { container } = renderSplitter({ direction: 'vertical' })
      expect(container.firstElementChild).toHaveAttribute('data-direction', 'vertical')
    })
  })

  describe('Gutter', () => {
    it('is a vertical separator and a tab stop', () => {
      const { container } = renderSplitter()
      const bar = gutter(container)
      expect(bar).toHaveAttribute('role', 'separator')
      expect(bar).toHaveAttribute('aria-orientation', 'vertical')
      expect(bar).toHaveAttribute('tabindex', '0')
    })

    it('writes gutterSize to the visible thickness variable', () => {
      const { container } = renderSplitter({ gutterSize: 8 })
      const root = container.firstElementChild as HTMLElement
      expect(root.style.getPropertyValue('--tiger-splitter-gutter')).toBe('8px')
    })
  })

  describe('Controlled sizes', () => {
    it('does not reset a drag when rerendered with the same sizes literal', () => {
      const onResize = vi.fn()
      const { container, rerender } = render(
        <Splitter sizes={['50%', '50%']} onResize={onResize}>
          <div>A</div>
          <div>B</div>
        </Splitter>
      )
      fireEvent.keyDown(gutter(container), { key: 'ArrowRight' })
      const afterDrag = onResize.mock.calls.at(-1)?.[0].sizes as number[]
      expect(afterDrag[0]).toBeGreaterThan(400)

      rerender(
        <Splitter sizes={['50%', '50%']} onResize={onResize}>
          <div>A</div>
          <div>B</div>
        </Splitter>
      )
      expect(parseFloat(paneBox(container, 0).style.width)).toBeCloseTo(afterDrag[0], 0)
    })

    it('applies new size values on rerender', () => {
      const { container, rerender } = render(
        <Splitter sizes={[200, 600]}>
          <div>A</div>
          <div>B</div>
        </Splitter>
      )
      expect(parseFloat(paneBox(container, 0).style.width)).toBeCloseTo(200, 0)
      rerender(
        <Splitter sizes={[100, 700]}>
          <div>A</div>
          <div>B</div>
        </Splitter>
      )
      expect(parseFloat(paneBox(container, 0).style.width)).toBeCloseTo(100, 0)
    })

    it('keeps the last ratios after sizes is omitted', () => {
      const onResize = vi.fn()
      const { container, rerender } = render(
        <Splitter sizes={[200, 600]} onResize={onResize}>
          <div>A</div>
          <div>B</div>
        </Splitter>
      )
      fireEvent.keyDown(gutter(container), { key: 'ArrowRight' })
      const dragged = onResize.mock.calls.at(-1)?.[0].sizes as number[]
      rerender(
        <Splitter onResize={onResize}>
          <div>A</div>
          <div>B</div>
        </Splitter>
      )
      expect(parseFloat(paneBox(container, 0).style.width)).toBeCloseTo(dragged[0], 0)
    })
  })

  describe('Percentages follow the container', () => {
    it('resolves percentage sizes against the measured container', () => {
      const { container } = renderSplitter({ sizes: ['30%', '70%'] })
      expect(parseFloat(paneBox(container, 0).style.width)).toBeCloseTo(240, 0)
      expect(parseFloat(paneBox(container, 1).style.width)).toBeCloseTo(560, 0)
    })

    it('keeps the same ratios when the container is resized', async () => {
      const { container } = renderSplitter({ sizes: ['30%', '70%'] })
      await waitFor(() => expect(MockResizeObserver.instances.length).toBeGreaterThan(0))
      stubElementSize(1604, 400)
      act(() => {
        MockResizeObserver.instances[0].trigger(1604, 400)
      })
      await waitFor(() => {
        expect(parseFloat(paneBox(container, 0).style.width)).toBeCloseTo(480, 0)
      })
    })

    it('does not let independent min clamps overflow the container', () => {
      const { container } = renderSplitter({ sizes: ['50%', '50%'], min: 500 })
      const first = parseFloat(paneBox(container, 0).style.width)
      const second = parseFloat(paneBox(container, 1).style.width)
      expect(first + second).toBeCloseTo(800, 0)
      expect(first).toBeLessThan(500)
    })
  })

  describe('Keyboard and pointer', () => {
    it('grows the start pane on ArrowRight and emits resize-end', () => {
      const onResize = vi.fn()
      const onResizeEnd = vi.fn()
      const { container } = renderSplitter({ sizes: [400, 400], onResize, onResizeEnd })
      fireEvent.keyDown(gutter(container), { key: 'ArrowRight' })
      expect(onResize).toHaveBeenCalledWith(
        expect.objectContaining({
          sizes: [400 + RESIZE_KEYBOARD_STEP, 400 - RESIZE_KEYBOARD_STEP]
        })
      )
      expect(onResizeEnd).toHaveBeenCalled()
    })

    it('moves the gutter with the pointer in rtl', () => {
      const onResize = vi.fn()
      const { container } = renderSplitter({
        sizes: [400, 400],
        dir: 'rtl',
        onResize
      })
      const bar = gutter(container)
      fireEvent.pointerDown(bar, { clientX: 400, button: 0, pointerId: 1 })
      fireEvent.pointerMove(document, { clientX: 450, pointerId: 1 })
      expect(onResize).toHaveBeenCalled()
      const sizes = onResize.mock.calls.at(-1)?.[0].sizes as number[]
      expect(sizes[0]).toBeLessThan(400)
    })

    it('calls onResizeStart on pointerdown', () => {
      const onResizeStart = vi.fn()
      const { container } = renderSplitter({ sizes: [400, 400], onResizeStart })
      fireEvent.pointerDown(gutter(container), { clientX: 400, button: 0 })
      expect(onResizeStart).toHaveBeenCalledWith(
        expect.objectContaining({ index: 0, sizes: [400, 400] })
      )
    })
  })

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = renderSplitter({ className: 'my-splitter' })
      expect(container.firstElementChild).toHaveClass('my-splitter')
    })
  })

  describe('Accessibility', () => {
    it('names the gutter and exposes splitter values', async () => {
      const { container } = renderSplitter()
      const bar = gutter(container)
      expect(bar).toHaveAttribute('aria-label', 'Resize panes 1')
      expect(bar).toHaveAttribute('aria-valuenow', '50')
      expect(bar).toHaveAttribute('aria-controls', paneBox(container, 0).id)
      await expectNoA11yViolations(container)
    })

    it('uses official locale objects for the gutter name', () => {
      const { container, rerender } = render(
        <ConfigProvider locale={zhCN}>
          <Splitter sizes={[400, 400]}>
            <div>A</div>
            <div>B</div>
          </Splitter>
        </ConfigProvider>
      )
      expect(gutter(container)).toHaveAttribute('aria-label', '调整分栏 1')
      rerender(
        <ConfigProvider locale={zhTW}>
          <Splitter sizes={[400, 400]}>
            <div>A</div>
            <div>B</div>
          </Splitter>
        </ConfigProvider>
      )
      expect(gutter(container)).toHaveAttribute('aria-label', '調整分欄 1')
    })
  })

  describe('Parent writeback', () => {
    it('stays in sync when the parent writes sizes from onSizesChange', () => {
      function Host() {
        const [sizes, setSizes] = useState<(number | string)[]>([400, 400])
        return (
          <Splitter sizes={sizes} onSizesChange={setSizes}>
            <div>A</div>
            <div>B</div>
          </Splitter>
        )
      }
      const { container } = render(<Host />)
      fireEvent.keyDown(gutter(container), { key: 'ArrowRight' })
      expect(parseFloat(paneBox(container, 0).style.width)).toBe(410)
    })
  })
})
