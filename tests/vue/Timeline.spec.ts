import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { h } from 'vue'
import { Timeline } from '../../packages/vue/src/components/Timeline'
import type { TimelineItem } from '../../packages/core/src/types/timeline'

describe('Timeline (Vue)', () => {
  it('renders labels and content', () => {
    const items: TimelineItem[] = [{ key: 1, label: '2024-01-01', content: 'Create project' }]
    render(Timeline, { props: { items } })
    expect(screen.getByText('2024-01-01')).toBeTruthy()
    expect(screen.getByText('Create project')).toBeTruthy()
  })

  it('supports mode=right and mode=alternate', () => {
    const items: TimelineItem[] = [
      { key: 1, content: 'Event 1' },
      { key: 2, content: 'Event 2' }
    ]

    const { container: rightContainer } = render(Timeline, {
      props: { items, mode: 'right' }
    })
    expect(rightContainer.querySelector('li')?.className).toContain('pr-8')
    expect(rightContainer.querySelector('li')?.className).toContain('text-right')

    const { container: altContainer } = render(Timeline, {
      props: { items, mode: 'alternate' }
    })
    const listItems = altContainer.querySelectorAll('li')
    expect(listItems[0].className).toContain('flex-row-reverse')
    expect(listItems[1].className).toContain('pl-8')
  })

  it('renders pending item and supports pending slot + pendingDot prop', () => {
    const items: TimelineItem[] = [{ key: 1, content: 'Event 1' }]

    const { container } = render(Timeline, {
      props: {
        items,
        pending: true,
        pendingDot: h('div', {}, 'Pending Dot')
      },
      attrs: {
        'aria-label': 'Timeline'
      },
      slots: {
        pending: () => h('div', {}, 'Pending Content')
      }
    })

    expect(container.querySelectorAll('li')).toHaveLength(2)
    const ul = container.querySelector('ul')
    expect(ul?.getAttribute('aria-label')).toBe('Timeline')
    expect(ul?.getAttribute('aria-busy')).toBe('true')
    expect(screen.getByText('Pending Dot')).toBeTruthy()
    expect(screen.getByText('Pending Content')).toBeTruthy()
  })

  it('supports reverse order', () => {
    const items: TimelineItem[] = [
      { key: 1, content: 'Event 1' },
      { key: 2, content: 'Event 2' },
      { key: 3, content: 'Event 3' }
    ]
    render(Timeline, { props: { items, reverse: true } })
    const contents = screen.getAllByText(/Event \d/)
    expect(contents[0].textContent).toBe('Event 3')
  })

  it('supports item and dot slots', () => {
    const items: TimelineItem[] = [{ key: 1, content: 'Event 1' }]
    render(Timeline, {
      props: { items },
      slots: {
        dot: () => h('div', {}, 'Dot'),
        item: ({ item }: { item: TimelineItem }) => h('div', {}, `Custom: ${item.content}`)
      }
    })

    expect(screen.getByText('Dot')).toBeTruthy()
    expect(screen.getByText('Custom: Event 1')).toBeTruthy()
  })

  it('merges className prop with attrs.class', () => {
    const { container } = render(Timeline, {
      props: { items: [], className: 'custom' },
      attrs: { class: 'from-attrs' }
    })
    expect(container.querySelector('ul')?.className).toContain('custom')
    expect(container.querySelector('ul')?.className).toContain('from-attrs')
  })
})
