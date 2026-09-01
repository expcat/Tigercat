/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, act } from '@testing-library/react'
import React from 'react'
import { ScrollArea } from '@expcat/tigercat-react/ScrollArea'
import type { ScrollAreaInstance } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils/react'

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
function renderOverflowing(
  props: React.ComponentProps<typeof ScrollArea> = {},
  dimensions: Dimensions = { scrollHeight: 400, clientHeight: 200 }
) {
  const utils = render(
    <ScrollArea {...props}>
      <p>tall content</p>
    </ScrollArea>
  )
  const viewport = getViewport(utils.container)
  stubViewport(viewport, { scrollWidth: 200, clientWidth: 200, ...dimensions })
  fireEvent.scroll(viewport)
  return { ...utils, viewport }
}

describe('ScrollArea', () => {
  describe('Rendering', () => {
    it('renders children inside the scrolling viewport', () => {
      const { container, getByText } = render(
        <ScrollArea>
          <p>panel body</p>
        </ScrollArea>
      )
      expect(getViewport(container).contains(getByText('panel body'))).toBe(true)
    })

    it('applies the dimension props to the overflowing viewport', () => {
      const { container } = render(
        <ScrollArea maxHeight={240} width="100%">
          <p>body</p>
        </ScrollArea>
      )
      const viewport = getViewport(container)
      expect(viewport.style.maxHeight).toBe('240px')
      expect(viewport.style.width).toBe('100%')
    })

    it('forwards extra props to the root element', () => {
      const { container } = render(
        <ScrollArea className="custom-root" id="log-panel">
          <p>body</p>
        </ScrollArea>
      )
      const root = container.querySelector('[data-scroll-area]') as HTMLElement
      expect(root.className).toContain('custom-root')
      expect(getViewport(container).className).not.toContain('custom-root')
      expect(root.id).toBe('log-panel')
    })
  })

  describe('Scrollbar visibility', () => {
    it('shows the vertical scrollbar once content overflows', () => {
      const { container } = renderOverflowing()
      expect(container.querySelector('[data-scroll-area-scrollbar="y"]')).not.toBeNull()
      expect(container.querySelector('[data-scroll-area-scrollbar="x"]')).toBeNull()
    })

    it('hides the scrollbar while the content fits', () => {
      const { container } = renderOverflowing({}, { scrollHeight: 200, clientHeight: 200 })
      expect(container.querySelector('[data-scroll-area-scrollbar="y"]')).toBeNull()
    })

    it('keeps the scrollbar mounted when scrollbar is always', () => {
      const { container } = renderOverflowing(
        { scrollbar: 'always' },
        { scrollHeight: 200, clientHeight: 200 }
      )
      expect(container.querySelector('[data-scroll-area-scrollbar="y"]')).not.toBeNull()
    })

    it('renders no scrollbar when scrollbar is hidden', () => {
      const { container } = renderOverflowing({ scrollbar: 'hidden' })
      expect(container.querySelector('[data-scroll-area-scrollbar="y"]')).toBeNull()
    })

    it('shows the horizontal scrollbar for a horizontal area', () => {
      const { container } = renderOverflowing(
        { direction: 'horizontal' },
        { scrollWidth: 800, clientWidth: 200, scrollHeight: 200, clientHeight: 200 }
      )
      expect(container.querySelector('[data-scroll-area-scrollbar="x"]')).not.toBeNull()
      expect(container.querySelector('[data-scroll-area-scrollbar="y"]')).toBeNull()
    })
  })

  describe('Scroll events', () => {
    it('calls onScroll with the offset and derived state', () => {
      const onScroll = vi.fn()
      const { viewport } = renderOverflowing({ onScroll })
      viewport.scrollTop = 100
      fireEvent.scroll(viewport)

      const detail = onScroll.mock.calls.at(-1)![0]
      expect(detail.scrollTop).toBe(100)
      expect(detail.state.y.progress).toBeCloseTo(0.5)
    })
  })

  describe('Scroll shadows', () => {
    it('renders only the bottom shadow at the top of the range', () => {
      const { container } = renderOverflowing({ shadow: true })
      expect(container.querySelector('[data-scroll-area-shadow="bottom"]')).not.toBeNull()
      expect(container.querySelector('[data-scroll-area-shadow="top"]')).toBeNull()
    })

    it('renders both shadows in the middle of the range', () => {
      const { container, viewport } = renderOverflowing({ shadow: true })
      viewport.scrollTop = 100
      fireEvent.scroll(viewport)
      expect(container.querySelector('[data-scroll-area-shadow="top"]')).not.toBeNull()
      expect(container.querySelector('[data-scroll-area-shadow="bottom"]')).not.toBeNull()
    })

    it('renders no shadow when shadow is off', () => {
      const { container } = renderOverflowing()
      expect(container.querySelector('[data-scroll-area-shadow="bottom"]')).toBeNull()
    })
  })

  describe('Pointer interaction', () => {
    it('jumps to the clicked position on the track', () => {
      const { container, viewport } = renderOverflowing()
      const track = container.querySelector('[data-scroll-area-scrollbar="y"]') as HTMLElement
      // thumb is 100px tall, so a click at 150 centers it at the end of the track
      fireEvent.pointerDown(track, { clientY: 150, button: 0 })
      expect(viewport.scrollTop).toBe(200)
    })

    it('scrolls while dragging the thumb', () => {
      const { container, viewport } = renderOverflowing()
      const thumb = container.querySelector('[data-scroll-area-thumb="y"]') as HTMLElement
      fireEvent.pointerDown(thumb, { clientY: 0, button: 0 })
      act(() => {
        fireEvent.pointerMove(document, { clientY: 50 })
      })
      // 50px of thumb travel over a 100px track maps onto half of the 200px scroll range
      expect(viewport.scrollTop).toBe(100)
      act(() => {
        fireEvent.pointerUp(document, { clientY: 50 })
      })
    })

    it('stops scrolling after the drag ends', () => {
      const { container, viewport } = renderOverflowing()
      const thumb = container.querySelector('[data-scroll-area-thumb="y"]') as HTMLElement
      fireEvent.pointerDown(thumb, { clientY: 0, button: 0 })
      act(() => {
        fireEvent.pointerUp(document, { clientY: 50 })
      })
      act(() => {
        fireEvent.pointerMove(document, { clientY: 100 })
      })
      expect(viewport.scrollTop).toBe(0)
    })
  })

  describe('Exposed methods', () => {
    function renderWithInstance(dimensions: Dimensions = { scrollHeight: 400, clientHeight: 200 }) {
      const instance = React.createRef<ScrollAreaInstance>()
      const utils = render(
        <ScrollArea ref={instance}>
          <p>tall content</p>
        </ScrollArea>
      )
      const viewport = getViewport(utils.container)
      stubViewport(viewport, dimensions)
      return { ...utils, viewport, instance }
    }

    it('scrolls to an absolute offset and back to the top', () => {
      const { viewport, instance } = renderWithInstance()

      act(() => instance.current!.scrollTo({ top: 120 }))
      expect(viewport.scrollTop).toBe(120)
      expect(instance.current!.getState().y.progress).toBeCloseTo(0.6)

      act(() => instance.current!.scrollToTop())
      expect(viewport.scrollTop).toBe(0)
    })

    it('scrolls to the bottom edge', () => {
      const { instance } = renderWithInstance()
      act(() => instance.current!.scrollToBottom())
      expect(instance.current!.getState().y.atEnd).toBe(true)
    })

    it('exposes the viewport element', () => {
      const { container, instance } = renderWithInstance()
      expect(instance.current!.getViewport()).toBe(getViewport(container))
    })
  })

  describe('Accessibility', () => {
    it('does not put a non-overflowing viewport on the tab order', () => {
      const { container } = render(
        <ScrollArea>
          <p>body</p>
        </ScrollArea>
      )
      expect(getViewport(container).getAttribute('tabindex')).toBeNull()
    })

    it('names the region when ariaLabel is provided', () => {
      const { getByRole } = render(
        <ScrollArea ariaLabel="Release notes">
          <p>body</p>
        </ScrollArea>
      )
      expect(getByRole('region', { name: 'Release notes' })).toBeTruthy()
    })

    it('leaves the viewport unlabelled without ariaLabel', () => {
      const { container } = render(
        <ScrollArea>
          <p>body</p>
        </ScrollArea>
      )
      expect(getViewport(container).getAttribute('role')).toBeNull()
    })

    it('hides the decorative scrollbar from assistive tech', () => {
      const { container } = renderOverflowing()
      expect(
        container.querySelector('[data-scroll-area-scrollbar="y"]')?.getAttribute('aria-hidden')
      ).toBe('true')
    })

    it('has no accessibility violations', async () => {
      const { container } = renderOverflowing({ ariaLabel: 'Log output', shadow: true })
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('Edge cases', () => {
    it('renders without children', () => {
      const { container } = render(<ScrollArea />)
      expect(getViewport(container)).not.toBeNull()
    })

    it('survives unmount in the middle of a thumb drag', () => {
      const { container, unmount } = renderOverflowing()
      const thumb = container.querySelector('[data-scroll-area-thumb="y"]') as HTMLElement
      fireEvent.pointerDown(thumb, { clientY: 0, button: 0 })
      expect(() => unmount()).not.toThrow()
      fireEvent.pointerMove(document, { clientY: 50 })
    })

    it('tolerates a zero-sized viewport', () => {
      const { container } = renderOverflowing({}, { scrollHeight: 0, clientHeight: 0 })
      expect(container.querySelector('[data-scroll-area-scrollbar="y"]')).toBeNull()
    })
  })
})
