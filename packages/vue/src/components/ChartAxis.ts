import { defineComponent, computed, h, PropType } from 'vue'
import {
  chartAxisLabelClasses,
  chartAxisLineClasses,
  chartAxisTickLineClasses,
  chartAxisTickTextClasses,
  classNames,
  coerceClassValue,
  getChartAxisGeometry,
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
    const geometry = computed(() =>
      getChartAxisGeometry(props.scale, {
        orientation: props.orientation,
        tickCount: props.ticks,
        tickValues: props.tickValues,
        tickFormat: props.tickFormat,
        tickSize: props.tickSize,
        tickPadding: props.tickPadding,
        label: props.label,
        labelOffset: props.labelOffset
      })
    )

    const axisClasses = computed(() => classNames(coerceClassValue(attrs.class), props.className))

    return () => {
      const next = geometry.value
      return h(
        'g',
        {
          ...attrs,
          class: axisClasses.value,
          transform: `translate(${props.x}, ${props.y})`,
          'aria-hidden': 'true'
        },
        [
          h('line', {
            ...next.axisLine,
            class: chartAxisLineClasses,
            'data-axis-line': 'true'
          }),
          ...next.ticks.map((tick) =>
            h('g', { key: tick.key, 'data-axis-tick': 'true' }, [
              h('line', {
                ...tick.line,
                class: chartAxisTickLineClasses
              }),
              h(
                'text',
                {
                  x: tick.text.x,
                  y: tick.text.y,
                  'text-anchor': tick.text.textAnchor,
                  dy: tick.text.dy,
                  class: chartAxisTickTextClasses
                },
                tick.label
              )
            ])
          ),
          next.label
            ? h(
                'text',
                {
                  class: chartAxisLabelClasses,
                  'data-axis-label': 'true',
                  x: next.label.x,
                  y: next.label.y,
                  'text-anchor': next.label.textAnchor,
                  dy: next.label.dy,
                  transform: next.label.transform
                },
                next.label.text
              )
            : null
        ]
      )
    }
  }
})

export default ChartAxis
