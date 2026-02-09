import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  getChartInnerRect,
  normalizeChartPadding,
  type ChartPadding,
  type ChartLegendPosition,
  type DonutChartDatum,
  type DonutChartProps as CoreDonutChartProps
} from '@expcat/tigercat-core'
import { PieChart } from './PieChart'

export interface VueDonutChartProps extends CoreDonutChartProps {
  data: DonutChartDatum[]
  padding?: ChartPadding
}

/** ECharts-inspired vibrant palette for donut charts */
const DONUT_PALETTE = [
  '#5470c6',
  '#91cc75',
  '#fac858',
  '#ee6666',
  '#73c0de',
  '#3ba272',
  '#fc8452',
  '#9a60b4',
  '#ea7ccc'
]

export const DonutChart = defineComponent({
  name: 'TigerDonutChart',
  props: {
    width: {
      type: Number,
      default: 320
    },
    height: {
      type: Number,
      default: 240
    },
    padding: {
      type: [Number, Object] as PropType<ChartPadding>,
      default: 24
    },
    data: {
      type: Array as PropType<DonutChartDatum[]>,
      required: true
    },
    innerRadius: {
      type: Number
    },
    innerRadiusRatio: {
      type: Number,
      default: 0.62
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
      default: 0.04
    },
    colors: {
      type: Array as PropType<string[]>
    },
    showLabels: {
      type: Boolean,
      default: false
    },
    labelFormatter: {
      type: Function as PropType<(value: number, datum: DonutChartDatum, index: number) => string>
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
      default: 0.3
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
      type: Function as PropType<(datum: DonutChartDatum, index: number) => string>
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
    },
    // Visual enhancements
    borderWidth: {
      type: Number,
      default: 0
    },
    borderColor: {
      type: String,
      default: '#ffffff'
    },
    hoverOffset: {
      type: Number,
      default: 10
    },
    labelPosition: {
      type: String as PropType<'inside' | 'outside'>,
      default: 'inside'
    },
    shadow: {
      type: Boolean,
      default: true
    },
    // DonutChart-specific
    centerValue: {
      type: [String, Number] as PropType<string | number>
    },
    centerLabel: {
      type: String
    },
    animated: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:hoveredIndex', 'update:selectedIndex', 'slice-click', 'slice-hover'],
  setup(props, { emit }) {
    const innerRect = computed(() => getChartInnerRect(props.width, props.height, props.padding))
    const pad = computed(() => normalizeChartPadding(props.padding))

    const resolvedOuterRadius = computed(() => {
      if (typeof props.outerRadius === 'number') return Math.max(0, props.outerRadius)
      return Math.max(0, Math.min(innerRect.value.width, innerRect.value.height) / 2)
    })

    const resolvedInnerRadius = computed(() => {
      if (typeof props.innerRadius === 'number') {
        return Math.min(Math.max(0, props.innerRadius), resolvedOuterRadius.value)
      }
      const ratio = Math.min(Math.max(props.innerRadiusRatio ?? 0.62, 0), 1)
      return resolvedOuterRadius.value * ratio
    })

    const centerPos = computed(() => ({
      x: pad.value.left + innerRect.value.width / 2,
      y: pad.value.top + innerRect.value.height / 2
    }))

    const hasCenterContent = computed(
      () => props.centerValue !== undefined || props.centerLabel !== undefined
    )

    const resolvedColors = computed(() =>
      props.colors && props.colors.length > 0 ? props.colors : DONUT_PALETTE
    )

    const donutTooltipFormatter = computed(() => {
      if (props.tooltipFormatter) return props.tooltipFormatter
      const total = props.data.reduce((s, d) => s + d.value, 0)
      return (datum: DonutChartDatum, index: number) => {
        const pct = total > 0 ? ((datum.value / total) * 100).toFixed(1) : '0'
        const label = datum.label ?? `#${index + 1}`
        return `${label}: ${datum.value} (${pct}%)`
      }
    })

    const handleHoveredIndexUpdate = (index: number | null) => {
      emit('update:hoveredIndex', index)
    }
    const handleSelectedIndexUpdate = (index: number | null) => {
      emit('update:selectedIndex', index)
    }
    const handleSliceClick = (datum: DonutChartDatum, index: number) => {
      emit('slice-click', datum, index)
    }
    const handleSliceHover = (datum: DonutChartDatum | null, index: number | null) => {
      emit('slice-hover', datum, index)
    }

    return () => {
      const pie = h(PieChart, {
        width: props.width,
        height: props.height,
        padding: props.padding,
        data: props.data,
        innerRadius: resolvedInnerRadius.value,
        outerRadius: props.outerRadius,
        startAngle: props.startAngle,
        endAngle: props.endAngle,
        padAngle: props.padAngle,
        colors: resolvedColors.value,
        showLabels: props.showLabels,
        labelFormatter: props.labelFormatter,
        labelPosition: props.labelPosition,
        borderWidth: props.borderWidth,
        borderColor: props.borderColor,
        hoverOffset: props.hoverOffset,
        shadow: props.shadow,
        hoverable: props.hoverable,
        hoveredIndex: props.hoveredIndex,
        activeOpacity: props.activeOpacity,
        inactiveOpacity: props.inactiveOpacity,
        selectable: props.selectable,
        selectedIndex: props.selectedIndex,
        showLegend: props.showLegend,
        legendPosition: props.legendPosition,
        legendMarkerSize: props.legendMarkerSize,
        legendGap: props.legendGap,
        showTooltip: props.showTooltip,
        tooltipFormatter: donutTooltipFormatter.value,
        title: props.title,
        desc: props.desc,
        className: classNames(props.className),
        'onUpdate:hoveredIndex': handleHoveredIndexUpdate,
        'onUpdate:selectedIndex': handleSelectedIndexUpdate,
        onSliceClick: handleSliceClick,
        onSliceHover: handleSliceHover
      })

      const center = hasCenterContent.value
        ? h(
            'div',
            {
              style: {
                position: 'absolute',
                left: `${centerPos.value.x}px`,
                top: `${centerPos.value.y}px`,
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                pointerEvents: 'none',
                lineHeight: '1.3'
              },
              'data-donut-center': 'true'
            },
            [
              props.centerValue !== undefined
                ? h(
                    'div',
                    {
                      class: 'text-xl font-semibold text-[color:var(--tiger-text,#1f2937)]',
                      style: { lineHeight: '1.2' }
                    },
                    `${props.centerValue}`
                  )
                : null,
              props.centerLabel !== undefined
                ? h(
                    'div',
                    {
                      class: 'text-xs text-[color:var(--tiger-text-secondary,#6b7280)]',
                      style: { marginTop: '2px' }
                    },
                    props.centerLabel
                  )
                : null
            ]
          )
        : null

      return h('div', { class: 'inline-block relative', 'data-donut-chart': 'true' }, [pie, center])
    }
  }
})

export default DonutChart
