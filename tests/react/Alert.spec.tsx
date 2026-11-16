/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, act, fireEvent } from '@testing-library/react'
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
    const root = screen.getByText('Alert Title').closest('.relative')

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(root).not.toHaveAttribute('role')
    expect(root).not.toHaveAttribute('aria-live')
    expect(screen.getByText('Alert Title')).toBeInTheDocument()
    expect(screen.getByText('Alert description')).toBeInTheDocument()
  })

  it('announces info inserted after the document has painted', () => {
    const performanceRef = document.defaultView?.performance
    if (!performanceRef) throw new Error('missing performance')
    const original = performanceRef.getEntriesByType
    performanceRef.getEntriesByType = (type: string) => {
      if (type === 'paint') {
        return [
          {
            name: 'first-contentful-paint',
            entryType: 'paint',
            startTime: 1,
            duration: 0,
            toJSON: () => ({})
          } as PerformanceEntry
        ]
      }
      return original.call(performanceRef, type)
    }

    try {
      render(<Alert type="info" title="Inserted" />)
      const root = screen.getByText('Inserted').closest('.relative')
      expect(root).toHaveAttribute('role', 'status')
      expect(root).toHaveAttribute('aria-live', 'polite')
    } finally {
      performanceRef.getEntriesByType = original
    }
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
    expect(screen.queryByText('Closable')).not.toBeInTheDocument()
  })

  it('keeps a controlled alert mounted until open becomes false', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    render(<Alert title="Closable" closable open onOpenChange={onOpenChange} />)

    await user.click(screen.getByRole('button', { name: 'Close alert' }))

    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(screen.getByText('Closable')).toBeInTheDocument()
  })

  it('keeps the alert open when its close request is canceled', async () => {
    const onOpenChange = vi.fn()
    render(
      <Alert
        title="Keep open"
        closable
        onClose={(event) => event.preventDefault()}
        onOpenChange={onOpenChange}
      />
    )

    await userEvent.setup().click(screen.getByRole('button', { name: 'Close alert' }))

    expect(screen.getByText('Keep open')).toBeInTheDocument()
    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Close alert' })).toHaveFocus()
  })

  it('hides when open is false', () => {
    const { rerender } = render(<Alert title="Closable" closable open />)
    expect(screen.getByText('Closable')).toBeInTheDocument()
    rerender(<Alert title="Closable" closable open={false} />)
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
      expect(screen.queryByText('Auto-close Alert')).not.toBeInTheDocument()
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
      expect(container.querySelector('[style*="width"]')).toBeInTheDocument()
    })

    it('pauses while the pointer or focus is inside and continues after leaving', async () => {
      vi.useFakeTimers()
      const onClose = vi.fn()
      const { unmount } = render(
        <Alert title="Hold" duration={5000} onClose={onClose}>
          <button type="button">Stay</button>
        </Alert>
      )
      const root = screen.getByText('Hold').closest('.relative')
      if (!root) throw new Error('missing alert root')

      fireEvent.pointerEnter(root)
      await act(() => {
        vi.advanceTimersByTime(5000)
      })
      expect(onClose).not.toHaveBeenCalled()
      expect(screen.getByText('Hold')).toBeInTheDocument()

      fireEvent.pointerLeave(root)
      await act(() => {
        vi.advanceTimersByTime(4999)
      })
      expect(onClose).not.toHaveBeenCalled()
      await act(() => {
        vi.advanceTimersByTime(50)
      })
      expect(onClose).toHaveBeenCalledTimes(1)
      unmount()

      onClose.mockClear()
      render(
        <Alert title="Focus" duration={5000} onClose={onClose}>
          <button type="button">Stay</button>
        </Alert>
      )
      fireEvent.focusIn(screen.getByRole('button', { name: 'Stay' }))
      await act(() => {
        vi.advanceTimersByTime(5000)
      })
      expect(onClose).not.toHaveBeenCalled()

      fireEvent.focusOut(screen.getByRole('button', { name: 'Stay' }))
      await act(() => {
        vi.advanceTimersByTime(5000)
      })
      expect(onClose).toHaveBeenCalledTimes(1)
      vi.useRealTimers()
    })
  })

  it('renders the action after the description with the description classes', () => {
    render(
      <Alert title="Title" description="Description" action={<button type="button">Act</button>} />
    )
    const title = screen.getByText('Title')
    const description = screen.getByText('Description')
    const action = screen.getByRole('button', { name: 'Act' }).parentElement
    expect(action).toHaveAttribute('data-tiger-alert-action', '')
    expect(title.compareDocumentPosition(description) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
    expect(
      description.compareDocumentPosition(action as Node) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(action).toHaveClass('text-sm', 'mt-1', 'text-[var(--tiger-text-secondary)]')
  })

  it('renders in banner mode', () => {
    render(<Alert title="Banner Alert" banner />)
    expect(screen.getByText('Banner Alert')).toBeInTheDocument()
  })
})
