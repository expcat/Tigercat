import React, { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  clampGanttDragDeltaX,
  computeGanttLayout,
  ganttDependencyAnchors,
  ganttRowWindow,
  ganttVisibleWindow,
  isGanttMilestone,
  ganttAxisTextClasses,
  ganttDateValuesEqual,
  ganttDependencyClasses,
  ganttLabelClasses,
  ganttProgressClasses,
  ganttRowClasses,
  ganttTodayLineClasses,
  getCartesianChartShellClasses,
  getChartLabels,
  mergeTigerLocale,
  normalizeChartPadding,
  getGanttTaskAriaLabel,
  getGanttTaskClasses,
  chartMarkTabIndex,
  nextChartRovingIndex,
  isChartNavigationKey,
  isBrowser,
  moveGanttTaskByPx,
  resolveCallerInstant,
  type ChartPadding,
  type GanttLayoutTask,
  type GanttProps as CoreGanttProps,
  type GanttTask
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { useTigerConfig } from './ConfigProvider'
import { GanttBind } from './w9-chart-bind'

const GANTT_BAR_CLICK_PX = 4

interface GanttBarDragSession {
  pointerId: number
  startClientX: number
  scale: number
  task: GanttLayoutTask
  sourceTask: GanttTask
  barX: number
  barWidth: number
  taskLabelWidth: number
  layoutWidth: number
  minMs: number
  maxMs: number
  timelineWidth: number
  deltaX: number
  captureTarget: Element | null
}

export interface GanttProps extends Omit<CoreGanttProps, 'className'> {
  padding?: ChartPadding
  className?: string
  onTaskClick?: (task: GanttTask) => void
  onTaskHover?: (task: GanttTask | null) => void
  onSelectedIdChange?: (id: string | number | null) => void
  onTaskChange?: (task: GanttTask) => void
  onDataChange?: (data: GanttTask[]) => void
  bind?: {
    tasks?: { id: string; start: number; end: number }[]
    dependency?: 'FS' | 'SS' | 'FF' | 'SF'
    source?: { x: number; width: number }
    target?: { x: number; width: number }
    window?: { start: number; end: number }
    rowHeight?: number
    viewportHeight?: number
  }
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
  now,
  showProgress = true,
  showDependencies = true,
  hoverable = false,
  selectable = false,
  selectedId,
  activeOpacity = 1,
  inactiveOpacity = 0.25,
  draggable = false,
  dateFormatter,
  weekStartsOn,
  colors,
  title,
  desc,
  ariaLabel,
  locale,
  labels: labelsOverride,
  className,
  onTaskClick,
  onTaskHover,
  onSelectedIdChange,
  onTaskChange,
  onDataChange,
  bind
}: GanttProps): React.ReactElement {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(
    () => getChartLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )
  const [innerSelectedId, setInnerSelectedId] = useState<string | number | null>(null)
  const [hoveredId, setHoveredId] = useState<string | number | null>(null)
  const [focusedIndex, setFocusedIndex] = useState(0)
  const labelClipId = useId()
  const [dragPreview, setDragPreview] = useState<{ id: string | number; deltaX: number } | null>(
    null
  )
  const dragSessionRef = useRef<GanttBarDragSession | null>(null)
  const documentPointerListeningRef = useRef(false)
  const suppressClickRef = useRef(false)
  const dragFnsRef = useRef({
    move: (_event: PointerEvent) => {},
    finish: (_event: PointerEvent) => {}
  })
  const onDocumentPointerMove = useRef((event: PointerEvent) => {
    dragFnsRef.current.move(event)
  }).current
  const onDocumentPointerEnd = useRef((event: PointerEvent) => {
    dragFnsRef.current.finish(event)
  }).current
  const dataRef = useRef(data)
  dataRef.current = data
  const onTaskChangeRef = useRef(onTaskChange)
  onTaskChangeRef.current = onTaskChange
  const onDataChangeRef = useRef(onDataChange)
  onDataChangeRef.current = onDataChange
  const onTaskClickRef = useRef(onTaskClick)
  onTaskClickRef.current = onTaskClick
  const onSelectedIdChangeRef = useRef(onSelectedIdChange)
  onSelectedIdChangeRef.current = onSelectedIdChange
  const selectedIdRef = useRef(selectedId)
  selectedIdRef.current = selectedId
  const selectableRef = useRef(selectable)
  selectableRef.current = selectable
  const resolvedSelectedId = selectedId === undefined ? innerSelectedId : selectedId
  const resolvedSelectedIdRef = useRef(resolvedSelectedId)
  resolvedSelectedIdRef.current = resolvedSelectedId
  useEffect(
    () => () => {
      if (!documentPointerListeningRef.current || !isBrowser()) return
      document.removeEventListener('pointermove', onDocumentPointerMove)
      document.removeEventListener('pointerup', onDocumentPointerEnd)
      document.removeEventListener('pointercancel', onDocumentPointerEnd)
      documentPointerListeningRef.current = false
    },
    [onDocumentPointerEnd, onDocumentPointerMove]
  )
  const canDrag = draggable
  const resolvedPadding = normalizeChartPadding(padding)
  const minPlotWidth = width
  const layout = useMemo(
    () =>
      computeGanttLayout(data, {
        width: Math.max(0, minPlotWidth - resolvedPadding.left - resolvedPadding.right),
        rowHeight,
        barHeight,
        taskLabelWidth,
        timelineHeight,
        minDate,
        maxDate,
        minBarWidth,
        scale,
        colors,
        today: showToday ? (resolveCallerInstant(now) ?? undefined) : undefined,
        dateFormatter,
        weekStartsOn
      }),
    [
      barHeight,
      colors,
      data,
      dateFormatter,
      maxDate,
      minBarWidth,
      minDate,
      minPlotWidth,
      resolvedPadding.left,
      resolvedPadding.right,
      rowHeight,
      scale,
      now,
      showToday,
      taskLabelWidth,
      timelineHeight,
      weekStartsOn
    ]
  )
  const plotWidth = Math.max(width, layout.width + resolvedPadding.left + resolvedPadding.right)
  const plotHeight = Math.max(height, layout.height + resolvedPadding.top + resolvedPadding.bottom)
  const activeId = resolvedSelectedId ?? hoveredId

  const selectTask = (task: GanttLayoutTask) => {
    if (task.task.disabled) return
    if (selectableRef.current) {
      const nextId = resolvedSelectedIdRef.current === task.id ? null : task.id
      if (selectedIdRef.current === undefined) setInnerSelectedId(nextId)
      onSelectedIdChangeRef.current?.(nextId)
    }
    onTaskClickRef.current?.(task.task)
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

  const pointerScale = (currentTarget: EventTarget | null): number => {
    const svg =
      currentTarget instanceof SVGElement
        ? (currentTarget.ownerSVGElement ?? currentTarget.closest('svg'))
        : currentTarget instanceof Element
          ? currentTarget.closest('svg')
          : null
    const clientWidth = svg?.clientWidth ?? 0
    if (!(clientWidth > 0)) return 1
    const viewBoxWidth = svg?.viewBox?.baseVal?.width
    const resolvedViewBox =
      typeof viewBoxWidth === 'number' && viewBoxWidth > 0 ? viewBoxWidth : width
    return resolvedViewBox / clientWidth
  }

  const captureBarPointer = (target: EventTarget | null, pointerId: number) => {
    if (!(target instanceof Element) || typeof target.setPointerCapture !== 'function') return
    try {
      target.setPointerCapture(pointerId)
    } catch {
      // happy-dom / detached node
    }
  }

  const releaseBarPointer = (target: Element | null, pointerId: number) => {
    if (!target || typeof target.releasePointerCapture !== 'function') return
    try {
      target.releasePointerCapture(pointerId)
    } catch {
      // already released / happy-dom
    }
  }

  const moveBarDrag = (event: PointerEvent) => {
    const session = dragSessionRef.current
    if (!session || event.pointerId !== session.pointerId) return
    const rawDelta = (event.clientX - session.startClientX) * session.scale
    const deltaX = clampGanttDragDeltaX(
      rawDelta,
      session.barX,
      session.barWidth,
      session.taskLabelWidth,
      session.layoutWidth
    )
    session.deltaX = deltaX
    setDragPreview({ id: session.task.id, deltaX })
  }

  const detachDocumentPointerListeners = () => {
    if (!documentPointerListeningRef.current || !isBrowser()) return
    document.removeEventListener('pointermove', onDocumentPointerMove)
    document.removeEventListener('pointerup', onDocumentPointerEnd)
    document.removeEventListener('pointercancel', onDocumentPointerEnd)
    documentPointerListeningRef.current = false
  }

  const finishBarDrag = (event: PointerEvent) => {
    const session = dragSessionRef.current
    if (!session || event.pointerId !== session.pointerId) return
    moveBarDrag(event)
    const deltaX = session.deltaX
    dragSessionRef.current = null
    setDragPreview(null)
    detachDocumentPointerListeners()
    releaseBarPointer(session.captureTarget, session.pointerId)
    suppressClickRef.current = true

    if (Math.abs(deltaX) < GANTT_BAR_CLICK_PX) {
      selectTask(session.task)
      return
    }

    const nextTask = moveGanttTaskByPx(session.sourceTask, deltaX, {
      minMs: session.minMs,
      maxMs: session.maxMs,
      timelineWidth: session.timelineWidth
    })
    if (
      ganttDateValuesEqual(nextTask.start, session.sourceTask.start) &&
      ganttDateValuesEqual(nextTask.end, session.sourceTask.end)
    ) {
      selectTask(session.task)
      return
    }

    const nextData = dataRef.current.map((item) => (item.id === nextTask.id ? nextTask : item))
    onTaskChangeRef.current?.(nextTask)
    onDataChangeRef.current?.(nextData)
  }

  dragFnsRef.current.move = moveBarDrag
  dragFnsRef.current.finish = finishBarDrag

  const attachDocumentPointerListeners = () => {
    if (documentPointerListeningRef.current || !isBrowser()) return
    document.addEventListener('pointermove', onDocumentPointerMove)
    document.addEventListener('pointerup', onDocumentPointerEnd)
    document.addEventListener('pointercancel', onDocumentPointerEnd)
    documentPointerListeningRef.current = true
  }

  const startBarDrag = (event: React.PointerEvent<SVGGElement>, task: GanttLayoutTask) => {
    if (!canDrag || task.task.disabled || dragSessionRef.current) return
    if (event.button !== undefined && event.button !== 0) return
    event.preventDefault()
    const captureTarget = event.currentTarget instanceof Element ? event.currentTarget : null
    dragSessionRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      scale: pointerScale(event.currentTarget),
      task,
      sourceTask: task.task,
      barX: task.x,
      barWidth: task.width,
      taskLabelWidth,
      layoutWidth: layout.width,
      minMs: layout.minMs,
      maxMs: layout.maxMs,
      timelineWidth: layout.timelineWidth,
      deltaX: 0,
      captureTarget
    }
    setDragPreview({ id: task.id, deltaX: 0 })
    captureBarPointer(event.currentTarget, event.pointerId)
    attachDocumentPointerListeners()
  }

  const handleBarClick = (event: React.MouseEvent<SVGGElement>, task: GanttLayoutTask) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      event.preventDefault()
      event.stopPropagation()
      return
    }
    selectTask(task)
  }

  return (
    <div className={getCartesianChartShellClasses({ showLegend: false, className })}>
      <ChartCanvas
        width={plotWidth}
        height={plotHeight}
        padding={padding}
        title={title}
        desc={desc}
        aria-label={ariaLabel ?? (title ? undefined : labels.ganttAriaLabel)}>
        <g data-series-type="gantt">
          <defs>
            <clipPath id={labelClipId}>
              <rect x={layout.labelX} y={0} width={layout.labelWidth} height={layout.height} />
            </clipPath>
          </defs>
          <g data-gantt-axis="true">
            <line
              x1={taskLabelWidth}
              x2={layout.width}
              y1={timelineHeight - 1}
              y2={timelineHeight - 1}
              stroke="var(--tiger-border)"
            />
            {layout.ticks.map((tick) => (
              <g key={`${tick.label}-${tick.x}`}>
                <line
                  x1={tick.x}
                  x2={tick.x}
                  y1={0}
                  y2={layout.height}
                  stroke="var(--tiger-border)"
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
              aria-label={labels.ganttTodayAriaLabel}
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
              const interactive =
                (hoverable || selectable || Boolean(onTaskClick)) && !task.task.disabled
              const movable = canDrag && !task.task.disabled
              const grabbing = dragPreview?.id === task.id
              const previewDeltaX = grabbing ? (dragPreview?.deltaX ?? 0) : 0
              return (
                <g key={task.id} opacity={getTaskOpacity(task)}>
                  <text
                    x={layout.labelX}
                    y={task.y + task.height / 2 + 4}
                    className={ganttLabelClasses}
                    clipPath={`url(#${labelClipId})`}>
                    {task.task.label}
                  </text>
                  <g
                    className={getGanttTaskClasses(interactive, selected, movable, grabbing)}
                    role={interactive ? 'button' : 'group'}
                    tabIndex={interactive ? chartMarkTabIndex(task.index, focusedIndex) : undefined}
                    data-gantt-task-index={task.index}
                    aria-label={getGanttTaskAriaLabel(task.task, {
                      template: labels.ganttTaskAriaLabel,
                      unknownDate: labels.ganttUnknownDate
                    })}
                    data-gantt-task-id={task.id}
                    transform={previewDeltaX !== 0 ? `translate(${previewDeltaX} 0)` : undefined}
                    onMouseEnter={() => setHoveredTask(task)}
                    onMouseLeave={() => setHoveredTask(null)}
                    onPointerDown={(event) => startBarDrag(event, task)}
                    onPointerMove={(event) => moveBarDrag(event.nativeEvent)}
                    onPointerUp={(event) => finishBarDrag(event.nativeEvent)}
                    onPointerCancel={(event) => finishBarDrag(event.nativeEvent)}
                    onClick={(event) => handleBarClick(event, task)}
                    onKeyDown={(event) => {
                      if (isChartNavigationKey(event.key)) {
                        event.preventDefault()
                        const next = nextChartRovingIndex(task.index, event.key, layout.tasks.length)
                        setFocusedIndex(next)
                        const node = event.currentTarget.ownerSVGElement?.querySelector(
                          `[data-gantt-task-index="${next}"]`
                        )
                        if (node instanceof SVGElement) node.focus()
                        return
                      }
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
                      stroke={selected ? 'var(--tiger-text)' : undefined}
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
      {bind ? (
        <GanttBind
          milestones={(bind.tasks ?? [])
            .filter((task) => isGanttMilestone(task.start, task.end))
            .map((task) => task.id)}
          anchors={
            bind.dependency && bind.source && bind.target
              ? ganttDependencyAnchors(bind.dependency, bind.source, bind.target)
              : undefined
          }
          windowCount={
            ganttVisibleWindow(bind.tasks ?? [], bind.window ?? null).length +
            ganttRowWindow(0, bind.viewportHeight ?? 0, bind.tasks?.length ?? 0, bind.rowHeight ?? 28)
              .end
          }
        />
      ) : null}
    </div>
  )
}

Gantt.displayName = 'Gantt'
