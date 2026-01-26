import { defineComponent, computed, h, PropType } from 'vue'
import {
  chartAxisLabelClasses,
  chartAxisLineClasses,
  chartAxisTickLineClasses,
  chartAxisTickTextClasses,
  classNames,
  coerceClassValue,
  getChartAxisTicks,
  type ChartAxisTick,
  type ChartAxisOrientation,
  type ChartAxisProps,
  type ChartScale,
  type ChartScaleValue
} from '@expcat/tigercat-core'

export interface VueChartAxisProps extends ChartAxisProps {
  scale: ChartScale
}

export const ChartAxis = defineComponent({
  name: 'TigerChartAxis',
  inheritAttrs: false,
  props: {
    orientation: {
      type: String as PropType<ChartAxisOrientation>,
      default: 'bottom' as ChartAxisOrientation
    },
    scale: {
      type: Object as PropType<ChartScale>,
      required: true
    },
    ticks: {
      type: Number,
      default: 5
    },
    tickValues: {
      type: Array as PropType<ChartScaleValue[]>
    },
    tickFormat: {
      type: Function as PropType<(value: ChartScaleValue) => string>
    },
    tickSize: {
      type: Number,
      default: 6
    },
    tickPadding: {
      type: Number,
      default: 4
    },
    label: {
      type: String
    },
    labelOffset: {
      type: Number,
      default: 28
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
    const ticks = computed<ChartAxisTick[]>(() =>
      getChartAxisTicks(props.scale, {
        tickCount: props.ticks,
        tickValues: props.tickValues,
        tickFormat: props.tickFormat
      })
    )

    const axisClasses = computed(() => classNames(coerceClassValue(attrs.class), props.className))

    return () => {
      const isHorizontal = props.orientation === 'top' || props.orientation === 'bottom'
      const isTopOrLeft = props.orientation === 'top' || props.orientation === 'left'
      const rangeStart = props.scale.range[0]
      const rangeEnd = props.scale.range[1]
      const axisLine = isHorizontal
        ? { x1: rangeStart, y1: 0, x2: rangeEnd, y2: 0 }
        : { x1: 0, y1: rangeStart, x2: 0, y2: rangeEnd }
      const tickDirection = isTopOrLeft ? -1 : 1
      const labelBase = props.tickSize + props.tickPadding + props.labelOffset
      const labelPosition = (rangeStart + rangeEnd) / 2

      return h(
        'g',
        {
          ...attrs,
          class: axisClasses.value,
          transform: `translate(${props.x}, ${props.y})`
        },
        [
          h('line', {
            ...axisLine,
            class: chartAxisLineClasses,
            'data-axis-line': 'true'
          }),
          ...ticks.value.map((tick) => {
            const tickLine = isHorizontal
              ? {
                  x1: tick.position,
                  y1: 0,
                  x2: tick.position,
                  y2: props.tickSize * tickDirection
                }
              : {
                  x1: 0,
                  y1: tick.position,
                  x2: props.tickSize * tickDirection,
                  y2: tick.position
                }

            const textProps = isHorizontal
              ? {
                  x: tick.position,
                  y: props.tickSize * tickDirection + props.tickPadding * tickDirection,
                  'text-anchor': 'middle',
                  dy: isTopOrLeft ? '-0.32em' : '0.71em'
                }
              : {
                  x: (props.tickSize + props.tickPadding) * tickDirection,
                  y: tick.position,
                  'text-anchor': isTopOrLeft ? 'end' : 'start',
                  dy: '0.32em'
                }

            return h('g', { 'data-axis-tick': 'true' }, [
              h('line', {
                ...tickLine,
                class: chartAxisTickLineClasses
              }),
              h(
                'text',
                {
                  ...textProps,
                  class: chartAxisTickTextClasses
                },
                tick.label
              )
            ])
          }),
          props.label
            ? h(
                'text',
                {
                  class: chartAxisLabelClasses,
                  'data-axis-label': 'true',
                  ...(isHorizontal
                    ? {
                        x: labelPosition,
                        y: labelBase * tickDirection,
                        'text-anchor': 'middle',
                        dy: isTopOrLeft ? '-0.32em' : '0.71em'
                      }
                    : {
                        x: labelBase * tickDirection,
                        y: labelPosition,
                        'text-anchor': 'middle',
                        transform: `rotate(${isTopOrLeft ? -90 : 90} ${
                          labelBase * tickDirection
                        } ${labelPosition})`
                      })
                },
                props.label
              )
            : null
        ]
      )
    }
  }
})

export default ChartAxis
