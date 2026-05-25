/**
 * @vitest-environment happy-dom
 */

import { defineComponent, h, ref } from 'vue'
import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { Spotlight, type SpotlightItem } from '@expcat/tigercat-vue'
import { expectNoA11yViolationsIsolated } from '../utils'

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

describe('Spotlight (Vue)', () => {
  it('does not render when closed', () => {
    render(Spotlight, { props: { items } })

    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument()
  })

  it('renders dialog, title and search input when open', () => {
    render(Spotlight, {
      props: { open: true, items, title: 'Command menu', placeholder: 'Find command' }
    })

    expect(document.querySelector('[role="dialog"]')).toBeInTheDocument()
    expect(document.querySelector('input')?.getAttribute('placeholder')).toBe('Find command')
    expect(document.body).toHaveTextContent('Command menu')
  })

  it('filters results by fuzzy query and keyword', async () => {
    render(Spotlight, { props: { open: true, items } })

    await fireEvent.update(document.querySelector('input')!, 'help')

    expect(document.body).toHaveTextContent('Search Docs')
    expect(document.body).not.toHaveTextContent('Open Dashboard')
  })

  it('renders grouped results and shortcut labels', () => {
    render(Spotlight, { props: { open: true, items } })

    expect(document.body).toHaveTextContent('Navigation')
    expect(document.body).toHaveTextContent('Actions')
    expect(document.body).toHaveTextContent('⌘ D')
  })

  it('selects active item with Enter and closes by default', async () => {
    const { emitted } = render(Spotlight, { props: { open: true, items } })

    await fireEvent.keyDown(document.querySelector('input')!, { key: 'Enter' })

    expect(emitted().select).toEqual([[items[0]]])
    expect(emitted()['update:open']).toEqual([[false]])
  })

  it('skips disabled items during keyboard navigation', async () => {
    const disabledFirstItems = [
      { key: 'disabled', label: 'Disabled action', disabled: true },
      { key: 'enabled', label: 'Enabled action' }
    ]
    const { emitted } = render(Spotlight, {
      props: { open: true, items: disabledFirstItems }
    })

    const input = document.querySelector('input')!
    expect(input.getAttribute('aria-activedescendant')).toContain('option-1')

    await fireEvent.keyDown(input, { key: 'Enter' })
    expect(emitted().select).toEqual([[disabledFirstItems[1]]])
  })

  it('supports controlled query updates', async () => {
    const Controlled = defineComponent({
      setup() {
        const query = ref('')
        return () =>
          h(Spotlight, {
            open: true,
            items,
            query: query.value,
            'onUpdate:query': (nextQuery: string) => {
              query.value = nextQuery
            }
          })
      }
    })

    render(Controlled)
    await fireEvent.update(document.querySelector('input')!, 'doc')

    expect((document.querySelector('input') as HTMLInputElement).value).toBe('doc')
  })

  it('closes on Escape and mask click', async () => {
    const { emitted, rerender } = render(Spotlight, { props: { open: true, items } })

    await fireEvent.keyDown(document.querySelector('input')!, { key: 'Escape' })
    expect(emitted()['update:open']).toEqual([[false]])

    await rerender({ open: true, items })
    await fireEvent.click(document.querySelector('[aria-hidden="true"]')!)
    expect(emitted()['update:open']).toContainEqual([false])
  })

  it('shows empty text when no result matches', async () => {
    render(Spotlight, { props: { open: true, items, emptyText: 'Nothing here' } })

    await fireEvent.update(document.querySelector('input')!, 'zzzz')

    expect(document.body).toHaveTextContent('Nothing here')
  })

  describe('Edge Cases', () => {
    it('keeps the panel open when closeOnSelect is false', async () => {
      const { emitted } = render(Spotlight, {
        props: { open: true, items, closeOnSelect: false }
      })

      await fireEvent.keyDown(document.querySelector('input')!, { key: 'Enter' })

      expect(emitted().select).toEqual([[items[0]]])
      expect(emitted()['update:open']).toBeUndefined()
    })

    it('does not close from mask click when maskClosable is false', async () => {
      const { emitted } = render(Spotlight, {
        props: { open: true, items, maskClosable: false }
      })

      await fireEvent.click(document.querySelector('[aria-hidden="true"]')!)

      expect(emitted()['update:open']).toBeUndefined()
    })

    it('applies custom filters and result limits', () => {
      render(Spotlight, {
        props: {
          open: true,
          items,
          filterItem: (_query: string, item: SpotlightItem) => item.group === 'Navigation',
          limit: 1
        }
      })

      expect(document.querySelectorAll('[role="option"]')).toHaveLength(1)
      expect(document.body).toHaveTextContent('Open Dashboard')
      expect(document.body).not.toHaveTextContent('Search Docs')
    })

    it('does not select disabled items on click', async () => {
      const { emitted } = render(Spotlight, { props: { open: true, items } })

      await fireEvent.click(document.body.querySelector('[aria-disabled="true"]')!)

      expect(emitted().select).toBeUndefined()
    })

    it('renders string icons safely', () => {
      render(Spotlight, {
        props: { open: true, items: [{ key: 'icon', label: 'Icon command', icon: '★' }] }
      })

      expect(document.body).toHaveTextContent('★')
      expect(document.body).toHaveTextContent('Icon command')
    })
  })

  it('has no accessibility violations', async () => {
    render(Spotlight, { props: { open: true, items } })
    await expectNoA11yViolationsIsolated(document.body)
  })
})
