/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/vue'
import { defineComponent, h, ref } from 'vue'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { WaterfallChart } from '../../packages/vue/src/components/WaterfallChart'
import { SankeyChart } from '../../packages/vue/src/components/SankeyChart'
import { NotificationBell } from '../../packages/vue/src/components/NotificationBell'
import { AssigneePicker } from '../../packages/vue/src/components/AssigneePicker'

describe('W9 vue data components', () => {
  it('renders waterfall bars and sankey links', () => {
    const waterfall = render(WaterfallChart, {
      props: {
        responsive: false,
        width: 320,
        height: 180,
        data: [
          { label: 'Open', value: 10, kind: 'total' },
          { label: 'Gain', value: 4, kind: 'increase' }
        ]
      }
    })
    expect(waterfall.container.querySelector('[data-waterfall-bar="increase"]')).toBeTruthy()
    waterfall.unmount()

    const sankey = render(SankeyChart, {
      props: {
        responsive: false,
        width: 320,
        height: 180,
        nodes: [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' }
        ],
        links: [{ source: 'a', target: 'b', value: 4 }]
      }
    })
    expect(sankey.container.querySelector('[data-sankey-link]')).toBeTruthy()
  })

  it('announces the notification bell count once', () => {
    const view = render(NotificationBell, {
      props: {
        items: [
          { id: '1', title: 'One', read: false },
          { id: '2', title: 'Two', read: true }
        ]
      }
    })
    expect(view.getByRole('button').textContent).toContain('1')
    expect(view.container.querySelector('[aria-live="polite"]')?.textContent).toContain('1')
  })

  it('filters assignees and emits selected ids', async () => {
    const selected = ref<string[]>([])
    const Host = defineComponent({
      setup() {
        return () =>
          h(AssigneePicker, {
            options: [
              { id: 'a', name: 'Ada', department: 'Ops' },
              { id: 'b', name: 'Bea', department: 'Design' }
            ],
            selectedIds: selected.value,
            'onUpdate:selectedIds': (ids: string[]) => {
              selected.value = ids
            }
          })
      }
    })
    const view = render(Host)
    expect(view.getByRole('listbox')).toBeTruthy()
    await fireEvent.click(view.getByRole('option', { name: /Ada/ }))
    expect(selected.value).toEqual(['a'])
  })

  it('keeps assignee option ids unique and the active descendant valid after options shrink', async () => {
    const all = [
      { id: 'a', name: 'Alice' },
      { id: 'b', name: 'Bob' },
      { id: 'c', name: 'Carol' }
    ]
    const options = ref(all)
    const changes: string[][] = []
    const Host = defineComponent({
      setup() {
        return () =>
          h('div', null, [
            h(AssigneePicker, {
              options: options.value,
              onChange: (ids: string[]) => {
                changes.push(ids)
              }
            }),
            h(AssigneePicker, { options: all })
          ])
      }
    })
    const view = render(Host)
    const listbox = view.getAllByRole('listbox')[0]
    const initialIds = view.getAllByRole('option').map((option) => option.id)
    expect(new Set(initialIds).size).toBe(initialIds.length)

    await fireEvent.keyDown(listbox, { key: 'End' })
    const carol = listbox.querySelectorAll('[role="option"]')[2]
    expect(listbox.getAttribute('aria-activedescendant')).toBe(carol.id)

    options.value = [all[0]]
    await waitFor(() => expect(listbox.querySelectorAll('[role="option"]')).toHaveLength(1))
    const alice = listbox.querySelector('[role="option"]')!
    expect(alice.textContent).toBe('Alice')
    expect(alice.id).toBe(initialIds[0])
    expect(listbox.getAttribute('aria-activedescendant')).toBe(alice.id)

    await fireEvent.keyDown(listbox, { key: 'Enter' })
    expect(changes).toEqual([['a']])
  })

  it('moves the active assignee from the search box without sharing its name', async () => {
    const view = render(AssigneePicker, {
      props: {
        options: [
          { id: 'ada', name: 'Ada' },
          { id: 'bea', name: 'Bea' },
          { id: 'cy', name: 'Cy' }
        ]
      }
    })
    const search = view.getByRole('searchbox')
    const listbox = view.getByRole('listbox')
    expect(search.getAttribute('aria-label')).not.toBe(listbox.getAttribute('aria-label'))
    await fireEvent.keyDown(search, { key: 'ArrowDown' })
    const bea = view.getByRole('option', { name: 'Bea' })
    expect(listbox.getAttribute('aria-activedescendant')).toBe(bea.id)
  })

  it('keeps Enter on the assignee that was clicked', async () => {
    const selected = ref<string[]>([])
    const Host = defineComponent({
      setup() {
        return () =>
          h(AssigneePicker, {
            options: [
              { id: 'ada', name: 'Ada' },
              { id: 'bea', name: 'Bea' },
              { id: 'cy', name: 'Cy' }
            ],
            selectedIds: selected.value,
            'onUpdate:selectedIds': (ids: string[]) => {
              selected.value = ids
            }
          })
      }
    })
    const view = render(Host)
    const listbox = view.getByRole('listbox')
    await fireEvent.keyDown(listbox, { key: 'ArrowDown' })
    await fireEvent.click(view.getByRole('option', { name: 'Cy' }))
    const cy = view.getByRole('option', { name: 'Cy' })
    expect(listbox.getAttribute('aria-activedescendant')).toBe(cy.id)
    await fireEvent.keyDown(listbox, { key: 'Enter' })
    expect(selected.value).not.toContain('bea')
  })

  it('uses a no-match message when assignee search misses and empty copy when the directory is empty', async () => {
    const options = [
      { id: 'ada', name: 'Ada' },
      { id: 'bea', name: 'Bea' },
      { id: 'cy', name: 'Cy' }
    ]
    const missed = render(AssigneePicker, { props: { options } })
    await fireEvent.update(missed.getByRole('searchbox'), 'zzz')
    expect(missed.queryByText('The directory is empty')).toBeNull()
    expect(missed.getByText('No results found')).toBeTruthy()
    missed.unmount()

    const empty = render(AssigneePicker, { props: { options: [] } })
    expect(empty.getByText('The directory is empty')).toBeTruthy()
    empty.unmount()

    const zhMissed = render(AssigneePicker, { props: { options, locale: zhCN } })
    await fireEvent.update(zhMissed.getByRole('searchbox'), 'zzz')
    expect(zhMissed.getByText('暂无结果')).toBeTruthy()
    zhMissed.unmount()

    const zhEmpty = render(AssigneePicker, { props: { options: [], locale: zhCN } })
    expect(zhEmpty.getByText('目录为空')).toBeTruthy()
  })

  it('keeps a selected-assignee count when the filter hides them', async () => {
    const selected = ref<string[]>([])
    const Host = defineComponent({
      setup() {
        return () =>
          h(AssigneePicker, {
            options: [
              { id: 'ada', name: 'Ada', department: 'Ops' },
              { id: 'bea', name: 'Bea', department: 'Design' },
              { id: 'cy', name: 'Cy', department: 'People' }
            ],
            selectedIds: selected.value,
            'onUpdate:selectedIds': (ids: string[]) => {
              selected.value = ids
            }
          })
      }
    })
    const view = render(Host)
    await fireEvent.click(view.getByRole('option', { name: /Cy/ }))
    await fireEvent.click(view.getByRole('option', { name: /Bea/ }))
    await fireEvent.update(view.getByRole('searchbox'), 'Design')
    expect(view.getByText('2 selected')).toBeTruthy()
    expect(view.getByRole('option', { name: /Bea/ })).toBeTruthy()
  })

  it('scrolls a long assignee list when End moves the active option', async () => {
    const options = Array.from({ length: 30 }, (_, index) => ({
      id: `p${index + 1}`,
      name: `Person ${index + 1}`
    }))
    const seen: Element[] = []
    const spy = vi.spyOn(HTMLElement.prototype, 'scrollIntoView').mockImplementation(function (
      this: HTMLElement
    ) {
      seen.push(this)
    })
    const view = render(AssigneePicker, { props: { options } })
    const listbox = view.getByRole('listbox')
    expect(listbox.className).toContain('overflow-auto')
    expect(listbox.className).toMatch(/max-h-/)
    await fireEvent.keyDown(listbox, { key: 'End' })
    const last = view.getByRole('option', { name: 'Person 30' })
    expect(listbox.getAttribute('aria-activedescendant')).toBe(last.id)
    expect(seen.at(-1)).toBe(last)
    spy.mockRestore()
  })
})
