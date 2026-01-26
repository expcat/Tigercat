import { defineComponent, computed, h, PropType, ref } from 'vue'
import {
  chartAxisTickTextClasses,
  classNames,
  createPieArcPath,
  DEFAULT_CHART_COLORS,
  getChartElementOpacity,
  getChartInnerRect,
  getPieArcs,
  polarToCartesian,
  type ChartLegendItem,
  type ChartLegendPosition,
  type ChartPadding,
  type PieChartDatum,
  type PieChartProps as CorePieChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartLegend } from './ChartLegend'
import { ChartSeries } from './ChartSeries'
import { ChartTooltip } from './ChartTooltip'

export interface VuePieChartProps extends CorePieChartProps {
  data: PieChartDatum[]
  padding?: ChartPadding
}

export const PieChart = defineComponent({
  name: 'TigerPieChart',
  props: {
    width: {
      type: Number,
      default: 320
    },
    height: {
      type: Number,
      default: 200
    },
    padding: {
      type: [Number, Object] as PropType<ChartPadding>,
      default: 24
    },
    data: {
      type: Array as PropType<PieChartDatum[]>,
      required: true
    },
    innerRadius: {
      type: Number,
      default: 0
    },
    outerRadius: {
      type: Number
    },
    startAngle: {
      type: Number,
      default: 0
    },
    endAngle: {
      type: Number,
      default: Math.PI * 2
    },
    padAngle: {
      type: Number,
      default: 0
    },
    colors: {
      type: Array as PropType<string[]>
    },
    showLabels: {
      type: Boolean,
      default: false
    },
    labelFormatter: {
      type: Function as PropType<(value: number, datum: PieChartDatum, index: number) => string>
    },
    // Interaction props
    hoverable: {
      type: Boolean,
      default: false
    },
    hoveredIndex: {
      type: Number as PropType<number | null>,
      default: undefined
    },
    activeOpacity: {
      type: Number,
      default: 1
    },
    inactiveOpacity: {
      type: Number,
      default: 0.25
    },
    selectable: {
      type: Boolean,
      default: false
    },
    selectedIndex: {
      type: Number as PropType<number | null>,
      default: undefined
    },
    // Legend props
    showLegend: {
      type: Boolean,
      default: false
    },
    legendPosition: {
      type: String as PropType<ChartLegendPosition>,
      default: 'bottom'
    },
    legendMarkerSize: {
      type: Number,
      default: 10
    },
    legendGap: {
      type: Number,
      default: 8
    },
    // Tooltip props
    showTooltip: {
      type: Boolean,
      default: true
    },
    tooltipFormatter: {
      type: Function as PropType<(datum: PieChartDatum, index: number) => string>
    },
    // Accessibility
    title: {
      type: String
    },
    desc: {
      type: String
    },
    className: {
      type: String
    }
  },
  emits: ['update:hoveredIndex', 'update:selectedIndex', 'slice-click', 'slice-hover'],
  setup(props, { emit }) {
    const localHoveredIndex = ref<number | null>(null)
    const localSelectedIndex = ref<number | null>(null)
    const tooltipPosition = ref({ x: 0, y: 0 })

    const innerRect = computed(() => getChartInnerRect(props.width, props.height, props.padding))

    const resolvedOuterRadius = computed(() => {
      if (typeof props.outerRadius === 'number') return Math.max(0, props.outerRadius)
      return Math.max(0, Math.min(innerRect.value.width, innerRect.value.height) / 2)
    })

    const resolvedInnerRadius = computed(() =>
      Math.min(Math.max(0, props.innerRadius ?? 0), resolvedOuterRadius.value)
    )

    const arcs = computed(() =>
      getPieArcs(props.data, {
        startAngle: props.startAngle,
        endAngle: props.endAngle,
        padAngle: props.padAngle
      })
    )

    const palette = computed(() =>
      props.colors && props.colors.length > 0 ? props.colors : [...DEFAULT_CHART_COLORS]
    )

    const resolvedHoveredIndex = computed(() =>
      props.hoveredIndex !== undefined ? props.hoveredIndex : localHoveredIndex.value
    )

    const resolvedSelectedIndex = computed(() =>
      props.selectedIndex !== undefined ? props.selectedIndex : localSelectedIndex.value
    )

    const activeIndex = computed(() => {
      if (resolvedSelectedIndex.value !== null) return resolvedSelectedIndex.value
      if (props.hoverable && resolvedHoveredIndex.value !== null) return resolvedHoveredIndex.value
      return null
    })

    const legendItems = computed<ChartLegendItem[]>(() =>
      props.data.map((datum, index) => ({
        index,
        label: datum.label ?? `${datum.value}`,
        color: datum.color ?? palette.value[index % palette.value.length],
        active: activeIndex.value === null || activeIndex.value === index
      }))
    )

    const formatTooltip = computed(
      () =>
        props.tooltipFormatter ??
        ((datum: PieChartDatum, index: number) => {
          const total = props.data.reduce((sum, d) => sum + d.value, 0)
          const percent = total > 0 ? ((datum.value / total) * 100).toFixed(1) : '0'
          const label = datum.label ?? `#${index + 1}`
          return `${label}: ${datum.value} (${percent}%)`
        })
    )

    const tooltipContent = computed(() => {
      if (resolvedHoveredIndex.value === null) return ''
      const datum = props.data[resolvedHoveredIndex.value]
      return datum ? formatTooltip.value(datum, resolvedHoveredIndex.value) : ''
    })

    const handleMouseEnter = (index: number, event: MouseEvent) => {
      if (!props.hoverable) return
      if (props.hoveredIndex === undefined) {
        localHoveredIndex.value = index
      }
      tooltipPosition.value = { x: event.clientX, y: event.clientY }
      emit('update:hoveredIndex', index)
      emit('slice-hover', index, props.data[index])
    }

    const handleMouseMove = (event: MouseEvent) => {
      tooltipPosition.value = { x: event.clientX, y: event.clientY }
    }

    const handleMouseLeave = () => {
      if (!props.hoverable) return
      if (props.hoveredIndex === undefined) {
        localHoveredIndex.value = null
      }
      emit('update:hoveredIndex', null)
      emit('slice-hover', null, null)
    }

    const handleClick = (index: number) => {
      if (!props.selectable) return
      const nextIndex = resolvedSelectedIndex.value === index ? null : index
      if (props.selectedIndex === undefined) {
        localSelectedIndex.value = nextIndex
      }
      emit('update:selectedIndex', nextIndex)
      emit('slice-click', index, props.data[index])
    }

    const handleKeyDown = (event: KeyboardEvent, index: number) => {
      if (!props.selectable) return
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      handleClick(index)
    }

    const handleLegendClick = (index: number) => {
      handleClick(index)
    }

    const handleLegendHover = (index: number) => {
      if (!props.hoverable) return
      if (props.hoveredIndex === undefined) {
        localHoveredIndex.value = index
      }
      emit('update:hoveredIndex', index)
    }

    const handleLegendLeave = () => {
      handleMouseLeave()
    }

    const wrapperClasses = computed(() =>
      classNames(
        'inline-flex',
        props.legendPosition === 'right'
          ? 'flex-row items-center gap-4'
          : props.legendPosition === 'left'
            ? 'flex-row-reverse items-center gap-4'
            : props.legendPosition === 'top'
              ? 'flex-col-reverse gap-2'
              : 'flex-col gap-2'
      )
    )

    return () => {
      const rect = innerRect.value
      const cx = rect.width / 2
      const cy = rect.height / 2
      const outerRadius = resolvedOuterRadius.value
      const innerRadius = resolvedInnerRadius.value
      const labelRadius = innerRadius + (outerRadius - innerRadius) / 2
      const formatLabel =
        props.labelFormatter ?? ((value: number, datum: PieChartDatum) => datum.label ?? `${value}`)

      const chart = h(
        ChartCanvas,
        {
          width: props.width,
          height: props.height,
          padding: props.padding,
          title: props.title,
          desc: props.desc,
          className: classNames(props.className)
        },
        {
          default: () =>
            [
              h(
                ChartSeries,
                {
                  data: props.data,
                  type: 'pie'
                },
                {
                  default: () =>
                    arcs.value.map((arc) => {
                      const color =
                        arc.data.color ?? palette.value[arc.index % palette.value.length]
                      const path = createPieArcPath({
                        cx,
                        cy,
                        innerRadius,
                        outerRadius,
                        startAngle: arc.startAngle,
                        endAngle: arc.endAngle
                      })
                      const opacity = getChartElementOpacity(arc.index, activeIndex.value, {
                        activeOpacity: props.activeOpacity,
                        inactiveOpacity: props.inactiveOpacity
                      })

                      return h('path', {
                        key: `slice-${arc.index}`,
                        d: path,
                        fill: color,
                        opacity,
                        class: classNames(
                          (props.hoverable || props.selectable) &&
                            'cursor-pointer transition-opacity duration-150'
                        ),
                        tabindex: props.selectable ? 0 : undefined,
                        role: props.selectable ? 'button' : undefined,
                        'aria-label': arc.data.label ?? `${arc.value}`,
                        'data-pie-slice': 'true',
                        'data-index': arc.index,
                        onMouseenter: (e: MouseEvent) => handleMouseEnter(arc.index, e),
                        onMousemove: handleMouseMove,
                        onMouseleave: handleMouseLeave,
                        onClick: () => handleClick(arc.index),
                        onKeydown: (e: KeyboardEvent) => handleKeyDown(e, arc.index)
                      })
                    })
                }
              ),
              props.showLabels
                ? arcs.value.map((arc) => {
                    const angle = (arc.startAngle + arc.endAngle) / 2
                    const { x, y } = polarToCartesian(cx, cy, labelRadius, angle)
                    const label = formatLabel(arc.value, arc.data, arc.index)

                    return h(
                      'text',
                      {
                        key: `label-${arc.index}`,
                        x,
                        y,
                        class: chartAxisTickTextClasses,
                        'text-anchor': 'middle',
                        'dominant-baseline': 'middle'
                      },
                      label
                    )
                  })
                : null
            ].filter(Boolean)
        }
      )

      const tooltip =
        props.showTooltip && props.hoverable
          ? h(ChartTooltip, {
              content: tooltipContent.value,
              visible: resolvedHoveredIndex.value !== null && tooltipContent.value !== '',
              x: tooltipPosition.value.x,
              y: tooltipPosition.value.y
            })
          : null

      if (!props.showLegend) {
        return h('div', { class: 'inline-block relative' }, [chart, tooltip])
      }

      return h('div', { class: wrapperClasses.value }, [
        chart,
        h(ChartLegend, {
          items: legendItems.value,
          position: props.legendPosition,
          markerSize: props.legendMarkerSize,
          gap: props.legendGap,
          interactive: props.hoverable || props.selectable,
          onItemClick: handleLegendClick,
          onItemHover: handleLegendHover,
          onItemLeave: handleLegendLeave
        }),
        tooltip
      ])
    }
  }
})

export default PieChart
