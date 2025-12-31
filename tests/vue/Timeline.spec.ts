import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import { h } from 'vue'
import { Timeline } from '../../packages/vue/src/components/Timeline'
import type { TimelineItem } from '../../packages/core/src/types/timeline'

describe('Timeline (Vue)', () => {
  describe('Rendering', () => {
    it('renders empty timeline', () => {
      const { container } = render(Timeline, {
        props: {
          items: [],
        },
      })

      const timeline = container.querySelector('ul')
      expect(timeline).toBeTruthy()
    })

    it('renders timeline with items', () => {
      const items: TimelineItem[] = [
        { key: 1, label: '2024-01-01', content: 'Event 1' },
        { key: 2, label: '2024-01-05', content: 'Event 2' },
      ]

      const { container } = render(Timeline, {
        props: { items },
      })

      const listItems = container.querySelectorAll('li')
      expect(listItems).toHaveLength(2)
    })

    it('renders timeline items with labels and content', () => {
      const items: TimelineItem[] = [
        { key: 1, label: '2024-01-01', content: 'Create project' },
      ]

      render(Timeline, {
        props: { items },
      })

      expect(screen.getByText('2024-01-01')).toBeTruthy()
      expect(screen.getByText('Create project')).toBeTruthy()
    })
  })

  describe('Props', () => {
    describe('mode', () => {
      it('renders left mode by default', () => {
        const items: TimelineItem[] = [
          { key: 1, content: 'Event 1' },
        ]

        const { container } = render(Timeline, {
          props: { items },
        })

        const listItem = container.querySelector('li')
        expect(listItem?.className).toContain('pl-8')
      })

      it('renders right mode', () => {
        const items: TimelineItem[] = [
          { key: 1, content: 'Event 1' },
        ]

        const { container } = render(Timeline, {
          props: { 
            items,
            mode: 'right',
          },
        })

        const listItem = container.querySelector('li')
        expect(listItem?.className).toContain('pr-8')
        expect(listItem?.className).toContain('text-right')
      })

      it('renders alternate mode', () => {
        const items: TimelineItem[] = [
          { key: 1, content: 'Event 1' },
          { key: 2, content: 'Event 2' },
        ]

        const { container } = render(Timeline, {
          props: { 
            items,
            mode: 'alternate',
          },
        })

        const listItems = container.querySelectorAll('li')
        
        // First item should be on the left (reverse flex)
        expect(listItems[0].className).toContain('pr-8')
        expect(listItems[0].className).toContain('flex-row-reverse')
        
        // Second item should be on the right (normal flex)
        expect(listItems[1].className).toContain('pl-8')
      })
    })

    describe('pending', () => {
      it('does not render pending item by default', () => {
        const items: TimelineItem[] = [
          { key: 1, content: 'Event 1' },
        ]

        const { container } = render(Timeline, {
          props: { items },
        })

        expect(container.querySelectorAll('li')).toHaveLength(1)
      })

      it('renders pending item when pending is true', () => {
        const items: TimelineItem[] = [
          { key: 1, content: 'Event 1' },
        ]

        const { container } = render(Timeline, {
          props: { 
            items,
            pending: true,
          },
        })

        expect(container.querySelectorAll('li')).toHaveLength(2)
        expect(screen.getByText('Loading...')).toBeTruthy()
      })

      it('renders custom pending dot', () => {
        const items: TimelineItem[] = [
          { key: 1, content: 'Event 1' },
        ]

        render(Timeline, {
          props: { 
            items,
            pending: true,
            pendingDot: h('div', { class: 'custom-pending' }, 'Custom'),
          },
        })

        expect(screen.getByText('Custom')).toBeTruthy()
      })
    })

    describe('reverse', () => {
      it('reverses items order when reverse is true', () => {
        const items: TimelineItem[] = [
          { key: 1, content: 'Event 1' },
          { key: 2, content: 'Event 2' },
          { key: 3, content: 'Event 3' },
        ]

        render(Timeline, {
          props: { 
            items,
            reverse: true,
          },
        })

        const contents = screen.getAllByText(/Event \d/)
        expect(contents[0].textContent).toBe('Event 3')
        expect(contents[1].textContent).toBe('Event 2')
        expect(contents[2].textContent).toBe('Event 1')
      })
    })

    describe('color', () => {
      it('applies custom color to timeline dot', () => {
        const items: TimelineItem[] = [
          { key: 1, content: 'Event 1', color: '#ff0000' },
        ]

        const { container } = render(Timeline, {
          props: { items },
        })

        const dot = container.querySelector('.w-2\\.5')
        expect(dot).toBeTruthy()
      })
    })

    describe('custom dot', () => {
      it('renders custom dot from item', () => {
        const items: TimelineItem[] = [
          { 
            key: 1, 
            content: 'Event 1',
            dot: h('div', { class: 'custom-dot' }, 'Custom Dot'),
          },
        ]

        render(Timeline, {
          props: { items },
        })

        expect(screen.getByText('Custom Dot')).toBeTruthy()
      })
    })
  })

  describe('Slots', () => {
    it('renders custom item content via slot', () => {
      const items: TimelineItem[] = [
        { key: 1, label: '2024-01-01', content: 'Event 1' },
      ]

      render(Timeline, {
        props: { items },
        slots: {
          item: ({ item }: { item: TimelineItem }) => 
            h('div', { class: 'custom-content' }, `Custom: ${item.content}`),
        },
      })

      expect(screen.getByText('Custom: Event 1')).toBeTruthy()
    })

    it('renders custom dot via slot', () => {
      const items: TimelineItem[] = [
        { key: 1, content: 'Event 1' },
      ]

      render(Timeline, {
        props: { items },
        slots: {
          dot: () => h('div', { class: 'custom-dot-slot' }, 'Dot'),
        },
      })

      expect(screen.getByText('Dot')).toBeTruthy()
    })

    it('renders custom pending content via slot', () => {
      const items: TimelineItem[] = [
        { key: 1, content: 'Event 1' },
      ]

      render(Timeline, {
        props: { 
          items,
          pending: true,
        },
        slots: {
          pending: () => h('div', 'Custom Pending Content'),
        },
      })

      expect(screen.getByText('Custom Pending Content')).toBeTruthy()
    })
  })

  describe('Timeline Structure', () => {
    it('renders connector line between items', () => {
      const items: TimelineItem[] = [
        { key: 1, content: 'Event 1' },
        { key: 2, content: 'Event 2' },
      ]

      const { container } = render(Timeline, {
        props: { items },
      })

      // Check for tail (connector line) elements
      const tails = container.querySelectorAll('.w-0\\.5')
      expect(tails.length).toBeGreaterThan(0)
    })

    it('does not render connector on last item', () => {
      const items: TimelineItem[] = [
        { key: 1, content: 'Event 1' },
        { key: 2, content: 'Event 2' },
      ]

      const { container } = render(Timeline, {
        props: { items },
      })

      const tails = container.querySelectorAll('.w-0\\.5')
      
      // Should have tails for all items except the last one
      // With 2 items, we expect only 1 tail (for the first item)
      expect(tails.length).toBe(1)
    })
  })

  describe('Accessibility', () => {
    it('uses semantic ul element', () => {
      const items: TimelineItem[] = [
        { key: 1, content: 'Event 1' },
      ]

      const { container } = render(Timeline, {
        props: { items },
      })

      expect(container.querySelector('ul')).toBeTruthy()
    })

    it('uses semantic li elements for items', () => {
      const items: TimelineItem[] = [
        { key: 1, content: 'Event 1' },
        { key: 2, content: 'Event 2' },
      ]

      const { container } = render(Timeline, {
        props: { items },
      })

      const listItems = container.querySelectorAll('li')
      expect(listItems).toHaveLength(2)
    })
  })

  describe('Edge Cases', () => {
    it('handles items without keys', () => {
      const items: TimelineItem[] = [
        { content: 'Event 1' },
        { content: 'Event 2' },
      ]

      const { container } = render(Timeline, {
        props: { items },
      })

      expect(container.querySelectorAll('li')).toHaveLength(2)
    })

    it('handles items without labels', () => {
      const items: TimelineItem[] = [
        { key: 1, content: 'Event 1' },
      ]

      render(Timeline, {
        props: { items },
      })

      expect(screen.getByText('Event 1')).toBeTruthy()
    })

    it('handles items without content', () => {
      const items: TimelineItem[] = [
        { key: 1, label: '2024-01-01' },
      ]

      render(Timeline, {
        props: { items },
      })

      expect(screen.getByText('2024-01-01')).toBeTruthy()
    })

    it('handles empty items array', () => {
      const { container } = render(Timeline, {
        props: { items: [] },
      })

      expect(container.querySelector('ul')).toBeTruthy()
      expect(container.querySelectorAll('li')).toHaveLength(0)
    })
  })
})
