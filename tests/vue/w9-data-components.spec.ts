/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { defineComponent, h, ref } from 'vue'
import { WaterfallChart } from '../../packages/vue/src/components/WaterfallChart'
import { SankeyChart } from '../../packages/vue/src/components/SankeyChart'
import { NotificationBell } from '../../packages/vue/src/components/NotificationBell'
import { AssigneePicker } from '../../packages/vue/src/components/AssigneePicker'
import { VirtualList } from '@expcat/tigercat-vue/VirtualList'

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

  it('uses one virtual window for a multi-column list', () => {
    const view = render(VirtualList, {
      props: {
        itemCount: 12,
        itemHeight: 40,
        height: 80,
        columns: 3,
        overscan: 0
      },
      slots: {
        default: ({ index }: { index: number }) => h('span', `Item ${index}`)
      }
    })
    expect(view.container.querySelector('[data-tiger-virtual-columns="3"]')).toBeTruthy()
    expect(view.container.textContent).not.toContain('Item 11')
  })
})
