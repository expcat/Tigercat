import {
  defineComponent,
  computed,
  h,
  onBeforeUnmount,
  onMounted,
  PropType,
  ref,
  useId,
  watch
} from 'vue'
import {
  chartCanvasBaseClasses,
  chartCanvasHostClasses,
  classNames,
  coerceClassValue,
  createChartResizeObserverController,
  DEFAULT_CHART_PADDING,
  DEFAULT_CHART_SIZE,
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
      default: DEFAULT_CHART_SIZE.width
    },
    height: {
      type: Number,
      default: DEFAULT_CHART_SIZE.height
    },
    responsive: {
      type: Boolean,
      default: true
    },
    padding: {
      type: [Number, Object] as PropType<ChartPadding>,
      default: () => ({ ...DEFAULT_CHART_PADDING })
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
    const hostRef = ref<HTMLDivElement | null>(null)
    const labelId = useId()
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

      const target = hostRef.value
      if (target) {
        resizeController.observe(target)
      }
    }

    let ready = false
    onMounted(() => {
      ready = true
      syncResponsiveObserver()
    })
    watch(() => props.responsive, syncResponsiveObserver)
    watch([() => resolvedSize.value.width, () => resolvedSize.value.height], ([nextWidth, nextHeight], prev) => {
      if (!ready) return
      if (prev && prev[0] === nextWidth && prev[1] === nextHeight) return
      emit('resolved-size-change', { width: nextWidth, height: nextHeight })
    })
    onBeforeUnmount(() => resizeController.disconnect())

    return () => {
      const rect = innerRect.value
      const size = resolvedSize.value
      const titleId = props.title ? `${labelId}-title` : undefined
      const descId = props.desc ? `${labelId}-desc` : undefined
      const accessibleName =
        (typeof attrs['aria-label'] === 'string' ? attrs['aria-label'] : undefined) || props.title
      const plotReady = rect.width > 0 && rect.height > 0
      return h(
        'div',
        {
          ref: hostRef,
          class: classNames(chartCanvasHostClasses, 'relative', props.responsive && 'h-full'),
          'data-chart-canvas-host': ''
        },
        [
          h(
            'svg',
            {
              ...attrs,
              width: size.width,
              height: size.height,
              viewBox: `0 0 ${size.width} ${size.height}`,
              class: svgClasses.value,
              style: svgStyle.value,
              role: 'group',
              'aria-label': accessibleName,
              'aria-labelledby': titleId,
              'aria-describedby': descId,
              'data-chart-plot': plotReady ? 'ready' : 'empty'
            },
            [
              props.title ? h('title', { id: titleId }, props.title) : null,
              props.desc ? h('desc', { id: descId }, props.desc) : null,
              plotReady
                ? h(
                    'g',
                    {
                      transform: `translate(${rect.x}, ${rect.y})`
                    },
                    slots.default?.({ innerRect: rect, width: size.width, height: size.height })
                  )
                : null
            ].filter(Boolean)
          )
        ]
      )
    }
  }
})

export default ChartCanvas
