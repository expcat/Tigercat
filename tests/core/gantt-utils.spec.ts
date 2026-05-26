import { describe, expect, it } from 'vitest'
import {
  computeGanttLayout,
  createGanttTimelineTicks,
  formatGanttDate,
  getGanttDependencyPath,
  getGanttTaskAriaLabel,
  normalizeGanttDate
} from '@expcat/tigercat-core'
import type { GanttTask } from '@expcat/tigercat-core'

const tasks: GanttTask[] = [
  {
    id: 'design',
    label: 'Design',
    start: '2026-01-01',
    end: '2026-01-05',
    progress: 50,
    color: '#2563eb'
  },
  {
    id: 'build',
    label: 'Build',
    start: '2026-01-05',
    end: '2026-01-12',
    progress: 120,
    dependencies: ['design']
  }
]

describe('gantt-utils', () => {
  it('normalizes supported date values', () => {
    expect(normalizeGanttDate('2026-01-01')).toBe(new Date(2026, 0, 1).getTime())
    expect(normalizeGanttDate(new Date('2026-01-02'))).toBe(new Date('2026-01-02').getTime())
  })

  it('computes task bars within the timeline area', () => {
    const layout = computeGanttLayout(tasks, {
      width: 700,
      taskLabelWidth: 100,
      rowHeight: 40,
      barHeight: 20,
      timelineHeight: 30
    })

    expect(layout.timelineWidth).toBe(600)
    expect(layout.height).toBe(110)
    expect(layout.tasks[0].x).toBe(100)
    expect(layout.tasks[0].y).toBe(40)
    expect(layout.tasks[0].width).toBeCloseTo(218.1818)
    expect(layout.tasks[1].x).toBeCloseTo(318.1818)
  })

  it('clamps progress width to the rendered bar', () => {
    const layout = computeGanttLayout(tasks, { width: 700, taskLabelWidth: 100 })

    expect(layout.tasks[0].progressWidth).toBe(layout.tasks[0].width / 2)
    expect(layout.tasks[1].progressWidth).toBe(layout.tasks[1].width)
  })

  it('creates dependency links from prerequisite tasks to dependents', () => {
    const layout = computeGanttLayout(tasks, { width: 700, taskLabelWidth: 100 })

    expect(layout.dependencies).toHaveLength(1)
    expect(layout.dependencies[0].sourceId).toBe('design')
    expect(layout.dependencies[0].targetId).toBe('build')
  })

  it('builds stable dependency paths', () => {
    expect(
      getGanttDependencyPath({
        sourceId: 'a',
        targetId: 'b',
        sourceX: 120,
        sourceY: 30,
        targetX: 200,
        targetY: 70
      })
    ).toBe('M 120 30 L 160 30 L 160 70 L 200 70')
  })

  it('creates timeline ticks for the selected scale', () => {
    const ticks = createGanttTimelineTicks(
      normalizeGanttDate('2026-01-01'),
      normalizeGanttDate('2026-03-15'),
      600,
      100,
      'month'
    )

    expect(ticks.map((tick) => tick.label)).toEqual(['2026-01', '2026-02', '2026-03'])
  })

  it('returns empty task layout for empty data', () => {
    const layout = computeGanttLayout([], {
      width: 500,
      taskLabelWidth: 100,
      minDate: '2026-01-01',
      maxDate: '2026-01-02'
    })

    expect(layout.tasks).toEqual([])
    expect(layout.dependencies).toEqual([])
    expect(layout.timelineWidth).toBe(400)
  })

  it('formats accessible task labels', () => {
    expect(getGanttTaskAriaLabel(tasks[0])).toBe('Design, 01-01 to 01-05, 50%')
    expect(formatGanttDate(new Date('2026-02-03'), 'day')).toBe('02-03')
  })
})
