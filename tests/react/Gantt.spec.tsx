import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Gantt } from '@expcat/tigercat-react'
import type { GanttTask } from '@expcat/tigercat-core'
import { expectNoA11yViolationsIsolated } from '../utils/react'

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
    const { container } = render(<Gantt data={data} />)

    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-gantt-tasks="true"] > g')).toHaveLength(2)
    expect(container.querySelectorAll('[data-gantt-rows="true"] rect')).toHaveLength(2)
    expect(container.querySelectorAll('[data-gantt-dependencies="true"] path')).toHaveLength(1)
  })

  it('renders title, desc and task labels', () => {
    const { container, getByText } = render(<Gantt data={data} title="Plan" desc="Release plan" />)

    expect(container.querySelector('title')?.textContent).toBe('Plan')
    expect(container.querySelector('desc')?.textContent).toBe('Release plan')
    expect(getByText('Design')).toBeInTheDocument()
  })

  it('selects tasks when selectable', () => {
    const onSelectedIdChange = vi.fn()
    const onTaskClick = vi.fn()
    const { getByRole } = render(
      <Gantt
        data={data}
        selectable
        onSelectedIdChange={onSelectedIdChange}
        onTaskClick={onTaskClick}
      />
    )

    fireEvent.click(getByRole('button', { name: 'Design, 01-01 to 01-05, 40%' }))

    expect(onSelectedIdChange).toHaveBeenCalledWith('design')
    expect(onTaskClick).toHaveBeenCalledWith(data[0])
  })

  it('emits hover events when hoverable', () => {
    const onTaskHover = vi.fn()
    const { getByRole } = render(<Gantt data={data} hoverable onTaskHover={onTaskHover} />)

    fireEvent.mouseEnter(getByRole('button', { name: 'Build, 01-05 to 01-12, 70%' }))
    fireEvent.mouseLeave(getByRole('button', { name: 'Build, 01-05 to 01-12, 70%' }))

    expect(onTaskHover).toHaveBeenCalledWith(data[1])
    expect(onTaskHover).toHaveBeenCalledWith(null)
  })

  it('supports keyboard selection', () => {
    const onSelectedIdChange = vi.fn()
    const { getByRole } = render(
      <Gantt data={data} selectable onSelectedIdChange={onSelectedIdChange} />
    )

    fireEvent.keyDown(getByRole('button', { name: 'Build, 01-05 to 01-12, 70%' }), {
      key: 'Enter'
    })

    expect(onSelectedIdChange).toHaveBeenCalledWith('build')
  })

  it('supports custom colors and className', () => {
    const { container } = render(<Gantt data={data} colors={['#ff0000']} className="gantt" />)

    expect(container.querySelector('svg.gantt')).toBeInTheDocument()
    expect(container.querySelector('rect[fill="#ff0000"]')).toBeInTheDocument()
  })

  it('can hide progress and dependencies', () => {
    const { container } = render(
      <Gantt data={data} showProgress={false} showDependencies={false} />
    )

    expect(container.querySelector('[data-gantt-dependencies="true"]')).not.toBeInTheDocument()
    expect(container.querySelector('.fill-black\\/20')).not.toBeInTheDocument()
  })

  it('supports custom date formatter', () => {
    const { getByText } = render(
      <Gantt data={data} scale="month" dateFormatter={(date) => `${date.getMonth() + 1}月`} />
    )

    expect(getByText('1月')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    const { container } = render(<Gantt data={data} title="Gantt chart" />)
    await expectNoA11yViolationsIsolated(container)
  })

  describe('Edge Cases and Boundary', () => {
    it.each(['day', 'week', 'month'] as const)('renders %s scale boundary', (scale) => {
      const { container } = render(<Gantt data={data} scale={scale} />)

      expect(container.querySelectorAll('[data-gantt-axis="true"] text').length).toBeGreaterThan(0)
    })

    it('renders empty data without task or dependency nodes', () => {
      const { container } = render(<Gantt data={[]} />)

      expect(container.querySelectorAll('[data-gantt-tasks="true"] > g')).toHaveLength(0)
      expect(container.querySelectorAll('[data-gantt-dependencies="true"] path')).toHaveLength(0)
    })

    it('prevents disabled tasks from becoming selectable', () => {
      const onSelectedIdChange = vi.fn()
      const onTaskClick = vi.fn()
      const disabledData: GanttTask[] = [{ ...data[0], disabled: true }]
      const { getByRole } = render(
        <Gantt
          data={disabledData}
          selectable
          onSelectedIdChange={onSelectedIdChange}
          onTaskClick={onTaskClick}
        />
      )

      fireEvent.click(getByRole('group', { name: 'Design, 01-01 to 01-05, 40%' }))

      expect(onSelectedIdChange).not.toHaveBeenCalled()
      expect(onTaskClick).toHaveBeenCalledWith(disabledData[0])
    })

    it('renders today marker when the range includes today', () => {
      const today = new Date()
      const minDate = new Date(today)
      minDate.setDate(today.getDate() - 1)
      const maxDate = new Date(today)
      maxDate.setDate(today.getDate() + 1)
      const { container } = render(
        <Gantt data={data} showToday minDate={minDate} maxDate={maxDate} />
      )

      expect(container.querySelector('[data-gantt-today="true"]')).toBeInTheDocument()
    })
  })
})
