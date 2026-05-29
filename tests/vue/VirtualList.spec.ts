/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { VirtualList } from '@expcat/tigercat-vue'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

describe('VirtualList', () => {
  const defaultProps = {
    itemCount: 1000,
    itemHeight: 40,
    height: 400
  }

  // --- Basic rendering ---
  it('renders with default props', () => {
    const { container } = renderWithProps(VirtualList, defaultProps)
    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('renders scrollable container with correct height', () => {
    const { container } = renderWithProps(VirtualList, defaultProps)
    const outer = container.firstElementChild as HTMLElement
    expect(outer.style.height).toBe('400px')
  })

  it('renders inner spacer with total height', () => {
    const { container } = renderWithProps(VirtualList, defaultProps)
    // Structure: outer > inner (totalHeight) > absolute positioned container
    const outer = container.firstElementChild as HTMLElement
    const inner = outer.firstElementChild as HTMLElement
    // 1000 items * 40px = 40000px
    expect(inner.style.height).toBe('40000px')
  })

  it('applies className prop', () => {
    const { container } = renderWithProps(VirtualList, { ...defaultProps, className: 'my-vl' })
    expect(container.querySelector('.my-vl')).toBeInTheDocument()
  })

  // --- Visible items ---
  it('renders only visible items (+ overscan)', () => {
    const { container } = render(VirtualList, {
      props: defaultProps,
      slots: {
        default: ({ index }: { index: number }) => `Item ${index}`
      }
    })
    // Items are wrapped in divs inside the absolute-positioned container
    const outer = container.firstElementChild as HTMLElement
    const inner = outer.firstElementChild as HTMLElement
    const itemContainer = inner.firstElementChild as HTMLElement
    const items = itemContainer.children
    // 400px / 40px = 10 visible, + 5 overscan = ~15
    expect(items.length).toBeGreaterThanOrEqual(10)
    expect(items.length).toBeLessThanOrEqual(25)
  })

  // --- Custom overscan ---
  it('respects overscan prop', () => {
    const { container } = render(VirtualList, {
      props: { ...defaultProps, overscan: 5 },
      slots: {
        default: ({ index }: { index: number }) => `Item ${index}`
      }
    })
    const outer = container.firstElementChild as HTMLElement
    const inner = outer.firstElementChild as HTMLElement
    const itemContainer = inner.firstElementChild as HTMLElement
    const items = itemContainer.children
    expect(items.length).toBeGreaterThanOrEqual(10)
  })

  // --- Scroll event ---
  it('emits scroll event on scroll', async () => {
    const onScroll = vi.fn()
    const { container } = render(VirtualList, {
      props: { ...defaultProps, onScroll }
    })
    const outer = container.firstElementChild as HTMLElement
    await fireEvent.scroll(outer)
    expect(onScroll).toHaveBeenCalled()
  })

  // --- Variable size via getItemHeight ---
  it('renders variable-height items via getItemHeight prop', () => {
    const getItemHeight = (index: number) => (index % 2 === 0 ? 30 : 60)
    const { container } = renderWithProps(VirtualList, {
      itemCount: 100,
      getItemHeight,
      height: 400,
      overscan: 2
    })
    const outer = container.firstElementChild as HTMLElement
    const inner = outer.firstElementChild as HTMLElement
    // total: 50*30 + 50*60 = 4500
    expect(inner.style.height).toBe('4500px')

    const itemContainer = inner.firstElementChild as HTMLElement
    const firstItem = itemContainer.firstElementChild as HTMLElement
    expect(firstItem.style.height).toBe('30px')
  })

  // --- Custom sizeStrategy ---
  it('uses custom sizeStrategy prop', () => {
    const customStrategy = {
      getRange: () => ({ startIndex: 0, endIndex: 2, offsetTop: 0, totalHeight: 300 }),
      getItemHeight: () => 100,
      getItemOffset: (i: number) => i * 100
    }
    const { container } = renderWithProps(VirtualList, {
      itemCount: 3,
      sizeStrategy: customStrategy,
      height: 200
    })
    const outer = container.firstElementChild as HTMLElement
    const inner = outer.firstElementChild as HTMLElement
    expect(inner.style.height).toBe('300px')
    const itemContainer = inner.firstElementChild as HTMLElement
    expect(itemContainer.children.length).toBe(3)
  })

  // --- Edge cases ---
  it('renders with zero items', () => {
    const { container } = renderWithProps(VirtualList, {
      itemCount: 0,
      itemHeight: 40,
      height: 400
    })
    const outer = container.firstElementChild as HTMLElement
    const inner = outer.firstElementChild as HTMLElement
    expect(inner.style.height).toBe('0px')
  })

  it('renders with single item', () => {
    const { container } = render(VirtualList, {
      props: { itemCount: 1, itemHeight: 40, height: 400 },
      slots: { default: ({ index }: { index: number }) => `Item ${index}` }
    })
    const outer = container.firstElementChild as HTMLElement
    const inner = outer.firstElementChild as HTMLElement
    expect(inner.style.height).toBe('40px')
    const itemContainer = inner.firstElementChild as HTMLElement
    expect(itemContainer.children.length).toBe(1)
  })

  it('renders with very large itemCount', () => {
    const { container } = renderWithProps(VirtualList, {
      itemCount: 100_000,
      itemHeight: 40,
      height: 400
    })
    const outer = container.firstElementChild as HTMLElement
    const inner = outer.firstElementChild as HTMLElement
    expect(inner.style.height).toBe('4000000px')
    const itemContainer = inner.firstElementChild as HTMLElement
    // Only visible + overscan should render, not all 100k
    expect(itemContainer.children.length).toBeLessThan(30)
  })

  it('renders with overscan=0', () => {
    const { container } = render(VirtualList, {
      props: { itemCount: 100, itemHeight: 40, height: 200, overscan: 0 },
      slots: { default: ({ index }: { index: number }) => `Item ${index}` }
    })
    const outer = container.firstElementChild as HTMLElement
    const inner = outer.firstElementChild as HTMLElement
    const itemContainer = inner.firstElementChild as HTMLElement
    // 200/40 = 5 visible, overscan 0, endIndex inclusive → 6 items
    expect(itemContainer.children.length).toBeLessThanOrEqual(6)
    expect(itemContainer.children.length).toBeGreaterThanOrEqual(5)
  })

  it('renders with estimatedItemHeight (dynamic strategy)', () => {
    const { container } = renderWithProps(VirtualList, {
      itemCount: 50,
      estimatedItemHeight: 60,
      height: 300
    })
    const outer = container.firstElementChild as HTMLElement
    const inner = outer.firstElementChild as HTMLElement
    // 50 * 60 = 3000
    expect(inner.style.height).toBe('3000px')
  })

  it('applies height=0 gracefully', () => {
    const { container } = renderWithProps(VirtualList, {
      itemCount: 10,
      itemHeight: 40,
      height: 0
    })
    const outer = container.firstElementChild as HTMLElement
    expect(outer.style.height).toBe('0px')
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(VirtualList)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
