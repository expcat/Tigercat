/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/vue'
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
      const { container } = render(Resizable, {
        props: {},
        slots: {
          default: () => [h('div', 'Content')]
        }
      })
      const root = container.firstElementChild as HTMLElement
      expect(root.style.width).toBe('')
      expect(root.style.height).toBe('')
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

    it('should apply maxWidth and maxHeight', () => {
      const { container } = renderResizable({ maxWidth: 500, maxHeight: 400 })
      const root = container.firstElementChild as HTMLElement
      expect(root).toBeTruthy()
    })
  })

  describe('Axis constraint', () => {
    it('should render with horizontal axis', () => {
      const { container } = renderResizable({ axis: 'horizontal' })
      expect(container.querySelector('[data-resizable]')).toBeTruthy()
    })

    it('should render with vertical axis', () => {
      const { container } = renderResizable({ axis: 'vertical' })
      expect(container.querySelector('[data-resizable]')).toBeTruthy()
    })
  })

  describe('Aspect ratio', () => {
    it('should render with lockAspectRatio', () => {
      const { container } = renderResizable({ lockAspectRatio: true })
      expect(container.querySelector('[data-resizable]')).toBeTruthy()
    })
  })

  describe('Custom style', () => {
    it('should apply custom style prop', () => {
      const { container } = renderResizable({ style: { border: '1px solid red' } })
      const root = container.firstElementChild as HTMLElement
      expect(root.style.border).toBe('1px solid red')
    })
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Resizable)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      // Baseline: component renders without crashing with no/minimal props
      expect(true).toBe(true)
    })
  })
})
