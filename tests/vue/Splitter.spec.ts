/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/vue'
import { h, ref } from 'vue'
import { Splitter } from '@expcat/tigercat-vue/Splitter'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { expectNoA11yViolations } from '../utils'
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
    it('does not reset a drag when rerendered with the same sizes values', async () => {
      const onResize = vi.fn()
      const { container, rerender } = renderSplitter({
        sizes: ['50%', '50%'],
        onResize
      })
      await fireEvent.keyDown(gutter(container), { key: 'ArrowRight' })
      const afterDrag = onResize.mock.calls.at(-1)?.[0].sizes as number[]
      expect(afterDrag[0]).toBeGreaterThan(400)

      await rerender({ sizes: ['50%', '50%'], onResize })
      expect(parseFloat(paneBox(container, 0).style.width)).toBeCloseTo(afterDrag[0], 0)
    })

    it('applies new size values on rerender', async () => {
      const { container, rerender } = renderSplitter({ sizes: [200, 600] })
      await waitFor(() => {
        expect(parseFloat(paneBox(container, 0).style.width)).toBeCloseTo(200, 0)
      })
      await rerender({ sizes: [100, 700] })
      await waitFor(() => {
        expect(parseFloat(paneBox(container, 0).style.width)).toBeCloseTo(100, 0)
      })
    })
  })

  describe('Percentages follow the container', () => {
    it('resolves percentage sizes against the measured container', async () => {
      const { container } = renderSplitter({ sizes: ['30%', '70%'] })
      await waitFor(() => {
        expect(parseFloat(paneBox(container, 0).style.width)).toBeCloseTo(240, 0)
      })
    })

    it('keeps the same ratios when the container is resized', async () => {
      const { container } = renderSplitter({ sizes: ['30%', '70%'] })
      await waitFor(() => expect(MockResizeObserver.instances.length).toBeGreaterThan(0))
      stubElementSize(1604, 400)
      MockResizeObserver.instances[0].trigger(1604, 400)
      await waitFor(() => {
        expect(parseFloat(paneBox(container, 0).style.width)).toBeCloseTo(480, 0)
      })
    })
  })

  describe('Keyboard and pointer', () => {
    it('grows the start pane on ArrowRight and emits resize-end', async () => {
      const onResize = vi.fn()
      const onResizeEnd = vi.fn()
      const { container } = renderSplitter({
        sizes: [400, 400],
        onResize,
        'onResize-end': onResizeEnd
      })
      await fireEvent.keyDown(gutter(container), { key: 'ArrowRight' })
      expect(onResize).toHaveBeenCalledWith(
        expect.objectContaining({
          sizes: [400 + RESIZE_KEYBOARD_STEP, 400 - RESIZE_KEYBOARD_STEP]
        })
      )
      expect(onResizeEnd).toHaveBeenCalled()
    })

    it('moves the gutter with the pointer in rtl', async () => {
      const onResize = vi.fn()
      const { container } = render(Splitter, {
        props: {
          sizes: [400, 400],
          onResize
        },
        attrs: { dir: 'rtl' },
        slots: {
          default: () => [h('div', 'A'), h('div', 'B')]
        }
      })
      const bar = gutter(container)
      await fireEvent.pointerDown(bar, { clientX: 400, button: 0, pointerId: 1 })
      await fireEvent.pointerMove(document, { clientX: 450, pointerId: 1 })
      expect(onResize).toHaveBeenCalled()
      const sizes = onResize.mock.calls.at(-1)?.[0].sizes as number[]
      expect(sizes[0]).toBeLessThan(400)
    })

    it('emits resize-start on pointerdown', async () => {
      const onResizeStart = vi.fn()
      const { container } = renderSplitter({
        sizes: [400, 400],
        'onResize-start': onResizeStart
      })
      await fireEvent.pointerDown(gutter(container), { clientX: 400, button: 0 })
      expect(onResizeStart).toHaveBeenCalledWith(
        expect.objectContaining({ index: 0, sizes: [400, 400] })
      )
    })
  })

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = renderSplitter({ className: 'my-splitter' })
      expect(container.firstElementChild?.className).toContain('my-splitter')
    })
  })

  describe('Accessibility', () => {
    it('names the gutter and exposes splitter values', async () => {
      const { container } = renderSplitter()
      const bar = gutter(container)
      expect(bar).toHaveAttribute('aria-label', 'Resize panes 1')
      expect(bar).toHaveAttribute('aria-valuenow')
      expect(bar).toHaveAttribute('aria-controls', paneBox(container, 0).id)
      await expectNoA11yViolations(container)
    })

    it('uses official locale objects for the gutter name', () => {
      const view = render({
        setup() {
          return () =>
            h(ConfigProvider, { locale: zhCN }, () => [
              h(Splitter, { sizes: [400, 400] }, () => [h('div', 'A'), h('div', 'B')])
            ])
        }
      })
      expect(gutter(view.container)).toHaveAttribute('aria-label', '调整分栏 1')
      view.unmount()
      const tw = render({
        setup() {
          return () =>
            h(ConfigProvider, { locale: zhTW }, () => [
              h(Splitter, { sizes: [400, 400] }, () => [h('div', 'A'), h('div', 'B')])
            ])
        }
      })
      expect(gutter(tw.container)).toHaveAttribute('aria-label', '調整分欄 1')
    })
  })

  describe('v-model:sizes', () => {
    it('keeps dragging when the parent writes the emitted pixels back', async () => {
      const sizes = ref<(number | string)[]>([400, 400])
      const { container } = render({
        setup() {
          return () =>
            h(
              Splitter,
              {
                sizes: sizes.value,
                'onUpdate:sizes': (next: number[]) => {
                  sizes.value = next
                }
              },
              () => [h('div', 'A'), h('div', 'B')]
            )
        }
      })
      await fireEvent.keyDown(gutter(container), { key: 'ArrowRight' })
      expect(parseFloat(paneBox(container, 0).style.width)).toBe(410)
    })
  })
})
