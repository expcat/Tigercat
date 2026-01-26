import { defineComponent, computed, h, PropType } from 'vue'
import {
  chartGridLineClasses,
  classNames,
  coerceClassValue,
  getChartAxisTicks,
  getChartGridLineDasharray,
  type ChartGridLine,
  type ChartGridLineStyle,
  type ChartGridProps,
  type ChartScale,
  type ChartScaleValue
} from '@expcat/tigercat-core'

export interface VueChartGridProps<
  TX extends ChartScaleValue = ChartScaleValue,
  TY extends ChartScaleValue = ChartScaleValue
> extends ChartGridProps<TX, TY> {
  xScale?: ChartScale<TX>
  yScale?: ChartScale<TY>
}

export const ChartGrid = defineComponent({
  name: 'TigerChartGrid',
  inheritAttrs: false,
  props: {
    xScale: {
      type: Object as PropType<ChartScale>
    },
    yScale: {
      type: Object as PropType<ChartScale>
    },
    show: {
      type: String as PropType<ChartGridLine>,
      default: 'both' as ChartGridLine
    },
    xTicks: {
      type: Number,
      default: 5
    },
    yTicks: {
      type: Number,
      default: 5
    },
    xTickValues: {
      type: Array as PropType<ChartScaleValue[]>
    },
    yTickValues: {
      type: Array as PropType<ChartScaleValue[]>
    },
    lineStyle: {
      type: String as PropType<ChartGridLineStyle>,
      default: 'solid' as ChartGridLineStyle
    },
    strokeWidth: {
      type: Number,
      default: 1
    },
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    },
    className: {
      type: String
    }
  },
  setup(props, { attrs }) {
    const dasharray = computed(() => getChartGridLineDasharray(props.lineStyle))

    const xTicks = computed(() => {
      if (!props.xScale) return []
      return getChartAxisTicks(props.xScale, {
        tickCount: props.xTicks,
        tickValues: props.xTickValues
      })
    })

    const yTicks = computed(() => {
      if (!props.yScale) return []
      return getChartAxisTicks(props.yScale, {
        tickCount: props.yTicks,
        tickValues: props.yTickValues
      })
    })

    const gridClasses = computed(() => classNames(coerceClassValue(attrs.class), props.className))

    return () => {
      const shouldRenderX = props.show === 'both' || props.show === 'x'
      const shouldRenderY = props.show === 'both' || props.show === 'y'
      const xRange = props.xScale?.range
      const yRange = props.yScale?.range

      const lines: ReturnType<typeof h>[] = []

      if (shouldRenderX && props.xScale && yRange) {
        xTicks.value.forEach((tick) => {
          lines.push(
            h('line', {
              x1: tick.position,
              y1: yRange[0],
              x2: tick.position,
              y2: yRange[1],
              class: chartGridLineClasses,
              'stroke-width': props.strokeWidth,
              'stroke-dasharray': dasharray.value
            })
          )
        })
      }

      if (shouldRenderY && props.yScale && xRange) {
        yTicks.value.forEach((tick) => {
          lines.push(
            h('line', {
              x1: xRange[0],
              y1: tick.position,
              x2: xRange[1],
              y2: tick.position,
              class: chartGridLineClasses,
              'stroke-width': props.strokeWidth,
              'stroke-dasharray': dasharray.value
            })
          )
        })
      }

      return h(
        'g',
        {
          ...attrs,
          class: gridClasses.value,
          transform: `translate(${props.x}, ${props.y})`
        },
        lines
      )
    }
  }
})

export default ChartGrid
