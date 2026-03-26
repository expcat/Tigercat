/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { VirtualList } from '@expcat/tigercat-vue'
import { renderWithProps } from '../utils'

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
})
