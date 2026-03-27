/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import { Resizable } from '@expcat/tigercat-react'

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

    it('should render default handles', () => {
      const { container } = renderResizable()
      const handles = container.querySelectorAll('[data-handle]')
      expect(handles).toHaveLength(3) // right, bottom, bottom-right
    })

    it('should render specific handles', () => {
      const { container } = renderResizable({
        handles: ['top', 'left']
      })
      const handles = container.querySelectorAll('[data-handle]')
      expect(handles).toHaveLength(2)
      expect(container.querySelector('[data-handle="top"]')).toBeTruthy()
      expect(container.querySelector('[data-handle="left"]')).toBeTruthy()
    })

    it('should apply default width and height', () => {
      const { container } = renderResizable()
      const root = container.firstElementChild as HTMLElement
      expect(root.style.width).toBe('300px')
      expect(root.style.height).toBe('200px')
    })

    it('should have relative positioning', () => {
      const { container } = renderResizable()
      const root = container.firstElementChild as HTMLElement
      expect(root.className).toContain('relative')
    })

    it('should have data-resizable attribute', () => {
      const { container } = renderResizable()
      const root = container.querySelector('[data-resizable]')
      expect(root).toBeTruthy()
    })
  })

  describe('Handles', () => {
    it('should show correct cursor for right handle', () => {
      const { container } = renderResizable({ handles: ['right'] })
      const handle = container.querySelector('[data-handle="right"]')
      expect(handle?.className).toContain('cursor-e-resize')
    })

    it('should show correct cursor for bottom handle', () => {
      const { container } = renderResizable({ handles: ['bottom'] })
      const handle = container.querySelector('[data-handle="bottom"]')
      expect(handle?.className).toContain('cursor-s-resize')
    })

    it('should show correct cursor for bottom-right handle', () => {
      const { container } = renderResizable({ handles: ['bottom-right'] })
      const handle = container.querySelector('[data-handle="bottom-right"]')
      expect(handle?.className).toContain('cursor-se-resize')
    })
  })

  describe('Disabled', () => {
    it('should add disabled classes to handles', () => {
      const { container } = renderResizable({ disabled: true })
      const handles = container.querySelectorAll('[data-handle]')
      handles.forEach((handle) => {
        expect(handle.className).toContain('pointer-events-none')
      })
    })

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

  describe('No dimensions', () => {
    it('should render without explicit dimensions', () => {
      const { container } = render(
        <Resizable>
          <div>Content</div>
        </Resizable>
      )
      const root = container.firstElementChild as HTMLElement
      expect(root.style.width).toBe('')
      expect(root.style.height).toBe('')
    })
  })
})
