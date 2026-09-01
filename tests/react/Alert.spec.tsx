/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Alert } from '@expcat/tigercat-react/Alert'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { jaJP } from '@expcat/tigercat-core/locales/ja-JP'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('Alert', () => {
  it('renders title and description without a live role by default', () => {
    render(<Alert title="Alert Title" description="Alert description" />)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('Alert Title')).toBeInTheDocument()
    expect(screen.getByText('Alert description')).toBeInTheDocument()
  })

  it('uses role=alert only for error content', () => {
    const { rerender } = render(<Alert type="error" title="Failed" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Failed')

    rerender(<Alert type="info" title="Note" />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('Note')).toBeInTheDocument()
  })

  it('empty alert is not a live region', () => {
    const { container } = render(<Alert />)
    expect(container.querySelector('[role="alert"]')).not.toBeInTheDocument()
    expect(container.querySelector('[role="status"]')).not.toBeInTheDocument()
  })

  it('lets the caller override role', () => {
    render(<Alert type="error" title="Failed" role="status" />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Failed')
  })

  it('renders each type with an icon', () => {
    const types = ['info', 'success', 'warning', 'error'] as const
    for (const type of types) {
      const { container, unmount } = render(<Alert type={type} title={type} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
      unmount()
    }
  })

  it('renders each size', () => {
    const sizes = ['sm', 'md', 'lg'] as const
    for (const size of sizes) {
      const { unmount } = render(<Alert size={size} title={size} />)
      expect(screen.getByText(size)).toBeInTheDocument()
      unmount()
    }
  })

  it('renders children when no title/description', () => {
    render(<Alert>Default content</Alert>)
    expect(screen.getByText('Default content')).toBeInTheDocument()
  })

  it('keeps children when title is set', () => {
    render(
      <Alert title="Saved">
        <button type="button">Undo</button>
      </Alert>
    )
    expect(screen.getByText('Saved')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()
  })

  it('renders titleSlot and descriptionSlot overriding props', () => {
    render(
      <Alert
        title="prop title"
        description="prop desc"
        titleSlot={<strong>Slot Title</strong>}
        descriptionSlot={<em>Slot Description</em>}
      />
    )

    expect(screen.getByText('Slot Title')).toBeInTheDocument()
    expect(screen.getByText('Slot Description')).toBeInTheDocument()
    expect(screen.queryByText('prop title')).not.toBeInTheDocument()
    expect(screen.queryByText('prop desc')).not.toBeInTheDocument()
  })

  it('hides icon when showIcon is false', () => {
    const { container } = render(<Alert title="Alert" showIcon={false} />)
    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('marks type and close icons as decorative', () => {
    const { container } = render(<Alert title="Note" closable />)
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
    for (const svg of svgs) {
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    }
  })

  it('merges className', () => {
    const { container } = render(<Alert title="Alert" className="custom-class" />)
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('emits close without unmounting', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<Alert title="Closable" closable onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: 'Close alert' }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Closable')).toBeInTheDocument()
  })

  it('hides when visible is false', () => {
    const { rerender } = render(<Alert title="Closable" closable visible />)
    expect(screen.getByText('Closable')).toBeInTheDocument()
    rerender(<Alert title="Closable" closable visible={false} />)
    expect(screen.queryByText('Closable')).not.toBeInTheDocument()
  })

  it('does not bubble close clicks', async () => {
    const user = userEvent.setup()
    const onWrapperClick = vi.fn()
    render(
      <div onClick={onWrapperClick}>
        <Alert title="Closable" closable />
      </div>
    )
    await user.click(screen.getByRole('button', { name: 'Close alert' }))
    expect(onWrapperClick).not.toHaveBeenCalled()
  })

  it('uses official locale objects for the close name', () => {
    const { rerender } = render(
      <ConfigProvider locale={zhCN}>
        <Alert title="提示" closable />
      </ConfigProvider>
    )
    expect(screen.getByRole('button', { name: '关闭提示' })).toBeInTheDocument()

    rerender(
      <ConfigProvider locale={zhTW}>
        <Alert title="提示" closable />
      </ConfigProvider>
    )
    expect(screen.getByRole('button', { name: '關閉提示' })).toBeInTheDocument()

    rerender(
      <ConfigProvider locale={jaJP}>
        <Alert title="注意" closable />
      </ConfigProvider>
    )
    expect(screen.getByRole('button', { name: 'アラートを閉じる' })).toBeInTheDocument()
  })

  it('uses custom closeAriaLabel', () => {
    render(<Alert title="Alert" closable closeAriaLabel="关闭" />)
    expect(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument()
  })

  it('has no a11y violations for a static info, an error, and several on a page', async () => {
    const { container } = render(
      <div>
        <Alert title="Info" description="Static" />
        <Alert type="error" title="Error" description="Inserted" closable />
        <Alert type="success" title="One" />
        <Alert type="warning" title="Two" />
        <Alert showIcon={false} title="No icon" />
      </div>
    )

    await expectNoA11yViolationsIsolated(container)
  })

  describe('Auto-close', () => {
    it('fires onClose after duration without requiring closable', async () => {
      vi.useFakeTimers()
      const onClose = vi.fn()
      render(<Alert title="Auto-close Alert" duration={3000} onClose={onClose} />)

      expect(screen.getByText('Auto-close Alert')).toBeInTheDocument()

      await act(() => {
        vi.advanceTimersByTime(3000)
      })
      expect(onClose).toHaveBeenCalledTimes(1)
      expect(onClose.mock.calls[0][0]).toBeInstanceOf(Event)
      expect(screen.getByText('Auto-close Alert')).toBeInTheDocument()
      vi.useRealTimers()
    })

    it('does not auto-close when duration is not set', async () => {
      vi.useFakeTimers()
      const onClose = vi.fn()
      render(<Alert title="No Auto-close" closable onClose={onClose} />)

      await act(() => {
        vi.advanceTimersByTime(10000)
      })
      expect(onClose).not.toHaveBeenCalled()
      vi.useRealTimers()
    })

    it('clicking close clears the duration timer', async () => {
      vi.useFakeTimers()
      const onClose = vi.fn()
      render(<Alert title="Auto-close Alert" closable duration={3000} onClose={onClose} />)

      await act(async () => {
        screen.getByRole('button', { name: 'Close alert' }).click()
      })
      expect(onClose).toHaveBeenCalledTimes(1)

      await act(() => {
        vi.advanceTimersByTime(3000)
      })
      expect(onClose).toHaveBeenCalledTimes(1)
      vi.useRealTimers()
    })

    it('shows a countdown bar without closable', () => {
      const { container } = render(<Alert title="Ticking" duration={5000} showCountdown />)
      expect(container.querySelector('[style*="animation-duration"]')).toBeInTheDocument()
    })
  })

  it('renders in banner mode', () => {
    render(<Alert title="Banner Alert" banner />)
    expect(screen.getByText('Banner Alert')).toBeInTheDocument()
  })
})
