/**
 * @vitest-environment happy-dom
 */
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'
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

  it('updates the notification bell live text when the unread count or locale changes', () => {
    const view = render(
      <NotificationBell
        items={[
          { id: '1', title: 'One', read: false },
          { id: '2', title: 'Two', read: true }
        ]}
      />
    )
    const live = () => view.container.querySelector('[aria-live="polite"]')?.textContent ?? ''
    expect(live()).toContain('1 unread')

    view.rerender(
      <NotificationBell
        items={[
          { id: '1', title: 'One', read: false },
          { id: '2', title: 'Two', read: false },
          { id: '3', title: 'Three', read: false }
        ]}
      />
    )
    expect(live()).toContain('3 unread')

    view.rerender(
      <NotificationBell
        items={[
          { id: '1', title: 'One', read: true },
          { id: '2', title: 'Two', read: true },
          { id: '3', title: 'Three', read: true }
        ]}
      />
    )
    expect(live()).toContain('0 unread')

    view.rerender(
      <NotificationBell items={[{ id: '1', title: 'One', read: false }]} locale={zhCN} />
    )
    expect(live()).toContain('1 条未读')
  })

  it('focuses an enabled control inside the opened bell panel', async () => {
    const read = [{ id: '1', title: 'Read', read: true }]
    const view = render(
      <div>
        <NotificationBell items={read} />
        <NotificationBell items={read} />
      </div>
    )
    const bells = view.getAllByRole('button', { name: /0 unread/ })
    fireEvent.click(bells[1])
    await waitFor(() => {
      const panels = [...document.querySelectorAll('[data-tiger-notification-bell-panel]')]
      const active = document.activeElement
      const owner = panels.find((panel) => panel.contains(active))
      expect(owner).toBe(panels[panels.length - 1])
      expect(active?.textContent ?? '').not.toContain('Mark all as read')
      expect((active as HTMLButtonElement).disabled).toBe(false)
    })
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

  it('moves the active assignee from the search box without sharing its name', () => {
    const view = render(
      <AssigneePicker
        options={[
          { id: 'ada', name: 'Ada' },
          { id: 'bea', name: 'Bea' },
          { id: 'cy', name: 'Cy' }
        ]}
      />
    )
    const search = view.getByRole('searchbox')
    const listbox = view.getByRole('listbox')
    expect(search.getAttribute('aria-label')).not.toBe(listbox.getAttribute('aria-label'))
    fireEvent.keyDown(search, { key: 'ArrowDown' })
    const bea = view.getByRole('option', { name: 'Bea' })
    expect(listbox.getAttribute('aria-activedescendant')).toBe(bea.id)
  })

  it('keeps Enter on the assignee that was clicked', () => {
    const selected = viChange()
    const view = render(
      <AssigneePicker
        options={[
          { id: 'ada', name: 'Ada' },
          { id: 'bea', name: 'Bea' },
          { id: 'cy', name: 'Cy' }
        ]}
        selectedIds={selected.ids}
        onChange={selected.fn}
      />
    )
    const listbox = view.getByRole('listbox')
    fireEvent.keyDown(listbox, { key: 'ArrowDown' })
    fireEvent.click(view.getByRole('option', { name: 'Cy' }))
    view.rerender(
      <AssigneePicker
        options={[
          { id: 'ada', name: 'Ada' },
          { id: 'bea', name: 'Bea' },
          { id: 'cy', name: 'Cy' }
        ]}
        selectedIds={selected.ids}
        onChange={selected.fn}
      />
    )
    const cy = view.getByRole('option', { name: 'Cy' })
    expect(listbox.getAttribute('aria-activedescendant')).toBe(cy.id)
    fireEvent.keyDown(listbox, { key: 'Enter' })
    expect(selected.ids).not.toContain('bea')
  })

  it('uses a no-match message when assignee search misses and empty copy when the directory is empty', () => {
    const options = [
      { id: 'ada', name: 'Ada' },
      { id: 'bea', name: 'Bea' },
      { id: 'cy', name: 'Cy' }
    ]
    const missed = render(<AssigneePicker options={options} />)
    fireEvent.change(missed.getByRole('searchbox'), { target: { value: 'zzz' } })
    expect(missed.queryByText('The directory is empty')).toBeNull()
    expect(missed.getByText('No results found')).toBeTruthy()
    missed.unmount()

    const empty = render(<AssigneePicker options={[]} />)
    expect(empty.getByText('The directory is empty')).toBeTruthy()
    empty.unmount()

    const zhMissed = render(<AssigneePicker options={options} locale={zhCN} />)
    fireEvent.change(zhMissed.getByRole('searchbox'), { target: { value: 'zzz' } })
    expect(zhMissed.getByText('暂无结果')).toBeTruthy()
    zhMissed.unmount()

    const zhEmpty = render(<AssigneePicker options={[]} locale={zhCN} />)
    expect(zhEmpty.getByText('目录为空')).toBeTruthy()
  })

  it('keeps a selected-assignee count when the filter hides them', () => {
    const selected = viChange()
    const options = [
      { id: 'ada', name: 'Ada', department: 'Ops' },
      { id: 'bea', name: 'Bea', department: 'Design' },
      { id: 'cy', name: 'Cy', department: 'People' }
    ]
    const view = render(
      <AssigneePicker options={options} selectedIds={selected.ids} onChange={selected.fn} />
    )
    fireEvent.click(view.getByRole('option', { name: /Cy/ }))
    view.rerender(
      <AssigneePicker options={options} selectedIds={selected.ids} onChange={selected.fn} />
    )
    fireEvent.click(view.getByRole('option', { name: /Bea/ }))
    view.rerender(
      <AssigneePicker options={options} selectedIds={selected.ids} onChange={selected.fn} />
    )
    fireEvent.change(view.getByRole('searchbox'), { target: { value: 'Design' } })
    expect(view.getByText('2 selected')).toBeTruthy()
    expect(view.getByRole('option', { name: /Bea/ })).toBeTruthy()
  })

  it('scrolls a long assignee list when End moves the active option', () => {
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
    const view = render(<AssigneePicker options={options} />)
    const listbox = view.getByRole('listbox')
    expect(listbox.className).toContain('overflow-auto')
    expect(listbox.className).toMatch(/max-h-/)
    fireEvent.keyDown(listbox, { key: 'End' })
    const last = view.getByRole('option', { name: 'Person 30' })
    expect(listbox.getAttribute('aria-activedescendant')).toBe(last.id)
    expect(seen.at(-1)).toBe(last)
    spy.mockRestore()
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
