/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { QRCode } from '@expcat/tigercat-vue/QRCode'
import { renderWithProps, expectNoA11yViolationsIsolated } from '../utils'

describe('QRCode', () => {
  it('renders with required value prop', () => {
    const { container } = renderWithProps(QRCode, { value: 'https://example.com' })
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders SVG with the given size', () => {
    const { container } = renderWithProps(QRCode, { value: 'test', size: 200 })
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '200')
    expect(svg).toHaveAttribute('height', '200')
  })

  it('names the active code with the encoded value', () => {
    renderWithProps(QRCode, { value: 'https://tigercat.dev' })
    expect(screen.getByRole('img', { name: /https:\/\/tigercat\.dev/ })).toBeInTheDocument()
  })

  it('merges className with the container', () => {
    const { container } = renderWithProps(QRCode, { value: 'test', className: 'my-qr' })
    const root = container.firstElementChild
    expect(root).toHaveClass('my-qr')
    expect(root).toHaveClass('relative')
  })

  it('forwards root attrs', () => {
    renderWithProps(QRCode, { value: 'test', id: 'qr-root', 'data-testid': 'qr' })
    expect(screen.getByTestId('qr')).toHaveAttribute('id', 'qr-root')
  })

  it('defaults to 128px', () => {
    const { container } = renderWithProps(QRCode, { value: 'test' })
    expect(container.querySelector('svg')).toHaveAttribute('width', '128')
  })

  it('applies background and module colors', () => {
    const { container } = renderWithProps(QRCode, {
      value: 'test',
      bgColor: '#eeeeee',
      color: '#ff0000'
    })
    expect(container.querySelector('svg > rect')).toHaveAttribute('fill', '#eeeeee')
    expect(container.querySelectorAll('svg rect[fill="#ff0000"]').length).toBeGreaterThan(0)
  })

  it('does not paint a refresh control without a handler', () => {
    renderWithProps(QRCode, { value: 'test', status: 'expired' })
    expect(screen.getByText('QR code expired')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('exposes a refresh button when @refresh is bound', async () => {
    const onRefresh = vi.fn()
    render(QRCode, {
      props: { value: 'test', status: 'expired' },
      attrs: { onRefresh }
    })
    await fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))
    expect(onRefresh).toHaveBeenCalledTimes(1)
  })

  it('hides the matrix while expired or loading', () => {
    const { container, unmount } = render(QRCode, {
      props: { value: 'test', status: 'expired' },
      attrs: { onRefresh: () => undefined }
    })
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('status', { name: /QR code expired/ })).toBeInTheDocument()
    unmount()

    const loading = renderWithProps(QRCode, { value: 'test', status: 'loading' })
    expect(loading.container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('status', { name: /Loading/ })).toBeInTheDocument()
  })

  it('uses official locale objects for aria and status text', () => {
    const { unmount } = render({
      components: { ConfigProvider, QRCode },
      setup: () => ({ locale: zhCN, onRefresh: () => undefined }),
      template:
        '<ConfigProvider :locale="locale"><QRCode value="test" status="expired" @refresh="onRefresh" /></ConfigProvider>'
    })
    expect(screen.getByRole('button', { name: zhCN.qrcode!.refreshText })).toBeInTheDocument()
    expect(screen.getByText(zhCN.qrcode!.expiredText!)).toBeInTheDocument()
    unmount()

    render({
      components: { ConfigProvider, QRCode },
      setup: () => ({ locale: zhTW, onRefresh: () => undefined }),
      template:
        '<ConfigProvider :locale="locale"><QRCode value="test" status="expired" @refresh="onRefresh" /></ConfigProvider>'
    })
    expect(screen.getByRole('button', { name: zhTW.qrcode!.refreshText })).toBeInTheDocument()
  })

  it('does not show overlay when active', () => {
    renderWithProps(QRCode, { value: 'test', status: 'active' })
    expect(screen.queryByText('QR code expired')).not.toBeInTheDocument()
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  describe('Accessibility', () => {
    it('has no violations for active, expired-with-refresh, and loading', async () => {
      const active = renderWithProps(QRCode, { value: 'https://example.com' })
      await expectNoA11yViolationsIsolated(active.container)

      const expired = render(QRCode, {
        props: { value: 'https://example.com', status: 'expired' },
        attrs: { onRefresh: () => undefined }
      })
      await expectNoA11yViolationsIsolated(expired.container)

      const loading = renderWithProps(QRCode, { value: 'https://example.com', status: 'loading' })
      await expectNoA11yViolationsIsolated(loading.container)
    })
  })
})
