import { defineComponent, computed, h, onBeforeUnmount, onMounted, PropType, ref, watch } from 'vue'
import {
  chartCanvasBaseClasses,
  classNames,
  coerceClassValue,
  createChartResizeObserverController,
  getChartInnerRect,
  resolveResponsiveChartSize,
  type ChartCanvasProps,
  type ChartCanvasSize,
  type ChartPadding
} from '@expcat/tigercat-core'

export interface VueChartCanvasProps extends ChartCanvasProps {
  padding?: ChartPadding
}

export const ChartCanvas = defineComponent({
  name: 'TigerChartCanvas',
  inheritAttrs: false,
  emits: {
    'resolved-size-change': (_size: ChartCanvasSize) => true
  },
  props: {
    width: {
      type: Number,
      default: 320
    },
    height: {
      type: Number,
      default: 200
    },
    responsive: {
      type: Boolean,
      default: false
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
  setup(props, { slots, attrs, emit }) {
    const svgRef = ref<SVGSVGElement | null>(null)
    const observedSize = ref<ChartCanvasSize | null>(null)
    const resizeController = createChartResizeObserverController({
      onSizeChange: (size) => {
        observedSize.value = size
      }
    })
    const resolvedSize = computed(() =>
      resolveResponsiveChartSize(
        { width: props.width, height: props.height },
        props.responsive ? observedSize.value : null
      )
    )
    const innerRect = computed(() =>
      getChartInnerRect(resolvedSize.value.width, resolvedSize.value.height, props.padding)
    )
    const svgClasses = computed(() =>
      classNames(chartCanvasBaseClasses, coerceClassValue(attrs.class), props.className)
    )

    const svgStyle = computed(() => ({
      ...(attrs.style as Record<string, unknown> | undefined)
    }))

    const syncResponsiveObserver = () => {
      if (!props.responsive) {
        resizeController.disconnect()
        observedSize.value = null
        return
      }

      const target = svgRef.value?.parentElement
      if (target) {
        resizeController.observe(target)
      }
    }

    onMounted(syncResponsiveObserver)
    watch(() => props.responsive, syncResponsiveObserver)
    watch(
      [() => resolvedSize.value.width, () => resolvedSize.value.height],
      ([nextWidth, nextHeight], prev) => {
        if (prev && prev[0] === nextWidth && prev[1] === nextHeight) return
        emit('resolved-size-change', { width: nextWidth, height: nextHeight })
      },
      { immediate: true }
    )
    onBeforeUnmount(() => resizeController.disconnect())

    return () => {
      const rect = innerRect.value
      const size = resolvedSize.value
      return h(
        'svg',
        {
          ...attrs,
          ref: svgRef,
          width: size.width,
          height: size.height,
          viewBox: `0 0 ${size.width} ${size.height}`,
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
            slots.default?.({ innerRect: rect, width: size.width, height: size.height })
          )
        ].filter(Boolean)
      )
    }
  }
})

export default ChartCanvas
