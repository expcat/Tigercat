import { afterEach, describe, it, expect, vi } from 'vitest'
import { render, screen, act, waitFor } from '@testing-library/react'
import React from 'react'
import { DEFAULT_LOADING_BACKGROUND } from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { jaJP } from '@expcat/tigercat-core/locales/ja-JP'
import { Loading } from '@expcat/tigercat-react/Loading'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'

describe('Loading (React)', () => {
  afterEach(() => {
    document.body.style.overflow = ''
    vi.useRealTimers()
  })

  it('uses official en-US loading text as the default name', () => {
    render(<Loading />)
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-label', 'Loading...')
    expect(status).toHaveAttribute('aria-busy', 'true')
    expect(status).not.toHaveAttribute('aria-live')
  })

  it('hides the decorative indicator from the accessibility tree', () => {
    const { container } = render(<Loading />)
    const hidden = container.querySelector('[aria-hidden="true"]')
    expect(hidden).toBeTruthy()
  })

  it('renders text and uses it as aria-label', () => {
    render(<Loading text="Loading data" />)
    expect(screen.getByText('Loading data')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading data')
  })

  it('reads official locale objects when text is omitted', () => {
    const { rerender } = render(
      <ConfigProvider locale={zhCN}>
        <Loading />
      </ConfigProvider>
    )
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '加载中...')

    rerender(
      <ConfigProvider locale={zhTW}>
        <Loading />
      </ConfigProvider>
    )
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '載入中...')

    rerender(
      <ConfigProvider locale={jaJP}>
        <Loading />
      </ConfigProvider>
    )
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '読み込み中...')
  })

  it('forwards attributes and merges className', () => {
    render(<Loading className="custom-class" data-testid="loading" />)
    const status = screen.getByTestId('loading')
    expect(status).toHaveClass('custom-class')
    expect(status).toHaveAttribute('role', 'status')
  })

  it('keeps role=status even if the caller tries to replace it', () => {
    render(<Loading role="alert" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders dots and bars variants', () => {
    const { rerender } = render(<Loading variant="dots" />)
    expect(screen.getByRole('status').querySelectorAll('[aria-hidden="true"] > *')).toHaveLength(3)

    rerender(<Loading variant="bars" />)
    expect(screen.getByRole('status').querySelectorAll('[aria-hidden="true"] > *')).toHaveLength(3)
  })

  it('renders ring and pulse variants as SVG', () => {
    const { rerender } = render(<Loading variant="ring" />)
    expect(screen.getByRole('status').querySelector('svg')).toBeInTheDocument()

    rerender(<Loading variant="pulse" />)
    expect(screen.getByRole('status').querySelector('svg')).toBeInTheDocument()
  })

  it('covers children with a region overlay and restores them when spinning is false', async () => {
    const { rerender } = render(
      <Loading spinning>
        <button type="button">Pay</button>
      </Loading>
    )
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pay' }).closest('[inert]')).toBeTruthy()

    rerender(
      <Loading spinning={false}>
        <button type="button">Pay</button>
      </Loading>
    )
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pay' }).closest('[inert]')).toBeNull()
  })

  it('lets user style override the fullscreen mask', () => {
    render(<Loading fullscreen style={{ backgroundColor: 'red' }} />)
    const wrapper = screen.getByRole('status')
    const reactPropsKey = Object.getOwnPropertyNames(wrapper).find((key) =>
      key.startsWith('__reactProps$')
    )
    const reactProps = reactPropsKey
      ? (wrapper as unknown as Record<string, { style?: { backgroundColor?: string } }>)[
          reactPropsKey
        ]
      : undefined
    expect(reactProps?.style?.backgroundColor).toBe('red')
  })

  it('supports fullscreen background', () => {
    const { container, unmount } = render(<Loading fullscreen background="rgba(0, 0, 0, 0.8)" />)
    const wrapper = screen.getByRole('status')

    expect(container.firstChild).toBeNull()
    expect(wrapper).toHaveStyle({ backgroundColor: 'rgba(0, 0, 0, 0.8)' })
    expect(document.body.style.overflow).toBe('hidden')

    unmount()

    expect(document.body.style.overflow).toBe('')
  })

  it('applies the shared surface mask when fullscreen has no background', () => {
    expect(DEFAULT_LOADING_BACKGROUND).toContain('--tiger-surface')
    expect(DEFAULT_LOADING_BACKGROUND).not.toContain('--tiger-loading-mask')

    render(<Loading fullscreen />)
    const wrapper = screen.getByRole('status')
    const reactPropsKey = Object.getOwnPropertyNames(wrapper).find((key) =>
      key.startsWith('__reactProps$')
    )
    const reactProps = reactPropsKey
      ? (wrapper as unknown as Record<string, { style?: { backgroundColor?: string } }>)[
          reactPropsKey
        ]
      : undefined

    expect(reactProps?.style?.backgroundColor).toBe(DEFAULT_LOADING_BACKGROUND)
  })

  it('inerts the page behind a fullscreen overlay', async () => {
    render(
      <>
        <button type="button">Behind</button>
        <Loading fullscreen />
      </>
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Behind' }).closest('[inert]')).toBeTruthy()
    })
  })

  it('allows fullscreen loading without scroll lock', () => {
    render(<Loading fullscreen lockScroll={false} />)

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('')
  })

  it('respects delay', async () => {
    vi.useFakeTimers()

    render(<Loading delay={100} />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
