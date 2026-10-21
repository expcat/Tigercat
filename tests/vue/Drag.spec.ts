/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import { Drag } from '@expcat/tigercat-vue/Drag'
import type { DragItem } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils'

const items: DragItem[] = [
  { id: 'a', index: 0 },
  { id: 'b', index: 1 }
]

describe('Drag (Vue)', () => {
  it('renders items with the same drag bindings as useDrag', () => {
    render(Drag, { props: { items } })
    expect(screen.getByText('a')).toBeInTheDocument()
    expect(screen.getByText('b')).toBeInTheDocument()
    expect(screen.getByText('a')).toHaveAttribute('draggable', 'true')
  })

  it('has no obvious a11y violations', async () => {
    const { container } = render(Drag, { props: { items } })
    await expectNoA11yViolationsIsolated(container)
  })

  it('rebinds the items map when containerId changes after mount', async () => {
    const sourceId = ref('source')
    const targetId = ref('target')
    const a = ref<DragItem[]>([{ id: 'A', index: 0 }])
    const b = ref<DragItem[]>([{ id: 'B', index: 0 }])
    const Host = defineComponent({
      setup() {
        return () =>
          h('div', {}, [
            h(Drag, {
              items: a.value,
              containerId: sourceId.value,
              config: { crossContainer: true },
              'onUpdate:items': (next: DragItem[]) => {
                a.value = next
              }
            }),
            h(Drag, {
              items: b.value,
              containerId: targetId.value,
              config: { crossContainer: true },
              'onUpdate:items': (next: DragItem[]) => {
                b.value = next
              }
            })
          ])
      }
    })
    const { container } = render(Host)
    await nextTick()
    sourceId.value = 'new-source'
    await nextTick()

    const lists = container.querySelectorAll('[role="list"]')
    const source = lists[0].querySelector('[role="listitem"]') as HTMLElement
    const target = lists[1].querySelector('[role="listitem"]') as HTMLElement
    const dataTransfer = { setData: vi.fn(), effectAllowed: 'none', dropEffect: 'none' }
    await fireEvent.dragStart(source, { dataTransfer })
    await fireEvent.dragOver(target, { dataTransfer })
    await fireEvent.drop(target, { dataTransfer })
    await nextTick()

    expect(a.value.map((item) => item.id)).toEqual([])
    expect(b.value.map((item) => item.id)).toEqual(['A', 'B'])
  })
})
