/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import { Resizable } from '@expcat/tigercat-react/Resizable'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { expectNoA11yViolations } from '../utils/a11y-helpers'
import { RESIZE_KEYBOARD_STEP } from '@expcat/tigercat-core'

function renderResizable(props: Record<string, unknown> = {}) {
  return render(
    <Resizable defaultWidth={300} defaultHeight={200} {...props}>
      <div data-testid="content">Content</div>
    </Resizable>
  )
}

function handle(container: HTMLElement, pos: string): HTMLElement {
  return container.querySelector(`[data-handle="${pos}"]`) as HTMLElement
}

describe('Resizable', () => {
  describe('Rendering', () => {
    it('should render with content', () => {
      const { getByTestId } = renderResizable()
      expect(getByTestId('content')).toBeInTheDocument()
    })
    it('should apply default width and height', () => {
      const { container } = renderResizable()
      const root = container.firstElementChild as HTMLElement
      expect(root.style.width).toBe('300px')
      expect(root.style.height).toBe('200px')
    })
  })

  describe('Handles', () => {
    it('renders the requested handles and hides empty-axis edges', () => {
      const { container } = renderResizable({ axis: 'horizontal' })
      expect(handle(container, 'right')).toBeTruthy()
      expect(container.querySelector('[data-handle="bottom"]')).toBeNull()
      expect(handle(container, 'bottom-right')).toBeTruthy()
    })
  })

  describe('Disabled', () => {
    it('should not call onResizeStart when disabled', () => {
      const onResizeStart = vi.fn()
      const { container } = renderResizable({ disabled: true, onResizeStart })
      fireEvent.pointerDown(handle(container, 'right'), { clientX: 300, clientY: 100, button: 0 })
      expect(onResizeStart).not.toHaveBeenCalled()
    })
  })

  describe('Pointer interaction', () => {
    it('grows width from the right handle', () => {
      const onResize = vi.fn()
      const { container } = renderResizable({ onResize, handles: ['right'] })
      const grip = handle(container, 'right')
      fireEvent.pointerDown(grip, { clientX: 300, clientY: 100, button: 0, pointerId: 1 })
      fireEvent.pointerMove(document, { clientX: 350, clientY: 100, pointerId: 1 })
      expect(onResize).toHaveBeenCalled()
      expect(onResize.mock.calls.at(-1)?.[0].width).toBe(350)
      expect((container.firstElementChild as HTMLElement).style.width).toBe('350px')
    })

    it('moves the start edge when dragging the left handle', () => {
      const onResize = vi.fn()
      const { container } = renderResizable({ onResize, handles: ['left'] })
      fireEvent.pointerDown(handle(container, 'left'), {
        clientX: 0,
        clientY: 100,
        button: 0,
        pointerId: 1
      })
      fireEvent.pointerMove(document, { clientX: -40, clientY: 100, pointerId: 1 })
      expect(onResize.mock.calls.at(-1)?.[0].width).toBe(340)
      expect((container.firstElementChild as HTMLElement).style.transform).toBe(
        'translate(-40px, 0px)'
      )
    })
  })

  describe('Aspect ratio', () => {
    it('resizes both axes from the bottom handle when locked', () => {
      const onResize = vi.fn()
      const { container } = renderResizable({
        onResize,
        handles: ['bottom'],
        lockAspectRatio: true,
        defaultWidth: 200,
        defaultHeight: 100
      })
      fireEvent.keyDown(handle(container, 'bottom'), { key: 'ArrowDown' })
      const evt = onResize.mock.calls[0][0]
      expect(evt.height).toBe(100 + RESIZE_KEYBOARD_STEP)
      expect(evt.width).toBe((100 + RESIZE_KEYBOARD_STEP) * 2)
    })
  })

  describe('Keyboard resize', () => {
    it('exposes edge handles as named separators and keeps corners off the tab order', () => {
      const { container } = renderResizable()
      const right = handle(container, 'right')
      expect(right).toHaveAttribute('role', 'separator')
      expect(right).toHaveAttribute('tabindex', '0')
      expect(right).toHaveAttribute('aria-label', 'Resize right')
      const corner = handle(container, 'bottom-right')
      expect(corner).toHaveAttribute('aria-hidden', 'true')
      expect(corner).toHaveAttribute('tabindex', '-1')
    })

    it('grows width with ArrowRight on the right handle', () => {
      const onResize = vi.fn()
      const onResizeEnd = vi.fn()
      const { container } = renderResizable({ onResize, onResizeEnd })
      fireEvent.keyDown(handle(container, 'right'), { key: 'ArrowRight' })
      expect(onResize).toHaveBeenCalledWith(
        expect.objectContaining({ width: 310, handle: 'right' })
      )
      expect(onResizeEnd).toHaveBeenCalled()
    })

    it('shrinks width with ArrowRight on the end handle in rtl', () => {
      const onResize = vi.fn()
      const { container } = renderResizable({ onResize, dir: 'rtl', handles: ['right'] })
      fireEvent.keyDown(handle(container, 'right'), { key: 'ArrowRight' })
      expect(onResize.mock.calls[0][0].width).toBe(290)
    })

    it('does not resize via keyboard when disabled', () => {
      const onResize = vi.fn()
      const { container } = renderResizable({ disabled: true, onResize })
      expect(handle(container, 'right')).toHaveAttribute('tabindex', '-1')
      fireEvent.keyDown(handle(container, 'right'), { key: 'ArrowRight' })
      expect(onResize).not.toHaveBeenCalled()
    })
  })

  describe('Locale', () => {
    it('names handles from official locale objects', () => {
      const { container, rerender } = render(
        <ConfigProvider locale={zhCN}>
          <Resizable defaultWidth={300} defaultHeight={200} handles={['right']}>
            <div>Box</div>
          </Resizable>
        </ConfigProvider>
      )
      expect(handle(container, 'right')).toHaveAttribute('aria-label', '调整大小：right')
      rerender(
        <ConfigProvider locale={zhTW}>
          <Resizable defaultWidth={300} defaultHeight={200} handles={['right']}>
            <div>Box</div>
          </Resizable>
        </ConfigProvider>
      )
      expect(handle(container, 'right')).toHaveAttribute('aria-label', '調整大小：right')
    })
  })

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = renderResizable({ className: 'my-resizable' })
      expect(container.firstElementChild).toHaveClass('my-resizable')
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations with labeled handles', async () => {
      const { container } = renderResizable({ handles: ['right', 'bottom'] })
      await expectNoA11yViolations(container)
    })
  })
})
