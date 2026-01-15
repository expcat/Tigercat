/**
 * @vitest-environment happy-dom
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { List } from '@expcat/tigercat-react'
import { expectNoA11yViolations } from '../utils/react'

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
    expect(screen.getByRole('status')).toHaveTextContent('No data')
  })

  it('renders custom empty text', () => {
    render(<List dataSource={[]} emptyText="No items" />)
    expect(screen.getByRole('status')).toHaveTextContent('No items')
  })

  it('renders header and footer', () => {
    render(<List dataSource={sampleData} header="Header" footer="Footer" />)

    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('sets aria-busy and shows loading overlay', () => {
    render(<List dataSource={sampleData} loading />)

    expect(screen.getByRole('list')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
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

    await fireEvent.click(screen.getByText('Next'))
    expect(onPageChange).toHaveBeenCalledWith({ current: 2, pageSize: 10 })
  })

  it('enables keyboard activation only when clickable', async () => {
    const onItemClick = vi.fn()

    const { rerender } = render(<List dataSource={sampleData} />)
    const nonClickableItem = screen.getAllByRole('listitem')[0]
    expect(nonClickableItem.getAttribute('tabindex')).toBeNull()

    rerender(<List dataSource={sampleData} onItemClick={onItemClick} />)
    const clickableItem = screen.getAllByRole('listitem')[0]
    expect(clickableItem).toHaveAttribute('tabindex', '0')

    await fireEvent.keyDown(clickableItem, { key: 'Enter' })
    expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({ title: 'Item 1' }), 0)
  })

  it('applies grid gutter as gap style', () => {
    render(<List dataSource={sampleData} grid={{ gutter: 12, column: 3 }} bordered="none" />)

    const grid = document.querySelector('.grid') as HTMLElement | null
    expect(grid).toBeTruthy()
    expect(grid?.style.gap).toBe('12px')
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<List dataSource={sampleData} />)
    await expectNoA11yViolations(container)
  })
})
