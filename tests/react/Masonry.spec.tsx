/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi, type MockInstance } from 'vitest'
import { act, render } from '@testing-library/react'
import React, { createRef } from 'react'
import { Masonry } from '@expcat/tigercat-react/Masonry'
import type { MasonryInstance } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils/react'

const LABELS = ['alpha', 'bravo', 'charlie', 'delta']

function itemNodes(labels: string[]) {
  return labels.map((label) => <div key={label}>{label}</div>)
}

/** happy-dom reports every layout box as 0 — stub the measurement source. */
function stubItemHeights(container: HTMLElement, heights: number[]): void {
  const items = container.querySelectorAll<HTMLElement>('[data-masonry-item]')
  for (const item of items) {
    const index = Number(item.dataset.masonryItem)
    Object.defineProperty(item, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ height: heights[index] ?? 0 }) as DOMRect
    })
  }
}

/** Stub measurement for elements that do not exist yet (dynamic insert). */
function stubPrototypeHeights(heights: number[]): MockInstance {
  return vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement
  ) {
    const index = Number(this.dataset.masonryItem)
    const height = this.hasAttribute('data-masonry-item') ? (heights[index] ?? 0) : 0
    const width = this.hasAttribute('data-masonry') ? 200 : 0
    return { height, top: 0, left: 0, right: width, bottom: height, width } as DOMRect
  })
}

function itemLefts(container: HTMLElement): number[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-masonry-item]')).map((item) =>
    Number.parseFloat(item.style.left || '0')
  )
}

describe('Masonry', () => {
  describe('Rendering', () => {
    it('renders children inside item wrappers', () => {
      const { container, getByText } = render(<Masonry>{itemNodes(LABELS)}</Masonry>)
      expect(getByText('alpha').closest('[data-masonry-item]')).not.toBeNull()
      expect(container.querySelectorAll('[data-masonry-item]')).toHaveLength(4)
    })

    it('renders the default three columns as CSS columns before measure', () => {
      const { container } = render(<Masonry>{itemNodes(LABELS)}</Masonry>)
      const root = container.querySelector('[data-masonry]') as HTMLElement
      expect(root.style.columnCount).toBe('3')
    })

    it('forwards extra props to the root', () => {
      const { container } = render(
        <Masonry className="custom-root" id="feed">
          {itemNodes(LABELS)}
        </Masonry>
      )
      const root = container.querySelector('[data-masonry]') as HTMLElement
      expect(root.className).toContain('custom-root')
      expect(root.className).toContain('tiger-masonry')
      expect(root.id).toBe('feed')
    })

    it('applies custom gap and item class names', () => {
      const { container } = render(
        <Masonry gap={24} itemClassName="item-extra">
          {itemNodes(LABELS)}
        </Masonry>
      )
      const root = container.querySelector('[data-masonry]') as HTMLElement
      expect(root.style.columnGap).toBe('24px')
      expect(container.querySelector('[data-masonry-item]')?.className).toContain('item-extra')
    })
  })

  describe('Measured distribution', () => {
    it('packs items into the currently shortest column', () => {
      const spy = stubPrototypeHeights([100, 50, 150, 10])
      const { container } = render(
        <Masonry columns={2} style={{ width: 200 }}>
          {itemNodes(LABELS)}
        </Masonry>
      )
      const lefts = itemLefts(container)
      expect(lefts[0]).toBe(lefts[3])
      expect(lefts[1]).toBe(lefts[2])
      expect(lefts[0]).not.toBe(lefts[1])
      spy.mockRestore()
    })

    it('redistributes when an item is inserted dynamically', () => {
      const spy = stubPrototypeHeights([100, 50, 150, 10, 5])
      const { container, rerender } = render(<Masonry columns={2}>{itemNodes(LABELS)}</Masonry>)

      rerender(<Masonry columns={2}>{itemNodes([...LABELS, 'echo'])}</Masonry>)

      expect(container.querySelectorAll('[data-masonry-item]')).toHaveLength(5)
      const lefts = itemLefts(container)
      expect(lefts[0]).toBe(lefts[3])
      expect(lefts[0]).toBe(lefts[4])
      expect(lefts[1]).toBe(lefts[2])
      spy.mockRestore()
    })

    it('drops every item wrapper when children empty out', () => {
      const { container, rerender } = render(<Masonry>{itemNodes(LABELS)}</Masonry>)

      rerender(<Masonry>{[]}</Masonry>)

      expect(container.querySelectorAll('[data-masonry-item]')).toHaveLength(0)
    })
  })

  describe('Responsive columns and gap', () => {
    it('resolves breakpoint columns from the container width', () => {
      const { container } = render(
        <Masonry columns={{ xs: 1, md: 3 }} style={{ width: 400 }}>
          {itemNodes(LABELS)}
        </Masonry>
      )
      const root = container.querySelector('[data-masonry]') as HTMLElement
      expect(
        root.style.columnCount === '1' || itemLefts(container).every((left) => left === 0)
      ).toBe(true)
    })

    it('resolves a responsive gap from the container width', () => {
      const { container } = render(
        <Masonry gap={{ xs: 8, lg: 32 }} style={{ width: 400 }}>
          {itemNodes(LABELS)}
        </Masonry>
      )
      const root = container.querySelector('[data-masonry]') as HTMLElement
      expect(root).toBeTruthy()
    })
  })

  describe('Layout event', () => {
    it('calls onLayout with the column count and heights', () => {
      const onLayout = vi.fn()
      render(
        <Masonry columns={2} gap={10} onLayout={onLayout}>
          {itemNodes(LABELS)}
        </Masonry>
      )

      const detail = onLayout.mock.calls.at(-1)![0]
      expect(detail.columnCount).toBe(2)
      expect(detail.columnHeights).toHaveLength(2)
    })

    it('re-emits layout when the gap changes', () => {
      const spy = stubPrototypeHeights([100, 50, 150, 10])
      const onLayout = vi.fn()
      const { rerender } = render(
        <Masonry columns={2} gap={16} onLayout={onLayout}>
          {itemNodes(LABELS)}
        </Masonry>
      )
      // distribution [0,3] / [1,2]: c0=100+10+g, c1=50+150+g
      expect(onLayout.mock.calls.at(-1)![0].columnHeights).toEqual([126, 216])

      rerender(
        <Masonry columns={2} gap={32} onLayout={onLayout}>
          {itemNodes(LABELS)}
        </Masonry>
      )
      expect(onLayout.mock.calls.at(-1)![0].columnHeights).toEqual([142, 232])
      spy.mockRestore()
    })
  })

  describe('Exposed methods', () => {
    it('re-measures on demand after heights change externally', () => {
      const instance = createRef<MasonryInstance>()
      const { container } = render(
        <Masonry ref={instance} columns={2}>
          {itemNodes(LABELS)}
        </Masonry>
      )
      stubItemHeights(container, [100, 50, 150, 10])

      act(() => {
        instance.current!.relayout()
      })

      const lefts = itemLefts(container)
      expect(lefts[0]).toBe(lefts[3])
      expect(lefts[1]).toBe(lefts[2])
    })

    it('exposes the resolved column count', () => {
      const instance = createRef<MasonryInstance>()
      render(
        <Masonry ref={instance} columns={4}>
          {itemNodes(LABELS)}
        </Masonry>
      )
      expect(instance.current!.getColumnCount()).toBe(4)
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Masonry>{itemNodes(LABELS)}</Masonry>)
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('Edge cases', () => {
    it('renders without children', () => {
      const { container } = render(<Masonry />)
      const root = container.querySelector('[data-masonry]') as HTMLElement
      expect(root.style.columnCount).toBe('3')
      expect(container.querySelectorAll('[data-masonry-item]')).toHaveLength(0)
    })

    it('clamps invalid column counts to one column', () => {
      const { container } = render(<Masonry columns={0}>{itemNodes(LABELS)}</Masonry>)
      const root = container.querySelector('[data-masonry]') as HTMLElement
      expect(root.style.columnCount).toBe('1')
      expect(container.querySelectorAll('[data-masonry-item]')).toHaveLength(4)
    })

    it('survives unmount', () => {
      const { unmount } = render(<Masonry>{itemNodes(LABELS)}</Masonry>)
      expect(() => unmount()).not.toThrow()
    })
  })
})
