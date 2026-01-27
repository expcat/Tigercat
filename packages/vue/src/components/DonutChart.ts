import { defineComponent, computed, h, PropType } from 'vue'
import {
  classNames,
  getChartInnerRect,
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

export const DonutChart = defineComponent({
  name: 'TigerDonutChart',
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
      type: Array as PropType<DonutChartDatum[]>,
      required: true
    },
    innerRadius: {
      type: Number
    },
    innerRadiusRatio: {
      type: Number,
      default: 0.6
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
    }
  },
  emits: ['update:hoveredIndex', 'update:selectedIndex', 'slice-click', 'slice-hover'],
  setup(props, { emit }) {
    const innerRect = computed(() => getChartInnerRect(props.width, props.height, props.padding))

    const resolvedOuterRadius = computed(() => {
      if (typeof props.outerRadius === 'number') return Math.max(0, props.outerRadius)
      return Math.max(0, Math.min(innerRect.value.width, innerRect.value.height) / 2)
    })

    const resolvedInnerRadius = computed(() => {
      if (typeof props.innerRadius === 'number') {
        return Math.min(Math.max(0, props.innerRadius), resolvedOuterRadius.value)
      }

      const ratio = Math.min(Math.max(props.innerRadiusRatio ?? 0.6, 0), 1)
      return resolvedOuterRadius.value * ratio
    })

    // Event handlers to forward to PieChart
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

    return () =>
      h(PieChart, {
        width: props.width,
        height: props.height,
        padding: props.padding,
        data: props.data,
        innerRadius: resolvedInnerRadius.value,
        outerRadius: props.outerRadius,
        startAngle: props.startAngle,
        endAngle: props.endAngle,
        padAngle: props.padAngle,
        colors: props.colors,
        showLabels: props.showLabels,
        labelFormatter: props.labelFormatter,
        // Interaction props
        hoverable: props.hoverable,
        hoveredIndex: props.hoveredIndex,
        activeOpacity: props.activeOpacity,
        inactiveOpacity: props.inactiveOpacity,
        selectable: props.selectable,
        selectedIndex: props.selectedIndex,
        // Legend props
        showLegend: props.showLegend,
        legendPosition: props.legendPosition,
        legendMarkerSize: props.legendMarkerSize,
        legendGap: props.legendGap,
        // Tooltip props
        showTooltip: props.showTooltip,
        tooltipFormatter: props.tooltipFormatter,
        // Accessibility
        title: props.title,
        desc: props.desc,
        className: classNames(props.className),
        // Event handlers
        'onUpdate:hoveredIndex': handleHoveredIndexUpdate,
        'onUpdate:selectedIndex': handleSelectedIndexUpdate,
        onSliceClick: handleSliceClick,
        onSliceHover: handleSliceHover
      })
  }
})

export default DonutChart
