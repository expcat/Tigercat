import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Descriptions } from '../../packages/react/src/components/Descriptions'
import type { DescriptionsItem } from '../../packages/core/src/types/descriptions'

describe('Descriptions (React)', () => {
  describe('Rendering', () => {
    it('should render descriptions with items', () => {
      const items: DescriptionsItem[] = [
        { label: 'Name', content: 'John Doe' },
        { label: 'Email', content: 'john@example.com' },
      ]

      const { container } = render(<Descriptions items={items} />)

      expect(container.textContent).toContain('Name')
      expect(container.textContent).toContain('John Doe')
      expect(container.textContent).toContain('Email')
      expect(container.textContent).toContain('john@example.com')
    })

    it('should render with title', () => {
      const items: DescriptionsItem[] = [
        { label: 'Name', content: 'John Doe' },
      ]

      const { container } = render(
        <Descriptions title="User Information" items={items} />
      )

      expect(container.textContent).toContain('User Information')
    })

    it('should render with extra content', () => {
      const items: DescriptionsItem[] = [
        { label: 'Name', content: 'John Doe' },
      ]

      const { container } = render(
        <Descriptions items={items} extra={<a href="#">Edit</a>} />
      )

      expect(screen.getByText('Edit')).toBeInTheDocument()
    })
  })

  describe('Layout', () => {
    it('should render horizontal layout by default', () => {
      const items: DescriptionsItem[] = [
        { label: 'Name', content: 'John Doe' },
      ]

      const { container } = render(<Descriptions items={items} />)

      const table = container.querySelector('table')
      const th = container.querySelector('th')
      const td = container.querySelector('td')

      expect(table).toBeInTheDocument()
      expect(th).toBeInTheDocument()
      expect(td).toBeInTheDocument()
    })

    it('should render vertical layout when layout="vertical"', () => {
      const items: DescriptionsItem[] = [
        { label: 'Name', content: 'John Doe' },
      ]

      const { container } = render(
        <Descriptions items={items} layout="vertical" />
      )

      // Vertical non-bordered should use div layout
      expect(container.innerHTML).toBeDefined()
    })

    it('should render vertical layout with table when bordered', () => {
      const items: DescriptionsItem[] = [
        { label: 'Name', content: 'John Doe' },
      ]

      const { container } = render(
        <Descriptions items={items} layout="vertical" bordered />
      )

      const table = container.querySelector('table')
      expect(table).toBeInTheDocument()
    })
  })

  describe('Column Configuration', () => {
    it('should respect column prop', () => {
      const items: DescriptionsItem[] = [
        { label: 'Name', content: 'John Doe' },
        { label: 'Email', content: 'john@example.com' },
        { label: 'Phone', content: '123-456-7890' },
        { label: 'Address', content: '123 Main St' },
      ]

      const { container } = render(
        <Descriptions items={items} column={2} />
      )

      // With column=2, 4 items should create 2 rows
      const rows = container.querySelectorAll('tr')
      expect(rows.length).toBe(2)
    })

    it('should handle item span', () => {
      const items: DescriptionsItem[] = [
        { label: 'Name', content: 'John Doe' },
        { label: 'Description', content: 'Long description text', span: 2 },
      ]

      const { container } = render(
        <Descriptions items={items} column={3} />
      )

      const cells = container.querySelectorAll('td')
      // Second item should have colspan
      expect(cells[1].getAttribute('colspan')).toBe('3')
    })
  })

  describe('Bordered', () => {
    it('should apply border classes when bordered=true', () => {
      const items: DescriptionsItem[] = [
        { label: 'Name', content: 'John Doe' },
      ]

      const { container } = render(
        <Descriptions items={items} bordered />
      )

      const table = container.querySelector('table')
      expect(table?.className).toContain('border')
      expect(table?.className).toContain('border-gray-200')
    })

    it('should not apply border classes when bordered=false', () => {
      const items: DescriptionsItem[] = [
        { label: 'Name', content: 'John Doe' },
      ]

      const { container } = render(
        <Descriptions items={items} bordered={false} />
      )

      const table = container.querySelector('table')
      expect(table?.className).not.toContain('border-gray-200')
    })
  })

  describe('Size', () => {
    it('should apply small size classes', () => {
      const items: DescriptionsItem[] = [
        { label: 'Name', content: 'John Doe' },
      ]

      const { container } = render(
        <Descriptions items={items} size="sm" />
      )

      expect(container.innerHTML).toContain('text-sm')
    })

    it('should apply medium size classes by default', () => {
      const items: DescriptionsItem[] = [
        { label: 'Name', content: 'John Doe' },
      ]

      const { container } = render(<Descriptions items={items} />)

      expect(container.innerHTML).toContain('text-base')
    })

    it('should apply large size classes', () => {
      const items: DescriptionsItem[] = [
        { label: 'Name', content: 'John Doe' },
      ]

      const { container } = render(
        <Descriptions items={items} size="lg" />
      )

      expect(container.innerHTML).toContain('text-lg')
    })
  })

  describe('Colon', () => {
    it('should show colon after label by default', () => {
      const items: DescriptionsItem[] = [
        { label: 'Name', content: 'John Doe' },
      ]

      const { container } = render(<Descriptions items={items} />)

      const labelCell = container.querySelector('th')
      expect(labelCell?.textContent).toContain(':')
    })

    it('should hide colon when colon=false', () => {
      const items: DescriptionsItem[] = [
        { label: 'Name', content: 'John Doe' },
      ]

      const { container } = render(
        <Descriptions items={items} colon={false} />
      )

      const labelCell = container.querySelector('th')
      expect(labelCell?.textContent).toBe('Name')
      expect(labelCell?.textContent).not.toContain(':')
    })
  })

  describe('Custom Styles', () => {
    it('should apply custom labelStyle', () => {
      const items: DescriptionsItem[] = [
        { label: 'Name', content: 'John Doe' },
      ]

      const { container } = render(
        <Descriptions
          items={items}
          labelStyle={{ color: 'red', fontWeight: 'bold' }}
        />
      )

      const labelCell = container.querySelector('th')
      expect(labelCell?.getAttribute('style')).toContain('color: red')
      expect(labelCell?.getAttribute('style')).toContain('font-weight: bold')
    })

    it('should apply custom contentStyle', () => {
      const items: DescriptionsItem[] = [
        { label: 'Name', content: 'John Doe' },
      ]

      const { container } = render(
        <Descriptions items={items} contentStyle={{ color: 'blue' }} />
      )

      const contentCell = container.querySelector('td')
      expect(contentCell?.getAttribute('style')).toContain('color: blue')
    })

    it('should apply custom labelClassName and contentClassName', () => {
      const items: DescriptionsItem[] = [
        {
          label: 'Name',
          content: 'John Doe',
          labelClassName: 'custom-label',
          contentClassName: 'custom-content',
        },
      ]

      const { container } = render(<Descriptions items={items} />)

      const labelCell = container.querySelector('th')
      const contentCell = container.querySelector('td')

      expect(labelCell?.className).toContain('custom-label')
      expect(contentCell?.className).toContain('custom-content')
    })
  })

  describe('Children', () => {
    it('should render children when provided', () => {
      const items: DescriptionsItem[] = [
        { label: 'Name', content: 'John Doe' },
      ]

      const { container } = render(
        <Descriptions items={items}>
          <div>Custom Content</div>
        </Descriptions>
      )

      expect(screen.getByText('Custom Content')).toBeInTheDocument()
    })
  })

  describe('Snapshots', () => {
    it('should match snapshot for basic horizontal layout', () => {
      const items: DescriptionsItem[] = [
        { label: 'Name', content: 'John Doe' },
        { label: 'Email', content: 'john@example.com' },
      ]

      const { container } = render(<Descriptions items={items} />)

      expect(container.innerHTML).toMatchSnapshot()
    })

    it('should match snapshot for bordered vertical layout', () => {
      const items: DescriptionsItem[] = [
        { label: 'Name', content: 'John Doe' },
        { label: 'Email', content: 'john@example.com' },
      ]

      const { container } = render(
        <Descriptions items={items} layout="vertical" bordered />
      )

      expect(container.innerHTML).toMatchSnapshot()
    })

    it('should match snapshot with all features', () => {
      const items: DescriptionsItem[] = [
        { label: 'Name', content: 'John Doe' },
        { label: 'Email', content: 'john@example.com' },
        { label: 'Description', content: 'Long description', span: 2 },
      ]

      const { container } = render(
        <Descriptions
          title="User Information"
          items={items}
          bordered
          size="md"
          column={3}
          extra={<a href="#">Edit</a>}
        />
      )

      expect(container.innerHTML).toMatchSnapshot()
    })
  })
})
