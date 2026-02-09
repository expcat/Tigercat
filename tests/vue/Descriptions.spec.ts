/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { Descriptions } from '@expcat/tigercat-vue'
import type { DescriptionsItem } from '@expcat/tigercat-core'

describe('Descriptions (Vue)', () => {
  const basicItems: DescriptionsItem[] = [
    { label: 'Name', content: 'John Doe' },
    { label: 'Email', content: 'john@example.com' }
  ]

  it('renders title and extra (prop + slot)', () => {
    render(Descriptions, {
      props: { title: 'User', extra: 'Extra', items: basicItems },
      slots: { extra: '<a href="#">Edit</a>' }
    })
    expect(screen.getByText('User')).toBeInTheDocument()
    expect(screen.getByText('Edit')).toBeInTheDocument()
  })

  it('hides header when no title or extra', () => {
    const { container } = render(Descriptions, { props: { items: basicItems } })
    expect(container.querySelector('[class*="justify-between"]')).toBeFalsy()
  })

  it('renders horizontal table layout by default', () => {
    const { container } = render(Descriptions, { props: { items: basicItems } })
    expect(container.querySelector('table')).toBeTruthy()
    expect(container.querySelector('th')?.textContent).toContain('Name')
    expect(container.querySelector('td')?.textContent).toContain('John Doe')
  })

  it('renders non-bordered vertical layout as dl/dt/dd', () => {
    const items: DescriptionsItem[] = [{ label: 'CPU', content: '8C' }]
    const { container } = render(Descriptions, {
      props: { items, layout: 'vertical' }
    })
    expect(container.querySelector('dl')).toBeTruthy()
    expect(container.querySelector('dt')?.textContent).toContain('CPU')
    expect(container.querySelector('dd')?.textContent).toContain('8C')
  })

  it('renders bordered vertical layout as table', () => {
    const items: DescriptionsItem[] = [{ label: 'CPU', content: '8C' }]
    const { container } = render(Descriptions, {
      props: { items, layout: 'vertical', bordered: true }
    })
    expect(container.querySelector('table')).toBeTruthy()
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
    const { container } = render(Descriptions, { props: { items, column: 2 } })
    expect(container.querySelectorAll('tr').length).toBe(2)

    const spanItems: DescriptionsItem[] = [
      { label: 'Name', content: 'John' },
      { label: 'Desc', content: 'Long', span: 2 }
    ]
    const { container: c2 } = render(Descriptions, {
      props: { items: spanItems, column: 3 }
    })
    expect(c2.querySelectorAll('td')[1].getAttribute('colspan')).toBe('3')
  })

  it('hides colon when colon=false', () => {
    const { container } = render(Descriptions, {
      props: { items: [{ label: 'Key', content: 'Val' }], colon: false }
    })
    expect(container.querySelector('th')?.textContent).toBe('Key')
  })

  it('shows colon by default', () => {
    const { container } = render(Descriptions, {
      props: { items: [{ label: 'Key', content: 'Val' }] }
    })
    expect(container.querySelector('th')?.textContent).toBe('Key:')
  })

  it('applies size classes', () => {
    const { container: sm } = render(Descriptions, {
      props: { items: basicItems, size: 'sm' }
    })
    expect(sm.firstElementChild?.className).toContain('text-sm')

    const { container: lg } = render(Descriptions, {
      props: { items: basicItems, size: 'lg' }
    })
    expect(lg.firstElementChild?.className).toContain('text-lg')
  })

  it('applies labelStyle and contentStyle', () => {
    const { container } = render(Descriptions, {
      props: {
        items: basicItems,
        labelStyle: { color: 'red' },
        contentStyle: { color: 'blue' }
      }
    })
    expect((container.querySelector('th') as HTMLElement).style.color).toBe('red')
    expect((container.querySelector('td') as HTMLElement).style.color).toBe('blue')
  })

  it('applies item-level labelClassName and contentClassName', () => {
    const items: DescriptionsItem[] = [
      { label: 'Key', content: 'Val', labelClassName: 'lbl-custom', contentClassName: 'cnt-custom' }
    ]
    const { container } = render(Descriptions, { props: { items } })
    expect(container.querySelector('th')?.className).toContain('lbl-custom')
    expect(container.querySelector('td')?.className).toContain('cnt-custom')
  })

  it('renders nothing for layout when items is empty', () => {
    const { container } = render(Descriptions, { props: { items: [] } })
    expect(container.querySelector('table')).toBeFalsy()
    expect(container.querySelector('dl')).toBeFalsy()
  })

  it('merges attrs.class with className and passes through attrs', () => {
    render(Descriptions, {
      props: { items: basicItems, className: 'from-prop' },
      attrs: { class: 'from-attrs', 'data-testid': 'root', 'aria-label': 'descriptions' }
    })
    const root = screen.getByTestId('root')
    expect(root).toHaveAttribute('aria-label', 'descriptions')
    expect(root.className).toContain('from-prop')
    expect(root.className).toContain('from-attrs')
  })

  it('adds bordered classes to table and cells', () => {
    const { container } = render(Descriptions, {
      props: { items: basicItems, bordered: true }
    })
    expect(container.querySelector('table')?.className).toContain('border')
    expect(container.querySelector('th')?.className).toContain('border')
    expect(container.querySelector('td')?.className).toContain('border')
  })
})
