/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi, type MockInstance } from 'vitest'
import { render } from '@testing-library/vue'
import { h, nextTick, ref } from 'vue'
import { Masonry } from '@expcat/tigercat-vue/Masonry'
import type { MasonryInstance } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils'

const LABELS = ['alpha', 'bravo', 'charlie', 'delta']

function itemNodes(labels: string[]) {
  return labels.map((label) => h('div', { key: label }, label))
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
    return { height, top: 0, left: 0, right: 0, bottom: 0, width: 0 } as DOMRect
  })
}

function getColumns(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-masonry-column]'))
}

function columnItemIndexes(column: HTMLElement): number[] {
  return Array.from(column.querySelectorAll<HTMLElement>('[data-masonry-item]')).map((item) =>
    Number(item.dataset.masonryItem)
  )
}

function setWindowWidth(width: number): void {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width })
}

describe('Masonry', () => {
  describe('Rendering', () => {
    it('renders slot content inside item wrappers', () => {
      const { container, getByText } = render(Masonry, {
        slots: { default: () => itemNodes(LABELS) }
      })
      expect(getByText('alpha').closest('[data-masonry-item]')).not.toBeNull()
      expect(container.querySelectorAll('[data-masonry-item]')).toHaveLength(4)
    })

    it('renders the default three columns', () => {
      const { container } = render(Masonry, {
        slots: { default: () => itemNodes(LABELS) }
      })
      expect(getColumns(container)).toHaveLength(3)
    })

    it('applies the default gap and merges attrs class onto the root', () => {
      const { container } = render(Masonry, {
        attrs: { class: 'custom-root' },
        slots: { default: () => itemNodes(LABELS) }
      })
      const root = container.querySelector('[data-masonry]') as HTMLElement
      expect(root.style.gap).toBe('16px')
      expect(root.className).toContain('custom-root')
      expect(root.className).toContain('tiger-masonry')
    })

    it('applies custom gap, column and item class names', () => {
      const { container } = render(Masonry, {
        props: { gap: 24, columnClassName: 'col-extra', itemClassName: 'item-extra' },
        slots: { default: () => itemNodes(LABELS) }
      })
      const root = container.querySelector('[data-masonry]') as HTMLElement
      expect(root.style.gap).toBe('24px')
      const column = getColumns(container)[0]
      expect(column.className).toContain('col-extra')
      expect(column.style.rowGap).toBe('24px')
      expect(container.querySelector('[data-masonry-item]')?.className).toContain('item-extra')
    })
  })

  describe('Measured distribution', () => {
    it('packs items into the currently shortest column', async () => {
      const spy = stubPrototypeHeights([100, 50, 150, 10])
      const { container } = render(Masonry, {
        props: { columns: 2 },
        slots: { default: () => itemNodes(LABELS) }
      })
      await nextTick()
      const columns = getColumns(container)
      expect(columnItemIndexes(columns[0])).toEqual([0, 3])
      expect(columnItemIndexes(columns[1])).toEqual([1, 2])
      spy.mockRestore()
    })

    it('redistributes when an item is inserted dynamically', async () => {
      const spy = stubPrototypeHeights([100, 50, 150, 10, 5])
      const items = ref(['alpha', 'bravo', 'charlie', 'delta'])
      const { container } = render({
        setup() {
          return () =>
            h(
              Masonry,
              { columns: 2 },
              { default: () => items.value.map((label) => h('div', { key: label }, label)) }
            )
        }
      })

      items.value = [...items.value, 'echo']
      await nextTick()
      await nextTick()

      const columns = getColumns(container)
      expect(container.querySelectorAll('[data-masonry-item]')).toHaveLength(5)
      // heights [100,50,150,10,5] → 100→c0, 50→c1, 150→c1, 10→c0, 5→c0
      expect(columnItemIndexes(columns[0])).toEqual([0, 3, 4])
      expect(columnItemIndexes(columns[1])).toEqual([1, 2])
      spy.mockRestore()
    })

    it('drops every item wrapper when the slot empties', async () => {
      const items = ref([...LABELS])
      const { container } = render({
        setup() {
          return () =>
            h(
              Masonry,
              {},
              { default: () => items.value.map((label) => h('div', { key: label }, label)) }
            )
        }
      })

      items.value = []
      await nextTick()
      await nextTick()

      expect(container.querySelectorAll('[data-masonry-item]')).toHaveLength(0)
      expect(getColumns(container)).toHaveLength(3)
    })
  })

  describe('Responsive columns and gap', () => {
    it('resolves breakpoint columns on resize', async () => {
      setWindowWidth(500)
      const { container } = render(Masonry, {
        props: { columns: { xs: 1, md: 3 } },
        slots: { default: () => itemNodes(LABELS) }
      })
      expect(getColumns(container)).toHaveLength(1)

      setWindowWidth(900)
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      expect(getColumns(container)).toHaveLength(3)
    })

    it('resolves a responsive gap on resize', async () => {
      setWindowWidth(500)
      const { container } = render(Masonry, {
        props: { gap: { xs: 8, lg: 32 } },
        slots: { default: () => itemNodes(LABELS) }
      })
      const root = container.querySelector('[data-masonry]') as HTMLElement
      expect(root.style.gap).toBe('8px')

      setWindowWidth(1200)
      window.dispatchEvent(new Event('resize'))
      await nextTick()
      expect(root.style.gap).toBe('32px')
    })
  })

  describe('Layout event', () => {
    it('emits layout with the column count and heights', () => {
      const onLayout = vi.fn()
      render(Masonry, {
        props: { columns: 2, gap: 10, onLayout },
        slots: { default: () => itemNodes(LABELS) }
      })

      const detail = onLayout.mock.calls.at(-1)![0]
      expect(detail.columnCount).toBe(2)
      // unmeasured happy-dom heights are 0, so every item lands in column 0
      expect(detail.columnHeights).toEqual([30, 0])
    })

    it('re-emits layout when the gap changes', async () => {
      const spy = stubPrototypeHeights([100, 50, 150, 10])
      const onLayout = vi.fn()
      const { rerender } = render(Masonry, {
        props: { columns: 2, gap: 16, onLayout },
        slots: { default: () => itemNodes(LABELS) }
      })
      await nextTick()
      await nextTick()
      // distribution [0,3] / [1,2]: c0=100+10+g, c1=50+150+g
      expect(onLayout.mock.calls.at(-1)![0].columnHeights).toEqual([126, 216])

      rerender({ columns: 2, gap: 32, onLayout })
      await nextTick()
      expect(onLayout.mock.calls.at(-1)![0].columnHeights).toEqual([142, 232])
      spy.mockRestore()
    })
  })

  describe('Exposed methods', () => {
    /** Mount through a wrapper so `ref` resolves to the exposed instance. */
    function renderWithInstance(props: Record<string, unknown> = {}) {
      const instance = ref<MasonryInstance>()
      const utils = render({
        setup() {
          return () => h(Masonry, { ref: instance, ...props }, { default: () => itemNodes(LABELS) })
        }
      })
      return { ...utils, instance }
    }

    it('re-measures on demand after heights change externally', async () => {
      const { container, instance } = renderWithInstance({ columns: 2 })
      stubItemHeights(container, [100, 50, 150, 10])

      instance.value!.relayout()
      await nextTick()

      const columns = getColumns(container)
      expect(columnItemIndexes(columns[0])).toEqual([0, 3])
      expect(columnItemIndexes(columns[1])).toEqual([1, 2])
    })

    it('exposes the resolved column count', () => {
      const { instance } = renderWithInstance({ columns: 4 })
      expect(instance.value!.getColumnCount()).toBe(4)
    })
  })

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(Masonry, {
        slots: { default: () => itemNodes(LABELS) }
      })
      await expectNoA11yViolationsIsolated(container)
    })
  })

  describe('Edge cases', () => {
    it('renders without a default slot', () => {
      const { container } = render(Masonry)
      expect(getColumns(container)).toHaveLength(3)
      expect(container.querySelectorAll('[data-masonry-item]')).toHaveLength(0)
    })

    it('clamps invalid column counts to one column', () => {
      const { container } = render(Masonry, {
        props: { columns: 0 },
        slots: { default: () => itemNodes(LABELS) }
      })
      expect(getColumns(container)).toHaveLength(1)
      expect(container.querySelectorAll('[data-masonry-item]')).toHaveLength(4)
    })

    it('survives unmount', () => {
      const { unmount } = render(Masonry, {
        slots: { default: () => itemNodes(LABELS) }
      })
      expect(() => unmount()).not.toThrow()
    })
  })
})
