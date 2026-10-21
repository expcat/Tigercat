/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/vue'
import { defineComponent, h, ref } from 'vue'
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
})
