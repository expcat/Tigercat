/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { h, ref } from 'vue'
import { ScrollArea } from '@expcat/tigercat-vue/ScrollArea'
import type { ScrollAreaInstance } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils'

type Dimensions = Partial<
  Record<'scrollHeight' | 'clientHeight' | 'scrollWidth' | 'clientWidth', number>
>

/** happy-dom reports every layout box as 0 — stub the metrics the state derives from. */
function stubViewport(viewport: HTMLElement, dimensions: Dimensions): void {
  for (const [key, value] of Object.entries(dimensions)) {
    Object.defineProperty(viewport, key, { configurable: true, value })
  }
}

function getViewport(container: HTMLElement): HTMLElement {
  return container.querySelector('[data-scroll-area-viewport]') as HTMLElement
}

/** Render with overflowing content, then let the component re-measure. */
async function renderOverflowing(
  props: Record<string, unknown> = {},
  dimensions: Dimensions = { scrollHeight: 400, clientHeight: 200 }
) {
  const utils = render(ScrollArea, {
    props,
    slots: { default: () => h('p', 'tall content') }
  })
  const viewport = getViewport(utils.container)
  stubViewport(viewport, { scrollWidth: 200, clientWidth: 200, ...dimensions })
  await fireEvent.scroll(viewport)
  return { ...utils, viewport }
}

describe('ScrollArea', () => {
  describe('Rendering', () => {
    it('renders slot content inside the scrolling viewport', () => {
      const { container, getByText } = render(ScrollArea, {
        slots: { default: () => h('p', 'panel body') }
      })
      expect(getViewport(container).contains(getByText('panel body'))).toBe(true)
    })

    it('applies the dimension props to the viewport', () => {
      const { container } = render(ScrollArea, {
        props: { maxHeight: 240, width: '100%' },
        slots: { default: () => h('p', 'body') }
      })
      const viewport = getViewport(container)
      expect(viewport.style.maxHeight).toBe('240px')
      expect(viewport.style.width).toBe('100%')
    })

    it('merges attrs class onto the root element', () => {
      const { container } = render(ScrollArea, {
        attrs: { class: 'custom-root' },
        slots: { default: () => h('p', 'body') }
      })
      expect(container.querySelector('[data-scroll-area]')?.className).toContain('custom-root')
    })
  })

  describe('Scrollbar visibility', () => {
    it('shows the vertical scrollbar once content overflows', async () => {
      const { container } = await renderOverflowing()
      expect(container.querySelector('[data-scroll-area-scrollbar="y"]')).not.toBeNull()
      expect(container.querySelector('[data-scroll-area-scrollbar="x"]')).toBeNull()
    })

    it('hides the scrollbar while the content fits', async () => {
      const { container } = await renderOverflowing({}, { scrollHeight: 200, clientHeight: 200 })
      expect(container.querySelector('[data-scroll-area-scrollbar="y"]')).toBeNull()
    })

    it('keeps the scrollbar mounted when scrollbar is always', async () => {
      const { container } = await renderOverflowing(
        { scrollbar: 'always' },
        { scrollHeight: 200, clientHeight: 200 }
      )
      expect(container.querySelector('[data-scroll-area-scrollbar="y"]')).not.toBeNull()
    })

    it('renders no scrollbar when scrollbar is hidden', async () => {
      const { container } = await renderOverflowing({ scrollbar: 'hidden' })
      expect(container.querySelector('[data-scroll-area-scrollbar="y"]')).toBeNull()
    })

    it('shows the horizontal scrollbar for a horizontal area', async () => {
      const { container } = await renderOverflowing(
        { direction: 'horizontal' },
        { scrollWidth: 800, clientWidth: 200, scrollHeight: 200, clientHeight: 200 }
      )
      expect(container.querySelector('[data-scroll-area-scrollbar="x"]')).not.toBeNull()
      expect(container.querySelector('[data-scroll-area-scrollbar="y"]')).toBeNull()
    })
  })

  describe('Scroll events', () => {
    it('emits scroll with the offset and derived state', async () => {
      const onScroll = vi.fn()
      const { viewport } = await renderOverflowing({ onScroll })
      viewport.scrollTop = 100
      await fireEvent.scroll(viewport)

      const detail = onScroll.mock.calls.at(-1)![0]
      expect(detail.scrollTop).toBe(100)
      expect(detail.state.y.progress).toBeCloseTo(0.5)
    })
  })

  describe('Scroll shadows', () => {
    it('renders only the bottom shadow at the top of the range', async () => {
      const { container } = await renderOverflowing({ shadow: true })
      expect(container.querySelector('[data-scroll-area-shadow="bottom"]')).not.toBeNull()
      expect(container.querySelector('[data-scroll-area-shadow="top"]')).toBeNull()
    })

    it('renders both shadows in the middle of the range', async () => {
      const { container, viewport } = await renderOverflowing({ shadow: true })
      viewport.scrollTop = 100
      await fireEvent.scroll(viewport)
      expect(container.querySelector('[data-scroll-area-shadow="top"]')).not.toBeNull()
      expect(container.querySelector('[data-scroll-area-shadow="bottom"]')).not.toBeNull()
    })

    it('renders no shadow when shadow is off', async () => {
      const { container } = await renderOverflowing()
      expect(container.querySelector('[data-scroll-area-shadow="bottom"]')).toBeNull()
    })
  })

  describe('Pointer interaction', () => {
    it('jumps to the clicked position on the track', async () => {
      const { container, viewport } = await renderOverflowing()
      const track = container.querySelector('[data-scroll-area-scrollbar="y"]') as HTMLElement
      // thumb is 100px tall, so a click at 150 centers it at the end of the track
      await fireEvent.pointerDown(track, { clientY: 150, button: 0 })
      expect(viewport.scrollTop).toBe(200)
    })

    it('scrolls while dragging the thumb', async () => {
      const { container, viewport } = await renderOverflowing()
      const thumb = container.querySelector('[data-scroll-area-thumb="y"]') as HTMLElement
      await fireEvent.pointerDown(thumb, { clientY: 0, button: 0 })
      await fireEvent.pointerMove(document, { clientY: 50 })
      // 50px of thumb travel over a 100px track maps onto half of the 200px scroll range
      expect(viewport.scrollTop).toBe(100)
      await fireEvent.pointerUp(document, { clientY: 50 })
    })

    it('stops scrolling after the drag ends', async () => {
      const { container, viewport } = await renderOverflowing()
      const thumb = container.querySelector('[data-scroll-area-thumb="y"]') as HTMLElement
      await fireEvent.pointerDown(thumb, { clientY: 0, button: 0 })
      await fireEvent.pointerUp(document, { clientY: 50 })
      await fireEvent.pointerMove(document, { clientY: 100 })
      expect(viewport.scrollTop).toBe(0)
    })
  })

  describe('Exposed methods', () => {
    /** Mount through a wrapper so `ref` resolves to the exposed instance. */
    function renderWithInstance(dimensions: Dimensions = { scrollHeight: 400, clientHeight: 200 }) {
      const instance = ref<ScrollAreaInstance>()
      const utils = render({
        setup() {
          return () => h(ScrollArea, { ref: instance }, { default: () => h('p', 'tall content') })
        }
      })
      const viewport = getViewport(utils.container)
      stubViewport(viewport, dimensions)
      return { ...utils, viewport, instance }
    }

    it('scrolls to an absolute offset and back to the top', () => {
      const { viewport, instance } = renderWithInstance()

      instance.value!.scrollTo({ top: 120 })
      expect(viewport.scrollTop).toBe(120)
      expect(instance.value!.getState().y.progress).toBeCloseTo(0.6)

      instance.value!.scrollToTop()
      expect(viewport.scrollTop).toBe(0)
    })

    it('scrolls to the bottom edge', () => {
      const { instance } = renderWithInstance()
      instance.value!.scrollToBottom()
      expect(instance.value!.getState().y.atEnd).toBe(true)
    })

    it('exposes the viewport element', () => {
      const { container, instance } = renderWithInstance()
      expect(instance.value!.getViewport()).toBe(getViewport(container))
    })
  })

  describe('Accessibility', () => {
    it('keeps the scrollable viewport keyboard reachable', () => {
      const { container } = render(ScrollArea, { slots: { default: () => h('p', 'body') } })
      expect(getViewport(container).getAttribute('tabindex')).toBe('0')
    })

    it('names the region when ariaLabel is provided', () => {
      const { getByRole } = render(ScrollArea, {
        props: { ariaLabel: 'Release notes' },
        slots: { default: () => h('p', 'body') }
      })
      expect(getByRole('region', { name: 'Release notes' })).toBeTruthy()
    })

    it('leaves the viewport unlabelled without ariaLabel', () => {
      const { container } = render(ScrollArea, { slots: { default: () => h('p', 'body') } })
      expect(getViewport(container).getAttribute('role')).toBeNull()
    })

    it('hides the decorative scrollbar from assistive tech', async () => {
      const { container } = await renderOverflowing()
      expect(
        container.querySelector('[data-scroll-area-scrollbar="y"]')?.getAttribute('aria-hidden')
      ).toBe('true')
    })

    it('has no accessibility violations', async () => {
      const { container } = await renderOverflowing({ ariaLabel: 'Log output', shadow: true })
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('Edge cases', () => {
    it('renders without a default slot', () => {
      const { container } = render(ScrollArea)
      expect(getViewport(container)).not.toBeNull()
    })

    it('survives unmount in the middle of a thumb drag', async () => {
      const { container, unmount } = await renderOverflowing()
      const thumb = container.querySelector('[data-scroll-area-thumb="y"]') as HTMLElement
      await fireEvent.pointerDown(thumb, { clientY: 0, button: 0 })
      expect(() => unmount()).not.toThrow()
      await fireEvent.pointerMove(document, { clientY: 50 })
    })

    it('tolerates a zero-sized viewport', async () => {
      const { container } = await renderOverflowing({}, { scrollHeight: 0, clientHeight: 0 })
      expect(container.querySelector('[data-scroll-area-scrollbar="y"]')).toBeNull()
    })
  })
})
