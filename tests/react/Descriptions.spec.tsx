import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Descriptions } from '../../packages/react/src/components/Descriptions'
import type { DescriptionsItem } from '../../packages/core/src/types/descriptions'

describe('Descriptions (React)', () => {
  const basicItems: DescriptionsItem[] = [
    { label: 'Name', content: 'John Doe' },
    { label: 'Email', content: 'john@example.com' }
  ]

  it('renders title and extra', () => {
    render(<Descriptions title="User" items={basicItems} extra={<a href="#">Edit</a>} />)
    expect(screen.getByText('User')).toBeInTheDocument()
    expect(screen.getByText('Edit')).toBeInTheDocument()
  })

  it('hides header when no title or extra', () => {
    const { container } = render(<Descriptions items={basicItems} />)
    expect(container.querySelector('[class*="justify-between"]')).toBeFalsy()
  })

  it('renders horizontal table layout by default', () => {
    const { container } = render(<Descriptions items={basicItems} />)
    expect(container.querySelector('table')).toBeInTheDocument()
    expect(container.querySelector('th')?.textContent).toContain('Name')
    expect(container.querySelector('td')?.textContent).toContain('John Doe')
  })

  it('renders non-bordered vertical layout as dl/dt/dd', () => {
    const items: DescriptionsItem[] = [{ label: 'CPU', content: '8C' }]
    const { container } = render(<Descriptions items={items} layout="vertical" />)
    expect(container.querySelector('dl')).toBeInTheDocument()
    expect(container.querySelector('dt')?.textContent).toContain('CPU')
    expect(container.querySelector('dd')?.textContent).toContain('8C')
  })

  it('renders bordered vertical layout as table', () => {
    const items: DescriptionsItem[] = [{ label: 'CPU', content: '8C' }]
    const { container } = render(<Descriptions items={items} layout="vertical" bordered />)
    expect(container.querySelector('table')).toBeInTheDocument()
    expect(container.querySelector('th')?.textContent).toContain('CPU')
    expect(container.querySelector('td')?.textContent).toContain('8C')
  })

  it('respects column and span in horizontal layout', () => {
    const items: DescriptionsItem[] = [
      { label: 'A', content: '1' },
      { label: 'B', content: '2' },
      { label: 'C', content: '3' },
      { label: 'D', content: '4' }
    ]
    const { container } = render(<Descriptions items={items} column={2} />)
    expect(container.querySelectorAll('tr')).toHaveLength(2)

    const spanItems: DescriptionsItem[] = [
      { label: 'Name', content: 'John' },
      { label: 'Desc', content: 'Long', span: 2 }
    ]
    const { container: c2 } = render(<Descriptions items={spanItems} column={3} />)
    expect(c2.querySelectorAll('td')[1].getAttribute('colspan')).toBe('3')
  })

  it('hides colon when colon=false', () => {
    const { container } = render(
      <Descriptions items={[{ label: 'Key', content: 'Val' }]} colon={false} />
    )
    expect(container.querySelector('th')?.textContent).toBe('Key')
  })

  it('shows colon by default', () => {
    const { container } = render(<Descriptions items={[{ label: 'Key', content: 'Val' }]} />)
    expect(container.querySelector('th')?.textContent).toBe('Key:')
  })

  it('applies size classes', () => {
    const { container: sm } = render(<Descriptions items={basicItems} size="sm" />)
    expect(sm.firstElementChild?.className).toContain('text-sm')

    const { container: lg } = render(<Descriptions items={basicItems} size="lg" />)
    expect(lg.firstElementChild?.className).toContain('text-lg')
  })

  it('applies labelStyle and contentStyle', () => {
    const { container } = render(
      <Descriptions
        items={basicItems}
        labelStyle={{ color: 'red' }}
        contentStyle={{ color: 'blue' }}
      />
    )
    expect((container.querySelector('th') as HTMLElement).style.color).toBe('red')
    expect((container.querySelector('td') as HTMLElement).style.color).toBe('blue')
  })

  it('applies item-level labelClassName and contentClassName', () => {
    const items: DescriptionsItem[] = [
      { label: 'Key', content: 'Val', labelClassName: 'lbl-custom', contentClassName: 'cnt-custom' }
    ]
    const { container } = render(<Descriptions items={items} />)
    expect(container.querySelector('th')?.className).toContain('lbl-custom')
    expect(container.querySelector('td')?.className).toContain('cnt-custom')
  })

  it('renders nothing for layout when items is empty', () => {
    const { container } = render(<Descriptions items={[]} />)
    expect(container.querySelector('table')).toBeFalsy()
    expect(container.querySelector('dl')).toBeFalsy()
  })

  it('passes through div attributes', () => {
    render(
      <Descriptions
        items={basicItems}
        data-testid="root"
        aria-label="descriptions"
        className="custom"
      />
    )
    const root = screen.getByTestId('root')
    expect(root).toHaveAttribute('aria-label', 'descriptions')
    expect(root.className).toContain('custom')
  })

  it('adds bordered classes to table and cells', () => {
    const { container } = render(<Descriptions items={basicItems} bordered />)
    expect(container.querySelector('table')?.className).toContain('border')
    expect(container.querySelector('th')?.className).toContain('border')
    expect(container.querySelector('td')?.className).toContain('border')
  })
})
