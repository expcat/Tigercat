import { defineComponent, computed, h, PropType } from 'vue'
import {
  chartCanvasBaseClasses,
  classNames,
  coerceClassValue,
  getChartInnerRect,
  type ChartCanvasProps,
  type ChartPadding
} from '@expcat/tigercat-core'

export interface VueChartCanvasProps extends ChartCanvasProps {
  padding?: ChartPadding
}

export const ChartCanvas = defineComponent({
  name: 'TigerChartCanvas',
  inheritAttrs: false,
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
    className: {
      type: String
    },
    title: {
      type: String
    },
    desc: {
      type: String
    }
  },
  setup(props, { slots, attrs }) {
    const innerRect = computed(() => getChartInnerRect(props.width, props.height, props.padding))
    const svgClasses = computed(() =>
      classNames(chartCanvasBaseClasses, coerceClassValue(attrs.class), props.className)
    )

    const svgStyle = computed(() => ({
      ...(attrs.style as Record<string, unknown> | undefined)
    }))

    return () => {
      const rect = innerRect.value
      return h(
        'svg',
        {
          ...attrs,
          width: props.width,
          height: props.height,
          viewBox: `0 0 ${props.width} ${props.height}`,
          class: svgClasses.value,
          style: svgStyle.value
        },
        [
          props.title ? h('title', props.title) : null,
          props.desc ? h('desc', props.desc) : null,
          h(
            'g',
            {
              transform: `translate(${rect.x}, ${rect.y})`
            },
            slots.default?.({ innerRect: rect })
          )
        ].filter(Boolean)
      )
    }
  }
})

export default ChartCanvas
