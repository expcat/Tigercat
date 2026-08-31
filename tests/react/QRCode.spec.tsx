/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React, { createRef } from 'react'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { QRCode } from '@expcat/tigercat-react/QRCode'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('QRCode', () => {
  it('renders with required value prop', () => {
    const { container } = render(<QRCode value="https://example.com" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders SVG with the given size', () => {
    const { container } = render(<QRCode value="test" size={200} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '200')
    expect(svg).toHaveAttribute('height', '200')
  })

  it('names the active code with the encoded value', () => {
    render(<QRCode value="https://tigercat.dev" />)
    expect(screen.getByRole('img', { name: /https:\/\/tigercat\.dev/ })).toBeInTheDocument()
  })

  it('forwards ref and root attributes', () => {
    const ref = createRef<HTMLDivElement>()
    render(<QRCode ref={ref} value="test" id="qr-root" data-testid="qr" />)
    expect(ref.current).toBeInstanceOf(HTMLDivElement)
    expect(screen.getByTestId('qr')).toHaveAttribute('id', 'qr-root')
  })

  it('applies className', () => {
    const { container } = render(<QRCode value="test" className="my-qr" />)
    expect(container.firstElementChild).toHaveClass('my-qr')
  })

  it('defaults to 128px', () => {
    const { container } = render(<QRCode value="test" />)
    expect(container.querySelector('svg')).toHaveAttribute('width', '128')
  })

  it('applies background and module colors', () => {
    const { container } = render(<QRCode value="test" bgColor="#eeeeee" color="#ff0000" />)
    expect(container.querySelector('svg > rect')).toHaveAttribute('fill', '#eeeeee')
    expect(container.querySelectorAll('svg rect[fill="#ff0000"]').length).toBeGreaterThan(0)
  })

  it('does not paint a refresh control without a handler', () => {
    render(<QRCode value="test" status="expired" />)
    expect(screen.getByText('QR code expired')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('exposes a refresh button when onRefresh is passed', () => {
    const onRefresh = vi.fn()
    render(<QRCode value="test" status="expired" onRefresh={onRefresh} />)
    fireEvent.click(screen.getByRole('button', { name: 'Refresh' }))
    expect(onRefresh).toHaveBeenCalledTimes(1)
  })

  it('hides the matrix while expired or loading', () => {
    const { container, rerender } = render(
      <QRCode value="test" status="expired" onRefresh={() => undefined} />
    )
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('status', { name: /QR code expired/ })).toBeInTheDocument()

    rerender(<QRCode value="test" status="loading" />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('status', { name: /Loading/ })).toBeInTheDocument()
  })

  it('uses official locale objects for aria and status text', () => {
    const { rerender } = render(
      <ConfigProvider locale={zhCN}>
        <QRCode value="test" status="expired" onRefresh={() => undefined} />
      </ConfigProvider>
    )
    expect(screen.getByRole('button', { name: zhCN.qrcode!.refreshText })).toBeInTheDocument()
    expect(screen.getByText(zhCN.qrcode!.expiredText!)).toBeInTheDocument()

    rerender(
      <ConfigProvider locale={zhTW}>
        <QRCode value="test" status="expired" onRefresh={() => undefined} />
      </ConfigProvider>
    )
    expect(screen.getByRole('button', { name: zhTW.qrcode!.refreshText })).toBeInTheDocument()
  })

  it('does not show overlay when active', () => {
    render(<QRCode value="test" status="active" />)
    expect(screen.queryByText('QR code expired')).not.toBeInTheDocument()
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  describe('Accessibility', () => {
    it('has no violations for active, expired-with-refresh, and loading', async () => {
      const { container, rerender } = render(<QRCode value="https://example.com" />)
      await expectNoA11yViolationsIsolated(container)

      rerender(<QRCode value="https://example.com" status="expired" onRefresh={() => undefined} />)
      await expectNoA11yViolationsIsolated(container)

      rerender(<QRCode value="https://example.com" status="loading" />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
})
