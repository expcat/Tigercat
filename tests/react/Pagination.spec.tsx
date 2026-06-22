/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

describe('Pagination', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders navigation with default aria-label', () => {
    const { container } = render(<Pagination total={100} />)
    const nav = container.querySelector('nav')
    expect(nav).toBeInTheDocument()
    expect(nav).toHaveAttribute('role', 'navigation')
    expect(nav).toHaveAttribute('aria-label', 'Pagination')
  })

  it('allows overriding aria-label via props', () => {
    const { container } = render(<Pagination total={100} aria-label="My pagination" />)
    expect(container.querySelector('nav')).toHaveAttribute('aria-label', 'My pagination')
  })

  it('calls onChange when a page button is clicked', async () => {
    const onChange = vi.fn()
    render(<Pagination total={100} pageSize={10} onChange={onChange} />)
    await fireEvent.click(screen.getByLabelText('Page 2'))
    expect(onChange).toHaveBeenCalledWith(2, 10)
  })

  it('sets aria-current on the active page', () => {
    render(<Pagination total={100} pageSize={10} current={3} />)
    expect(screen.getByLabelText('Page 3')).toHaveAttribute('aria-current', 'page')
  })

  it('disables prev/next on boundaries', () => {
    const { unmount } = render(<Pagination total={100} pageSize={10} current={1} />)
    expect(screen.getByLabelText('Previous page')).toBeDisabled()

    unmount()
    render(<Pagination total={100} pageSize={10} current={10} />)
    expect(screen.getByLabelText('Next page')).toBeDisabled()
  })

  it('disables all page buttons when disabled', () => {
    render(<Pagination total={100} pageSize={10} disabled />)
    screen.getAllByRole('button').forEach((btn) => expect(btn).toBeDisabled())
  })

  it('hides on single page when hideOnSinglePage is true', () => {
    const { container } = render(<Pagination total={5} pageSize={10} hideOnSinglePage />)
    expect(container.querySelector('nav')).not.toBeInTheDocument()
  })

  it('jumps to page on Enter when showQuickJumper', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<Pagination total={100} pageSize={10} showQuickJumper onChange={onChange} />)

    const input = screen.getByLabelText('Go to') as HTMLInputElement
    await user.type(input, '5')
    await user.keyboard('{Enter}')

    expect(onChange).toHaveBeenCalledWith(5, 10)
    expect(input.value).toBe('')
  })

  it('normalizes quick jumper input after idle validation', () => {
    vi.useFakeTimers()

    render(<Pagination total={100} pageSize={10} showQuickJumper />)

    const input = screen.getByLabelText('Go to') as HTMLInputElement
    fireEvent.change(input, { target: { value: '99' } })

    expect(input.value).toBe('99')

    act(() => {
      vi.advanceTimersByTime(120)
    })

    expect(input.value).toBe('10')
  })

  it('loads pagination locale lazily', async () => {
    render(
      <Pagination
        total={100}
        pageSize={10}
        showQuickJumper
        locale={() =>
          Promise.resolve({
            zhCN: {
              pagination: {
                jumpToText: '跳至',
                pageText: '页'
              }
            }
          })
        }
      />
    )

    expect(screen.getByLabelText('Go to')).toBeInTheDocument()
    expect(await screen.findByLabelText('跳至')).toBeInTheDocument()
    expect(screen.getByText('页')).toBeInTheDocument()
  })

  it('calls onPageSizeChange and adjusts page when needed', async () => {
    const onPageSizeChange = vi.fn()
    render(
      <Pagination
        total={100}
        pageSize={10}
        current={10}
        showSizeChanger
        pageSizeOptions={[10, 20, 50]}
        onPageSizeChange={onPageSizeChange}
      />
    )

    await fireEvent.change(screen.getByLabelText('/ page'), {
      target: { value: '50' }
    })

    expect(onPageSizeChange).toHaveBeenCalledWith(2, 50)
  })

  it('applies size classes', () => {
    const { container } = render(<Pagination total={100} pageSize={10} size="small" />)
    expect(container.querySelector('button')).toHaveClass('h-7')
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(<Pagination />)
      await expectNoA11yViolationsIsolated(container)
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      const { container } = render(<Pagination />)
      expect(container.firstChild).toBeTruthy()
    })
  })
})
