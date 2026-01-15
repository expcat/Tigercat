/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { List } from '@expcat/tigercat-vue'
import { expectNoA11yViolations } from '../utils'

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

    await fireEvent.click(screen.getByText('Next'))
    expect(onPageChange).toHaveBeenCalledWith({ current: 2, pageSize: 10 })
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

  it('has no accessibility violations', async () => {
    const { container } = render(List, {
      props: {
        dataSource: sampleData
      }
    })

    await expectNoA11yViolations(container)
  })
})
