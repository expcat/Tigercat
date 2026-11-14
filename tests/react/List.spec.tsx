/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { List } from '@expcat/tigercat-react/List'
import { expectNoA11yViolationsIsolated } from '../utils/react'

const sampleData = [
  { key: 1, title: 'Item 1', description: 'Description 1' },
  { key: 2, title: 'Item 2', description: 'Description 2' },
  { key: 3, title: 'Item 3', description: 'Description 3' }
]

describe('List', () => {
  it('renders list items', () => {
    render(<List dataSource={sampleData} />)

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Description 1')).toBeInTheDocument()
  })

  it('renders empty state', () => {
    render(<List dataSource={[]} />)
    expect(screen.getByText('No data')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('renders custom empty text', () => {
    render(<List dataSource={[]} emptyText="No items" />)
    expect(screen.getByText('No items')).toBeInTheDocument()
  })

  it('renders header and footer', () => {
    render(<List dataSource={sampleData} header="Header" footer="Footer" />)

    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('isolates mounted row controls while loading and restores them afterwards', async () => {
    const user = userEvent.setup()
    const onItemClick = vi.fn()
    const { rerender } = render(<List dataSource={sampleData} loading onItemClick={onItemClick} />)

    expect(document.querySelector('[aria-busy="true"]')).toBeTruthy()
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
    const rowButton = screen.getByRole('button', { name: 'Item 1 Description 1' })
    expect(rowButton.closest('[inert]')).toBeTruthy()
    expect(rowButton).toBeDisabled()
    await user.tab()
    expect(rowButton).not.toHaveFocus()
    await user.click(rowButton)
    expect(onItemClick).not.toHaveBeenCalled()

    rerender(<List dataSource={sampleData} onItemClick={onItemClick} />)
    expect(rowButton.closest('[inert]')).toBeNull()
    await user.tab()
    expect(rowButton).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(onItemClick).toHaveBeenCalledTimes(1)
  })

  it('activates custom rows by keyboard without activating their nested controls', async () => {
    const user = userEvent.setup()
    const onItemClick = vi.fn()
    const onAction = vi.fn()
    render(
      <List
        dataSource={sampleData}
        onItemClick={onItemClick}
        renderItem={(item) => (
          <>
            <span>{item.title}</span>
            <button onClick={onAction}>Action {item.key}</button>
          </>
        )}
      />
    )
    const row = screen.getAllByRole('listitem')[0]
    expect(row).toHaveAttribute('tabindex', '0')
    await user.tab()
    expect(row).toHaveFocus()
    await user.keyboard('{Enter} ')
    expect(onItemClick).toHaveBeenCalledTimes(2)
    expect(onItemClick).toHaveBeenLastCalledWith(sampleData[0], 0)
    await user.tab()
    await user.keyboard('{Enter} ')
    expect(onAction).toHaveBeenCalledTimes(2)
    expect(onItemClick).toHaveBeenCalledTimes(2)
    expect(
      screen.getByRole('button', { name: 'Action 1' }).parentElement?.closest('button')
    ).toBeNull()
  })

  it('calls onPageChange when clicking next page', async () => {
    const onPageChange = vi.fn()
    const largeDataSource = Array.from({ length: 25 }, (_, i) => ({
      key: i + 1,
      title: `Item ${i + 1}`
    }))

    render(
      <List
        dataSource={largeDataSource}
        pagination={{ current: 1, pageSize: 10 }}
        onPageChange={onPageChange}
      />
    )

    await fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenCalledWith({ current: 2, pageSize: 10 })
  })

  it('renders dataSource as-is and derives page count from total in remote mode', () => {
    // Server-side pagination: dataSource holds only the current page (page 2 of 48 items)
    const pageTwoItems = Array.from({ length: 10 }, (_, i) => ({
      key: i + 11,
      title: `Item ${i + 11}`
    }))

    render(
      <List
        dataSource={pageTwoItems}
        pagination={{ remote: true, current: 2, pageSize: 10, total: 48 }}
      />
    )

    expect(screen.getAllByRole('listitem')).toHaveLength(10)
    expect(screen.getByText('Item 11')).toBeInTheDocument()
    expect(screen.getByText('Item 20')).toBeInTheDocument()
    // More than 3 pages: page-number buttons plus quick jumper
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: 'Page 5' })).toBeInTheDocument()
    expect(screen.getByLabelText('Go to')).toBeInTheDocument()
    expect(screen.getByText('Total 48 items')).toBeInTheDocument()
  })

  it('keeps client-side slicing when remote is not set (regression)', () => {
    const items = Array.from({ length: 15 }, (_, i) => ({
      key: i + 1,
      title: `Item ${i + 1}`
    }))

    render(<List dataSource={items} pagination={{ current: 2, pageSize: 10 }} />)

    expect(screen.getAllByRole('listitem')).toHaveLength(5)
    expect(screen.getByText('Item 11')).toBeInTheDocument()
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
  })

  it('enables keyboard activation only when clickable', async () => {
    const onItemClick = vi.fn()

    const { rerender } = render(<List dataSource={sampleData} />)
    const nonClickableItem = screen.getAllByRole('listitem')[0]
    expect(nonClickableItem.getAttribute('tabindex')).toBeNull()

    rerender(<List dataSource={sampleData} onItemClick={onItemClick} />)
    const clickableItem = screen.getAllByRole('listitem')[0]
    expect(clickableItem.getAttribute('tabindex')).toBeNull()
    const rowButton = screen.getAllByRole('button')[0]
    await fireEvent.click(rowButton)
    expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({ title: 'Item 1' }), 0)
  })

  it('honours a later pagination.current prop', () => {
    const items = Array.from({ length: 15 }, (_, i) => ({
      key: i + 1,
      title: `Item ${i + 1}`
    }))
    const { rerender } = render(
      <List dataSource={items} pagination={{ current: 2, pageSize: 10 }} />
    )
    expect(screen.getByText('Item 11')).toBeInTheDocument()
    rerender(<List dataSource={items} pagination={{ current: 1, pageSize: 10 }} />)
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.queryByText('Item 11')).not.toBeInTheDocument()
  })

  it('applies grid gutter as gap style', () => {
    render(<List dataSource={sampleData} grid={{ gutter: 12, column: 3 }} bordered={false} />)

    const grid = document.querySelector('.grid') as HTMLElement | null
    expect(grid).toBeTruthy()
    expect(grid?.style.gap).toBe('12px')
  })

  it('provides a named virtual list with keyboard scrolling and one semantic item per row', async () => {
    const largeDataSource = Array.from({ length: 100 }, (_, index) => ({
      key: index,
      title: `Item ${index}`
    }))

    render(
      <List
        dataSource={largeDataSource}
        pagination={false}
        virtual
        virtualHeight={80}
        virtualItemHeight={20}
        virtualOverscan={0}
      />
    )

    const renderedItems = screen.getAllByRole('listitem')
    expect(renderedItems.length).toBeLessThan(largeDataSource.length)
    expect(screen.getByText('Item 0')).toBeInTheDocument()
    expect(screen.queryByText('Item 50')).not.toBeInTheDocument()
    const list = screen.getByRole('list', { name: 'Scrollable region' })
    expect(renderedItems).toHaveLength(4)
    expect(renderedItems[0]).toHaveAttribute('aria-setsize', '100')
    expect(renderedItems[0]).toHaveAttribute('aria-posinset', '1')
    const user = userEvent.setup()
    await user.tab()
    expect(list).toHaveFocus()
    await user.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}')
    expect(list.scrollTop).toBe(20)
    expect(screen.queryByText('Item 0')).not.toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<List dataSource={sampleData} />)
    await expectNoA11yViolationsIsolated(container)
  })
})
