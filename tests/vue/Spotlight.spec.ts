/**
 * @vitest-environment happy-dom
 */

import { defineComponent, h, nextTick, ref } from 'vue'
import { fireEvent, render, waitFor } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { Spotlight } from '@expcat/tigercat-vue/Spotlight'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import type { SpotlightItem } from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { expectNoA11yViolations } from '../utils'

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

  it('renders grouped results and one shortcut badge on the command row', () => {
    render(Spotlight, { props: { open: true, items } })

    expect(document.body).toHaveTextContent('Navigation')
    expect(document.body).toHaveTextContent('Actions')
    const dashboard = [...document.querySelectorAll('[role="option"]')].find((option) =>
      option.textContent?.includes('Open Dashboard')
    )
    expect(dashboard?.querySelectorAll('kbd')).toHaveLength(1)
    expect(dashboard?.querySelector('kbd')).toHaveTextContent('⌘ D')
    expect(document.querySelectorAll('kbd')).toHaveLength(1)
    expect(document.querySelector('[data-tiger-spotlight-footer]')).toBeNull()
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

    it('renders a registered icon name as svg and an unknown string as text', () => {
      render(Spotlight, {
        props: {
          open: true,
          items: [
            { key: 'find', label: 'Find command', icon: 'search' },
            { key: 'star', label: 'Star command', icon: '★' }
          ]
        }
      })

      const options = [...document.querySelectorAll('[role="option"]')]
      const find = options.find((option) => option.textContent?.includes('Find command'))
      const star = options.find((option) => option.textContent?.includes('Star command'))
      expect(find?.querySelector('svg')).toBeTruthy()
      expect(find?.textContent).not.toContain('search')
      expect(star?.querySelector('svg')).toBeNull()
      expect(star?.textContent).toContain('★')
    })
  })

  it('has no accessibility violations', async () => {
    render(Spotlight, { props: { open: true, items, hotkey: false } })
    await expectNoA11yViolations(document.body)
  })

  it('does not open from a hotkey unless one is set', async () => {
    render(Spotlight, { props: { items } })
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument()
    await fireEvent.keyDown(document, { key: 'k', metaKey: true })
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument()
  })

  it('claims the hotkey after mount and releases it when hotkey turns off', async () => {
    const hotkey = ref(false)
    const Page = defineComponent({
      setup() {
        return () => h(Spotlight, { items, hotkey: hotkey.value })
      }
    })
    render(Page)

    await fireEvent.keyDown(document, { key: 'k', metaKey: true })
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument()

    hotkey.value = true
    await nextTick()
    await fireEvent.keyDown(document, { key: 'k', metaKey: true })
    expect(document.querySelector('[role="dialog"]')).toBeInTheDocument()

    hotkey.value = false
    await nextTick()
    await fireEvent.keyDown(document, { key: 'k', metaKey: true })
    expect(document.querySelector('[role="dialog"]')).toBeInTheDocument()
  })

  it('closes from the toggle hotkey on the panel search input only', async () => {
    const Page = defineComponent({
      setup() {
        return () =>
          h('div', [h('input', { 'aria-label': 'notes' }), h(Spotlight, { items, hotkey: true })])
      }
    })
    render(Page)
    const notes = document.querySelector('input[aria-label="notes"]')!

    await fireEvent.keyDown(notes, { key: 'k', metaKey: true })
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument()

    await fireEvent.keyDown(document, { key: 'k', metaKey: true })
    const search = document.querySelector('[data-tiger-spotlight-root] input')!
    search.focus()
    expect(document.querySelector('[role="dialog"]')).toBeInTheDocument()

    await fireEvent.keyDown(search, { key: 'k', metaKey: true })
    expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument()
  })

  it('selects an item from its shortcut while open', async () => {
    const { emitted } = render(Spotlight, {
      props: { open: true, items, hotkey: false }
    })
    await fireEvent.keyDown(document, { key: 'd', metaKey: true })
    expect(emitted().select).toEqual([[items[0]]])
  })

  it('keeps listbox mounted when there are no matches and names the dialog from locale', async () => {
    render({
      setup: () => () =>
        h(ConfigProvider, { locale: zhCN }, () =>
          h(Spotlight, { open: true, items, hotkey: false, query: 'zzzzzzz' })
        )
    })
    expect(document.querySelector('[role="dialog"]')).toHaveAccessibleName('命令面板')
    expect(document.querySelector('[role="listbox"]')).toBeInTheDocument()
    expect(document.querySelector('[role="status"]')).toHaveTextContent('暂无结果')
    expect(document.body).not.toHaveTextContent('Open Dashboard')
  })

  it('hosts nested overlays on the trap root', () => {
    render(Spotlight, { props: { open: true, items, hotkey: false } })
    const root = document.querySelector('[data-tiger-spotlight-root]')
    expect(root?.querySelector(':scope > [data-tiger-overlay-host]')).toBeTruthy()
  })

  it('restores focus after defaultOpen Escape', async () => {
    const App = defineComponent({
      setup() {
        const show = ref(false)
        return () =>
          h('div', [
            h('button', { type: 'button', onClick: () => (show.value = true) }, 'Before'),
            show.value ? h(Spotlight, { defaultOpen: true, items, hotkey: false }) : null
          ])
      }
    })
    const { getByRole } = render({
      setup: () => () => h(ConfigProvider, null, () => h(App))
    })
    const opener = getByRole('button', { name: 'Before' })
    opener.focus()
    await fireEvent.click(opener)
    await waitFor(() => expect(getByRole('combobox')).toHaveFocus())
    await fireEvent.keyDown(document, { key: 'Escape' })
    await waitFor(() => {
      expect(document.querySelector('[role="dialog"]')).not.toBeInTheDocument()
    })
    expect(opener).toHaveFocus()
  })
})
