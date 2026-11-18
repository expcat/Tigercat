/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/vue'
import { h, ref, nextTick } from 'vue'
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
      expect(container.firstElementChild).toHaveAttribute('data-orientation', 'horizontal')
    })

    it('renders vertical direction', () => {
      const { container } = renderSplitter({ orientation: 'vertical' })
      expect(container.firstElementChild).toHaveAttribute('data-orientation', 'vertical')
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

    it('keeps the last ratios after sizes is omitted', async () => {
      const onResize = vi.fn()
      const sizes = ref<(number | string)[] | undefined>([200, 600])
      const { container } = render({
        setup() {
          return () =>
            h(
              Splitter,
              {
                sizes: sizes.value,
                onResize
              },
              () => [h('div', 'A'), h('div', 'B')]
            )
        }
      })
      await waitFor(() => {
        expect(parseFloat(paneBox(container, 0).style.width)).toBeCloseTo(200, 0)
      })
      await fireEvent.keyDown(gutter(container), { key: 'ArrowRight' })
      sizes.value = undefined
      await nextTick()
      expect(parseFloat(paneBox(container, 0).style.width)).toBeCloseTo(210, 0)
      expect(parseFloat(paneBox(container, 1).style.width)).toBeCloseTo(590, 0)
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

    it('keeps dragged percentages when sizes are not written back', async () => {
      const { container } = renderSplitter({ sizes: ['30%', '70%'] })
      await waitFor(() => {
        expect(parseFloat(paneBox(container, 0).style.width)).toBeCloseTo(240, 0)
      })
      await fireEvent.keyDown(gutter(container), { key: 'ArrowRight' })
      expect(parseFloat(paneBox(container, 0).style.width)).toBeCloseTo(250, 0)
      expect(parseFloat(paneBox(container, 1).style.width)).toBeCloseTo(550, 0)

      stubElementSize(1604, 400)
      MockResizeObserver.instances[0].trigger(1604, 400)
      await waitFor(() => {
        expect(parseFloat(paneBox(container, 0).style.width)).toBeCloseTo(500, 0)
        expect(parseFloat(paneBox(container, 1).style.width)).toBeCloseTo(1100, 0)
      })
    })
  })

  describe('Collapsible panes', () => {
    it('keeps the first uncontrolled pane collapsed and restores its size', async () => {
      const { container } = render(Splitter, {
        props: { collapsible: true },
        slots: { default: () => [h('div', 'A'), h('div', 'B')] }
      })
      await waitFor(() => {
        expect(parseFloat(paneBox(container, 0).style.width)).toBe(400)
      })
      const before = [0, 1].map((index) => parseFloat(paneBox(container, index).style.width))
      expect(before).toEqual([400, 400])
      const collapse = () =>
        container.querySelector('[data-tiger-splitter-collapse="0"]') as HTMLElement

      await fireEvent.click(collapse())
      expect(paneBox(container, 0)).toHaveAttribute('data-collapsed')
      expect(parseFloat(paneBox(container, 0).style.width)).toBe(0)
      expect(parseFloat(paneBox(container, 1).style.width)).toBe(800)
      expect(gutter(container)).toHaveAttribute('aria-valuenow', '0')

      await fireEvent.click(collapse())
      expect(paneBox(container, 0)).not.toHaveAttribute('data-collapsed')
      expect([0, 1].map((index) => parseFloat(paneBox(container, index).style.width))).toEqual(
        before
      )
    })

    it('keeps collapsed panes at zero when an uncontrolled pane is added', async () => {
      stubElementSize(608)
      const count = ref(2)
      const { container } = render({
        setup: () => () =>
          h(Splitter, { collapsible: true, min: 40 }, () =>
            Array.from({ length: count.value }, (_, index) =>
              h('div', { key: index }, `Pane ${index + 1}`)
            )
          )
      })
      const widths = () =>
        Array.from(container.querySelectorAll<HTMLElement>('[data-pane-index]'), (pane) =>
          parseFloat(pane.style.width)
        )
      const collapsed = () =>
        Array.from(container.querySelectorAll('[data-collapsed]'), (pane) =>
          pane.getAttribute('data-pane-index')
        )
      const collapse = (index: number) =>
        fireEvent.click(paneBox(container, index).querySelector('button') as HTMLElement)

      await nextTick()
      await collapse(0)
      expect(widths()).toEqual([0, 604])
      expect(collapsed()).toEqual(['0'])

      count.value = 3
      await nextTick()
      expect(widths()).toEqual([0, 300, 300])
      expect(collapsed()).toEqual(['0'])

      await collapse(1)
      expect(widths()).toEqual([0, 0, 600])
      expect(collapsed()).toEqual(['0', '1'])
    })

    it('restores an unspecified pane after collapse', async () => {
      const { container } = renderSplitter({ sizes: ['30%'], collapsible: true })
      await waitFor(() => {
        expect(parseFloat(paneBox(container, 1).style.width)).toBeCloseTo(560, 0)
      })
      const collapse = () =>
        container.querySelectorAll('[data-tiger-splitter-collapse]')[1] as HTMLElement
      await fireEvent.click(collapse())
      expect(parseFloat(paneBox(container, 1).style.width)).toBeCloseTo(0, 0)
      await fireEvent.click(collapse())
      expect(parseFloat(paneBox(container, 1).style.width)).toBeCloseTo(560, 0)
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
    it('writes percentage sizes back as percentages and refreshes pane labels', async () => {
      const sizes = ref<(number | string)[]>(['30%', '70%'])
      const { container } = render({
        setup() {
          return () =>
            h(
              Splitter,
              {
                sizes: sizes.value,
                'onUpdate:sizes': (next: (number | string)[]) => {
                  sizes.value = next
                }
              },
              () => [h('div', `左侧 ${sizes.value[0]}`), h('div', `右侧 ${sizes.value[1]}`)]
            )
        }
      })
      await waitFor(() => {
        expect(parseFloat(paneBox(container, 0).style.width)).toBeCloseTo(240, 0)
      })
      await fireEvent.keyDown(gutter(container), { key: 'ArrowRight' })
      expect(sizes.value).toEqual(['31.25%', '68.75%'])
      expect(container.textContent).toContain('左侧 31.25%')
      expect(container.textContent).toContain('右侧 68.75%')
      expect(parseFloat(paneBox(container, 0).style.width)).toBeCloseTo(250, 0)

      stubElementSize(1604, 400)
      MockResizeObserver.instances[0].trigger(1604, 400)
      await waitFor(() => {
        expect(parseFloat(paneBox(container, 0).style.width)).toBeCloseTo(500, 0)
      })
      expect(sizes.value).toEqual(['31.25%', '68.75%'])
    })

    it('updates the bound labels when the gutter is dragged', async () => {
      const sizes = ref<(number | string)[]>(['30%', '70%'])
      const { container } = render({
        setup() {
          return () =>
            h(
              Splitter,
              {
                sizes: sizes.value,
                'onUpdate:sizes': (next: (number | string)[]) => {
                  sizes.value = next
                }
              },
              () => [h('div', `左侧 ${sizes.value[0]}`), h('div', `右侧 ${sizes.value[1]}`)]
            )
        }
      })
      await waitFor(() => {
        expect(parseFloat(paneBox(container, 0).style.width)).toBeCloseTo(240, 0)
      })
      const bar = gutter(container)
      await fireEvent.pointerDown(bar, { clientX: 240, button: 0, pointerId: 1 })
      await fireEvent.pointerMove(document, { clientX: 400, pointerId: 1 })
      await fireEvent.pointerUp(document, { clientX: 400, pointerId: 1 })
      expect(sizes.value[0]).toBe('50%')
      expect(sizes.value[1]).toBe('50%')
      expect(container.textContent).toContain('左侧 50%')
      expect(container.textContent).not.toContain('左侧 30%')
    })

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
