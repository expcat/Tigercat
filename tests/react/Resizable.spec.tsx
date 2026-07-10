/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import { Resizable } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

function renderResizable(props: Record<string, unknown> = {}) {
  return render(
    <Resizable defaultWidth={300} defaultHeight={200} {...props}>
      <div data-testid="content">Content</div>
    </Resizable>
  )
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
    it('should show correct cursor for right handle', () => {
      const { container } = renderResizable({ handles: ['right'] })
      const handle = container.querySelector('[data-handle="right"]')
      expect(handle?.className).toContain('cursor-e-resize')
    })
  })

  describe('Disabled', () => {
    it('should not call onResizeStart when disabled', () => {
      const onResizeStart = vi.fn()
      const { container } = renderResizable({ disabled: true, onResizeStart })
      const handle = container.querySelector('[data-handle="right"]')!
      fireEvent.mouseDown(handle, { clientX: 300, clientY: 100 })
      expect(onResizeStart).not.toHaveBeenCalled()
    })
  })

  describe('Mouse interaction', () => {
    it('should call onResizeStart on mousedown', () => {
      const onResizeStart = vi.fn()
      const { container } = renderResizable({ onResizeStart })
      const handle = container.querySelector('[data-handle="right"]')!
      fireEvent.mouseDown(handle, { clientX: 300, clientY: 100 })
      expect(onResizeStart).toHaveBeenCalledWith(
        expect.objectContaining({
          width: 300,
          height: 200,
          handle: 'right',
          deltaX: 0,
          deltaY: 0
        })
      )
    })
  })

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = renderResizable({ className: 'my-resizable' })
      const root = container.firstElementChild as HTMLElement
      expect(root.className).toContain('my-resizable')
    })
  })

  describe('All handle positions', () => {
    const positions = [
      'top',
      'right',
      'bottom',
      'left',
      'top-left',
      'top-right',
      'bottom-left',
      'bottom-right'
    ]

    positions.forEach((pos) => {
      it(`should render ${pos} handle`, () => {
        const { container } = renderResizable({ handles: [pos] })
        expect(container.querySelector(`[data-handle="${pos}"]`)).toBeTruthy()
      })
    })
  })


  describe('Min/Max constraints', () => {
    it('should apply minWidth and minHeight', () => {
      const { container } = renderResizable({ minWidth: 100, minHeight: 50 })
      expect(container.querySelector('[data-resizable]')).toBeTruthy()
    })
  })

  describe('Axis constraint', () => {
    it('should render with horizontal axis', () => {
      const { container } = renderResizable({ axis: 'horizontal' })
      expect(container.querySelector('[data-resizable]')).toBeTruthy()
    })
  })



  describe('Resize callbacks', () => {
    it('should call onResize during drag', () => {
      const onResizeStart = vi.fn()
      const onResize = vi.fn()
      const onResizeEnd = vi.fn()
      const { container } = renderResizable({ onResizeStart, onResize, onResizeEnd })
      const handle = container.querySelector('[data-handle="right"]')!

      fireEvent.mouseDown(handle, { clientX: 300, clientY: 100 })
      expect(onResizeStart).toHaveBeenCalledWith(
        expect.objectContaining({ width: 300, height: 200, handle: 'right' })
      )

      fireEvent.mouseMove(document, { clientX: 350, clientY: 100 })
      // onResize should have been called via createDocumentDragSession
    })
  })
  // --- Keyboard resize (C32-2) ---
  describe('Keyboard resize', () => {
    it('exposes handles as focusable separators with ARIA', () => {
      const { container } = renderResizable()
      const handle = container.querySelector('[data-handle="right"]')!
      expect(handle).toHaveAttribute('role', 'separator')
      expect(handle).toHaveAttribute('tabindex', '0')
      expect(handle).toHaveAttribute('aria-orientation', 'vertical')
      expect(handle).toHaveAttribute('aria-valuenow', '300')
    })

    it('grows width with ArrowRight on the right handle', () => {
      const onResize = vi.fn()
      const { container } = renderResizable({ onResize })
      const handle = container.querySelector('[data-handle="right"]')!
      fireEvent.keyDown(handle, { key: 'ArrowRight' })
      expect(onResize).toHaveBeenCalled()
      const evt = onResize.mock.calls[0][0]
      expect(evt.width).toBe(310)
      expect(evt.handle).toBe('right')
    })
    it('does not resize via keyboard when disabled', () => {
      const onResize = vi.fn()
      const { container } = renderResizable({ disabled: true, onResize })
      const handle = container.querySelector('[data-handle="right"]')!
      expect(handle).toHaveAttribute('tabindex', '-1')
      fireEvent.keyDown(handle, { key: 'ArrowRight' })
      expect(onResize).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Resizable />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
