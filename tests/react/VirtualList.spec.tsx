/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent, act } from '@testing-library/react'
import React, { createRef } from 'react'
import { VirtualList, type VirtualListHandle } from '@expcat/tigercat-react/VirtualList'
import { expectNoA11yViolations } from '../utils/react'

describe('VirtualList', () => {
  const defaultProps = {
    itemCount: 1000,
    itemHeight: 40,
    height: 400,
    renderItem: ({ index }: { index: number }) => <div>Item {index}</div>
  }

  // --- Basic rendering ---
  it('renders with default props', () => {
    const { container } = render(<VirtualList {...defaultProps} />)
    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('renders scrollable container with correct height', () => {
    const { container } = render(<VirtualList {...defaultProps} />)
    const outer = container.firstElementChild as HTMLElement
    expect(outer.style.height).toBe('400px')
  })

  it('renders inner spacer with total height', () => {
    const { container } = render(<VirtualList {...defaultProps} />)
    const outer = container.firstElementChild as HTMLElement
    const inner = outer.firstElementChild as HTMLElement
    expect(inner.style.height).toBe('40000px')
  })

  it('applies className', () => {
    const { container } = render(<VirtualList {...defaultProps} className="my-vl" />)
    expect(container.querySelector('.my-vl')).toBeInTheDocument()
  })

  // --- Visible items ---
  it('renders only visible items (+ overscan)', () => {
    const { container } = render(<VirtualList {...defaultProps} />)
    const outer = container.firstElementChild as HTMLElement
    const inner = outer.firstElementChild as HTMLElement
    const itemContainer = inner.firstElementChild as HTMLElement
    const items = itemContainer.children
    expect(items.length).toBeGreaterThanOrEqual(10)
    expect(items.length).toBeLessThanOrEqual(25)
  })

  // --- Custom overscan ---
  it('respects overscan prop', () => {
    const { container } = render(<VirtualList {...defaultProps} overscan={5} />)
    const outer = container.firstElementChild as HTMLElement
    const inner = outer.firstElementChild as HTMLElement
    const itemContainer = inner.firstElementChild as HTMLElement
    const items = itemContainer.children
    expect(items.length).toBeGreaterThanOrEqual(10)
  })

  // --- Scroll event ---
  it('calls onScroll with the current scrollTop', () => {
    const onScroll = vi.fn()
    const { container } = render(<VirtualList {...defaultProps} onScroll={onScroll} />)
    const outer = container.firstElementChild as HTMLElement
    outer.scrollTop = 500
    fireEvent.scroll(outer)
    expect(onScroll).toHaveBeenCalledWith(500)
  })

  // --- Variable size via getItemHeight ---
  it('renders variable-height items via getItemHeight prop', () => {
    const getItemHeight = (index: number) => (index % 2 === 0 ? 30 : 60)
    const { container } = render(
      <VirtualList
        itemCount={100}
        getItemHeight={getItemHeight}
        height={400}
        overscan={2}
        renderItem={({ index }) => <div>Item {index}</div>}
      />
    )
    const outer = container.firstElementChild as HTMLElement
    const inner = outer.firstElementChild as HTMLElement
    // total: 50*30 + 50*60 = 1500 + 3000 = 4500
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
    const { container } = render(
      <VirtualList
        itemCount={3}
        sizeStrategy={customStrategy}
        height={200}
        renderItem={({ index }) => <div>Item {index}</div>}
      />
    )
    const outer = container.firstElementChild as HTMLElement
    const inner = outer.firstElementChild as HTMLElement
    expect(inner.style.height).toBe('300px')
    const itemContainer = inner.firstElementChild as HTMLElement
    expect(itemContainer.children.length).toBe(3)
  })

  // --- Edge cases ---
  it('renders with zero items', () => {
    const { container } = render(
      <VirtualList
        itemCount={0}
        itemHeight={40}
        height={400}
        renderItem={defaultProps.renderItem}
      />
    )
    const outer = container.firstElementChild as HTMLElement
    const inner = outer.firstElementChild as HTMLElement
    expect(inner.style.height).toBe('0px')
  })

  it('renders with single item', () => {
    const { container } = render(
      <VirtualList
        itemCount={1}
        itemHeight={40}
        height={400}
        renderItem={defaultProps.renderItem}
      />
    )
    const outer = container.firstElementChild as HTMLElement
    const inner = outer.firstElementChild as HTMLElement
    expect(inner.style.height).toBe('40px')
    const itemContainer = inner.firstElementChild as HTMLElement
    expect(itemContainer.children.length).toBe(1)
  })

  it('renders with very large itemCount', () => {
    const { container } = render(
      <VirtualList
        itemCount={100_000}
        itemHeight={40}
        height={400}
        renderItem={defaultProps.renderItem}
      />
    )
    const outer = container.firstElementChild as HTMLElement
    const inner = outer.firstElementChild as HTMLElement
    expect(inner.style.height).toBe('4000000px')
    const itemContainer = inner.firstElementChild as HTMLElement
    expect(itemContainer.children.length).toBeLessThan(30)
  })

  it('renders with overscan=0', () => {
    const { container } = render(
      <VirtualList
        itemCount={100}
        itemHeight={40}
        height={200}
        overscan={0}
        renderItem={defaultProps.renderItem}
      />
    )
    const outer = container.firstElementChild as HTMLElement
    const inner = outer.firstElementChild as HTMLElement
    const itemContainer = inner.firstElementChild as HTMLElement
    // 200/40 = 5 visible, overscan 0, exclusive end → 5 items
    expect(itemContainer.children.length).toBe(5)
  })

  it('renders with estimatedItemHeight (dynamic strategy)', () => {
    const { container } = render(
      <VirtualList
        itemCount={50}
        estimatedItemHeight={60}
        height={300}
        renderItem={defaultProps.renderItem}
      />
    )
    const outer = container.firstElementChild as HTMLElement
    const inner = outer.firstElementChild as HTMLElement
    expect(inner.style.height).toBe('3000px')
  })

  it('applies height=0 gracefully', () => {
    const { container } = render(
      <VirtualList itemCount={10} itemHeight={40} height={0} renderItem={defaultProps.renderItem} />
    )
    const outer = container.firstElementChild as HTMLElement
    expect(outer.style.height).toBe('0px')
  })
  it('forwards data attributes onto the scroller', () => {
    const { getByTestId } = render(<VirtualList {...defaultProps} data-testid="vl-root" />)
    expect(getByTestId('vl-root')).toHaveAttribute('role', 'list')
  })

  it('pins fixed-height items and clips overflow', () => {
    const { container } = render(<VirtualList {...defaultProps} overscan={0} />)
    const item = container.querySelector('[role="listitem"]') as HTMLElement
    expect(item.style.height).toBe('40px')
    expect(item.style.overflow).toBe('hidden')
  })

  it('updates the visible window after scrolling', () => {
    const { container } = render(<VirtualList {...defaultProps} overscan={0} />)
    const outer = container.firstElementChild as HTMLElement
    outer.scrollTop = 500
    fireEvent.scroll(outer)
    const labels = [...container.querySelectorAll('[role="listitem"]')].map(
      (node) => node.textContent
    )
    expect(labels).toContain('Item 12')
  })

  it('scrolls to an index through the imperative handle', () => {
    const ref = createRef<VirtualListHandle>()
    const { container } = render(
      <VirtualList {...defaultProps} overscan={0} ref={ref} aria-label="Rows" />
    )
    act(() => {
      ref.current?.scrollToIndex(500)
    })
    expect(ref.current?.getScrollElement()?.scrollTop).toBe(20000)
    expect(container.textContent).toContain('Item 500')
  })

  it('measures newly visible dynamic items after scroll', () => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get() {
        return 80
      }
    })
    const { container } = render(
      <VirtualList
        itemCount={100}
        estimatedItemHeight={30}
        height={300}
        overscan={0}
        renderItem={({ index }) => <div>Item {index}</div>}
      />
    )
    const outer = container.firstElementChild as HTMLElement
    const inner = outer.firstElementChild as HTMLElement
    expect(Number.parseInt(inner.style.height, 10)).toBeGreaterThan(3000)
    outer.scrollTop = 400
    fireEvent.scroll(outer)
    expect(Number.parseInt(inner.style.height, 10)).toBeGreaterThan(3000)
  })

  describe('Accessibility', () => {
    it('names the list and has no axe violations with visible items', async () => {
      const { container, getByRole } = render(
        <VirtualList {...defaultProps} aria-label="Rows" overscan={0} />
      )
      expect(getByRole('list')).toHaveAccessibleName('Rows')
      expect(container.querySelectorAll('[role="listitem"]').length).toBeGreaterThan(0)
      await expectNoA11yViolations(container)
    })
  })
})
