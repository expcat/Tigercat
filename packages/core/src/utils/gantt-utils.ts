import { classNames } from './class-names'
import { DEFAULT_CHART_COLORS } from './chart/color'
import { formatChartTemplate } from './chart/layout'
import { devWarn } from './dev-warn'
import type { GanttDateValue, GanttScale, GanttTask } from '../types/gantt'

const DAY_MS = 24 * 60 * 60 * 1000
export const MAX_GANTT_TICKS = 24

export function ganttTaskKey(id: string | number): string {
  return String(id)
}

export interface GanttLayoutOptions {
  width?: number
  rowHeight?: number
  barHeight?: number
  taskLabelWidth?: number
  timelineHeight?: number
  minDate?: GanttDateValue
  maxDate?: GanttDateValue
  minBarWidth?: number
  scale?: GanttScale
  colors?: string[]
  today?: GanttDateValue
  dateFormatter?: (date: Date, scale: GanttScale) => string
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  direction?: 'ltr' | 'rtl'
}

export interface GanttLayoutTask {
  id: string | number
  task: GanttTask
  index: number
  x: number
  y: number
  width: number
  height: number
  progressWidth: number
  startMs: number
  endMs: number
  color: string
  /** Date-end x used for dependency anchors (not minBarWidth). */
  dateEndX: number
}

export interface GanttLayoutDependency {
  sourceId: string | number
  targetId: string | number
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  path: string
}

export interface GanttTimelineTick {
  value: Date
  x: number
  label: string
}

export interface GanttLayoutResult {
  tasks: GanttLayoutTask[]
  dependencies: GanttLayoutDependency[]
  ticks: GanttTimelineTick[]
  width: number
  height: number
  timelineWidth: number
  timelineX: number
  labelX: number
  labelWidth: number
  minMs: number
  maxMs: number
  todayX: number | null
}

export const ganttRowClasses = 'fill-[var(--tiger-surface-muted)]'
export const ganttLabelClasses =
  'pointer-events-none select-none fill-[var(--tiger-text)] text-xs font-medium'
export const ganttAxisTextClasses =
  'pointer-events-none select-none fill-[var(--tiger-text-secondary)] text-[11px]'
export const ganttBarClasses =
  'transition-[filter,opacity,stroke] motion-reduce:transition-none duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'
export const ganttProgressClasses =
  'fill-[color-mix(in_oklab,var(--tiger-text)_20%,transparent)]'
export const ganttDependencyClasses =
  'fill-none stroke-[var(--tiger-text-secondary)] stroke-[1.5]'
export const ganttTodayLineClasses = 'stroke-[var(--tiger-error)] stroke-2'

export function normalizeGanttDate(value: GanttDateValue): number {
  const date =
    typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(
          Number(value.slice(0, 4)),
          Number(value.slice(5, 7)) - 1,
          Number(value.slice(8, 10))
        )
      : value instanceof Date
        ? value
        : new Date(value)
  const time = date.getTime()
  if (!Number.isFinite(time)) return Number.NaN
  return time
}

export function getGanttTaskAriaLabel(
  task: GanttTask,
  labels?: { template?: string; unknownDate?: string }
): string {
  const unknown = labels?.unknownDate ?? ''
  const startMs = normalizeGanttDate(task.start)
  const endMs = normalizeGanttDate(task.end)
  const start = Number.isFinite(startMs) ? formatGanttDate(new Date(startMs), 'day') : unknown
  const end = Number.isFinite(endMs) ? formatGanttDate(new Date(endMs), 'day') : unknown
  const progress = typeof task.progress === 'number' ? `, ${clampProgress(task.progress)}%` : ''
  const template = labels?.template ?? '{label}, {start} – {end}{progress}'
  return formatChartTemplate(template, {
    label: task.label,
    start,
    end,
    progress
  })
}

export function getGanttTaskClasses(
  interactive: boolean,
  selected: boolean,
  movable = false,
  grabbing = false
): string {
  return classNames(
    ganttBarClasses,
    grabbing ? 'cursor-grabbing' : movable ? 'cursor-grab' : interactive && 'cursor-pointer',
    selected && 'drop-shadow-md'
  )
}

export interface ShiftGanttTaskDatesOptions {
  minMs?: number
  maxMs?: number
}

export type GanttTimeRange = Pick<GanttLayoutResult, 'minMs' | 'maxMs' | 'timelineWidth'>

export interface GanttTaskDateOverlayEntry {
  start: GanttDateValue
  end: GanttDateValue
  baseStart?: GanttDateValue
  baseEnd?: GanttDateValue
}

export function ganttPxToMs(
  deltaX: number,
  minMs: number,
  maxMs: number,
  timelineWidth: number
): number {
  if (!(timelineWidth > 0) || !Number.isFinite(timelineWidth) || !Number.isFinite(deltaX)) return 0
  const rangeMs = maxMs - minMs
  if (!Number.isFinite(rangeMs) || rangeMs <= 0) return 0
  return deltaX * (rangeMs / timelineWidth)
}

export function ganttDateValuesEqual(a: GanttDateValue, b: GanttDateValue): boolean {
  if (Object.is(a, b)) return true
  const aMs = normalizeGanttDate(a)
  const bMs = normalizeGanttDate(b)
  return Number.isFinite(aMs) && Number.isFinite(bMs) && aMs === bMs
}

export function clampGanttDragDeltaX(
  deltaX: number,
  barX: number,
  barWidth: number,
  taskLabelWidth: number,
  layoutWidth: number
): number {
  if (!Number.isFinite(deltaX)) return 0
  const minDelta = taskLabelWidth - barX
  const maxDelta = layoutWidth - barX - barWidth
  if (!Number.isFinite(minDelta) || !Number.isFinite(maxDelta) || minDelta > maxDelta) {
    return 0
  }
  return Math.min(maxDelta, Math.max(minDelta, deltaX))
}

export function shiftGanttTaskDates(
  task: GanttTask,
  deltaMs: number,
  options: ShiftGanttTaskDatesOptions = {}
): GanttTask {
  const startMs = normalizeGanttDate(task.start)
  const endMs = normalizeGanttDate(task.end)
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return { ...task }

  const dayDelta = Math.round((Number.isFinite(deltaMs) ? deltaMs : 0) / DAY_MS)
  if (dayDelta === 0) {
    return {
      ...task,
      start: cloneGanttDateValue(task.start),
      end: cloneGanttDateValue(task.end)
    }
  }

  let nextStart = addLocalDays(startMs, dayDelta)
  let nextEnd = addLocalDays(endMs, dayDelta)
  if (nextEnd.getTime() < nextStart.getTime()) {
    const swapped = nextStart
    nextStart = nextEnd
    nextEnd = swapped
  }

  const durationMs = nextEnd.getTime() - nextStart.getTime()
  const minMs = options.minMs
  const maxMs = options.maxMs
  const hasMin = minMs !== undefined && Number.isFinite(minMs)
  const hasMax = maxMs !== undefined && Number.isFinite(maxMs)

  if (hasMin && hasMax && durationMs > (maxMs as number) - (minMs as number)) {
    nextStart = new Date(minMs as number)
    nextEnd = new Date((minMs as number) + durationMs)
  } else {
    if (hasMin && nextStart.getTime() < (minMs as number)) {
      nextStart = new Date(minMs as number)
      nextEnd = new Date((minMs as number) + durationMs)
    }
    if (hasMax && nextEnd.getTime() > (maxMs as number)) {
      nextEnd = new Date(maxMs as number)
      nextStart = new Date((maxMs as number) - durationMs)
    }
    if (hasMin && nextStart.getTime() < (minMs as number)) {
      nextStart = new Date(minMs as number)
      nextEnd = new Date((minMs as number) + durationMs)
    }
  }

  return {
    ...task,
    start: preserveGanttDateValue(task.start, nextStart),
    end: preserveGanttDateValue(task.end, nextEnd)
  }
}

export function moveGanttTaskByPx(
  task: GanttTask,
  deltaX: number,
  range: GanttTimeRange
): GanttTask {
  const deltaMs = ganttPxToMs(deltaX, range.minMs, range.maxMs, range.timelineWidth)
  return shiftGanttTaskDates(task, deltaMs, { minMs: range.minMs, maxMs: range.maxMs })
}

export function applyGanttTaskDateOverlay(
  data: GanttTask[],
  overlay?: ReadonlyMap<string | number, GanttTaskDateOverlayEntry> | null
): GanttTask[] {
  if (!overlay || overlay.size === 0) return data
  return data.map((task) => {
    const entry = overlay.get(task.id)
    if (!entry) return task
    if (
      entry.baseStart !== undefined &&
      entry.baseEnd !== undefined &&
      (!ganttDateValuesEqual(task.start, entry.baseStart) ||
        !ganttDateValuesEqual(task.end, entry.baseEnd))
    ) {
      return task
    }
    return { ...task, start: entry.start, end: entry.end }
  })
}

export function getGanttDependencyPath(dependency: Omit<GanttLayoutDependency, 'path'>): string {
  if (dependency.targetX >= dependency.sourceX) {
    const midX = dependency.sourceX + Math.max(16, (dependency.targetX - dependency.sourceX) / 2)
    return `M ${dependency.sourceX} ${dependency.sourceY} L ${midX} ${dependency.sourceY} L ${midX} ${dependency.targetY} L ${dependency.targetX} ${dependency.targetY}`
  }
  const bypassY = Math.max(dependency.sourceY, dependency.targetY) + 16
  return `M ${dependency.sourceX} ${dependency.sourceY} L ${dependency.sourceX + 16} ${dependency.sourceY} L ${dependency.sourceX + 16} ${bypassY} L ${dependency.targetX - 16} ${bypassY} L ${dependency.targetX - 16} ${dependency.targetY} L ${dependency.targetX} ${dependency.targetY}`
}

export function computeGanttLayout(
  data: GanttTask[],
  options: GanttLayoutOptions = {}
): GanttLayoutResult {
  const {
    width: rawWidth = 720,
    rowHeight: rawRowHeight = 40,
    barHeight: rawBarHeight = 18,
    taskLabelWidth: rawTaskLabelWidth = 140,
    timelineHeight: rawTimelineHeight = 36,
    minBarWidth: rawMinBarWidth = 6,
    scale = 'week',
    colors = DEFAULT_CHART_COLORS,
    dateFormatter
  } = options
  const width = Number.isFinite(rawWidth) ? Math.max(0, rawWidth) : 0
  const rowHeight = Number.isFinite(rawRowHeight) ? Math.max(0, rawRowHeight) : 0
  const barHeight = Number.isFinite(rawBarHeight) ? Math.max(0, rawBarHeight) : 0
  const taskLabelWidth = Number.isFinite(rawTaskLabelWidth) ? Math.max(0, rawTaskLabelWidth) : 0
  const timelineHeight = Number.isFinite(rawTimelineHeight) ? Math.max(0, rawTimelineHeight) : 0
  const minBarWidth = Number.isFinite(rawMinBarWidth) ? Math.max(0, rawMinBarWidth) : 0

  if (data.length === 0) {
    const rawMinMs = options.minDate == null ? Number.NaN : normalizeGanttDate(options.minDate)
    const minMs = Number.isFinite(rawMinMs) ? rawMinMs : 0
    const rawMaxMs = options.maxDate == null ? Number.NaN : normalizeGanttDate(options.maxDate)
    const maxMs = Number.isFinite(rawMaxMs) && rawMaxMs > minMs ? rawMaxMs : minMs
    return {
      tasks: [],
      dependencies: [],
      ticks: [],
      width,
      height: timelineHeight,
      timelineWidth: Math.max(0, width - taskLabelWidth),
      timelineX: options.direction === 'rtl' ? 0 : taskLabelWidth,
      labelX: options.direction === 'rtl' ? Math.max(0, width - taskLabelWidth) : 0,
      labelWidth: taskLabelWidth,
      minMs,
      maxMs,
      todayX: null
    }
  }

  const taskRanges: Array<{ task: GanttTask; startMs: number; endMs: number; index: number }> = []
  data.forEach((task, index) => {
    const rawStart = normalizeGanttDate(task.start)
    const rawEnd = normalizeGanttDate(task.end)
    if (!Number.isFinite(rawStart) || !Number.isFinite(rawEnd)) {
      devWarn('Gantt.invalidDate', 'Gantt skipped a task with an invalid start or end date')
      return
    }
    const startMs = Math.min(rawStart, rawEnd)
    const inclusiveEnd = ganttInclusiveEndMs(task.end, Math.max(rawStart, rawEnd), startMs)
    taskRanges.push({ task, startMs, endMs: inclusiveEnd, index })
  })
  if (taskRanges.length === 0) {
    return computeGanttLayout([], options)
  }
  const inferredMinMs = Math.min(...taskRanges.map((item) => item.startMs))
  const inferredMaxMs = Math.max(...taskRanges.map((item) => item.endMs))
  const rawMinMs = normalizeGanttDate(options.minDate ?? inferredMinMs)
  const rawMaxMs = normalizeGanttDate(options.maxDate ?? inferredMaxMs)
  const minMs = Number.isFinite(rawMinMs) ? rawMinMs : inferredMinMs
  const maxMs = Number.isFinite(rawMaxMs) ? rawMaxMs : inferredMaxMs
  const safeMaxMs = maxMs > minMs ? maxMs : minMs + DAY_MS
  const timelineWidth = Math.max(0, width - taskLabelWidth)
  const rangeMs = safeMaxMs - minMs
  const rtl = options.direction === 'rtl'
  const timelineX = rtl ? 0 : taskLabelWidth
  const labelX = rtl ? timelineWidth : 0
  const xForTime = (time: number) => timelineX + ((time - minMs) / rangeMs) * timelineWidth

  const seenIds = new Set<string>()
  const tasks = taskRanges.flatMap(({ task, startMs, endMs }, visualIndex) => {
    const key = ganttTaskKey(task.id)
    if (seenIds.has(key)) {
      devWarn('Gantt.duplicateId', 'Gantt skipped a duplicate task id')
      return []
    }
    seenIds.add(key)
    const rawX = xForTime(startMs)
    const dateEndX = xForTime(endMs)
    const timelineEnd = timelineX + timelineWidth
    const clippedX = Math.max(timelineX, Math.min(timelineEnd, rawX))
    const clippedEndX = Math.max(timelineX, Math.min(timelineEnd, dateEndX))
    const rawWidth = Math.max(0, clippedEndX - clippedX)
    const barWidth = Math.max(minBarWidth, rawWidth)
    return [
      {
        id: task.id,
        task,
        index: visualIndex,
        x: clippedX,
        y: timelineHeight + visualIndex * rowHeight + (rowHeight - barHeight) / 2,
        width: Math.min(barWidth, width - clippedX),
        height: barHeight,
        progressWidth:
          Math.min(barWidth, width - clippedX) * (clampProgress(task.progress ?? 0) / 100),
        startMs,
        endMs,
        color: task.color ?? colors[visualIndex % colors.length],
        dateEndX: clippedEndX
      }
    ]
  })

  const taskMap = new Map(tasks.map((task) => [ganttTaskKey(task.id), task]))
  const dependencies = tasks.flatMap((target) =>
    (target.task.dependencies ?? []).flatMap((sourceId) => {
      const source = taskMap.get(ganttTaskKey(sourceId))
      if (!source) return []
      const dependency = {
        sourceId: source.id,
        targetId: target.id,
        sourceX: source.dateEndX,
        sourceY: source.y + source.height / 2,
        targetX: target.x,
        targetY: target.y + target.height / 2
      }
      return [{ ...dependency, path: getGanttDependencyPath(dependency) }]
    })
  )

  const todaySource = options.today === undefined ? null : normalizeGanttDate(options.today)
  const todayMs =
    todaySource !== null && Number.isFinite(todaySource) ? startOfLocalDay(todaySource) : null
  const todayX =
    todayMs !== null && todayMs >= minMs && todayMs <= safeMaxMs ? xForTime(todayMs) : null

  return {
    tasks,
    dependencies,
    ticks: createGanttTimelineTicks(
      minMs,
      safeMaxMs,
      timelineWidth,
      timelineX,
      scale,
      dateFormatter,
      options.weekStartsOn
    ),
    width,
    height: timelineHeight + tasks.length * rowHeight,
    timelineWidth,
    timelineX,
    labelX,
    labelWidth: taskLabelWidth,
    minMs,
    maxMs: safeMaxMs,
    todayX
  }
}

export function createGanttTimelineTicks(
  minMs: number,
  maxMs: number,
  timelineWidth: number,
  taskLabelWidth: number,
  scale: GanttScale,
  formatter: (date: Date, scale: GanttScale) => string = formatGanttDate,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0
): GanttTimelineTick[] {
  if (!Number.isFinite(minMs)) return []
  const safeMinMs = minMs
  const safeMaxMs = Number.isFinite(maxMs) && maxMs > safeMinMs ? maxMs : safeMinMs + DAY_MS
  const safeTimelineWidth = Number.isFinite(timelineWidth) ? Math.max(0, timelineWidth) : 0
  const safeTaskLabelWidth = Number.isFinite(taskLabelWidth) ? Math.max(0, taskLabelWidth) : 0
  const ticks: GanttTimelineTick[] = []
  const rangeMs = Math.max(DAY_MS, safeMaxMs - safeMinMs)
  const baseStep = scale === 'month' ? 30 * DAY_MS : scale === 'week' ? 7 * DAY_MS : DAY_MS
  let step = 1
  while (rangeMs / (baseStep * step) > MAX_GANTT_TICKS && step < 4096) step *= 2

  let current = startOfTick(new Date(safeMinMs), scale, weekStartsOn)
  let guard = 0
  while (current.getTime() <= safeMaxMs && guard <= MAX_GANTT_TICKS) {
    const currentMs = current.getTime()
    if (currentMs >= safeMinMs) {
      ticks.push({
        value: new Date(currentMs),
        x: safeTaskLabelWidth + ((currentMs - safeMinMs) / rangeMs) * safeTimelineWidth,
        label: formatter(new Date(currentMs), scale)
      })
    }
    current = addTick(current, scale, step)
    guard += 1
  }

  if (ticks.length === 0) {
    const date = new Date(safeMinMs)
    ticks.push({ value: date, x: safeTaskLabelWidth, label: formatter(date, scale) })
  }

  return ticks
}

export function formatGanttDate(date: Date, scale: GanttScale): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  if (scale === 'month') return `${year}-${month}`
  return `${year}-${month}-${day}`
}

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

function startOfLocalDay(ms: number): number {
  const date = new Date(ms)
  date.setHours(0, 0, 0, 0)
  return date.getTime()
}

function ganttInclusiveEndMs(endValue: GanttDateValue, rawEndMs: number, startMs: number): number {
  if (isYearMonthDayString(endValue)) return rawEndMs + DAY_MS
  if (rawEndMs === startMs) return rawEndMs + DAY_MS
  return rawEndMs > startMs ? rawEndMs : startMs + DAY_MS
}

function startOfTick(
  date: Date,
  scale: GanttScale,
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 0
): Date {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  if (scale === 'month') {
    next.setDate(1)
    return next
  }
  if (scale === 'week') {
    const day = next.getDay()
    const diff = (day - weekStartsOn + 7) % 7
    next.setDate(next.getDate() - diff)
  }
  return next
}

function addTick(date: Date, scale: GanttScale, steps = 1): Date {
  const next = new Date(date)
  const count = Math.max(1, Math.floor(steps))
  if (scale === 'month') next.setMonth(next.getMonth() + count)
  else if (scale === 'week') next.setDate(next.getDate() + 7 * count)
  else next.setDate(next.getDate() + count)
  return next
}

function isYearMonthDayString(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function toYearMonthDayString(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function cloneGanttDateValue(value: GanttDateValue): GanttDateValue {
  return value instanceof Date ? new Date(value.getTime()) : value
}

function addLocalDays(ms: number, days: number): Date {
  const date = new Date(ms)
  date.setDate(date.getDate() + days)
  return date
}

function preserveGanttDateValue(original: GanttDateValue, next: Date): GanttDateValue {
  if (isYearMonthDayString(original)) return toYearMonthDayString(next)
  if (original instanceof Date) return next
  if (typeof original === 'number') return next.getTime()
  return next
}

export const layoutGantt = computeGanttLayout
