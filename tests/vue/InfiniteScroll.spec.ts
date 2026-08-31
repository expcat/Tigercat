import { describe, it, expect, vi } from 'vitest'
import { render, waitFor } from '@testing-library/vue'
import { InfiniteScroll } from '@expcat/tigercat-vue/InfiniteScroll'
import { h } from 'vue'
import { expectNoA11yViolations } from '../utils'

describe('InfiniteScroll (Vue)', () => {
  it('renders children via default slot', () => {
    const { getByText } = render(InfiniteScroll, {
      props: { hasMore: true },
      slots: { default: () => h('div', {}, 'Content here') }
    })
    expect(getByText('Content here')).toBeTruthy()
  })

  it('shows loading text when loading', () => {
    const { getByText } = render(InfiniteScroll, {
      props: { loading: true, loadingText: 'Fetching...' }
    })
    expect(getByText('Fetching...')).toBeTruthy()
  })

  it('shows default loading text', () => {
    const { getByText } = render(InfiniteScroll, {
      props: { loading: true }
    })
    expect(getByText('Loading...')).toBeTruthy()
  })

  it('does not show loading when not loading', () => {
    const { queryByText } = render(InfiniteScroll, {
      props: { loading: false }
    })
    expect(queryByText('Loading...')).toBeNull()
  })

  it('shows end text when no more data', () => {
    const { getByText } = render(InfiniteScroll, {
      props: { hasMore: false, loading: false, endText: 'All done' }
    })
    expect(getByText('All done')).toBeTruthy()
  })

  it('shows default end text', () => {
    const { getByText } = render(InfiniteScroll, {
      props: { hasMore: false, loading: false }
    })
    expect(getByText('No more data')).toBeTruthy()
  })

  it('does not show end text when hasMore', () => {
    const { queryByText } = render(InfiniteScroll, {
      props: { hasMore: true }
    })
    expect(queryByText('No more data')).toBeNull()
  })

  it('applies custom className', () => {
    const { container } = render(InfiniteScroll, {
      props: { className: 'my-scroll' }
    })
    expect(container.firstElementChild?.className).toContain('my-scroll')
  })

  it('has role=status on loader', () => {
    const { getByRole } = render(InfiniteScroll, {
      props: { loading: true }
    })
    expect(getByRole('status')).toBeTruthy()
  })

  it('renders loader slot', () => {
    const { getByText } = render(InfiniteScroll, {
      props: { loading: true },
      slots: { loader: () => h('span', {}, 'Custom loader') }
    })
    expect(getByText('Custom loader')).toBeTruthy()
  })

  it('renders end slot', () => {
    const { getByText } = render(InfiniteScroll, {
      props: { hasMore: false, loading: false },
      slots: { end: () => h('span', {}, 'Finished!') }
    })
    expect(getByText('Finished!')).toBeTruthy()
  })

  it('loader appears before content when inverse', () => {
    const { container } = render(InfiniteScroll, {
      props: { loading: true, inverse: true },
      slots: { default: () => h('div', { 'data-testid': 'content' }, 'Content') }
    })
    const children = Array.from(container.firstElementChild?.children ?? [])
    const loaderIdx = children.findIndex((c) => c.getAttribute('role') === 'status')
    const contentIdx = children.findIndex((c) => c.getAttribute('data-testid') === 'content')
    expect(loaderIdx).toBeLessThan(contentIdx)
  })

  it('renders a sentinel element when hasMore', () => {
    const { container } = render(InfiniteScroll, {
      props: { hasMore: true }
    })
    const sentinel = container.querySelector('.tiger-infinite-scroll-sentinel')
    expect(sentinel).toBeTruthy()
    expect(sentinel?.getAttribute('aria-hidden')).toBe('true')
  })

  it('does not render sentinel when hasMore is false', () => {
    const { container } = render(InfiniteScroll, {
      props: { hasMore: false, loading: false }
    })
    const sentinel = container.querySelector('.tiger-infinite-scroll-sentinel')
    expect(sentinel).toBeNull()
  })

  // --- Edge cases ---
  it('does not render sentinel when disabled', () => {
    const { container } = render(InfiniteScroll, {
      props: { hasMore: true, disabled: true }
    })
    // Sentinel should still render (observer just won't fire)
    const sentinel = container.querySelector('.tiger-infinite-scroll-sentinel')
    // disabled doesn't remove sentinel — it prevents load-more from firing
    expect(sentinel).toBeTruthy()
  })

  it('does not show both loading and end at same time', () => {
    const { queryByText } = render(InfiniteScroll, {
      props: { hasMore: false, loading: true }
    })
    // Loading shown, end text hidden
    expect(queryByText('Loading...')).toBeTruthy()
    expect(queryByText('No more data')).toBeNull()
  })

  it('supports horizontal direction class', () => {
    const { container } = render(InfiniteScroll, {
      props: { direction: 'horizontal' }
    })
    expect(container.firstElementChild?.className).toContain('flex-row')
  })

  it('renders without children', () => {
    const { container } = render(InfiniteScroll, {
      props: { hasMore: true }
    })
    expect(container.firstElementChild).toBeTruthy()
  })

  it('gives the sentinel a non-zero area', () => {
    const { container } = render(InfiniteScroll, {
      props: { hasMore: true }
    })
    const sentinel = container.querySelector('.tiger-infinite-scroll-sentinel') as HTMLElement
    expect(Number.parseInt(sentinel.style.height, 10)).toBeGreaterThan(0)
    expect(sentinel.style.overflow).toBe('hidden')
  })

  it('gives a horizontal sentinel width and height', () => {
    const { container } = render(InfiniteScroll, {
      props: { hasMore: true, direction: 'horizontal' }
    })
    const sentinel = container.querySelector('.tiger-infinite-scroll-sentinel') as HTMLElement
    expect(Number.parseInt(sentinel.style.width, 10)).toBeGreaterThan(0)
    expect(sentinel.style.height).toBe('100%')
  })

  it('puts end chrome on the start edge when inverse', () => {
    const { container } = render(InfiniteScroll, {
      props: { hasMore: false, loading: false, inverse: true },
      slots: { default: () => h('div', { 'data-testid': 'content' }, 'Content') }
    })
    const children = Array.from(container.firstElementChild?.children ?? [])
    const endIdx = children.findIndex((node) => node.textContent === 'No more data')
    const contentIdx = children.findIndex((node) => node.getAttribute('data-testid') === 'content')
    expect(endIdx).toBeGreaterThanOrEqual(0)
    expect(endIdx).toBeLessThan(contentIdx)
  })

  it('forwards data attributes and height onto the scroller', () => {
    const { container } = render(InfiniteScroll, {
      props: { hasMore: true, height: 288 },
      attrs: { 'data-testid': 'feed' },
      slots: { default: () => h('div', {}, 'row') }
    })
    const root = container.querySelector('[data-testid="feed"]') as HTMLElement
    expect(root.style.height).toBe('288px')
  })

  it('emits load-more when the first page does not fill the box', async () => {
    const onLoadMore = vi.fn()
    render(InfiniteScroll, {
      props: { hasMore: true, height: 288, onLoadMore },
      slots: { default: () => h('div', {}, 'one') }
    })
    await waitFor(() => expect(onLoadMore).toHaveBeenCalled())
  })

  it('does not emit load-more while loading', async () => {
    const onLoadMore = vi.fn()
    render(InfiniteScroll, {
      props: { hasMore: true, loading: true, height: 288, onLoadMore },
      slots: { default: () => h('div', {}, 'one') }
    })
    await Promise.resolve()
    expect(onLoadMore).not.toHaveBeenCalled()
  })

  it('emits load-more again after loading returns to false', async () => {
    const onLoadMore = vi.fn()
    const { rerender } = render(InfiniteScroll, {
      props: { hasMore: true, loading: false, height: 288, onLoadMore },
      slots: { default: () => h('div', {}, 'one') }
    })
    await waitFor(() => expect(onLoadMore).toHaveBeenCalledTimes(1))
    await rerender({ hasMore: true, loading: true, height: 288, onLoadMore })
    await rerender({ hasMore: true, loading: false, height: 288, onLoadMore })
    await waitFor(() => expect(onLoadMore).toHaveBeenCalledTimes(2))
  })

  it('does not emit load-more when disabled or exhausted', async () => {
    const onLoadMore = vi.fn()
    const { rerender } = render(InfiniteScroll, {
      props: { hasMore: true, disabled: true, height: 288, onLoadMore },
      slots: { default: () => h('div', {}, 'one') }
    })
    await Promise.resolve()
    expect(onLoadMore).not.toHaveBeenCalled()
    await rerender({ hasMore: false, height: 288, onLoadMore })
    await Promise.resolve()
    expect(onLoadMore).not.toHaveBeenCalled()
  })

  describe('Accessibility', () => {
    it('marks loading and has no axe violations with content', async () => {
      const { container, rerender } = render(InfiniteScroll, {
        props: { hasMore: true, loading: true, height: 288 },
        slots: { default: () => h('div', {}, 'Row') }
      })
      expect(container.firstElementChild).toHaveAttribute('aria-busy', 'true')
      await expectNoA11yViolations(container)
      await rerender({ hasMore: false, loading: false, height: 288 })
      await expectNoA11yViolations(container)
    })
  })
})
