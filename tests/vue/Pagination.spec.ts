/**
 * @vitest-environment happy-dom
 */

import { nextTick } from 'vue'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { Pagination } from '@expcat/tigercat-vue'
import { expectNoA11yViolationsIsolated } from '../utils'

describe('Pagination', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders navigation with default aria-label', () => {
    const { container } = render(Pagination, { props: { total: 100 } })
    const nav = container.querySelector('nav')
    expect(nav).toBeInTheDocument()
    expect(nav).toHaveAttribute('role', 'navigation')
    expect(nav).toHaveAttribute('aria-label', 'Pagination')
  })

  it('allows overriding aria-label via attrs', () => {
    const { container } = render(Pagination, {
      props: { total: 100 },
      attrs: { 'aria-label': 'My pagination' }
    })
    expect(container.querySelector('nav')).toHaveAttribute('aria-label', 'My pagination')
  })

  it('merges attrs.class with className prop', () => {
    const { container } = render(Pagination, {
      props: { total: 100, className: 'from-prop' },
      attrs: { class: 'from-attrs' }
    })
    expect(container.querySelector('nav')).toHaveClass('from-prop')
    expect(container.querySelector('nav')).toHaveClass('from-attrs')
  })

  it('emits change when a page button is clicked', async () => {
    const onChange = vi.fn()
    render(Pagination, {
      props: { total: 100, pageSize: 10 },
      attrs: { onChange }
    })
    await fireEvent.click(screen.getByLabelText('Page 2'))
    expect(onChange).toHaveBeenCalledWith(2, 10)
  })

  it('sets aria-current on the active page', () => {
    render(Pagination, { props: { total: 100, pageSize: 10, current: 3 } })
    expect(screen.getByLabelText('Page 3')).toHaveAttribute('aria-current', 'page')
  })

  it('disables prev/next on boundaries', () => {
    const { unmount } = render(Pagination, {
      props: { total: 100, pageSize: 10, current: 1 }
    })
    expect(screen.getByLabelText('Previous page')).toBeDisabled()

    unmount()
    render(Pagination, { props: { total: 100, pageSize: 10, current: 10 } })
    expect(screen.getByLabelText('Next page')).toBeDisabled()
  })

  it('disables all page buttons when disabled', () => {
    render(Pagination, { props: { total: 100, pageSize: 10, disabled: true } })
    screen.getAllByRole('button').forEach((btn) => expect(btn).toBeDisabled())
  })

  it('hides on single page when hideOnSinglePage is true', () => {
    const { container } = render(Pagination, {
      props: { total: 5, pageSize: 10, hideOnSinglePage: true }
    })
    expect(container.querySelector('nav')).not.toBeInTheDocument()
  })

  it('jumps to page on Enter when showQuickJumper', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(Pagination, {
      props: { total: 100, pageSize: 10, showQuickJumper: true },
      attrs: { onChange }
    })

    const input = screen.getByLabelText('Go to') as HTMLInputElement
    await user.type(input, '5')
    await user.keyboard('{Enter}')

    expect(onChange).toHaveBeenCalledWith(5, 10)
    expect(input.value).toBe('')
  })

  it('normalizes quick jumper input after idle validation', async () => {
    vi.useFakeTimers()

    render(Pagination, {
      props: { total: 100, pageSize: 10, showQuickJumper: true }
    })

    const input = screen.getByLabelText('Go to') as HTMLInputElement
    await fireEvent.update(input, '99')

    expect(input.value).toBe('99')

    vi.advanceTimersByTime(120)
    await nextTick()

    expect(input.value).toBe('10')
  })

  it('loads pagination locale lazily', async () => {
    render(Pagination, {
      props: {
        total: 100,
        pageSize: 10,
        showQuickJumper: true,
        locale: () =>
          Promise.resolve({
            zhCN: {
              pagination: {
                jumpToText: '跳至',
                pageText: '页'
              }
            }
          })
      }
    })

    expect(screen.getByLabelText('Go to')).toBeInTheDocument()
    expect(await screen.findByLabelText('跳至')).toBeInTheDocument()
    expect(screen.getByText('页')).toBeInTheDocument()
  })

  it('reports a size change only through page-size-change, never a duplicate change', async () => {
    const onPageSizeChange = vi.fn()
    const onChange = vi.fn()
    render(Pagination, {
      props: {
        total: 100,
        pageSize: 10,
        current: 10,
        showSizeChanger: true,
        pageSizeOptions: [10, 20, 50]
      },
      attrs: { onPageSizeChange, onChange }
    })

    // Use default English label from i18n system
    await fireEvent.update(screen.getByLabelText('/ page'), '50')

    // current page 10 is clamped to 2 (100/50), carried by page-size-change
    expect(onPageSizeChange).toHaveBeenCalledWith(2, 50)
    // the clamp must not also surface as a page-navigation event
    expect(onChange).not.toHaveBeenCalled()
  })

  it('applies size classes', () => {
    const { container } = render(Pagination, {
      props: { total: 100, pageSize: 10, size: 'small' }
    })
    expect(container.querySelector('button')).toHaveClass('h-7')
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(Pagination)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      const { container } = render(Pagination)
      expect(container.firstChild).toBeTruthy()
    })
  })
})
