import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { Timeline } from '../../packages/react/src/components/Timeline'
import type { TimelineItem } from '../../packages/core/src/types/timeline'

describe('Timeline (React)', () => {
  describe('Rendering', () => {
    it('renders empty timeline', () => {
      const { container } = render(<Timeline items={[]} />)

      const timeline = container.querySelector('ul')
      expect(timeline).toBeTruthy()
    })

    it('renders timeline with items', () => {
      const items: TimelineItem[] = [
        { key: 1, label: '2024-01-01', content: 'Event 1' },
        { key: 2, label: '2024-01-05', content: 'Event 2' },
      ]

      const { container } = render(<Timeline items={items} />)

      const listItems = container.querySelectorAll('li')
      expect(listItems).toHaveLength(2)
    })

    it('renders timeline items with labels and content', () => {
      const items: TimelineItem[] = [
        { key: 1, label: '2024-01-01', content: 'Create project' },
      ]

      render(<Timeline items={items} />)

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

        const { container } = render(<Timeline items={items} />)

        const listItem = container.querySelector('li')
        expect(listItem?.className).toContain('pl-8')
      })

      it('renders right mode', () => {
        const items: TimelineItem[] = [
          { key: 1, content: 'Event 1' },
        ]

        const { container } = render(<Timeline items={items} mode="right" />)

        const listItem = container.querySelector('li')
        expect(listItem?.className).toContain('pr-8')
        expect(listItem?.className).toContain('text-right')
      })

      it('renders alternate mode', () => {
        const items: TimelineItem[] = [
          { key: 1, content: 'Event 1' },
          { key: 2, content: 'Event 2' },
        ]

        const { container } = render(<Timeline items={items} mode="alternate" />)

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

        const { container } = render(<Timeline items={items} />)

        expect(container.querySelectorAll('li')).toHaveLength(1)
      })

      it('renders pending item when pending is true', () => {
        const items: TimelineItem[] = [
          { key: 1, content: 'Event 1' },
        ]

        const { container } = render(<Timeline items={items} pending />)

        expect(container.querySelectorAll('li')).toHaveLength(2)
        expect(screen.getByText('Loading...')).toBeTruthy()
      })

      it('renders custom pending dot', () => {
        const items: TimelineItem[] = [
          { key: 1, content: 'Event 1' },
        ]

        render(
          <Timeline 
            items={items} 
            pending 
            pendingDot={<div className="custom-pending">Custom</div>}
          />
        )

        expect(screen.getByText('Custom')).toBeTruthy()
      })

      it('renders custom pending content', () => {
        const items: TimelineItem[] = [
          { key: 1, content: 'Event 1' },
        ]

        render(
          <Timeline 
            items={items} 
            pending 
            pendingContent={<div>Custom Pending</div>}
          />
        )

        expect(screen.getByText('Custom Pending')).toBeTruthy()
      })
    })

    describe('reverse', () => {
      it('reverses items order when reverse is true', () => {
        const items: TimelineItem[] = [
          { key: 1, content: 'Event 1' },
          { key: 2, content: 'Event 2' },
          { key: 3, content: 'Event 3' },
        ]

        render(<Timeline items={items} reverse />)

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

        const { container } = render(<Timeline items={items} />)

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
            dot: <div className="custom-dot">Custom Dot</div>,
          },
        ]

        render(<Timeline items={items} />)

        expect(screen.getByText('Custom Dot')).toBeTruthy()
      })
    })

    describe('className', () => {
      it('applies custom className', () => {
        const items: TimelineItem[] = [
          { key: 1, content: 'Event 1' },
        ]

        const { container } = render(
          <Timeline items={items} className="custom-timeline" />
        )

        const timeline = container.querySelector('ul')
        expect(timeline?.className).toContain('custom-timeline')
      })
    })
  })

  describe('Render Props', () => {
    it('renders custom item content via renderItem', () => {
      const items: TimelineItem[] = [
        { key: 1, label: '2024-01-01', content: 'Event 1' },
      ]

      render(
        <Timeline 
          items={items}
          renderItem={(item) => (
            <div className="custom-content">Custom: {item.content}</div>
          )}
        />
      )

      expect(screen.getByText('Custom: Event 1')).toBeTruthy()
    })

    it('renders custom dot via renderDot', () => {
      const items: TimelineItem[] = [
        { key: 1, content: 'Event 1' },
      ]

      render(
        <Timeline 
          items={items}
          renderDot={() => <div className="custom-dot-render">Dot</div>}
        />
      )

      expect(screen.getByText('Dot')).toBeTruthy()
    })
  })

  describe('Timeline Structure', () => {
    it('renders connector line between items', () => {
      const items: TimelineItem[] = [
        { key: 1, content: 'Event 1' },
        { key: 2, content: 'Event 2' },
      ]

      const { container } = render(<Timeline items={items} />)

      // Check for tail (connector line) elements
      const tails = container.querySelectorAll('.w-0\\.5')
      expect(tails.length).toBeGreaterThan(0)
    })

    it('does not render connector on last item', () => {
      const items: TimelineItem[] = [
        { key: 1, content: 'Event 1' },
        { key: 2, content: 'Event 2' },
      ]

      const { container } = render(<Timeline items={items} />)

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

      const { container } = render(<Timeline items={items} />)

      expect(container.querySelector('ul')).toBeTruthy()
    })

    it('uses semantic li elements for items', () => {
      const items: TimelineItem[] = [
        { key: 1, content: 'Event 1' },
        { key: 2, content: 'Event 2' },
      ]

      const { container } = render(<Timeline items={items} />)

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

      const { container } = render(<Timeline items={items} />)

      expect(container.querySelectorAll('li')).toHaveLength(2)
    })

    it('handles items without labels', () => {
      const items: TimelineItem[] = [
        { key: 1, content: 'Event 1' },
      ]

      render(<Timeline items={items} />)

      expect(screen.getByText('Event 1')).toBeTruthy()
    })

    it('handles items without content', () => {
      const items: TimelineItem[] = [
        { key: 1, label: '2024-01-01' },
      ]

      render(<Timeline items={items} />)

      expect(screen.getByText('2024-01-01')).toBeTruthy()
    })

    it('handles empty items array', () => {
      const { container } = render(<Timeline items={[]} />)

      expect(container.querySelector('ul')).toBeTruthy()
      expect(container.querySelectorAll('li')).toHaveLength(0)
    })

    it('handles undefined items', () => {
      const { container } = render(<Timeline />)

      expect(container.querySelector('ul')).toBeTruthy()
      expect(container.querySelectorAll('li')).toHaveLength(0)
    })
  })

  describe('Multiple Items', () => {
    it('renders multiple items correctly', () => {
      const items: TimelineItem[] = [
        { key: 1, label: '2024-01-01', content: 'Event 1' },
        { key: 2, label: '2024-01-05', content: 'Event 2' },
        { key: 3, label: '2024-01-10', content: 'Event 3' },
      ]

      render(<Timeline items={items} />)

      expect(screen.getByText('Event 1')).toBeTruthy()
      expect(screen.getByText('Event 2')).toBeTruthy()
      expect(screen.getByText('Event 3')).toBeTruthy()
    })

    it('renders alternating positions in alternate mode', () => {
      const items: TimelineItem[] = [
        { key: 1, content: 'Event 1' },
        { key: 2, content: 'Event 2' },
        { key: 3, content: 'Event 3' },
        { key: 4, content: 'Event 4' },
      ]

      const { container } = render(<Timeline items={items} mode="alternate" />)

      const listItems = container.querySelectorAll('li')
      
      // Check alternating pattern
      expect(listItems[0].className).toContain('flex-row-reverse') // left
      expect(listItems[1].className).not.toContain('flex-row-reverse') // right
      expect(listItems[2].className).toContain('flex-row-reverse') // left
      expect(listItems[3].className).not.toContain('flex-row-reverse') // right
    })
  })
})
