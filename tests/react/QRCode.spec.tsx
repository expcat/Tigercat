/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { ConfigProvider, QRCode } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('QRCode', () => {
  // --- Basic rendering ---
  it('renders with required value prop', () => {
    const { container } = render(<QRCode value="https://example.com" />)
    expect(container.querySelector('svg')).toBeInTheDocument()
  })

  it('renders SVG with correct size', () => {
    const { container } = render(<QRCode value="test" size={200} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '200')
    expect(svg).toHaveAttribute('height', '200')
  })

  it('renders an accessible img role', () => {
    const { container } = render(<QRCode value="test" />)
    expect(container.querySelector('[role="img"]')).toBeInTheDocument()
  })

  it('has aria-label QR Code', () => {
    const { container } = render(<QRCode value="test" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-label', 'QR Code')
  })

  it('keeps default English status text outside ConfigProvider', () => {
    render(<QRCode value="test" status="expired" />)
    expect(screen.getByLabelText('QR Code')).toBeInTheDocument()
    expect(screen.getByText('QR code expired')).toBeInTheDocument()
    expect(screen.getByText('Refresh')).toBeInTheDocument()
  })

  it('applies className', () => {
    const { container } = render(<QRCode value="test" className="my-qr" />)
    expect(container.querySelector('.my-qr')).toBeInTheDocument()
  })

  // --- Sizes ---
  it('defaults to 128px', () => {
    const { container } = render(<QRCode value="test" />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '128')
  })

  it('applies custom size', () => {
    const { container } = render(<QRCode value="test" size={256} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '256')
  })

  // --- Colors ---
  it('applies background color', () => {
    const { container } = render(<QRCode value="test" bgColor="#eeeeee" />)
    const bgRect = container.querySelector('svg > rect')
    expect(bgRect).toHaveAttribute('fill', '#eeeeee')
  })

  it('applies foreground color to modules', () => {
    const { container } = render(<QRCode value="test" color="#ff0000" />)
    const rects = container.querySelectorAll('svg rect[fill="#ff0000"]')
    expect(rects.length).toBeGreaterThan(0)
  })

  // --- Status ---
  it('shows expired overlay', () => {
    render(<QRCode value="test" status="expired" />)
    expect(screen.getByText('QR code expired')).toBeInTheDocument()
    expect(screen.getByText('Refresh')).toBeInTheDocument()
  })

  it('calls onRefresh on expired click', () => {
    const onRefresh = vi.fn()
    render(<QRCode value="test" status="expired" onRefresh={onRefresh} />)
    fireEvent.click(screen.getByText('Refresh'))
    expect(onRefresh).toHaveBeenCalled()
  })

  it('shows loading overlay', () => {
    render(<QRCode value="test" status="loading" />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('uses ConfigProvider qrcode locale for aria and status text', () => {
    const { rerender } = render(
      <ConfigProvider
        locale={{
          qrcode: {
            ariaLabel: '全局二维码',
            expiredText: '全局已过期',
            refreshText: '全局刷新',
            loadingText: '全局加载中'
          }
        }}>
        <QRCode value="test" status="expired" />
      </ConfigProvider>
    )

    expect(screen.getByLabelText('全局二维码')).toBeInTheDocument()
    expect(screen.getByText('全局已过期')).toBeInTheDocument()
    expect(screen.getByText('全局刷新')).toBeInTheDocument()

    rerender(
      <ConfigProvider locale={{ qrcode: { loadingText: '全局加载中' } }}>
        <QRCode value="test" status="loading" />
      </ConfigProvider>
    )
    expect(screen.getByText('全局加载中')).toBeInTheDocument()
  })

  it('lets the qrcode locale prop override ConfigProvider text', () => {
    render(
      <ConfigProvider
        locale={{
          qrcode: {
            ariaLabel: '全局二维码',
            expiredText: '全局已过期',
            refreshText: '全局刷新'
          }
        }}>
        <QRCode
          value="test"
          status="expired"
          locale={{
            qrcode: {
              ariaLabel: '局部二维码',
              expiredText: '局部已过期',
              refreshText: '局部刷新'
            }
          }}
        />
      </ConfigProvider>
    )

    expect(screen.getByLabelText('局部二维码')).toBeInTheDocument()
    expect(screen.getByText('局部已过期')).toBeInTheDocument()
    expect(screen.getByText('局部刷新')).toBeInTheDocument()
    expect(screen.queryByText('全局已过期')).toBeNull()
  })

  it('does not show overlay when active', () => {
    render(<QRCode value="test" status="active" />)
    expect(screen.queryByText('QR code expired')).not.toBeInTheDocument()
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
  })

  // --- Deterministic rendering ---
  it('generates different patterns for different values', () => {
    const { container: c1 } = render(<QRCode value="aaa" />)
    const { container: c2 } = render(<QRCode value="bbb" />)
    const rects1 = c1.querySelectorAll('svg rect').length
    const rects2 = c2.querySelectorAll('svg rect').length
    expect(rects1).toBeGreaterThan(1)
    expect(rects2).toBeGreaterThan(1)
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<QRCode value="https://example.com" />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {})
})
