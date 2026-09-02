/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { h } from 'vue'
import { Alert } from '@expcat/tigercat-vue/Alert'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import { jaJP } from '@expcat/tigercat-core/locales/ja-JP'
import { renderWithProps, renderWithSlots, expectNoA11yViolationsIsolated } from '../utils'

describe('Alert', () => {
  it('renders title and description without a live role by default', () => {
    renderWithProps(Alert, {
      title: 'Alert Title',
      description: 'Alert description'
    })

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('Alert Title')).toBeInTheDocument()
    expect(screen.getByText('Alert description')).toBeInTheDocument()
  })

  it('uses role=alert only for error content', () => {
    const { unmount } = renderWithProps(Alert, { type: 'error', title: 'Failed' })
    expect(screen.getByRole('alert')).toHaveTextContent('Failed')
    unmount()

    renderWithProps(Alert, { type: 'info', title: 'Note' })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText('Note')).toBeInTheDocument()
  })

  it('empty alert is not a live region', () => {
    const { container } = renderWithProps(Alert, {})
    expect(container.querySelector('[role="alert"]')).not.toBeInTheDocument()
    expect(container.querySelector('[role="status"]')).not.toBeInTheDocument()
  })

  it('lets the caller override role', () => {
    renderWithProps(Alert, { type: 'error', title: 'Failed' }, { attrs: { role: 'status' } })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Failed')
  })

  it('renders slots for title/description', () => {
    renderWithSlots(
      Alert,
      {
        title: 'Custom Title',
        description: 'Custom Description'
      },
      {
        type: 'info'
      }
    )

    expect(screen.getByText('Custom Title')).toBeInTheDocument()
    expect(screen.getByText('Custom Description')).toBeInTheDocument()
  })

  it('renders default slot content when no title/description', () => {
    renderWithSlots(Alert, {
      default: 'Default content'
    })

    expect(screen.getByText('Default content')).toBeInTheDocument()
  })

  it('keeps the default slot when title is set', () => {
    renderWithSlots(
      Alert,
      {
        default: () => h('button', { type: 'button' }, 'Undo')
      },
      { title: 'Saved' }
    )
    expect(screen.getByText('Saved')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()
  })

  it('hides icon when showIcon is false', () => {
    const { container } = renderWithProps(Alert, {
      title: 'Alert',
      showIcon: false
    })

    expect(container.querySelector('svg')).not.toBeInTheDocument()
  })

  it('marks type and close icons as decorative', () => {
    const { container } = renderWithProps(Alert, { title: 'Note', closable: true })
    const svgs = container.querySelectorAll('svg')
    expect(svgs.length).toBeGreaterThan(0)
    for (const svg of svgs) {
      expect(svg.getAttribute('aria-hidden')).toBe('true')
    }
  })

  it('merges className and attrs.class', () => {
    const { container } = renderWithProps(
      Alert,
      {
        title: 'Alert',
        className: 'custom-class'
      },
      {
        attrs: {
          class: 'attrs-class'
        }
      }
    )

    const root = container.querySelector('.custom-class')
    expect(root).toBeInTheDocument()
    expect(root).toHaveClass('attrs-class')
  })

  it('emits close without unmounting', async () => {
    const onClose = vi.fn()

    render(Alert, {
      props: {
        title: 'Closable Alert',
        closable: true,
        onClose
      }
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Close alert' }))

    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Closable Alert')).toBeInTheDocument()
  })

  it('hides when open is false', async () => {
    const { rerender } = renderWithProps(Alert, {
      title: 'Closable Alert',
      closable: true,
      open: true
    })
    expect(screen.getByText('Closable Alert')).toBeInTheDocument()
    await rerender({ title: 'Closable Alert', closable: true, open: false })
    expect(screen.queryByText('Closable Alert')).not.toBeInTheDocument()
  })

  it('uses official locale objects for the close name', () => {
    const { unmount } = render({
      components: { ConfigProvider, Alert },
      template: '<ConfigProvider :locale="locale"><Alert title="提示" closable /></ConfigProvider>',
      setup: () => ({ locale: zhCN })
    })
    expect(screen.getByRole('button', { name: '关闭提示' })).toBeInTheDocument()
    unmount()

    const second = render({
      components: { ConfigProvider, Alert },
      template: '<ConfigProvider :locale="locale"><Alert title="提示" closable /></ConfigProvider>',
      setup: () => ({ locale: zhTW })
    })
    expect(screen.getByRole('button', { name: '關閉提示' })).toBeInTheDocument()
    second.unmount()

    render({
      components: { ConfigProvider, Alert },
      template: '<ConfigProvider :locale="locale"><Alert title="注意" closable /></ConfigProvider>',
      setup: () => ({ locale: jaJP })
    })
    expect(screen.getByRole('button', { name: 'アラートを閉じる' })).toBeInTheDocument()
  })

  it('uses custom closeAriaLabel', () => {
    renderWithProps(Alert, {
      title: 'Alert',
      closable: true,
      closeAriaLabel: '关闭'
    })

    expect(screen.getByRole('button', { name: '关闭' })).toBeInTheDocument()
  })

  it('has no a11y violations for a static info, an error, and several on a page', async () => {
    const { container } = render({
      components: { Alert },
      template: `
        <div>
          <Alert title="Info" description="Static" />
          <Alert type="error" title="Error" description="Inserted" closable />
          <Alert type="success" title="One" />
          <Alert type="warning" title="Two" />
          <Alert :show-icon="false" title="No icon" />
        </div>
      `
    })

    await expectNoA11yViolationsIsolated(container)
  })

  describe('Auto-close', () => {
    it('emits close after duration without requiring closable', async () => {
      vi.useFakeTimers()
      const onClose = vi.fn()
      renderWithProps(Alert, {
        title: 'Auto-close Alert',
        duration: 3000,
        onClose
      })

      expect(screen.getByText('Auto-close Alert')).toBeInTheDocument()

      vi.advanceTimersByTime(3000)
      await vi.waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1)
      })
      expect(onClose.mock.calls[0][0]).toBeInstanceOf(Event)
      expect(screen.getByText('Auto-close Alert')).toBeInTheDocument()
      vi.useRealTimers()
    })

    it('does not auto-close when duration is not set', async () => {
      vi.useFakeTimers()
      const onClose = vi.fn()
      renderWithProps(Alert, {
        title: 'No Auto-close',
        closable: true,
        onClose
      })

      vi.advanceTimersByTime(10000)
      expect(onClose).not.toHaveBeenCalled()
      vi.useRealTimers()
    })

    it('clicking close clears the duration timer', async () => {
      vi.useFakeTimers()
      const onClose = vi.fn()
      renderWithProps(Alert, {
        title: 'Auto-close Alert',
        closable: true,
        duration: 3000,
        onClose
      })

      await fireEvent.click(screen.getByRole('button', { name: 'Close alert' }))
      expect(onClose).toHaveBeenCalledTimes(1)

      vi.advanceTimersByTime(3000)
      expect(onClose).toHaveBeenCalledTimes(1)
      vi.useRealTimers()
    })
  })

  it('renders in banner mode', () => {
    renderWithProps(Alert, {
      title: 'Banner Alert',
      banner: true
    })
    expect(screen.getByText('Banner Alert')).toBeInTheDocument()
  })
})
