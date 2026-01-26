import { defineComponent, computed, h, PropType } from 'vue'
import {
  chartAxisTickTextClasses,
  classNames,
  createPieArcPath,
  getChartInnerRect,
  getPieArcs,
  polarToCartesian,
  type ChartPadding,
  type PieChartDatum,
  type PieChartProps as CorePieChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartSeries } from './ChartSeries'

const defaultPieColors = [
  'var(--tiger-chart-1,#2563eb)',
  'var(--tiger-chart-2,#22c55e)',
  'var(--tiger-chart-3,#f97316)',
  'var(--tiger-chart-4,#a855f7)',
  'var(--tiger-chart-5,#0ea5e9)',
  'var(--tiger-chart-6,#ef4444)'
]

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
    className: {
      type: String
    }
  },
  setup(props) {
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
      props.colors && props.colors.length > 0 ? props.colors : defaultPieColors
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

      return h(
        ChartCanvas,
        {
          width: props.width,
          height: props.height,
          padding: props.padding,
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

                      return h('path', {
                        key: `slice-${arc.index}`,
                        d: path,
                        fill: color,
                        'data-pie-slice': 'true',
                        'data-index': arc.index
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
    }
  }
})

export default PieChart
