import { describe, expect, it } from 'vitest'
import {
  applyGanttTaskDateOverlay,
  computeGanttLayout,
  createGanttTimelineTicks,
  formatGanttDate,
  getGanttDependencyPath,
  getGanttTaskAriaLabel,
  ganttPxToMs,
  moveGanttTaskByPx,
  normalizeGanttDate,
  shiftGanttTaskDates
} from '@expcat/tigercat-core'
import type { GanttTask } from '@expcat/tigercat-core'

const DAY_MS = 24 * 60 * 60 * 1000

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

  it('normalizes invalid ranges into finite layout and labels', () => {
    const layout = computeGanttLayout(
      [{ id: 'bad', label: 'Bad', start: 'bad-date', end: Number.POSITIVE_INFINITY, progress: 30 }],
      { width: Number.NaN, taskLabelWidth: -100, minDate: 'bad-date', maxDate: 'also-bad' }
    )

    expect(layout.timelineWidth).toBe(0)
    expect(layout.tasks[0].x).toBe(0)
    expect(layout.tasks[0].width).toBe(6)
    expect(getGanttTaskAriaLabel(layout.tasks[0].task)).toBe('Bad, unknown to unknown, 30%')

    const ticks = createGanttTimelineTicks(Number.NaN, Number.POSITIVE_INFINITY, 100, 0, 'day')
    expect(ticks.every((tick) => Number.isFinite(tick.x))).toBe(true)
  })

  it('maps pixel deltas to the timeline range', () => {
    expect(ganttPxToMs(10, 0, 100, 50)).toBe(20)
    expect(ganttPxToMs(10, 0, 100, 0)).toBe(0)
    expect(ganttPxToMs(10, 50, 50, 100)).toBe(0)
    expect(ganttPxToMs(Number.NaN, 0, 100, 50)).toBe(0)
  })

  it('shifts YYYY-MM-DD tasks by whole local days and keeps duration', () => {
    const next = shiftGanttTaskDates(tasks[0], DAY_MS)
    expect(next.start).toBe('2026-01-02')
    expect(next.end).toBe('2026-01-06')
    expect(next.id).toBe('design')
    expect(next.progress).toBe(50)
    expect(next.color).toBe('#2563eb')
  })

  it('preserves Date and number value kinds when shifting', () => {
    const startDate = new Date(2026, 0, 1, 9, 30)
    const endDate = new Date(2026, 0, 5, 9, 30)
    const fromDate = shiftGanttTaskDates(
      { id: 'dated', label: 'Dated', start: startDate, end: endDate },
      DAY_MS
    )
    expect(fromDate.start).toBeInstanceOf(Date)
    expect((fromDate.start as Date).getDate()).toBe(2)
    expect((fromDate.start as Date).getHours()).toBe(9)
    expect((fromDate.end as Date).getDate()).toBe(6)

    const startMs = new Date(2026, 0, 1).getTime()
    const endMs = new Date(2026, 0, 5).getTime()
    const fromNumber = shiftGanttTaskDates(
      { id: 'ms', label: 'Ms', start: startMs, end: endMs },
      DAY_MS
    )
    expect(typeof fromNumber.start).toBe('number')
    expect(fromNumber.start).toBe(new Date(2026, 0, 2).getTime())
    expect(fromNumber.end).toBe(new Date(2026, 0, 6).getTime())
  })

  it('clamps moved windows without shrinking duration', () => {
    const task: GanttTask = {
      id: 'design',
      label: 'Design',
      start: '2026-01-01',
      end: '2026-01-05'
    }
    const minMs = normalizeGanttDate('2026-01-01')
    const maxMs = normalizeGanttDate('2026-01-31')
    const left = shiftGanttTaskDates(task, -10 * DAY_MS, { minMs, maxMs })
    expect(left.start).toBe('2026-01-01')
    expect(left.end).toBe('2026-01-05')

    const right = shiftGanttTaskDates(task, 40 * DAY_MS, { minMs, maxMs })
    expect(right.start).toBe('2026-01-27')
    expect(right.end).toBe('2026-01-31')

    const long: GanttTask = {
      id: 'long',
      label: 'Long',
      start: '2026-01-01',
      end: '2026-03-01'
    }
    const pinned = shiftGanttTaskDates(long, 10 * DAY_MS, { minMs, maxMs })
    expect(pinned.start).toBe('2026-01-01')
    expect(normalizeGanttDate(pinned.end) - normalizeGanttDate(pinned.start)).toBe(
      normalizeGanttDate(long.end) - normalizeGanttDate(long.start)
    )
  })

  it('snaps zero and sub-day deltas to the same calendar day', () => {
    const next = shiftGanttTaskDates(tasks[0], 0.4 * DAY_MS)
    expect(next.start).toBe('2026-01-01')
    expect(next.end).toBe('2026-01-05')

    const layout = computeGanttLayout([tasks[0]], {
      width: 712,
      taskLabelWidth: 140,
      minDate: '2026-01-01',
      maxDate: '2026-01-31'
    })
    const moved = moveGanttTaskByPx(tasks[0], 4, layout)
    expect(moved.start).toBe('2026-01-01')
    expect(moved.end).toBe('2026-01-05')
  })

  it('applies a date overlay only while incoming dates still match the base', () => {
    const overlay = new Map([
      [
        'design',
        {
          start: '2026-01-02',
          end: '2026-01-06',
          baseStart: '2026-01-01',
          baseEnd: '2026-01-05'
        }
      ]
    ])
    expect(applyGanttTaskDateOverlay(tasks, overlay)[0].start).toBe('2026-01-02')
    expect(
      applyGanttTaskDateOverlay(
        [{ ...tasks[0], start: '2026-01-08', end: '2026-01-12' }],
        overlay
      )[0].start
    ).toBe('2026-01-08')
  })
})
