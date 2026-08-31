import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { ConfigProvider } from '@expcat/tigercat-react/ConfigProvider'
import { Timeline } from '@expcat/tigercat-react/Timeline'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'
import type { TimelineItem } from '../../packages/core/src/types/timeline'
import { expectNoA11yViolations } from '../utils/react'

describe('Timeline (React)', () => {
  it('renders labels and content', () => {
    const items: TimelineItem[] = [{ key: 1, label: '2024-01-01', content: 'Create project' }]

    render(<Timeline items={items} />)

    expect(screen.getByText('2024-01-01')).toBeTruthy()
    expect(screen.getByText('Create project')).toBeTruthy()
  })

  it('renders ReactNode item content', () => {
    const items: TimelineItem[] = [
      { key: 1, label: 'Now', content: <strong data-testid="rich-content">Updated profile</strong> }
    ]

    render(<Timeline items={items} />)

    expect(screen.getByTestId('rich-content')).toHaveTextContent('Updated profile')
  })

  it('supports mode=right and mode=alternate', () => {
    const items: TimelineItem[] = [
      { key: 1, content: 'Event 1' },
      { key: 2, content: 'Event 2' }
    ]

    const { container: rightContainer } = render(<Timeline items={items} mode="right" />)
    expect(rightContainer.querySelector('li')?.className).toContain('pe-8')

    const { container: altContainer } = render(<Timeline items={items} mode="alternate" />)
    const listItems = altContainer.querySelectorAll('li')
    expect(listItems[0].className).toContain('grid-cols-2')
    const contents = altContainer.querySelectorAll('[class*="col-start"]')
    expect(contents[0].className).toContain('col-start-1')
    expect(contents[1].className).toContain('col-start-2')
  })

  it('renders pending item and supports custom pending UI', () => {
    const items: TimelineItem[] = [{ key: 1, content: 'Event 1' }]

    const { container } = render(
      <Timeline
        items={items}
        pending
        pendingDot={<div>Pending Dot</div>}
        pendingContent={<div>Pending Content</div>}
      />
    )

    expect(container.querySelectorAll('li')).toHaveLength(2)
    expect(container.querySelector('ul')?.getAttribute('aria-busy')).toBe('true')
    expect(screen.getByText('Pending Dot')).toBeTruthy()
    expect(screen.getByText('Pending Content')).toBeTruthy()
  })

  it('keeps default pending text outside ConfigProvider', () => {
    render(<Timeline pending />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('uses ConfigProvider timeline locale for default pending content', () => {
    render(
      <ConfigProvider locale={zhCN}>
        <Timeline pending />
      </ConfigProvider>
    )
    expect(screen.getByText(zhCN.timeline!.pendingText!)).toBeInTheDocument()
  })

  it('uses zh-TW pending text from the official locale object', () => {
    render(
      <ConfigProvider locale={zhTW}>
        <Timeline pending />
      </ConfigProvider>
    )
    expect(screen.getByText(zhTW.timeline!.pendingText!)).toBeInTheDocument()
  })

  it('lets the timeline locale prop override ConfigProvider pending text', () => {
    render(
      <ConfigProvider locale={{ timeline: { pendingText: '全局加载中' } }}>
        <Timeline pending locale={{ timeline: { pendingText: '局部加载中' } }} />
      </ConfigProvider>
    )
    expect(screen.getByText('局部加载中')).toBeInTheDocument()
    expect(screen.queryByText('全局加载中')).toBeNull()
  })

  it('keeps custom pendingContent ahead of timeline locale text', () => {
    render(
      <ConfigProvider locale={{ timeline: { pendingText: '全局加载中' } }}>
        <Timeline pending pendingContent={<div>Custom pending</div>} />
      </ConfigProvider>
    )
    expect(screen.getByText('Custom pending')).toBeInTheDocument()
    expect(screen.queryByText('全局加载中')).toBeNull()
  })

  it('supports reverse order', () => {
    const items: TimelineItem[] = [
      { key: 1, content: 'Event 1' },
      { key: 2, content: 'Event 2' },
      { key: 3, content: 'Event 3' }
    ]

    render(<Timeline items={items} reverse />)

    const contents = screen.getAllByText(/Event \d/)
    expect(contents[0].textContent).toBe('Event 3')
  })

  it('keeps pending at the DOM end when reversed', () => {
    render(
      <Timeline
        items={[
          { key: 1, content: 'Event 1' },
          { key: 2, content: 'Event 2' }
        ]}
        reverse
        pending
      />
    )
    const items = screen.getAllByRole('listitem')
    expect(items[0]).toHaveTextContent('Event 2')
    expect(items[items.length - 1]).toHaveTextContent('Loading...')
  })

  it('prefers pendingDot over renderDot for the pending item', () => {
    render(
      <Timeline
        items={[{ key: 1, content: 'Event 1' }]}
        pending
        pendingDot={<span>Pending Dot</span>}
        renderDot={() => <span>Custom Dot</span>}
      />
    )
    expect(screen.getByText('Pending Dot')).toBeInTheDocument()
    expect(screen.getAllByText('Custom Dot')).toHaveLength(1)
  })

  it('keeps key 0 as the item identity', () => {
    const { rerender } = render(
      <Timeline items={[{ key: 0, content: 'Zero' }, { key: 1, content: 'One' }]} />
    )
    expect(screen.getByText('Zero')).toBeInTheDocument()
    rerender(<Timeline items={[{ key: 1, content: 'One' }, { key: 0, content: 'Zero' }]} />)
    expect(screen.getByText('Zero')).toBeInTheDocument()
  })

  it('supports renderItem and renderDot', () => {
    const items: TimelineItem[] = [{ key: 1, content: 'Event 1' }]

    render(
      <Timeline
        items={items}
        renderDot={() => <div>Dot</div>}
        renderItem={(item) => <div>Custom: {String(item.content)}</div>}
      />
    )

    expect(screen.getByText('Dot')).toBeTruthy()
    expect(screen.getByText('Custom: Event 1')).toBeTruthy()
  })

  it('passes through ul attributes and merges className', () => {
    const { getByTestId } = render(
      <Timeline items={[]} className="custom" data-testid="timeline" aria-label="Timeline" />
    )

    const ul = getByTestId('timeline')
    expect(ul.getAttribute('aria-label')).toBe('Timeline')
    expect(ul.className).toContain('custom')
  })
  describe('Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <Timeline
          pending
          items={[
            { key: 1, label: 'Start', content: 'Created' },
            { key: 2, label: 'Next', content: 'Shipped' }
          ]}
        />
      )
      expect(container.querySelector('ul')).toHaveAttribute('role', 'list')
      await expectNoA11yViolations(container)
    })
  })
  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      const { container } = render(<Timeline />)
      expect(container.firstChild).toBeTruthy()
    })
  })
})
