import { defineComponent, computed, h, PropType } from 'vue'
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
import { useChartInteraction } from '../composables/useChartInteraction'

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
    // Use shared interaction composable
    const {
      tooltipPosition,
      resolvedHoveredIndex,
      activeIndex,
      handleMouseEnter,
      handleMouseMove,
      handleMouseLeave,
      handleClick,
      handleKeyDown,
      handleLegendClick,
      handleLegendHover,
      handleLegendLeave,
      wrapperClasses
    } = useChartInteraction<PieChartDatum>({
      hoverable: computed(() => props.hoverable),
      hoveredIndexProp: () => props.hoveredIndex,
      selectable: computed(() => props.selectable),
      selectedIndexProp: () => props.selectedIndex,
      activeOpacity: computed(() => props.activeOpacity),
      inactiveOpacity: computed(() => props.inactiveOpacity),
      legendPosition: computed(() => props.legendPosition),
      emit: emit as (event: string, ...args: unknown[]) => void,
      getData: (index: number) => props.data[index],
      eventNames: { hover: 'slice-hover', click: 'slice-click' }
    })

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
                        role: props.selectable ? 'button' : 'img',
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
