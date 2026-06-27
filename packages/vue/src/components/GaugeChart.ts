import { defineComponent, computed, h, ref, watch, onBeforeUnmount, PropType, useId } from 'vue'
import {
  classNames,
  createGaugeArcPath,
  createGaugeNeedlePath,
  valueToGaugeAngle,
  computeGaugeTicks,
  getChartInnerRect,
  chartAxisTickTextClasses,
  getStableChartGradientPrefix,
  createGaugeAnimation,
  type GaugeAnimationController,
  type ChartPadding,
  type GaugeChartProps as CoreGaugeChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartTooltip } from './ChartTooltip'

export interface VueGaugeChartProps extends CoreGaugeChartProps {
  padding?: ChartPadding
}

export const GaugeChart = defineComponent({
  name: 'TigerGaugeChart',
  props: {
    width: { type: Number, default: 280 },
    height: { type: Number, default: 200 },
    padding: { type: [Number, Object] as PropType<ChartPadding>, default: 24 },
    value: { type: Number, required: true },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    startAngle: { type: Number, default: 135 },
    endAngle: { type: Number, default: 405 },
    arcWidth: { type: Number, default: 20 },
    showTicks: { type: Boolean, default: true },
    tickCount: { type: Number, default: 5 },
    valueFormatter: { type: Function as PropType<(value: number) => string> },
    tooltipFormatter: { type: Function as PropType<(value: number) => string> },
    showTooltip: { type: Boolean, default: true },
    label: { type: String },
    segments: {
      type: Array as PropType<Array<{ range: [number, number]; color: string }>>
    },
    trackColor: { type: String, default: 'var(--tiger-border,#e5e7eb)' },
    color: { type: String, default: 'var(--tiger-primary,#2563eb)' },
    gradient: { type: Boolean, default: false },
    // a11y
    title: { type: String },
    desc: { type: String },
    className: { type: String }
  },
  setup(props) {
    const innerRect = computed(() => getChartInnerRect(props.width, props.height, props.padding))

    const radius = computed(() => Math.min(innerRect.value.width, innerRect.value.height) / 2 - 4)

    const cx = computed(() => innerRect.value.width / 2)
    const cy = computed(() => innerRect.value.height / 2)

    // Per-instance gradient ID prefix (only used when props.gradient is true)
    const gradientPrefix = getStableChartGradientPrefix('gauge', useId())
    const valueGradientId = `${gradientPrefix}-value`

    const targetAngle = computed(() =>
      valueToGaugeAngle(props.value, props.min, props.max, props.startAngle, props.endAngle)
    )

    // Animated needle angle — driven by rAF
    const animatedAngle = ref(targetAngle.value)
    let animCtrl: GaugeAnimationController | null = null

    watch(targetAngle, (to, from) => {
      animCtrl?.stop()
      animCtrl = createGaugeAnimation({
        from,
        to,
        onUpdate: (v) => {
          animatedAngle.value = v
        }
      })
    })

    onBeforeUnmount(() => {
      animCtrl?.stop()
    })

    // Tooltip (hover / focus over the gauge)
    const wrapperRef = ref<HTMLElement | null>(null)
    const tooltipState = ref({ visible: false, x: 0, y: 0 })
    const handleTooltipMove = (e: MouseEvent) => {
      if (!props.showTooltip) return
      tooltipState.value = { visible: true, x: e.clientX, y: e.clientY }
    }
    const handleTooltipLeave = () => {
      tooltipState.value = { ...tooltipState.value, visible: false }
    }
    const handleTooltipFocus = () => {
      if (!props.showTooltip) return
      const rect = wrapperRef.value?.getBoundingClientRect()
      if (rect) {
        tooltipState.value = {
          visible: true,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        }
      }
    }

    const ticks = computed(() =>
      props.showTicks
        ? computeGaugeTicks(
            cx.value,
            cy.value,
            radius.value,
            props.min,
            props.max,
            props.startAngle,
            props.endAngle,
            props.tickCount
          )
        : []
    )

    return () => {
      const r = radius.value
      const c = cx.value
      const cY = cy.value
      const aw = props.arcWidth

      // Track arc
      const trackPath = createGaugeArcPath(c, cY, r, props.startAngle, props.endAngle, aw)

      // Value arc
      const valuePath =
        animatedAngle.value > props.startAngle
          ? createGaugeArcPath(c, cY, r, props.startAngle, animatedAngle.value, aw)
          : null

      // Segment arcs
      const segmentArcs =
        props.segments?.map((seg, i) => {
          const sStart = valueToGaugeAngle(
            seg.range[0],
            props.min,
            props.max,
            props.startAngle,
            props.endAngle
          )
          const sEnd = valueToGaugeAngle(
            seg.range[1],
            props.min,
            props.max,
            props.startAngle,
            props.endAngle
          )
          return h('path', {
            key: `seg-${i}`,
            d: createGaugeArcPath(c, cY, r, sStart, sEnd, aw),
            fill: seg.color,
            'stroke-width': 0
          })
        }) ?? []

      // Needle
      const needlePath = createGaugeNeedlePath(c, cY, r - aw - 6, animatedAngle.value)

      const formattedValue = props.valueFormatter
        ? props.valueFormatter(props.value)
        : `${props.value}`

      const tooltipContent = props.tooltipFormatter
        ? props.tooltipFormatter(props.value)
        : props.label
          ? `${props.label}: ${formattedValue}`
          : formattedValue

      const canvas = h(
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
          default: () => [
            // Gradient defs (opt-in, only when gradient mode is on and value arc renders)
            props.gradient && !props.segments && valuePath
              ? h('defs', {}, [
                  h(
                    'linearGradient',
                    {
                      id: valueGradientId,
                      x1: 0,
                      y1: 0,
                      x2: 0,
                      y2: 1
                    },
                    [
                      h('stop', { offset: '0%', 'stop-color': props.color, 'stop-opacity': 1 }),
                      h('stop', { offset: '100%', 'stop-color': props.color, 'stop-opacity': 0.55 })
                    ]
                  )
                ])
              : null,
            // Track
            h('path', {
              d: trackPath,
              fill: props.trackColor,
              'stroke-width': 0
            }),
            // Segments or value arc
            ...(props.segments
              ? segmentArcs
              : valuePath
                ? [
                    h('path', {
                      d: valuePath,
                      fill: props.gradient ? `url(#${valueGradientId})` : props.color,
                      'stroke-width': 0
                    })
                  ]
                : []),
            // Ticks
            ...ticks.value
              .map((tick, i) => [
                h('line', {
                  key: `tick-${i}`,
                  x1: tick.x1,
                  y1: tick.y1,
                  x2: tick.x2,
                  y2: tick.y2,
                  stroke: 'var(--tiger-text-secondary,#6b7280)',
                  'stroke-width': 1
                }),
                h(
                  'text',
                  {
                    key: `tick-label-${i}`,
                    x: tick.x2 + (tick.x2 - tick.x1) * 1.5,
                    y: tick.y2 + (tick.y2 - tick.y1) * 1.5,
                    class: chartAxisTickTextClasses,
                    'text-anchor': 'middle',
                    'dominant-baseline': 'middle',
                    style: { fontSize: '10px' }
                  },
                  tick.label
                )
              ])
              .flat(),
            // Needle
            h('path', {
              d: needlePath,
              fill: 'var(--tiger-text,#374151)'
            }),
            // Center dot
            h('circle', {
              cx: c,
              cy: cY,
              r: 5,
              fill: 'var(--tiger-text,#374151)'
            }),
            // Value text
            h(
              'text',
              {
                x: c,
                y: cY + r * 0.35,
                class: 'fill-[color:var(--tiger-text,#374151)] text-lg font-semibold tabular-nums',
                'text-anchor': 'middle',
                'dominant-baseline': 'middle'
              },
              formattedValue
            ),
            // Label
            ...(props.label
              ? [
                  h(
                    'text',
                    {
                      x: c,
                      y: cY + r * 0.35 + 20,
                      class: chartAxisTickTextClasses,
                      'text-anchor': 'middle',
                      'dominant-baseline': 'middle'
                    },
                    props.label
                  )
                ]
              : [])
          ]
        }
      )

      return h(
        'div',
        {
          ref: wrapperRef,
          class: 'inline-block relative',
          tabindex: props.showTooltip ? 0 : undefined,
          role: 'img',
          'aria-label': props.label ? `${props.label}: ${formattedValue}` : formattedValue,
          onMousemove: handleTooltipMove,
          onMouseleave: handleTooltipLeave,
          onFocus: handleTooltipFocus,
          onBlur: handleTooltipLeave
        },
        [
          canvas,
          props.showTooltip
            ? h(ChartTooltip, {
                content: tooltipContent,
                visible: tooltipState.value.visible && tooltipContent !== '',
                x: tooltipState.value.x,
                y: tooltipState.value.y
              })
            : null
        ]
      )
    }
  }
})

export default GaugeChart
