/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { fireEvent, render, screen } from '@testing-library/vue'
import { Drag } from '@expcat/tigercat-vue/Drag'
import { ConfigProvider } from '@expcat/tigercat-vue/ConfigProvider'
import type { DragItem } from '@expcat/tigercat-core'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
import { expectNoA11yViolationsIsolated } from '../utils'

const items: DragItem[] = [
  { id: 'a', index: 0 },
  { id: 'b', index: 1 }
]

describe('Drag (Vue)', () => {
  it('reorders default items using only the keyboard', async () => {
    const value = ref(items)
    const Host = defineComponent(
      () => () =>
        h(Drag, {
          items: value.value,
          'onUpdate:items': (next: DragItem[]) => {
            value.value = next
          }
        })
    )
    render(Host)
    const first = screen.getAllByRole('listitem')[0]
    expect.soft(first).toHaveAttribute('tabindex', '0')
    first.focus()
    expect.soft(first).toHaveFocus()
    await fireEvent.keyDown(first, { key: ' ' })
    await fireEvent.keyDown(first, { key: 'ArrowDown' })
    await fireEvent.keyDown(first, { key: 'Enter' })

    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual(['b', 'a'])
  })

  it.each([false, true])(
    'announces the hovered position in zh-CN (cross-container: %s)',
    async (cross) => {
      const source = ref<DragItem[]>(cross ? [items[0]] : [...items, { id: 0, index: 2 }])
      const target = ref<DragItem[]>([
        { id: 'b', index: 0 },
        { id: 0, index: 1 }
      ])
      const Host = defineComponent(
        () => () =>
          h(ConfigProvider, { locale: zhCN }, () => [
            h(Drag, {
              items: source.value,
              containerId: 'source',
              config: { crossContainer: cross },
              'onUpdate:items': (next: DragItem[]) => {
                source.value = next
              }
            }),
            cross
              ? h(Drag, {
                  items: target.value,
                  containerId: 'target',
                  config: { crossContainer: true },
                  'onUpdate:items': (next: DragItem[]) => {
                    target.value = next
                  }
                })
              : null
          ])
      )
      const { container } = render(Host)
      await fireEvent.dragStart(screen.getByText('a'))
      await fireEvent.dragOver(screen.getByText('0'))

      expect(container.querySelector('[data-tiger-drag-live]')).toHaveTextContent(
        `从第 1 项到第 ${cross ? 2 : 3} 项`
      )
      await fireEvent.drop(screen.getByText('0'))
      expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual(
        cross ? ['b', 'a', '0'] : ['b', '0', 'a']
      )
    }
  )

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
