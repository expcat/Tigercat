/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { h } from 'vue'
import { Splitter } from '@expcat/tigercat-vue'

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

    it('should render three panes with two gutters', () => {
      const { container } = render(Splitter, {
        props: { sizes: [200, 200, 200] },
        slots: {
          default: () => [h('div', 'Pane A'), h('div', 'Pane B'), h('div', 'Pane C')]
        }
      })
      const panes = container.querySelectorAll('.tiger-splitter-pane')
      const gutters = container.querySelectorAll('[role="separator"]')
      expect(panes).toHaveLength(3)
      expect(gutters).toHaveLength(2)
    })

    it('should apply pane sizes as width in horizontal mode', () => {
      const { container } = renderSplitter({ sizes: [300, 500] })
      const panes = container.querySelectorAll('.tiger-splitter-pane')
      expect((panes[0] as HTMLElement).style.width).toBe('300px')
      expect((panes[1] as HTMLElement).style.width).toBe('500px')
    })

    it('should apply pane sizes as height in vertical mode', () => {
      const { container } = renderSplitter({
        direction: 'vertical',
        sizes: [200, 300]
      })
      const panes = container.querySelectorAll('.tiger-splitter-pane')
      expect((panes[0] as HTMLElement).style.height).toBe('200px')
      expect((panes[1] as HTMLElement).style.height).toBe('300px')
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

    it('should have correct aria-orientation for vertical', () => {
      const { container } = renderSplitter({ direction: 'vertical' })
      const gutter = container.querySelector('[role="separator"]')
      expect(gutter?.getAttribute('aria-orientation')).toBe('horizontal')
    })

    it('should be focusable when not disabled', () => {
      const { container } = renderSplitter()
      const gutter = container.querySelector('[role="separator"]')
      expect(gutter?.getAttribute('tabindex')).toBe('0')
    })

    it('should not be focusable when disabled', () => {
      const { container } = renderSplitter({ disabled: true })
      const gutter = container.querySelector('[role="separator"]')
      expect(gutter?.getAttribute('tabindex')).toBe('-1')
    })

    it('should show cursor-col-resize for horizontal', () => {
      const { container } = renderSplitter()
      const gutter = container.querySelector('[role="separator"]')
      expect(gutter?.className).toContain('cursor-col-resize')
    })

    it('should show cursor-row-resize for vertical', () => {
      const { container } = renderSplitter({ direction: 'vertical' })
      const gutter = container.querySelector('[role="separator"]')
      expect(gutter?.className).toContain('cursor-row-resize')
    })
  })

  describe('Disabled state', () => {
    it('should add disabled classes to gutter', () => {
      const { container } = renderSplitter({ disabled: true })
      const gutter = container.querySelector('[role="separator"]')
      expect(gutter?.className).toContain('pointer-events-none')
      expect(gutter?.className).toContain('opacity-50')
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

    it('should resize on ArrowLeft key in horizontal mode', async () => {
      const onResize = vi.fn()
      const { container } = renderSplitter({
        sizes: [400, 400],
        onResize: onResize
      })
      const gutter = container.querySelector('[role="separator"]')!
      await fireEvent.keyDown(gutter, { key: 'ArrowLeft' })
      expect(onResize).toHaveBeenCalled()
    })

    it('should resize on ArrowDown key in vertical mode', async () => {
      const onResize = vi.fn()
      const { container } = renderSplitter({
        direction: 'vertical',
        sizes: [400, 400],
        onResize: onResize
      })
      const gutter = container.querySelector('[role="separator"]')!
      await fireEvent.keyDown(gutter, { key: 'ArrowDown' })
      expect(onResize).toHaveBeenCalled()
    })

    it('should not resize on irrelevant keys', async () => {
      const onResize = vi.fn()
      const { container } = renderSplitter({
        sizes: [400, 400],
        onResize: onResize
      })
      const gutter = container.querySelector('[role="separator"]')!
      await fireEvent.keyDown(gutter, { key: 'Enter' })
      expect(onResize).not.toHaveBeenCalled()
    })

    it('should not resize when disabled', async () => {
      const onResize = vi.fn()
      const { container } = renderSplitter({
        disabled: true,
        sizes: [400, 400],
        onResize: onResize
      })
      const gutter = container.querySelector('[role="separator"]')!
      await fireEvent.keyDown(gutter, { key: 'ArrowRight' })
      expect(onResize).not.toHaveBeenCalled()
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

    it('should not emit resize-start when disabled', async () => {
      const onResizeStart = vi.fn()
      const { container } = renderSplitter({
        disabled: true,
        sizes: [400, 400],
        'onResize-start': onResizeStart
      })
      const gutter = container.querySelector('[role="separator"]')!
      await fireEvent.mouseDown(gutter, { clientX: 400 })
      expect(onResizeStart).not.toHaveBeenCalled()
    })
  })

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = renderSplitter({ className: 'my-splitter' })
      const root = container.firstElementChild as HTMLElement
      expect(root.className).toContain('my-splitter')
    })
  })
})
