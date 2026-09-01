import { computed, defineComponent, h, onBeforeUnmount, PropType, ref } from 'vue'
import {
  classNames,
  coerceClassValue,
  clampGanttDragDeltaX,
  computeGanttLayout,
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
  isBrowser,
  moveGanttTaskByPx,
  type ChartPadding,
  type GanttDateValue,
  type GanttLayoutTask,
  type GanttProps as CoreGanttProps,
  type GanttScale,
  type GanttTask
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { useTigerConfig } from './ConfigProvider'

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

export interface VueGanttProps extends CoreGanttProps {
  padding?: ChartPadding
  onTaskClick?: (task: GanttTask) => void
  onTaskChange?: (task: GanttTask) => void
}

export type GanttProps = VueGanttProps

export const Gantt = defineComponent({
  name: 'TigerGantt',
  inheritAttrs: false,
  props: {
    data: { type: Array as PropType<GanttTask[]>, required: true },
    width: { type: Number, default: 760 },
    height: { type: Number, default: 360 },
    padding: { type: [Number, Object] as PropType<ChartPadding>, default: 24 },
    scale: { type: String as PropType<GanttScale>, default: 'week' },
    rowHeight: { type: Number, default: 40 },
    barHeight: { type: Number, default: 18 },
    taskLabelWidth: { type: Number, default: 140 },
    timelineHeight: { type: Number, default: 36 },
    minDate: { type: [String, Number, Date] as PropType<GanttDateValue> },
    maxDate: { type: [String, Number, Date] as PropType<GanttDateValue> },
    minBarWidth: { type: Number, default: 6 },
    showToday: { type: Boolean, default: false },
    showProgress: { type: Boolean, default: true },
    showDependencies: { type: Boolean, default: true },
    hoverable: { type: Boolean, default: false },
    selectable: { type: Boolean, default: false },
    selectedId: {
      type: [String, Number, null] as PropType<string | number | null>,
      default: undefined
    },
    activeOpacity: { type: Number, default: 1 },
    inactiveOpacity: { type: Number, default: 0.25 },
    draggable: { type: Boolean, default: false },
    dateFormatter: {
      type: Function as PropType<(date: Date, scale: GanttScale) => string>
    },
    weekStartsOn: { type: Number as PropType<0 | 1 | 2 | 3 | 4 | 5 | 6> },
    colors: { type: Array as PropType<string[]> },
    title: { type: String },
    desc: { type: String },
    ariaLabel: { type: String },
    className: { type: String },
    onTaskClick: { type: Function as PropType<(task: GanttTask) => void> },
    onTaskChange: { type: Function as PropType<(task: GanttTask) => void> }
  },
  emits: ['update:selectedId', 'task-click', 'task-hover', 'task-change', 'update:data'],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const labels = computed(() => getChartLabels(mergeTigerLocale(config.value.locale)))
    const innerSelectedId = ref<string | number | null>(null)
    const hoveredId = ref<string | number | null>(null)
    const dragSession = ref<GanttBarDragSession | null>(null)
    const dragPreview = ref<{ id: string | number; deltaX: number } | null>(null)
    let documentPointerListening = false
    let suppressClick = false
    const resolvedSelectedId = computed(() =>
      props.selectedId === undefined ? innerSelectedId.value : props.selectedId
    )
    const canDrag = computed(() => props.draggable || typeof props.onTaskChange === 'function')
    const resolvedPadding = computed(() => normalizeChartPadding(props.padding))
    const layout = computed(() =>
      computeGanttLayout(props.data, {
        width: Math.max(0, props.width - resolvedPadding.value.left - resolvedPadding.value.right),
        rowHeight: props.rowHeight,
        barHeight: props.barHeight,
        taskLabelWidth: props.taskLabelWidth,
        timelineHeight: props.timelineHeight,
        minDate: props.minDate,
        maxDate: props.maxDate,
        minBarWidth: props.minBarWidth,
        scale: props.scale,
        colors: props.colors,
        today: props.showToday ? new Date() : undefined,
        dateFormatter: props.dateFormatter,
        weekStartsOn: props.weekStartsOn
      })
    )
    const plotWidth = computed(() =>
      Math.max(
        props.width,
        layout.value.width + resolvedPadding.value.left + resolvedPadding.value.right
      )
    )
    const plotHeight = computed(() =>
      Math.max(
        props.height,
        layout.value.height + resolvedPadding.value.top + resolvedPadding.value.bottom
      )
    )
    const activeId = computed(() => resolvedSelectedId.value ?? hoveredId.value)

    const selectTask = (task: GanttLayoutTask) => {
      if (task.task.disabled) return
      if (props.selectable) {
        const nextId = resolvedSelectedId.value === task.id ? null : task.id
        if (props.selectedId === undefined) innerSelectedId.value = nextId
        emit('update:selectedId', nextId)
      }
      props.onTaskClick?.(task.task)
      emit('task-click', task.task)
    }

    const setHoveredTask = (task: GanttLayoutTask | null) => {
      if (!props.hoverable) return
      hoveredId.value = task?.id ?? null
      emit('task-hover', task?.task ?? null)
    }

    const getTaskOpacity = (task: GanttLayoutTask) => {
      if (activeId.value === null) return props.activeOpacity
      return activeId.value === task.id ? props.activeOpacity : props.inactiveOpacity
    }

    const pointerScale = (event: PointerEvent): number => {
      const target = event.currentTarget
      const svg =
        target instanceof SVGElement
          ? (target.ownerSVGElement ?? target.closest('svg'))
          : target instanceof Element
            ? target.closest('svg')
            : null
      const clientWidth = svg?.clientWidth ?? 0
      if (!(clientWidth > 0)) return 1
      const viewBoxWidth = svg?.viewBox?.baseVal?.width
      const resolvedViewBox =
        typeof viewBoxWidth === 'number' && viewBoxWidth > 0 ? viewBoxWidth : props.width
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
      const session = dragSession.value
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
      dragPreview.value = { id: session.task.id, deltaX }
    }

    const finishBarDrag = (event: PointerEvent) => {
      const session = dragSession.value
      if (!session || event.pointerId !== session.pointerId) return
      moveBarDrag(event)
      const deltaX = session.deltaX
      dragSession.value = null
      dragPreview.value = null
      detachDocumentPointerListeners()
      releaseBarPointer(session.captureTarget, session.pointerId)
      suppressClick = true

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

      const nextData = props.data.map((item) => (item.id === nextTask.id ? nextTask : item))
      props.onTaskChange?.(nextTask)
      emit('task-change', nextTask)
      emit('update:data', nextData)
    }

    const handleDocumentPointerMove = (event: PointerEvent) => {
      moveBarDrag(event)
    }

    const handleDocumentPointerEnd = (event: PointerEvent) => {
      finishBarDrag(event)
    }

    const attachDocumentPointerListeners = () => {
      if (documentPointerListening || !isBrowser()) return
      document.addEventListener('pointermove', handleDocumentPointerMove)
      document.addEventListener('pointerup', handleDocumentPointerEnd)
      document.addEventListener('pointercancel', handleDocumentPointerEnd)
      documentPointerListening = true
    }

    const detachDocumentPointerListeners = () => {
      if (!documentPointerListening || !isBrowser()) return
      document.removeEventListener('pointermove', handleDocumentPointerMove)
      document.removeEventListener('pointerup', handleDocumentPointerEnd)
      document.removeEventListener('pointercancel', handleDocumentPointerEnd)
      documentPointerListening = false
    }

    const startBarDrag = (event: PointerEvent, task: GanttLayoutTask) => {
      if (!canDrag.value || task.task.disabled || dragSession.value) return
      if (event.button !== undefined && event.button !== 0) return
      event.preventDefault()
      const current = layout.value
      const captureTarget = event.currentTarget instanceof Element ? event.currentTarget : null
      dragSession.value = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        scale: pointerScale(event),
        task,
        sourceTask: task.task,
        barX: task.x,
        barWidth: task.width,
        taskLabelWidth: props.taskLabelWidth,
        layoutWidth: current.width,
        minMs: current.minMs,
        maxMs: current.maxMs,
        timelineWidth: current.timelineWidth,
        deltaX: 0,
        captureTarget
      }
      dragPreview.value = { id: task.id, deltaX: 0 }
      captureBarPointer(event.currentTarget, event.pointerId)
      attachDocumentPointerListeners()
    }

    const handleBarClick = (event: MouseEvent, task: GanttLayoutTask) => {
      if (suppressClick) {
        suppressClick = false
        event.preventDefault()
        event.stopPropagation()
        return
      }
      selectTask(task)
    }

    onBeforeUnmount(() => {
      detachDocumentPointerListeners()
      dragSession.value = null
      dragPreview.value = null
    })

    return () =>
      h(
        'div',
        {
          class: getCartesianChartShellClasses({
            showLegend: false,
            className: classNames(coerceClassValue(attrs.class), props.className)
          })
        },
        [
          h(
            ChartCanvas,
            {
              width: plotWidth.value,
              height: plotHeight.value,
              padding: props.padding,
              title: props.title,
              desc: props.desc,
              'aria-label':
                props.ariaLabel ?? (props.title ? undefined : labels.value.ganttAriaLabel)
            },
            {
              default: () =>
                h('g', { 'data-series-type': 'gantt' }, [
                  h('g', { 'data-gantt-axis': 'true' }, [
                    h('line', {
                      x1: props.taskLabelWidth,
                      x2: layout.value.width,
                      y1: props.timelineHeight - 1,
                      y2: props.timelineHeight - 1,
                      stroke: 'var(--tiger-border,#d1d5db)'
                    }),
                    ...layout.value.ticks.map((tick) =>
                      h('g', { key: `${tick.label}-${tick.x}` }, [
                        h('line', {
                          x1: tick.x,
                          x2: tick.x,
                          y1: 0,
                          y2: layout.value.height,
                          stroke: 'var(--tiger-border,#e5e7eb)'
                        }),
                        h('text', { x: tick.x + 4, y: 16, class: ganttAxisTextClasses }, tick.label)
                      ])
                    )
                  ]),
                  h(
                    'g',
                    { 'data-gantt-rows': 'true' },
                    layout.value.tasks.map((task) =>
                      h('rect', {
                        key: `row-${task.id}`,
                        x: 0,
                        y: props.timelineHeight + task.index * props.rowHeight,
                        width: layout.value.width,
                        height: props.rowHeight,
                        class: task.index % 2 === 0 ? ganttRowClasses : undefined,
                        opacity: task.index % 2 === 0 ? 0.75 : 0
                      })
                    )
                  ),
                  props.showToday && layout.value.todayX !== null
                    ? h('line', {
                        x1: layout.value.todayX,
                        x2: layout.value.todayX,
                        y1: 0,
                        y2: layout.value.height,
                        class: ganttTodayLineClasses,
                        'data-gantt-today': 'true'
                      })
                    : undefined,
                  props.showDependencies
                    ? h(
                        'g',
                        { 'data-gantt-dependencies': 'true' },
                        layout.value.dependencies.map((dependency) =>
                          h('path', {
                            key: `${dependency.sourceId}-${dependency.targetId}`,
                            d: dependency.path,
                            class: ganttDependencyClasses
                          })
                        )
                      )
                    : undefined,
                  h(
                    'g',
                    { 'data-gantt-tasks': 'true' },
                    layout.value.tasks.map((task) => {
                      const selected = resolvedSelectedId.value === task.id
                      const interactive =
                        (props.hoverable ||
                          props.selectable ||
                          typeof props.onTaskClick === 'function') &&
                        !task.task.disabled
                      const movable = canDrag.value && !task.task.disabled
                      const grabbing = dragPreview.value?.id === task.id
                      const previewDeltaX = grabbing ? (dragPreview.value?.deltaX ?? 0) : 0
                      return h('g', { key: task.id, opacity: getTaskOpacity(task) }, [
                        h(
                          'text',
                          {
                            x: 0,
                            y: task.y + task.height / 2 + 4,
                            class: ganttLabelClasses
                          },
                          task.task.label
                        ),
                        h(
                          'g',
                          {
                            class: getGanttTaskClasses(interactive, selected, movable, grabbing),
                            role: interactive ? 'button' : 'group',
                            tabindex: interactive ? 0 : undefined,
                            'aria-label': getGanttTaskAriaLabel(task.task),
                            'data-gantt-task-id': task.id,
                            transform:
                              previewDeltaX !== 0 ? `translate(${previewDeltaX} 0)` : undefined,
                            onMouseenter: () => setHoveredTask(task),
                            onMouseleave: () => setHoveredTask(null),
                            onPointerdown: (event: PointerEvent) => startBarDrag(event, task),
                            onPointermove: (event: PointerEvent) => moveBarDrag(event),
                            onPointerup: (event: PointerEvent) => finishBarDrag(event),
                            onPointercancel: (event: PointerEvent) => finishBarDrag(event),
                            onClick: (event: MouseEvent) => handleBarClick(event, task),
                            onKeydown: (event: KeyboardEvent) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault()
                                selectTask(task)
                              }
                            }
                          },
                          [
                            h('rect', {
                              x: task.x,
                              y: task.y,
                              width: task.width,
                              height: task.height,
                              rx: 4,
                              fill: task.color,
                              stroke: selected ? 'var(--tiger-text,#111827)' : undefined,
                              strokeWidth: selected ? 2 : undefined
                            }),
                            props.showProgress && task.progressWidth > 0
                              ? h('rect', {
                                  x: task.x,
                                  y: task.y,
                                  width: task.progressWidth,
                                  height: task.height,
                                  rx: 4,
                                  class: ganttProgressClasses
                                })
                              : undefined
                          ]
                        )
                      ])
                    })
                  )
                ])
            }
          )
        ]
      )
  }
})

export default Gantt
