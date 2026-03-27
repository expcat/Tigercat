import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import { InfiniteScroll } from '@expcat/tigercat-react'

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
})
