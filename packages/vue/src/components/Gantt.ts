import { computed, defineComponent, h, PropType, ref } from 'vue'
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
  type GanttDateValue,
  type GanttLayoutTask,
  type GanttProps as CoreGanttProps,
  type GanttScale,
  type GanttTask
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'

export interface VueGanttProps extends CoreGanttProps {
  padding?: ChartPadding
}

export const Gantt = defineComponent({
  name: 'TigerGantt',
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
    inactiveOpacity: { type: Number, default: 0.35 },
    dateFormatter: {
      type: Function as PropType<(date: Date, scale: GanttScale) => string>
    },
    colors: { type: Array as PropType<string[]> },
    title: { type: String },
    desc: { type: String },
    ariaLabel: { type: String, default: 'Gantt chart' },
    className: { type: String }
  },
  emits: ['update:selectedId', 'task-click', 'task-hover'],
  setup(props, { emit }) {
    const innerSelectedId = ref<string | number | null>(null)
    const hoveredId = ref<string | number | null>(null)
    const resolvedSelectedId = computed(() =>
      props.selectedId === undefined ? innerSelectedId.value : props.selectedId
    )
    const innerRect = computed(() => getChartInnerRect(props.width, props.height, props.padding))
    const layout = computed(() =>
      computeGanttLayout(props.data, {
        width: innerRect.value.width,
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
        dateFormatter: props.dateFormatter
      })
    )
    const activeId = computed(() => resolvedSelectedId.value ?? hoveredId.value)

    const selectTask = (task: GanttLayoutTask) => {
      if (props.selectable && !task.task.disabled) {
        const nextId = resolvedSelectedId.value === task.id ? null : task.id
        innerSelectedId.value = nextId
        emit('update:selectedId', nextId)
      }
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

    return () =>
      h(
        ChartCanvas,
        {
          width: props.width,
          height: props.height,
          padding: props.padding,
          title: props.title,
          desc: props.desc,
          className: classNames(props.className),
          role: 'img',
          'aria-label': props.ariaLabel
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
                  const interactive = (props.hoverable || props.selectable) && !task.task.disabled
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
                        class: getGanttTaskClasses(interactive, selected),
                        role: interactive ? 'button' : 'group',
                        tabindex: interactive ? 0 : undefined,
                        'aria-label': getGanttTaskAriaLabel(task.task),
                        onMouseenter: () => setHoveredTask(task),
                        onMouseleave: () => setHoveredTask(null),
                        onClick: () => selectTask(task),
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
  }
})

export default Gantt
