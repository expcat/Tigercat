/**
 * @vitest-environment happy-dom
 */

import { fireEvent, render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { Gantt } from '@expcat/tigercat-vue'
import type { GanttTask } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils'

const data: GanttTask[] = [
  { id: 'design', label: 'Design', start: '2026-01-01', end: '2026-01-05', progress: 40 },
  {
    id: 'build',
    label: 'Build',
    start: '2026-01-05',
    end: '2026-01-12',
    progress: 70,
    dependencies: ['design']
  }
]

describe('Gantt', () => {
  it('renders svg tasks, rows and dependencies', () => {
    const { container } = render(Gantt, { props: { data } })

    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-gantt-tasks="true"] > g')).toHaveLength(2)
    expect(container.querySelectorAll('[data-gantt-rows="true"] rect')).toHaveLength(2)
    expect(container.querySelectorAll('[data-gantt-dependencies="true"] path')).toHaveLength(1)
  })

  it('renders title, desc and task labels', () => {
    const { container, getByText } = render(Gantt, {
      props: { data, title: 'Plan', desc: 'Release plan' }
    })

    expect(container.querySelector('title')?.textContent).toBe('Plan')
    expect(container.querySelector('desc')?.textContent).toBe('Release plan')
    expect(getByText('Design')).toBeInTheDocument()
  })

  it('selects tasks when selectable', async () => {
    const { getByRole, emitted } = render(Gantt, { props: { data, selectable: true } })

    await fireEvent.click(getByRole('button', { name: 'Design, 01-01 to 01-05, 40%' }))

    expect(emitted()['update:selectedId']).toEqual([['design']])
    expect(emitted()['task-click']).toEqual([[data[0]]])
  })

  it('emits hover events when hoverable', async () => {
    const { getByRole, emitted } = render(Gantt, { props: { data, hoverable: true } })

    await fireEvent.mouseEnter(getByRole('button', { name: 'Build, 01-05 to 01-12, 70%' }))
    await fireEvent.mouseLeave(getByRole('button', { name: 'Build, 01-05 to 01-12, 70%' }))

    expect(emitted()['task-hover']).toEqual([[data[1]], [null]])
  })

  it('supports keyboard selection', async () => {
    const { getByRole, emitted } = render(Gantt, { props: { data, selectable: true } })

    await fireEvent.keyDown(getByRole('button', { name: 'Build, 01-05 to 01-12, 70%' }), {
      key: 'Enter'
    })

    expect(emitted()['update:selectedId']).toEqual([['build']])
  })

  it('supports custom colors and className', () => {
    const { container } = render(Gantt, {
      props: { data, colors: ['#ff0000'], className: 'gantt' }
    })

    expect(container.querySelector('svg.gantt')).toBeInTheDocument()
    expect(container.querySelector('rect[fill="#ff0000"]')).toBeInTheDocument()
  })

  it('can hide progress and dependencies', () => {
    const { container } = render(Gantt, {
      props: { data, showProgress: false, showDependencies: false }
    })

    expect(container.querySelector('[data-gantt-dependencies="true"]')).not.toBeInTheDocument()
    expect(container.querySelector('.fill-black\\/20')).not.toBeInTheDocument()
  })

  it('supports custom date formatter', () => {
    const { getByText } = render(Gantt, {
      props: { data, scale: 'month', dateFormatter: (date: Date) => `${date.getMonth() + 1}月` }
    })

    expect(getByText('1月')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(Gantt, { props: { data, title: 'Gantt chart' } })
    await expectNoA11yViolationsIsolated(container)
  })

  describe('Edge Cases and Boundary', () => {
    it.each(['day', 'week', 'month'] as const)('renders %s scale boundary', (scale) => {
      const { container } = render(Gantt, { props: { data, scale } })

      expect(container.querySelectorAll('[data-gantt-axis="true"] text').length).toBeGreaterThan(0)
    })

    it('renders empty data without task or dependency nodes', () => {
      const { container } = render(Gantt, { props: { data: [] } })

      expect(container.querySelectorAll('[data-gantt-tasks="true"] > g')).toHaveLength(0)
      expect(container.querySelectorAll('[data-gantt-dependencies="true"] path')).toHaveLength(0)
    })

    it('prevents disabled tasks from becoming selectable', async () => {
      const disabledData: GanttTask[] = [{ ...data[0], disabled: true }]
      const { getByRole, emitted } = render(Gantt, {
        props: { data: disabledData, selectable: true }
      })

      await fireEvent.click(getByRole('group', { name: 'Design, 01-01 to 01-05, 40%' }))

      expect(emitted()['update:selectedId']).toBeUndefined()
      expect(emitted()['task-click']).toEqual([[disabledData[0]]])
    })

    it('renders today marker when the range includes today', () => {
      const today = new Date()
      const minDate = new Date(today)
      minDate.setDate(today.getDate() - 1)
      const maxDate = new Date(today)
      maxDate.setDate(today.getDate() + 1)
      const { container } = render(Gantt, {
        props: { data, showToday: true, minDate, maxDate }
      })

      expect(container.querySelector('[data-gantt-today="true"]')).toBeInTheDocument()
    })
  })
})
