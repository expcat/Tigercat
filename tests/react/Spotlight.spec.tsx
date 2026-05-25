/**
 * @vitest-environment happy-dom
 */

import React, { useState } from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Spotlight, type SpotlightItem } from '@expcat/tigercat-react'
import { expectNoA11yViolationsIsolated } from '../utils/react'

const items: SpotlightItem[] = [
  {
    key: 'dashboard',
    label: 'Open Dashboard',
    description: 'View workspace metrics',
    group: 'Navigation',
    shortcut: ['⌘', 'D']
  },
  {
    key: 'docs',
    label: 'Search Docs',
    group: 'Navigation',
    keywords: ['help']
  },
  {
    key: 'invite',
    label: 'Invite teammate',
    group: 'Actions',
    disabled: true
  }
]

describe('Spotlight (React)', () => {
  it('does not render when closed', () => {
    render(<Spotlight items={items} />)

    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument()
  })

  it('renders dialog, title and search input when open', () => {
    render(<Spotlight open items={items} title="Command menu" placeholder="Find command" />)

    expect(document.querySelector('[role="dialog"]')).toBeInTheDocument()
    expect(document.querySelector('#tiger-spotlight')).not.toBeInTheDocument()
    expect(document.querySelector('input')?.getAttribute('placeholder')).toBe('Find command')
    expect(document.body).toHaveTextContent('Command menu')
  })

  it('filters results by fuzzy query and keyword', async () => {
    const user = userEvent.setup()
    render(<Spotlight open items={items} />)

    await user.type(document.querySelector('input')!, 'help')

    expect(document.body).toHaveTextContent('Search Docs')
    expect(document.body).not.toHaveTextContent('Open Dashboard')
  })

  it('renders grouped results and shortcut labels', () => {
    render(<Spotlight open items={items} />)

    expect(document.body).toHaveTextContent('Navigation')
    expect(document.body).toHaveTextContent('Actions')
    expect(document.body).toHaveTextContent('⌘ D')
  })

  it('selects the active item with Enter and closes by default', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onOpenChange = vi.fn()

    render(<Spotlight open items={items} onSelect={onSelect} onOpenChange={onOpenChange} />)
    await user.keyboard('{Enter}')

    expect(onSelect).toHaveBeenCalledWith(items[0])
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('skips disabled items during keyboard navigation', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const disabledFirstItems = [
      { key: 'disabled', label: 'Disabled action', disabled: true },
      { key: 'enabled', label: 'Enabled action' }
    ]

    render(<Spotlight open items={disabledFirstItems} onSelect={onSelect} />)
    const input = document.querySelector('input')!

    expect(input.getAttribute('aria-activedescendant')).toContain('option-1')
    await user.keyboard('{Enter}')

    expect(onSelect).toHaveBeenCalledWith(disabledFirstItems[1])
  })

  it('updates query through controlled props', async () => {
    const user = userEvent.setup()
    const onQueryChange = vi.fn()

    const Controlled = () => {
      const [query, setQuery] = useState('')
      return (
        <Spotlight
          open
          items={items}
          query={query}
          onQueryChange={(nextQuery) => {
            onQueryChange(nextQuery)
            setQuery(nextQuery)
          }}
        />
      )
    }

    render(<Controlled />)
    await user.type(document.querySelector('input')!, 'doc')

    expect(onQueryChange).toHaveBeenLastCalledWith('doc')
    expect((document.querySelector('input') as HTMLInputElement).value).toBe('doc')
  })

  it('closes on Escape and mask click', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()
    const { rerender } = render(<Spotlight open items={items} onOpenChange={onOpenChange} />)

    await user.keyboard('{Escape}')
    expect(onOpenChange).toHaveBeenCalledWith(false)

    rerender(<Spotlight open items={items} onOpenChange={onOpenChange} />)
    await user.click(document.querySelector('[aria-hidden="true"]')!)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('shows empty text when no result matches', async () => {
    const user = userEvent.setup()
    render(<Spotlight open items={items} emptyText="Nothing here" />)

    await user.type(document.querySelector('input')!, 'zzzz')

    expect(document.body).toHaveTextContent('Nothing here')
  })

  describe('Edge Cases', () => {
    it('keeps the panel open when closeOnSelect is false', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()
      const onSelect = vi.fn()

      render(
        <Spotlight
          open
          items={items}
          closeOnSelect={false}
          onOpenChange={onOpenChange}
          onSelect={onSelect}
        />
      )

      await user.keyboard('{Enter}')
      expect(onSelect).toHaveBeenCalledWith(items[0])
      expect(onOpenChange).not.toHaveBeenCalledWith(false)
    })

    it('does not close from mask click when maskClosable is false', async () => {
      const user = userEvent.setup()
      const onOpenChange = vi.fn()

      render(<Spotlight open items={items} maskClosable={false} onOpenChange={onOpenChange} />)
      await user.click(document.querySelector('[aria-hidden="true"]')!)

      expect(onOpenChange).not.toHaveBeenCalled()
    })

    it('applies custom filters and result limits', () => {
      render(
        <Spotlight
          open
          items={items}
          filterItem={(_query, item) => item.group === 'Navigation'}
          limit={1}
        />
      )

      expect(document.querySelectorAll('[role="option"]')).toHaveLength(1)
      expect(document.body).toHaveTextContent('Open Dashboard')
      expect(document.body).not.toHaveTextContent('Search Docs')
    })

    it('does not select disabled items on click', async () => {
      const user = userEvent.setup()
      const onSelect = vi.fn()

      render(<Spotlight open items={items} onSelect={onSelect} />)
      await user.click(document.body.querySelector('[aria-disabled="true"]')!)

      expect(onSelect).not.toHaveBeenCalled()
    })

    it('renders string icons safely', () => {
      render(<Spotlight open items={[{ key: 'icon', label: 'Icon command', icon: '★' }]} />)

      expect(document.body).toHaveTextContent('★')
      expect(document.body).toHaveTextContent('Icon command')
    })
  })

  it('has no accessibility violations', async () => {
    render(<Spotlight open items={items} />)
    await expectNoA11yViolationsIsolated(document.body)
  })
})
