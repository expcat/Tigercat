/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { List } from '@expcat/tigercat-vue'
import { expectNoA11yViolationsIsolated } from '../utils'

const sampleData = [
  { key: 1, title: 'Item 1', description: 'Description 1' },
  { key: 2, title: 'Item 2', description: 'Description 2' },
  { key: 3, title: 'Item 3', description: 'Description 3' }
]

describe('List', () => {
  it('renders list items', () => {
    render(List, {
      props: {
        dataSource: sampleData
      }
    })

    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Description 1')).toBeInTheDocument()
  })

  it('renders empty state', () => {
    render(List, {
      props: {
        dataSource: []
      }
    })

    expect(screen.getByRole('status')).toHaveTextContent('No data')
  })

  it('renders custom empty text', () => {
    render(List, {
      props: {
        dataSource: [],
        emptyText: 'No items'
      }
    })

    expect(screen.getByRole('status')).toHaveTextContent('No items')
  })

  it('sets aria-busy and shows loading overlay', () => {
    render(List, {
      props: {
        dataSource: sampleData,
        loading: true
      }
    })

    expect(screen.getByRole('list')).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
  })

  it('renders header and footer slots', () => {
    render(List, {
      props: {
        dataSource: sampleData
      },
      slots: {
        header: 'Header',
        footer: 'Footer'
      }
    })

    expect(screen.getByText('Header')).toBeInTheDocument()
    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('emits item-click on click and Enter', async () => {
    const onItemClick = vi.fn()

    render(List, {
      props: {
        dataSource: sampleData,
        onItemClick
      }
    })

    const firstItem = screen.getAllByRole('listitem')[0]
    expect(firstItem).toHaveAttribute('tabindex', '0')

    await fireEvent.click(firstItem)
    await fireEvent.keyDown(firstItem, { key: 'Enter' })

    expect(onItemClick).toHaveBeenCalledWith(expect.objectContaining({ title: 'Item 1' }), 0)
  })

  it('emits page-change when clicking next page', async () => {
    const onPageChange = vi.fn()
    const largeDataSource = Array.from({ length: 25 }, (_, i) => ({
      key: i + 1,
      title: `Item ${i + 1}`
    }))

    render(List, {
      props: {
        dataSource: largeDataSource,
        pagination: {
          current: 1,
          pageSize: 10
        },
        onPageChange
      }
    })

    await fireEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onPageChange).toHaveBeenCalledWith({ current: 2, pageSize: 10 })
  })

  it('renders dataSource as-is and derives page count from total in remote mode', () => {
    // Server-side pagination: dataSource holds only the current page (page 2 of 48 items)
    const pageTwoItems = Array.from({ length: 10 }, (_, i) => ({
      key: i + 11,
      title: `Item ${i + 11}`
    }))

    render(List, {
      props: {
        dataSource: pageTwoItems,
        pagination: { remote: true, current: 2, pageSize: 10, total: 48 }
      }
    })

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

    render(List, {
      props: {
        dataSource: items,
        pagination: { current: 2, pageSize: 10 }
      }
    })

    expect(screen.getAllByRole('listitem')).toHaveLength(5)
    expect(screen.getByText('Item 11')).toBeInTheDocument()
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
    expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
  })

  it('applies grid gutter as gap style', () => {
    const { container } = render(List, {
      props: {
        dataSource: sampleData,
        grid: {
          gutter: 12,
          column: 3
        },
        bordered: 'none'
      }
    })

    const grid = container.querySelector('.grid') as HTMLElement | null
    expect(grid).toBeTruthy()
    expect(grid?.style.gap).toBe('12px')
  })

  it('uses VirtualList when virtual mode is enabled', () => {
    const largeDataSource = Array.from({ length: 100 }, (_, index) => ({
      key: index,
      title: `Item ${index}`
    }))

    render(List, {
      props: {
        dataSource: largeDataSource,
        pagination: false,
        virtual: true,
        virtualHeight: 80,
        virtualItemHeight: 20,
        virtualOverscan: 0
      }
    })

    const renderedItems = screen.getAllByRole('listitem')
    expect(renderedItems.length).toBeLessThan(largeDataSource.length)
    expect(screen.getByText('Item 0')).toBeInTheDocument()
    expect(screen.queryByText('Item 50')).not.toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(List, {
      props: {
        dataSource: sampleData
      }
    })

    await expectNoA11yViolationsIsolated(container)
  })
  describe('Edge Cases', () => {})
})
