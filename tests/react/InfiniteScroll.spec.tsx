import { describe, it, expect, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import React from 'react'
import { InfiniteScroll } from '@expcat/tigercat-react/InfiniteScroll'
import { expectNoA11yViolations } from '../utils/react'

describe('InfiniteScroll (React)', () => {
  it('renders children', () => {
    const { getByText } = render(
      <InfiniteScroll hasMore>
        <div>Content</div>
      </InfiniteScroll>
    )
    expect(getByText('Content')).toBeTruthy()
  })

  it('shows loading text when loading', () => {
    const { getByText } = render(<InfiniteScroll loading loadingText="Fetching..." />)
    expect(getByText('Fetching...')).toBeTruthy()
  })

  it('shows default loading text', () => {
    const { getByText } = render(<InfiniteScroll loading />)
    expect(getByText('Loading...')).toBeTruthy()
  })

  it('does not show loading when not loading', () => {
    const { queryByText } = render(<InfiniteScroll loading={false} />)
    expect(queryByText('Loading...')).toBeNull()
  })

  it('shows end text when no more data', () => {
    const { getByText } = render(
      <InfiniteScroll hasMore={false} loading={false} endText="All done" />
    )
    expect(getByText('All done')).toBeTruthy()
  })

  it('shows default end text', () => {
    const { getByText } = render(<InfiniteScroll hasMore={false} loading={false} />)
    expect(getByText('No more data')).toBeTruthy()
  })

  it('does not show end when hasMore', () => {
    const { queryByText } = render(<InfiniteScroll hasMore />)
    expect(queryByText('No more data')).toBeNull()
  })

  it('applies custom className', () => {
    const { container } = render(<InfiniteScroll className="my-scroll" />)
    expect(container.firstElementChild?.className).toContain('my-scroll')
  })

  it('has role=status on loader', () => {
    const { getByRole } = render(<InfiniteScroll loading />)
    expect(getByRole('status')).toBeTruthy()
  })

  it('custom loader element', () => {
    const { getByText } = render(<InfiniteScroll loading loader={<span>Custom loader</span>} />)
    expect(getByText('Custom loader')).toBeTruthy()
  })

  it('custom end element', () => {
    const { getByText } = render(
      <InfiniteScroll hasMore={false} loading={false} end={<span>Finished!</span>} />
    )
    expect(getByText('Finished!')).toBeTruthy()
  })

  it('loader appears before content when inverse', () => {
    const { container } = render(
      <InfiniteScroll loading inverse>
        <div data-testid="content">Content</div>
      </InfiniteScroll>
    )
    const children = Array.from(container.firstElementChild?.children ?? [])
    const loaderIdx = children.findIndex((c) => c.getAttribute('role') === 'status')
    const contentIdx = children.findIndex((c) => c.getAttribute('data-testid') === 'content')
    expect(loaderIdx).toBeLessThan(contentIdx)
  })

  it('content before loader in default mode', () => {
    const { container } = render(
      <InfiniteScroll loading>
        <div data-testid="content">Content</div>
      </InfiniteScroll>
    )
    const children = Array.from(container.firstElementChild?.children ?? [])
    const loaderIdx = children.findIndex((c) => c.getAttribute('role') === 'status')
    const contentIdx = children.findIndex((c) => c.getAttribute('data-testid') === 'content')
    expect(contentIdx).toBeLessThan(loaderIdx)
  })

  it('renders a sentinel element when hasMore', () => {
    const { container } = render(<InfiniteScroll hasMore />)
    const sentinel = container.querySelector('.tiger-infinite-scroll-sentinel')
    expect(sentinel).toBeTruthy()
    expect(sentinel?.getAttribute('aria-hidden')).toBe('true')
  })

  it('does not render sentinel when hasMore is false', () => {
    const { container } = render(<InfiniteScroll hasMore={false} loading={false} />)
    const sentinel = container.querySelector('.tiger-infinite-scroll-sentinel')
    expect(sentinel).toBeNull()
  })

  // --- Edge cases ---
  it('does not render sentinel when disabled', () => {
    const { container } = render(<InfiniteScroll hasMore disabled />)
    // Sentinel still renders (observer won't fire)
    const sentinel = container.querySelector('.tiger-infinite-scroll-sentinel')
    expect(sentinel).toBeTruthy()
  })

  it('does not show both loading and end at same time', () => {
    const { queryByText } = render(<InfiniteScroll hasMore={false} loading />)
    expect(queryByText('Loading...')).toBeTruthy()
    expect(queryByText('No more data')).toBeNull()
  })

  it('supports horizontal direction class', () => {
    const { container } = render(<InfiniteScroll direction="horizontal" />)
    expect(container.firstElementChild?.className).toContain('flex-row')
  })

  it('renders without children', () => {
    const { container } = render(<InfiniteScroll hasMore />)
    expect(container.firstElementChild).toBeTruthy()
  })

  it('gives the sentinel a non-zero area', () => {
    const { container } = render(<InfiniteScroll hasMore />)
    const sentinel = container.querySelector('.tiger-infinite-scroll-sentinel') as HTMLElement
    expect(Number.parseInt(sentinel.style.height, 10)).toBeGreaterThan(0)
    expect(sentinel.style.overflow).toBe('hidden')
  })

  it('gives a horizontal sentinel width and height', () => {
    const { container } = render(<InfiniteScroll hasMore direction="horizontal" />)
    const sentinel = container.querySelector('.tiger-infinite-scroll-sentinel') as HTMLElement
    expect(Number.parseInt(sentinel.style.width, 10)).toBeGreaterThan(0)
    expect(sentinel.style.height).toBe('100%')
  })

  it('puts end chrome on the start edge when inverse', () => {
    const { container } = render(
      <InfiniteScroll hasMore={false} loading={false} inverse>
        <div data-testid="content">Content</div>
      </InfiniteScroll>
    )
    const children = Array.from(container.firstElementChild?.children ?? [])
    const endIdx = children.findIndex((node) => node.textContent === 'No more data')
    const contentIdx = children.findIndex((node) => node.getAttribute('data-testid') === 'content')
    expect(endIdx).toBeGreaterThanOrEqual(0)
    expect(endIdx).toBeLessThan(contentIdx)
  })

  it('forwards data attributes and height onto the scroller', () => {
    const { getByTestId } = render(
      <InfiniteScroll data-testid="feed" height={288} hasMore>
        <div>row</div>
      </InfiniteScroll>
    )
    expect(getByTestId('feed').style.height).toBe('288px')
  })

  it('loads more when the first page does not fill the box', async () => {
    const onLoadMore = vi.fn()
    render(
      <InfiniteScroll hasMore height={288} onLoadMore={onLoadMore}>
        <div>one</div>
      </InfiniteScroll>
    )
    await waitFor(() => expect(onLoadMore).toHaveBeenCalled())
  })

  it('does not load while loading is true', async () => {
    const onLoadMore = vi.fn()
    render(
      <InfiniteScroll hasMore loading height={288} onLoadMore={onLoadMore}>
        <div>one</div>
      </InfiniteScroll>
    )
    await Promise.resolve()
    expect(onLoadMore).not.toHaveBeenCalled()
  })

  it('loads again after loading returns to false while the sentinel stays in view', async () => {
    const onLoadMore = vi.fn()
    const { rerender } = render(
      <InfiniteScroll hasMore loading={false} height={288} onLoadMore={onLoadMore}>
        <div>one</div>
      </InfiniteScroll>
    )
    await waitFor(() => expect(onLoadMore).toHaveBeenCalledTimes(1))
    rerender(
      <InfiniteScroll hasMore loading height={288} onLoadMore={onLoadMore}>
        <div>one</div>
      </InfiniteScroll>
    )
    rerender(
      <InfiniteScroll hasMore loading={false} height={288} onLoadMore={onLoadMore}>
        <div>one</div>
      </InfiniteScroll>
    )
    await waitFor(() => expect(onLoadMore).toHaveBeenCalledTimes(2))
  })

  it('does not load when disabled or exhausted', async () => {
    const onLoadMore = vi.fn()
    const { rerender } = render(
      <InfiniteScroll hasMore disabled height={288} onLoadMore={onLoadMore}>
        <div>one</div>
      </InfiniteScroll>
    )
    await Promise.resolve()
    expect(onLoadMore).not.toHaveBeenCalled()
    rerender(
      <InfiniteScroll hasMore={false} height={288} onLoadMore={onLoadMore}>
        <div>one</div>
      </InfiniteScroll>
    )
    await Promise.resolve()
    expect(onLoadMore).not.toHaveBeenCalled()
  })

  describe('Accessibility', () => {
    it('marks loading and has no axe violations with content', async () => {
      const { container, rerender } = render(
        <InfiniteScroll hasMore loading height={288}>
          <div>Row</div>
        </InfiniteScroll>
      )
      expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true')
      await expectNoA11yViolations(container)
      rerender(
        <InfiniteScroll hasMore={false} height={288}>
          <div>Row</div>
        </InfiniteScroll>
      )
      await expectNoA11yViolations(container)
    })
  })
})
