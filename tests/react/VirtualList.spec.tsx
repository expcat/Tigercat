/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import { VirtualList } from '@expcat/tigercat-react'

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
  it('calls onScroll on scroll', () => {
    const onScroll = vi.fn()
    const { container } = render(<VirtualList {...defaultProps} onScroll={onScroll} />)
    const outer = container.firstElementChild as HTMLElement
    fireEvent.scroll(outer)
    expect(onScroll).toHaveBeenCalled()
  })
})
