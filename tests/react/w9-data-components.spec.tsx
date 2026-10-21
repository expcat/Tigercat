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

  it('keeps assignee option ids unique and the active descendant valid after options shrink', () => {
    const all = [
      { id: 'a', name: 'Alice' },
      { id: 'b', name: 'Bob' },
      { id: 'c', name: 'Carol' }
    ]
    const onChange = viChange()
    const view = render(
      <div>
        <AssigneePicker options={all} onChange={onChange.fn} />
        <AssigneePicker options={all} />
      </div>
    )
    const listbox = view.getAllByRole('listbox')[0]
    const initialIds = view.getAllByRole('option').map((option) => option.id)
    expect(new Set(initialIds).size).toBe(initialIds.length)

    fireEvent.keyDown(listbox, { key: 'End' })
    const carol = listbox.querySelectorAll('[role="option"]')[2]
    expect(listbox.getAttribute('aria-activedescendant')).toBe(carol.id)

    view.rerender(
      <div>
        <AssigneePicker options={[all[0]]} onChange={onChange.fn} />
        <AssigneePicker options={all} />
      </div>
    )
    const alice = listbox.querySelector('[role="option"]')!
    expect(alice.textContent).toBe('Alice')
    expect(alice.id).toBe(initialIds[0])
    expect(listbox.getAttribute('aria-activedescendant')).toBe(alice.id)

    fireEvent.keyDown(listbox, { key: 'Enter' })
    expect(onChange.ids).toEqual(['a'])
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
