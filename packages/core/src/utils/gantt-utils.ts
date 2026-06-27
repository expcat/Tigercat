import { classNames } from './class-names'
import { DEFAULT_CHART_COLORS } from './chart-utils'
import type { GanttDateValue, GanttScale, GanttTask } from '../types/gantt'

const DAY_MS = 24 * 60 * 60 * 1000

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
  minMs: number
  maxMs: number
  todayX: number | null
}

export const ganttRowClasses = 'fill-[var(--tiger-fill,#f9fafb)]'
export const ganttLabelClasses =
  'pointer-events-none select-none fill-[var(--tiger-text,#111827)] text-xs font-medium'
export const ganttAxisTextClasses =
  'pointer-events-none select-none fill-[var(--tiger-text-muted,#6b7280)] text-[11px]'
export const ganttBarClasses =
  'transition-[filter,opacity,stroke] duration-150 ease-out focus:outline-none'
export const ganttProgressClasses = 'fill-black/20'
export const ganttDependencyClasses =
  'fill-none stroke-[var(--tiger-text-muted,#6b7280)] stroke-[1.5]'
export const ganttTodayLineClasses = 'stroke-[var(--tiger-danger,#ef4444)] stroke-2'

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

export function getGanttTaskAriaLabel(task: GanttTask): string {
  const startMs = normalizeGanttDate(task.start)
  const endMs = normalizeGanttDate(task.end)
  const start = Number.isFinite(startMs) ? formatGanttDate(new Date(startMs), 'day') : 'unknown'
  const end = Number.isFinite(endMs) ? formatGanttDate(new Date(endMs), 'day') : 'unknown'
  const progress = typeof task.progress === 'number' ? `, ${clampProgress(task.progress)}%` : ''
  return `${task.label}, ${start} to ${end}${progress}`
}

export function getGanttTaskClasses(interactive: boolean, selected: boolean): string {
  return classNames(ganttBarClasses, interactive && 'cursor-pointer', selected && 'drop-shadow-md')
}

export function getGanttDependencyPath(dependency: Omit<GanttLayoutDependency, 'path'>): string {
  const midX = dependency.sourceX + Math.max(16, (dependency.targetX - dependency.sourceX) / 2)
  return `M ${dependency.sourceX} ${dependency.sourceY} L ${midX} ${dependency.sourceY} L ${midX} ${dependency.targetY} L ${dependency.targetX} ${dependency.targetY}`
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
    const fallbackMin = Date.now()
    const rawMinMs = normalizeGanttDate(options.minDate ?? fallbackMin)
    const minMs = Number.isFinite(rawMinMs) ? rawMinMs : fallbackMin
    const rawMaxMs = normalizeGanttDate(options.maxDate ?? minMs + DAY_MS)
    const maxMs = Number.isFinite(rawMaxMs) && rawMaxMs > minMs ? rawMaxMs : minMs + DAY_MS
    return {
      tasks: [],
      dependencies: [],
      ticks: [],
      width,
      height: timelineHeight,
      timelineWidth: Math.max(0, width - taskLabelWidth),
      minMs,
      maxMs,
      todayX: null
    }
  }

  const taskRanges = data.map((task) => {
    const rawStart = normalizeGanttDate(task.start)
    const rawEnd = normalizeGanttDate(task.end)
    const startFallback = Number.isFinite(rawEnd) ? rawEnd : Date.now()
    const endFallback = Number.isFinite(rawStart) ? rawStart : startFallback + DAY_MS
    const safeStart = Number.isFinite(rawStart) ? rawStart : startFallback
    const safeEnd = Number.isFinite(rawEnd) ? rawEnd : endFallback
    const startMs = Math.min(safeStart, safeEnd)
    const endMs = Math.max(safeStart, safeEnd)
    return { task, startMs, endMs: endMs === startMs ? endMs + DAY_MS : endMs }
  })
  const inferredMinMs = Math.min(...taskRanges.map((item) => item.startMs))
  const inferredMaxMs = Math.max(...taskRanges.map((item) => item.endMs))
  const rawMinMs = normalizeGanttDate(options.minDate ?? inferredMinMs)
  const rawMaxMs = normalizeGanttDate(options.maxDate ?? inferredMaxMs)
  const minMs = Number.isFinite(rawMinMs) ? rawMinMs : inferredMinMs
  const maxMs = Number.isFinite(rawMaxMs) ? rawMaxMs : inferredMaxMs
  const safeMaxMs = maxMs > minMs ? maxMs : minMs + DAY_MS
  const timelineWidth = Math.max(0, width - taskLabelWidth)
  const rangeMs = safeMaxMs - minMs
  const xForTime = (time: number) => taskLabelWidth + ((time - minMs) / rangeMs) * timelineWidth

  const tasks = taskRanges.map(({ task, startMs, endMs }, index) => {
    const x = xForTime(startMs)
    const rawWidth = xForTime(endMs) - x
    const barWidth = Math.max(minBarWidth, rawWidth)
    return {
      id: task.id,
      task,
      index,
      x,
      y: timelineHeight + index * rowHeight + (rowHeight - barHeight) / 2,
      width: barWidth,
      height: barHeight,
      progressWidth: barWidth * (clampProgress(task.progress ?? 0) / 100),
      startMs,
      endMs,
      color: task.color ?? colors[index % colors.length]
    }
  })

  const taskMap = new Map(tasks.map((task) => [task.id, task]))
  const dependencies = tasks.flatMap((target) =>
    (target.task.dependencies ?? []).flatMap((sourceId) => {
      const source = taskMap.get(sourceId)
      if (!source) return []
      const dependency = {
        sourceId: source.id,
        targetId: target.id,
        sourceX: source.x + source.width,
        sourceY: source.y + source.height / 2,
        targetX: target.x,
        targetY: target.y + target.height / 2
      }
      return [{ ...dependency, path: getGanttDependencyPath(dependency) }]
    })
  )

  const todayMs = options.today === undefined ? null : normalizeGanttDate(options.today)
  const todayX =
    todayMs !== null && todayMs >= minMs && todayMs <= safeMaxMs ? xForTime(todayMs) : null

  return {
    tasks,
    dependencies,
    ticks: createGanttTimelineTicks(
      minMs,
      safeMaxMs,
      timelineWidth,
      taskLabelWidth,
      scale,
      dateFormatter
    ),
    width,
    height: timelineHeight + data.length * rowHeight,
    timelineWidth,
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
  formatter: (date: Date, scale: GanttScale) => string = formatGanttDate
): GanttTimelineTick[] {
  const safeMinMs = Number.isFinite(minMs) ? minMs : Date.now()
  const safeMaxMs = Number.isFinite(maxMs) && maxMs > safeMinMs ? maxMs : safeMinMs + DAY_MS
  const safeTimelineWidth = Number.isFinite(timelineWidth) ? Math.max(0, timelineWidth) : 0
  const safeTaskLabelWidth = Number.isFinite(taskLabelWidth) ? Math.max(0, taskLabelWidth) : 0
  const ticks: GanttTimelineTick[] = []
  const rangeMs = Math.max(DAY_MS, safeMaxMs - safeMinMs)
  let current = startOfTick(new Date(safeMinMs), scale)

  while (current.getTime() <= safeMaxMs) {
    const currentMs = current.getTime()
    if (currentMs >= safeMinMs) {
      ticks.push({
        value: new Date(currentMs),
        x: safeTaskLabelWidth + ((currentMs - safeMinMs) / rangeMs) * safeTimelineWidth,
        label: formatter(new Date(currentMs), scale)
      })
    }
    current = addTick(current, scale)
    if (ticks.length > 64) break
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
  return `${month}-${day}`
}

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
}

function startOfTick(date: Date, scale: GanttScale): Date {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  if (scale === 'month') {
    next.setDate(1)
    return next
  }
  if (scale === 'week') {
    const day = next.getDay()
    next.setDate(next.getDate() - day)
  }
  return next
}

function addTick(date: Date, scale: GanttScale): Date {
  const next = new Date(date)
  if (scale === 'month') next.setMonth(next.getMonth() + 1)
  else if (scale === 'week') next.setDate(next.getDate() + 7)
  else next.setDate(next.getDate() + 1)
  return next
}
