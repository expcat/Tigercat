/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { renderToString } from '@vue/server-renderer'
import { h } from 'vue'
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

  it('names the active code without the encoded value', () => {
    renderWithProps(QRCode, { value: 'https://tigercat.dev' })
    expect(screen.getByRole('img', { name: 'QR Code' })).toBeInTheDocument()
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
    expect(container.querySelector('svg path')).toHaveAttribute('fill', '#ff0000')
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
    expect(screen.getByRole('img', { name: /QR code expired/ })).toBeInTheDocument()
    unmount()

    const loading = renderWithProps(QRCode, { value: 'test', status: 'loading' })
    expect(loading.container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('img', { name: /Loading/ })).toBeInTheDocument()
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
    expect(
      screen.getByRole('img', { name: `${zhCN.qrcode!.ariaLabel}, ${zhCN.qrcode!.expiredText}` })
    ).toBeInTheDocument()
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

  it('keeps an explicit image name and does not nest the refresh button inside it', () => {
    const active = render(QRCode, {
      props: { value: 'pay' },
      attrs: { 'aria-label': '付款二维码' }
    })
    expect(screen.getByRole('img', { name: '付款二维码' })).toBeInTheDocument()
    active.unmount()

    const expired = render(QRCode, {
      props: { value: 'pay', status: 'expired' },
      attrs: { 'aria-label': '付款二维码', onRefresh: () => undefined }
    })
    const img = screen.getByRole('img', { name: '付款二维码, QR code expired' })
    const button = screen.getByRole('button', { name: 'Refresh' })
    expect(img).not.toContainElement(button)
    expired.unmount()

    render(QRCode, {
      props: { value: 'pay' },
      attrs: { 'aria-labelledby': 'pay-title' }
    })
    expect(screen.getByRole('img')).toHaveAttribute('aria-labelledby', 'pay-title')
  })

  it('keeps the caller image name in server markup', async () => {
    const active = await renderToString(h(QRCode, { value: 'pay', 'aria-label': '付款二维码' }))
    expect(active).toContain('aria-label="付款二维码"')
    expect(active).not.toContain('aria-label="QR Code"')

    const expired = await renderToString(
      h(QRCode, {
        value: 'pay',
        status: 'expired',
        'aria-label': '付款二维码',
        onRefresh: () => undefined
      })
    )
    expect(expired).toContain('aria-label="付款二维码, QR code expired"')
    const imageEnd = expired.indexOf('</div>', expired.indexOf('role="img"'))
    const buttonAt = expired.indexOf('<button')
    expect(imageEnd).toBeGreaterThan(-1)
    expect(buttonAt).toBeGreaterThan(imageEnd)

    const labelled = await renderToString(
      h(QRCode, { value: 'pay', 'aria-labelledby': 'pay-title' })
    )
    expect(labelled).toContain('aria-labelledby="pay-title"')

    const localized = await renderToString(
      h(ConfigProvider, { locale: zhCN }, () => h(QRCode, { value: 'pay' }))
    )
    expect(localized).toContain('aria-label="二维码"')
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
