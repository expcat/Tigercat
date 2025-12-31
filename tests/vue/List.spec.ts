/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/vue'
import { h } from 'vue'
import { List } from '@tigercat/vue'
import {
  renderWithProps,
  renderWithSlots,
  expectNoA11yViolations,
  componentSizes,
} from '../utils'

const sampleData = [
  { key: 1, title: 'Item 1', description: 'Description 1' },
  { key: 2, title: 'Item 2', description: 'Description 2' },
  { key: 3, title: 'Item 3', description: 'Description 3' },
]

const listBorderStyles = ['none', 'divided', 'bordered'] as const

describe('List', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(List, {
        props: {
          dataSource: sampleData,
        },
      })

      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByText('Item 2')).toBeInTheDocument()
      expect(screen.getByText('Item 3')).toBeInTheDocument()
    })

    it('should render list items with title and description', () => {
      const { getByText } = renderWithProps(List, {
        dataSource: sampleData,
      })

      expect(getByText('Item 1')).toBeInTheDocument()
      expect(getByText('Description 1')).toBeInTheDocument()
    })

    it('should render empty state when no data', () => {
      const { getByText } = renderWithProps(List, {
        dataSource: [],
      })

      expect(getByText('No data')).toBeInTheDocument()
    })

    it('should render custom empty text', () => {
      const { getByText } = renderWithProps(List, {
        dataSource: [],
        emptyText: 'No items available',
      })

      expect(getByText('No items available')).toBeInTheDocument()
    })

    it('should render header slot when provided', () => {
      const { getByText } = render(List, {
        props: {
          dataSource: sampleData,
        },
        slots: {
          header: 'List Header',
        },
      })

      expect(getByText('List Header')).toBeInTheDocument()
    })

    it('should render footer slot when provided', () => {
      const { getByText } = render(List, {
        props: {
          dataSource: sampleData,
        },
        slots: {
          footer: 'List Footer',
        },
      })

      expect(getByText('List Footer')).toBeInTheDocument()
    })
  })

  describe('Props', () => {
    describe('Size', () => {
      it.each(componentSizes)('should render %s size correctly', (size) => {
        const { container } = renderWithProps(List, {
          dataSource: sampleData,
          size,
        })

        const list = container.querySelector('div')
        expect(list).toBeInTheDocument()
      })
    })

    describe('Border Styles', () => {
      it.each(listBorderStyles)('should render %s border style correctly', (bordered) => {
        const { container } = renderWithProps(List, {
          dataSource: sampleData,
          bordered,
        })

        const list = container.querySelector('div')
        expect(list).toBeInTheDocument()
      })
    })

    describe('Item Layout', () => {
      it('should render horizontal layout', () => {
        const { container } = renderWithProps(List, {
          dataSource: sampleData,
          itemLayout: 'horizontal',
        })

        expect(container.querySelector('.flex-row')).toBeInTheDocument()
      })

      it('should render vertical layout', () => {
        const { container } = renderWithProps(List, {
          dataSource: sampleData,
          itemLayout: 'vertical',
        })

        expect(container.querySelector('.flex-col')).toBeInTheDocument()
      })
    })
  })

  describe('Loading State', () => {
    it('should render loading spinner when loading', () => {
      const { container } = renderWithProps(List, {
        dataSource: sampleData,
        loading: true,
      })

      const spinner = container.querySelector('svg.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should not render items when loading', () => {
      const { queryByText } = renderWithProps(List, {
        dataSource: sampleData,
        loading: true,
      })

      expect(queryByText('Item 1')).not.toBeInTheDocument()
    })

    it('should render items when not loading', () => {
      const { getByText } = renderWithProps(List, {
        dataSource: sampleData,
        loading: false,
      })

      expect(getByText('Item 1')).toBeInTheDocument()
    })
  })

  describe('Avatar', () => {
    it('should render avatar when provided', () => {
      const dataWithAvatar = [
        {
          key: 1,
          title: 'User 1',
          avatar: 'https://example.com/avatar1.jpg',
        },
      ]

      const { container } = renderWithProps(List, {
        dataSource: dataWithAvatar,
      })

      const avatar = container.querySelector('img[src="https://example.com/avatar1.jpg"]')
      expect(avatar).toBeInTheDocument()
    })

    it('should render avatar with correct alt text', () => {
      const dataWithAvatar = [
        {
          key: 1,
          title: 'User 1',
          avatar: 'https://example.com/avatar1.jpg',
        },
      ]

      const { container } = renderWithProps(List, {
        dataSource: dataWithAvatar,
      })

      const avatar = container.querySelector('img')
      expect(avatar?.alt).toBe('User 1')
    })
  })

  describe('Extra Content', () => {
    it('should render extra content when provided', () => {
      const dataWithExtra = [
        {
          key: 1,
          title: 'Item 1',
          extra: h('button', {}, 'Action'),
        },
      ]

      const { getByText } = renderWithProps(List, {
        dataSource: dataWithExtra,
      })

      expect(getByText('Action')).toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    const largeDataSource = Array.from({ length: 25 }, (_, i) => ({
      key: i + 1,
      title: `Item ${i + 1}`,
    }))

    it('should render pagination when enabled', () => {
      const { getByText } = renderWithProps(List, {
        dataSource: largeDataSource,
        pagination: {
          current: 1,
          pageSize: 10,
        },
      })

      expect(getByText(/Page 1 of/)).toBeInTheDocument()
    })

    it('should not render pagination when disabled', () => {
      const { queryByText } = renderWithProps(List, {
        dataSource: largeDataSource,
        pagination: false,
      })

      expect(queryByText(/Page 1 of/)).not.toBeInTheDocument()
    })

    it('should paginate data correctly', () => {
      const { getByText, queryByText } = renderWithProps(List, {
        dataSource: largeDataSource,
        pagination: {
          current: 1,
          pageSize: 10,
        },
      })

      // First page should show items 1-10
      expect(getByText('Item 1')).toBeInTheDocument()
      expect(getByText('Item 10')).toBeInTheDocument()
      expect(queryByText('Item 11')).not.toBeInTheDocument()
    })

    it('should show total items count', () => {
      const { getByText } = renderWithProps(List, {
        dataSource: largeDataSource,
        pagination: {
          current: 1,
          pageSize: 10,
          showTotal: true,
        },
      })

      expect(getByText(/Showing 1 to 10 of 25 items/)).toBeInTheDocument()
    })

    it('should emit page-change event when page changes', async () => {
      const onPageChange = vi.fn()
      const { getByText } = render(List, {
        props: {
          dataSource: largeDataSource,
          pagination: {
            current: 1,
            pageSize: 10,
          },
          'onPage-change': onPageChange,
        },
      })

      const nextButton = getByText('Next')
      await fireEvent.click(nextButton)

      expect(onPageChange).toHaveBeenCalledWith({ current: 2, pageSize: 10 })
    })
  })

  describe('Grid Layout', () => {
    it('should render grid layout when grid prop is provided', () => {
      const { container } = renderWithProps(List, {
        dataSource: sampleData,
        grid: {
          column: 3,
        },
      })

      const grid = container.querySelector('.grid')
      expect(grid).toBeInTheDocument()
    })

    it('should apply responsive grid columns', () => {
      const { container } = renderWithProps(List, {
        dataSource: sampleData,
        grid: {
          xs: 1,
          sm: 2,
          md: 3,
        },
      })

      const grid = container.querySelector('.grid')
      expect(grid?.className).toContain('grid-cols')
    })
  })

  describe('Events', () => {
    it('should emit item-click when item is clicked', async () => {
      const onItemClick = vi.fn()
      const { getByText } = render(List, {
        props: {
          dataSource: sampleData,
          hoverable: true,
          'onItem-click': onItemClick,
        },
      })

      const item = getByText('Item 1').closest('div')
      if (item) {
        await fireEvent.click(item)
      }

      expect(onItemClick).toHaveBeenCalled()
    })
  })

  describe('Custom Render', () => {
    it('should use custom renderItem slot', () => {
      const { container } = render(List, {
        props: {
          dataSource: sampleData,
        },
        slots: {
          renderItem: '({ item }) => `Custom: ${item.title}`',
        },
      })

      // Slot is rendered but we just check the component is properly mounted
      expect(container.querySelector('.flex')).toBeInTheDocument()
    })
  })

  describe('Hoverable', () => {
    it('should apply hover classes when hoverable is true', () => {
      const { container } = renderWithProps(List, {
        dataSource: sampleData,
        hoverable: true,
      })

      const item = container.querySelector('.hover\\:bg-gray-50')
      expect(item).toBeInTheDocument()
    })

    it('should not apply hover classes when hoverable is false', () => {
      const { container } = renderWithProps(List, {
        dataSource: sampleData,
        hoverable: false,
      })

      const item = container.querySelector('.hover\\:bg-gray-50')
      expect(item).not.toBeInTheDocument()
    })
  })

  describe('Row Key', () => {
    it('should use default key field', () => {
      const { container } = renderWithProps(List, {
        dataSource: sampleData,
      })

      const items = container.querySelectorAll('[class*="flex"]')
      expect(items.length).toBeGreaterThan(0)
    })

    it('should use custom key field', () => {
      const customData = [
        { id: 'a', title: 'Item A' },
        { id: 'b', title: 'Item B' },
      ]

      const { getByText } = renderWithProps(List, {
        dataSource: customData,
        rowKey: 'id',
      })

      expect(getByText('Item A')).toBeInTheDocument()
    })

    it('should use key function', () => {
      const customData = [
        { name: 'Item A' },
        { name: 'Item B' },
      ]

      const { container } = renderWithProps(List, {
        dataSource: customData,
        rowKey: (item: any) => item.name,
      })

      const items = container.querySelectorAll('[class*="flex"]')
      expect(items.length).toBeGreaterThan(0)
    })
  })

  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = renderWithProps(List, {
        dataSource: sampleData,
      })

      await expectNoA11yViolations(container)
    })

    it('should have no accessibility violations with header and footer', async () => {
      const { container } = render(List, {
        props: {
          dataSource: sampleData,
        },
        slots: {
          header: 'Header',
          footer: 'Footer',
        },
      })

      await expectNoA11yViolations(container)
    })
  })
})
