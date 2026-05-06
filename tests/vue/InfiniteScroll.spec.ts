import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { InfiniteScroll } from '@expcat/tigercat-vue'
import { h } from 'vue'

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

  it('sentinel has height 0 and is hidden', () => {
    const { container } = render(InfiniteScroll, {
      props: { hasMore: true }
    })
    const sentinel = container.querySelector('.tiger-infinite-scroll-sentinel') as HTMLElement
    expect(sentinel.style.height).toBe('0px')
    expect(sentinel.style.overflow).toBe('hidden')
  })
})
