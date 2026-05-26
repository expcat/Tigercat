import React, { useMemo, useState } from 'react'
import {
  classNames,
  computeGanttLayout,
  ganttAxisTextClasses,
  ganttDependencyClasses,
  ganttLabelClasses,
  ganttProgressClasses,
  ganttRowClasses,
  ganttTodayLineClasses,
  getChartInnerRect,
  getGanttTaskAriaLabel,
  getGanttTaskClasses,
  type ChartPadding,
  type GanttLayoutTask,
  type GanttProps as CoreGanttProps,
  type GanttTask
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'

export interface GanttProps extends Omit<CoreGanttProps, 'className'> {
  padding?: ChartPadding
  className?: string
  onTaskClick?: (task: GanttTask) => void
  onTaskHover?: (task: GanttTask | null) => void
  onSelectedIdChange?: (id: string | number | null) => void
}

export function Gantt({
  data,
  width = 760,
  height = 360,
  padding = 24,
  scale = 'week',
  rowHeight = 40,
  barHeight = 18,
  taskLabelWidth = 140,
  timelineHeight = 36,
  minDate,
  maxDate,
  minBarWidth = 6,
  showToday = false,
  showProgress = true,
  showDependencies = true,
  hoverable = false,
  selectable = false,
  selectedId,
  activeOpacity = 1,
  inactiveOpacity = 0.35,
  dateFormatter,
  colors,
  title,
  desc,
  ariaLabel = 'Gantt chart',
  className,
  onTaskClick,
  onTaskHover,
  onSelectedIdChange
}: GanttProps): React.ReactElement {
  const [innerSelectedId, setInnerSelectedId] = useState<string | number | null>(null)
  const [hoveredId, setHoveredId] = useState<string | number | null>(null)
  const resolvedSelectedId = selectedId === undefined ? innerSelectedId : selectedId
  const innerRect = useMemo(
    () => getChartInnerRect(width, height, padding),
    [height, padding, width]
  )
  const layout = useMemo(
    () =>
      computeGanttLayout(data, {
        width: innerRect.width,
        rowHeight,
        barHeight,
        taskLabelWidth,
        timelineHeight,
        minDate,
        maxDate,
        minBarWidth,
        scale,
        colors,
        today: showToday ? new Date() : undefined,
        dateFormatter
      }),
    [
      barHeight,
      colors,
      data,
      dateFormatter,
      innerRect.width,
      maxDate,
      minBarWidth,
      minDate,
      rowHeight,
      scale,
      showToday,
      taskLabelWidth,
      timelineHeight
    ]
  )
  const activeId = resolvedSelectedId ?? hoveredId

  const selectTask = (task: GanttLayoutTask) => {
    if (selectable && !task.task.disabled) {
      const nextId = resolvedSelectedId === task.id ? null : task.id
      if (selectedId === undefined) setInnerSelectedId(nextId)
      onSelectedIdChange?.(nextId)
    }
    onTaskClick?.(task.task)
  }

  const setHoveredTask = (task: GanttLayoutTask | null) => {
    if (!hoverable) return
    setHoveredId(task?.id ?? null)
    onTaskHover?.(task?.task ?? null)
  }

  const getTaskOpacity = (task: GanttLayoutTask) => {
    if (activeId === null) return activeOpacity
    return activeId === task.id ? activeOpacity : inactiveOpacity
  }

  return (
    <ChartCanvas
      width={width}
      height={height}
      padding={padding}
      title={title}
      desc={desc}
      className={classNames(className)}
      role="img"
      aria-label={ariaLabel}>
      <g data-series-type="gantt">
        <g data-gantt-axis="true">
          <line
            x1={taskLabelWidth}
            x2={layout.width}
            y1={timelineHeight - 1}
            y2={timelineHeight - 1}
            stroke="var(--tiger-border,#d1d5db)"
          />
          {layout.ticks.map((tick) => (
            <g key={`${tick.label}-${tick.x}`}>
              <line
                x1={tick.x}
                x2={tick.x}
                y1={0}
                y2={layout.height}
                stroke="var(--tiger-border,#e5e7eb)"
              />
              <text x={tick.x + 4} y={16} className={ganttAxisTextClasses}>
                {tick.label}
              </text>
            </g>
          ))}
        </g>
        <g data-gantt-rows="true">
          {layout.tasks.map((task) => (
            <rect
              key={`row-${task.id}`}
              x={0}
              y={timelineHeight + task.index * rowHeight}
              width={layout.width}
              height={rowHeight}
              className={task.index % 2 === 0 ? ganttRowClasses : undefined}
              opacity={task.index % 2 === 0 ? 0.75 : 0}
            />
          ))}
        </g>
        {showToday && layout.todayX !== null ? (
          <line
            x1={layout.todayX}
            x2={layout.todayX}
            y1={0}
            y2={layout.height}
            className={ganttTodayLineClasses}
            data-gantt-today="true"
          />
        ) : null}
        {showDependencies ? (
          <g data-gantt-dependencies="true">
            {layout.dependencies.map((dependency) => (
              <path
                key={`${dependency.sourceId}-${dependency.targetId}`}
                d={dependency.path}
                className={ganttDependencyClasses}
              />
            ))}
          </g>
        ) : null}
        <g data-gantt-tasks="true">
          {layout.tasks.map((task) => {
            const selected = resolvedSelectedId === task.id
            const interactive = (hoverable || selectable) && !task.task.disabled
            return (
              <g key={task.id} opacity={getTaskOpacity(task)}>
                <text x={0} y={task.y + task.height / 2 + 4} className={ganttLabelClasses}>
                  {task.task.label}
                </text>
                <g
                  className={getGanttTaskClasses(interactive, selected)}
                  role={interactive ? 'button' : 'group'}
                  tabIndex={interactive ? 0 : undefined}
                  aria-label={getGanttTaskAriaLabel(task.task)}
                  onMouseEnter={() => setHoveredTask(task)}
                  onMouseLeave={() => setHoveredTask(null)}
                  onClick={() => selectTask(task)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      selectTask(task)
                    }
                  }}>
                  <rect
                    x={task.x}
                    y={task.y}
                    width={task.width}
                    height={task.height}
                    rx={4}
                    fill={task.color}
                    stroke={selected ? 'var(--tiger-text,#111827)' : undefined}
                    strokeWidth={selected ? 2 : undefined}
                  />
                  {showProgress && task.progressWidth > 0 ? (
                    <rect
                      x={task.x}
                      y={task.y}
                      width={task.progressWidth}
                      height={task.height}
                      rx={4}
                      className={ganttProgressClasses}
                    />
                  ) : null}
                </g>
              </g>
            )
          })}
        </g>
      </g>
    </ChartCanvas>
  )
}

Gantt.displayName = 'Gantt'
