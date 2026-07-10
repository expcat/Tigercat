/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { h } from 'vue'
import { Resizable } from '@expcat/tigercat-vue'
import { expectNoA11yViolationsIsolated } from '../utils'

function renderResizable(props: Record<string, unknown> = {}) {
  return render(Resizable, {
    props: {
      defaultWidth: 300,
      defaultHeight: 200,
      ...props
    },
    slots: {
      default: () => [h('div', { 'data-testid': 'content' }, 'Content')]
    }
  })
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


  describe('Mouse interaction', () => {
    it('should have mousedown handler on handles', () => {
      const { container } = renderResizable()
      const handle = container.querySelector('[data-handle="right"]')!
      // Handle is rendered and interactive
      expect(handle).toBeTruthy()
      expect(handle.className).toContain('cursor-e-resize')
    })

    it('should have non-interactive handles when disabled', () => {
      const { container } = renderResizable({ disabled: true })
      const handle = container.querySelector('[data-handle="right"]')!
      expect(handle.className).toContain('pointer-events-none')
    })
  })

  describe('Min/Max constraints', () => {
    it('should apply minWidth and minHeight', () => {
      const { container } = renderResizable({ minWidth: 100, minHeight: 50 })
      const root = container.firstElementChild as HTMLElement
      expect(root).toBeTruthy()
    })
  })

  describe('Axis constraint', () => {
    it('should render with horizontal axis', () => {
      const { container } = renderResizable({ axis: 'horizontal' })
      expect(container.querySelector('[data-resizable]')).toBeTruthy()
    })
  })


  // --- Keyboard resize (C32-2) ---
  describe('Keyboard resize', () => {
    it('exposes handles as focusable separators with ARIA', () => {
      const { container } = renderResizable()
      const handle = container.querySelector('[data-handle="right"]')!
      expect(handle.getAttribute('role')).toBe('separator')
      expect(handle.getAttribute('tabindex')).toBe('0')
      expect(handle.getAttribute('aria-orientation')).toBe('vertical')
      expect(handle.getAttribute('aria-valuenow')).toBe('300')
    })

    it('grows width with ArrowRight on the right handle', async () => {
      const { container, emitted } = renderResizable()
      const handle = container.querySelector('[data-handle="right"]')!
      await fireEvent.keyDown(handle, { key: 'ArrowRight' })
      const events = emitted().resize as unknown[][]
      expect(events).toBeTruthy()
      expect((events[0][0] as { width: number }).width).toBe(310)
    })
    it('does not resize via keyboard when disabled', async () => {
      const { container, emitted } = renderResizable({ disabled: true })
      const handle = container.querySelector('[data-handle="right"]')!
      expect(handle.getAttribute('tabindex')).toBe('-1')
      await fireEvent.keyDown(handle, { key: 'ArrowRight' })
      expect(emitted().resize).toBeUndefined()
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Resizable)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
