/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { h } from 'vue'
import { Splitter } from '@expcat/tigercat-vue'
import { expectNoA11yViolationsIsolated } from '../utils'

function renderSplitter(props: Record<string, unknown> = {}) {
  return render(Splitter, {
    props: {
      sizes: [400, 400],
      ...props
    },
    slots: {
      default: () => [
        h('div', { 'data-testid': 'pane-1' }, 'Pane 1'),
        h('div', { 'data-testid': 'pane-2' }, 'Pane 2')
      ]
    }
  })
}

describe('Splitter', () => {
  describe('Rendering', () => {
    it('should render with two panes', () => {
      const { container } = renderSplitter()
      const panes = container.querySelectorAll('.tiger-splitter-pane')
      expect(panes).toHaveLength(2)
    })

    it('should render gutter between panes', () => {
      const { container } = renderSplitter()
      const gutters = container.querySelectorAll('[role="separator"]')
      expect(gutters).toHaveLength(1)
    })

    it('should render horizontal direction by default', () => {
      const { container } = renderSplitter()
      const root = container.firstElementChild as HTMLElement
      expect(root.getAttribute('data-direction')).toBe('horizontal')
      expect(root.className).toContain('flex-row')
    })

    it('should render vertical direction', () => {
      const { container } = renderSplitter({ direction: 'vertical' })
      const root = container.firstElementChild as HTMLElement
      expect(root.getAttribute('data-direction')).toBe('vertical')
      expect(root.className).toContain('flex-col')
    })
  })

  describe('Gutter', () => {
    it('should have separator role', () => {
      const { container } = renderSplitter()
      const gutter = container.querySelector('[role="separator"]')
      expect(gutter).toBeTruthy()
    })

    it('should have correct aria-orientation for horizontal', () => {
      const { container } = renderSplitter()
      const gutter = container.querySelector('[role="separator"]')
      expect(gutter?.getAttribute('aria-orientation')).toBe('vertical')
    })
    it('should be focusable when not disabled', () => {
      const { container } = renderSplitter()
      const gutter = container.querySelector('[role="separator"]')
      expect(gutter?.getAttribute('tabindex')).toBe('0')
    })
  })


  describe('Keyboard interaction', () => {
    it('should resize on ArrowRight key in horizontal mode', async () => {
      const onResize = vi.fn()
      const { container } = renderSplitter({
        sizes: [400, 400],
        onResize: onResize
      })
      const gutter = container.querySelector('[role="separator"]')!
      await fireEvent.keyDown(gutter, { key: 'ArrowRight' })
      expect(onResize).toHaveBeenCalledWith(expect.objectContaining({ sizes: expect.any(Array) }))
    })
  })

  describe('Mouse interaction', () => {
    it('should emit resize-start on mousedown', async () => {
      const onResizeStart = vi.fn()
      const { container } = renderSplitter({
        sizes: [400, 400],
        'onResize-start': onResizeStart
      })
      const gutter = container.querySelector('[role="separator"]')!
      await fireEvent.mouseDown(gutter, { clientX: 400 })
      expect(onResizeStart).toHaveBeenCalledWith(
        expect.objectContaining({ index: 0, sizes: [400, 400] })
      )
    })
  })

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = renderSplitter({ className: 'my-splitter' })
      const root = container.firstElementChild as HTMLElement
      expect(root.className).toContain('my-splitter')
    })
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Splitter)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Dragging state', () => {
    it('should apply dragging highlight class to the active gutter on mousedown', async () => {
      const { container } = renderSplitter({ sizes: [400, 400] })
      const gutter = container.querySelector('[role="separator"]') as HTMLElement
      const draggingClass = 'bg-[var(--tiger-primary,#2563eb)]'
      expect(gutter.classList.contains(draggingClass)).toBe(false)
      await fireEvent.mouseDown(gutter, { clientX: 400 })
      expect(gutter.classList.contains(draggingClass)).toBe(true)
    })
  })
})
