import { afterEach, describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { DEFAULT_LOADING_BACKGROUND } from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { jaJP } from '@expcat/tigercat-core/locales/ja-JP'
import { Loading } from '@expcat/tigercat-vue/Loading'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { expectNoA11yViolations, expectNoA11yViolationsIsolated } from '../utils'

describe('Loading (Vue)', () => {
  afterEach(() => {
    document.body.style.overflow = ''
    vi.useRealTimers()
  })

  it('uses official en-US loading text as the default name', () => {
    render(Loading)
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-label', 'Loading...')
    expect(status).toHaveAttribute('aria-busy', 'true')
    expect(status).not.toHaveAttribute('aria-live')
  })

  it('hides the decorative indicator from the accessibility tree', () => {
    const { container } = render(Loading)
    expect(container.querySelector('[aria-hidden="true"]')).toBeTruthy()
  })

  it('renders text and uses it as aria-label', () => {
    render(Loading, { props: { text: 'Loading data' } })
    expect(screen.getByText('Loading data')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading data')
  })

  it('reads official locale objects when text is omitted', () => {
    const { unmount } = render({
      components: { ConfigProvider, Loading },
      template: '<ConfigProvider :locale="locale"><Loading /></ConfigProvider>',
      setup: () => ({ locale: zhCN })
    })
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '加载中...')
    unmount()

    const tw = render({
      components: { ConfigProvider, Loading },
      template: '<ConfigProvider :locale="locale"><Loading /></ConfigProvider>',
      setup: () => ({ locale: zhTW })
    })
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '載入中...')
    tw.unmount()

    render({
      components: { ConfigProvider, Loading },
      template: '<ConfigProvider :locale="locale"><Loading /></ConfigProvider>',
      setup: () => ({ locale: jaJP })
    })
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', '読み込み中...')
  })

  it('forwards attrs and merges class', () => {
    render(Loading, {
      props: { className: 'prop-class' },
      attrs: { class: 'attr-class', 'data-testid': 'loading' }
    })

    const status = screen.getByTestId('loading')
    expect(status).toHaveClass('prop-class')
    expect(status).toHaveClass('attr-class')
    expect(status).toHaveAttribute('role', 'status')
  })

  it('keeps role=status even if the caller tries to replace it', () => {
    render(Loading, { attrs: { role: 'alert' } })
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders dots and bars variants', () => {
    const { unmount } = render(Loading, { props: { variant: 'dots' } })
    expect(screen.getByRole('status').querySelectorAll('[aria-hidden="true"] > *')).toHaveLength(3)
    unmount()

    render(Loading, { props: { variant: 'bars' } })
    expect(screen.getByRole('status').querySelectorAll('[aria-hidden="true"] > *')).toHaveLength(3)
  })

  it('renders ring and pulse variants as SVG', () => {
    const { unmount } = render(Loading, { props: { variant: 'ring' } })
    expect(screen.getByRole('status').querySelector('svg')).toBeInTheDocument()
    unmount()

    render(Loading, { props: { variant: 'pulse' } })
    expect(screen.getByRole('status').querySelector('svg')).toBeInTheDocument()
  })

  it('covers the default slot with a region overlay', async () => {
    const { rerender } = render(Loading, {
      props: { spinning: true },
      slots: { default: '<button type="button">Pay</button>' }
    })
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pay' }).closest('[inert]')).toBeTruthy()

    await rerender({ spinning: false })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pay' }).closest('[inert]')).toBeNull()
  })

  it('lets user style override the fullscreen mask', () => {
    render(Loading, {
      props: { fullscreen: true, style: { backgroundColor: 'red' } }
    })
    const wrapper = screen.getByRole('status') as HTMLElement & {
      __vnode?: { props?: { style?: unknown } }
    }
    const style = wrapper.__vnode?.props?.style
    const parts = Array.isArray(style) ? style : [style]
    const lastColor = parts
      .map((part) =>
        part && typeof part === 'object'
          ? (part as { backgroundColor?: string }).backgroundColor
          : undefined
      )
      .filter(Boolean)
      .at(-1)
    expect(lastColor).toBe('red')
  })

  it('supports fullscreen background', () => {
    const { container, unmount } = render(Loading, {
      props: { fullscreen: true, background: 'rgba(0, 0, 0, 0.8)' }
    })
    const wrapper = screen.getByRole('status')

    expect(container.querySelector('[role="status"]')).toBeNull()
    expect(wrapper).toHaveStyle({ backgroundColor: 'rgba(0, 0, 0, 0.8)' })
    expect(document.body.style.overflow).toBe('hidden')

    unmount()

    expect(document.body.style.overflow).toBe('')
  })

  it('applies the shared surface mask when fullscreen has no background', () => {
    expect(Loading.props.background.default).toBe(DEFAULT_LOADING_BACKGROUND)
    expect(DEFAULT_LOADING_BACKGROUND).toContain('--tiger-surface')
    expect(DEFAULT_LOADING_BACKGROUND).not.toContain('--tiger-loading-mask')

    render(Loading, { props: { fullscreen: true } })
    const wrapper = screen.getByRole('status') as HTMLElement & {
      __vnode?: { props?: { style?: { backgroundColor?: string } } }
    }

    expect(wrapper.__vnode?.props?.style?.backgroundColor).toBe(DEFAULT_LOADING_BACKGROUND)
  })

  it('inerts the page behind a fullscreen overlay', async () => {
    render({
      components: { Loading },
      template: '<div><button type="button">Behind</button><Loading fullscreen /></div>'
    })

    await vi.waitFor(() => {
      expect(screen.getByRole('button', { name: 'Behind' }).closest('[inert]')).toBeTruthy()
    })
  })

  it('allows fullscreen loading without scroll lock', () => {
    render(Loading, { props: { fullscreen: true, lockScroll: false } })

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('')
  })

  it('respects delay', async () => {
    vi.useFakeTimers()

    render(Loading, { props: { delay: 100 } })
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    vi.advanceTimersByTime(100)
    await vi.runAllTimersAsync()
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  describe('Accessibility', () => {
    it('has no accessibility violations for the inline spinner', async () => {
      const { container } = render(Loading)
      await expectNoA11yViolationsIsolated(container)
    })

    it('has no accessibility violations for named text and a Chinese fullscreen layer', async () => {
      const { container } = render({
        components: { ConfigProvider, Loading },
        template: '<ConfigProvider :locale="locale"><Loading text="同步中" /></ConfigProvider>',
        setup: () => ({ locale: zhCN })
      })
      await expectNoA11yViolationsIsolated(container)

      render({
        components: { ConfigProvider, Loading },
        template: '<ConfigProvider :locale="locale"><Loading fullscreen /></ConfigProvider>',
        setup: () => ({ locale: zhCN })
      })
      await expectNoA11yViolations(document.body)
    })
  })
})
