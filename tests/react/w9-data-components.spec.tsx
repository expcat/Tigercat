/**
 * @vitest-environment happy-dom
 */
import React from 'react'
import { describe, expect, it } from 'vitest'
import { fireEvent, render } from '@testing-library/react'
import { WaterfallChart } from '../../packages/react/src/components/WaterfallChart'
import { SankeyChart } from '../../packages/react/src/components/SankeyChart'
import { NotificationBell } from '../../packages/react/src/components/NotificationBell'
import { AssigneePicker } from '../../packages/react/src/components/AssigneePicker'
import { VirtualList } from '@expcat/tigercat-react/VirtualList'

describe('W9 react data components', () => {
  it('renders waterfall bars and sankey links', () => {
    const waterfall = render(
      <WaterfallChart
        responsive={false}
        width={320}
        height={180}
        data={[
          { label: 'Open', value: 10, kind: 'total' },
          { label: 'Gain', value: 4, kind: 'increase' }
        ]}
      />
    )
    expect(waterfall.container.querySelector('[data-waterfall-bar="increase"]')).toBeTruthy()
    waterfall.unmount()

    const sankey = render(
      <SankeyChart
        responsive={false}
        width={320}
        height={180}
        nodes={[
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' }
        ]}
        links={[{ source: 'a', target: 'b', value: 4 }]}
      />
    )
    expect(sankey.container.querySelector('[data-sankey-link]')).toBeTruthy()
  })

  it('announces the notification bell count once', () => {
    const view = render(
      <NotificationBell
        items={[
          { id: '1', title: 'One', read: false },
          { id: '2', title: 'Two', read: true }
        ]}
      />
    )
    expect(view.getByRole('button').textContent).toContain('1')
    expect(view.container.querySelector('[aria-live="polite"]')?.textContent).toContain('1')
  })

  it('filters assignees and emits selected ids', () => {
    const onChange = viChange()
    const view = render(
      <AssigneePicker
        options={[
          { id: 'a', name: 'Ada', department: 'Ops' },
          { id: 'b', name: 'Bea', department: 'Design' }
        ]}
        onChange={onChange.fn}
      />
    )
    expect(view.getByRole('listbox')).toBeTruthy()
    fireEvent.click(view.getByRole('option', { name: /Ada/ }))
    expect(onChange.ids).toEqual(['a'])
  })

  it('uses one virtual window for a multi-column list', () => {
    const view = render(
      <VirtualList
        itemCount={12}
        itemHeight={40}
        height={80}
        columns={3}
        overscan={0}
        renderItem={({ index }) => <span>Item {index}</span>}
      />
    )
    expect(view.container.querySelector('[data-tiger-virtual-columns="3"]')).toBeTruthy()
    expect(view.container.textContent).not.toContain('Item 11')
  })
})

function viChange() {
  const box: { ids: string[]; fn: (ids: string[]) => void } = {
    ids: [],
    fn: (ids) => {
      box.ids = ids
    }
  }
  return box
}
