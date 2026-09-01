import { defineComponent, computed, h, ref, watch, onBeforeUnmount, PropType, useId } from 'vue'
import {
  coerceClassValue,
  classNames,
  layoutGauge,
  createGaugeArcPath,
  createGaugeNeedlePath,
  createGaugeAnimation,
  getStableChartGradientPrefix,
  chartAxisTickTextClasses,
  getCartesianChartShellClasses,
  DEFAULT_GAUGE_END_ANGLE,
  DEFAULT_GAUGE_HEIGHT,
  DEFAULT_GAUGE_START_ANGLE,
  DEFAULT_GAUGE_WIDTH,
  type GaugeAnimationController,
  type ChartPadding,
  type GaugeChartProps as CoreGaugeChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartTooltip } from './ChartTooltip'
import { useResponsiveChartSize } from '../composables/useResponsiveChartSize'

export interface VueGaugeChartProps extends CoreGaugeChartProps {
  padding?: ChartPadding
}

export type GaugeChartProps = VueGaugeChartProps

export const GaugeChart = defineComponent({
  name: 'TigerGaugeChart',
  inheritAttrs: false,
  props: {
    width: { type: Number, default: DEFAULT_GAUGE_WIDTH },
    height: { type: Number, default: DEFAULT_GAUGE_HEIGHT },
    padding: { type: [Number, Object] as PropType<ChartPadding>, default: 24 },
    responsive: { type: Boolean, default: false },
    value: { type: Number, required: true },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    startAngle: { type: Number, default: DEFAULT_GAUGE_START_ANGLE },
    endAngle: { type: Number, default: DEFAULT_GAUGE_END_ANGLE },
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
    animated: { type: Boolean, default: true },
    title: { type: String },
    desc: { type: String },
    className: { type: String }
  },
  setup(props, { attrs }) {
    const { innerRect, onResolvedSizeChange } = useResponsiveChartSize(
      () => props.width,
      () => props.height,
      () => props.padding,
      () => props.responsive
    )
    const geometry = computed(() =>
      layoutGauge({
        innerWidth: innerRect.value.width,
        innerHeight: innerRect.value.height,
        value: props.value,
        min: props.min,
        max: props.max,
        startAngle: props.startAngle,
        endAngle: props.endAngle,
        arcWidth: props.arcWidth,
        showTicks: props.showTicks,
        tickCount: props.tickCount,
        segments: props.segments,
        valueFormatter: props.valueFormatter,
        label: props.label
      })
    )
    const animatedAngle = ref(geometry.value.valueAngle)
    const prevAngle = ref(geometry.value.valueAngle)
    let controller: GaugeAnimationController | null = null

    watch(
      () => geometry.value.valueAngle,
      (to) => {
        const from = prevAngle.value
        prevAngle.value = to
        controller?.stop()
        if (!props.animated || from === to) {
          animatedAngle.value = to
          return
        }
        controller = createGaugeAnimation({
          from,
          to,
          onUpdate: (next) => {
            animatedAngle.value = next
          }
        })
      }
    )
    onBeforeUnmount(() => controller?.stop())

    const needlePath = computed(() =>
      createGaugeNeedlePath(
        geometry.value.cx,
        geometry.value.cy,
        Math.max(0, geometry.value.radius - props.arcWidth - 6),
        animatedAngle.value
      )
    )
    const valuePath = computed(() => {
      if (animatedAngle.value === geometry.value.startAngle) return null
      return createGaugeArcPath(
        geometry.value.cx,
        geometry.value.cy,
        geometry.value.radius,
        geometry.value.startAngle,
        animatedAngle.value,
        props.arcWidth
      )
    })
    const tooltip = ref({ open: false, x: 0, y: 0 })
    const formattedValue = computed(() => geometry.value.valueText.text)
    const tooltipContent = computed(() =>
      props.tooltipFormatter
        ? props.tooltipFormatter(props.value)
        : props.label
          ? `${props.label}: ${formattedValue.value}`
          : formattedValue.value
    )
    const gradientPrefix = getStableChartGradientPrefix('gauge', useId())
    const valueGradientId = `${gradientPrefix}-value`

    return () => {
      const geo = geometry.value
      return h(
        'div',
        {
          class: getCartesianChartShellClasses({
            showLegend: false,
            responsive: props.responsive,
            className: classNames(coerceClassValue(attrs.class), props.className)
          }),
          role: 'meter',
          'aria-valuenow': Number.isFinite(props.value) ? props.value : undefined,
          'aria-valuemin': props.min,
          'aria-valuemax': props.max,
          'aria-valuetext': formattedValue.value,
          'aria-label': props.label ?? props.title ?? formattedValue.value,
          onMousemove: (e: MouseEvent) => {
            if (!props.showTooltip) return
            tooltip.value = { open: true, x: e.clientX, y: e.clientY }
          },
          onMouseleave: () => {
            tooltip.value = { ...tooltip.value, open: false }
          }
        },
        [
          h(
            ChartCanvas,
            {
              width: props.width,
              height: props.height,
              padding: props.padding,
              responsive: props.responsive,
              onResolvedSizeChange
            },
            {
              default: () => [
                props.gradient && valuePath.value
                  ? h('defs', null, [
                      h(
                        'linearGradient',
                        {
                          id: valueGradientId,
                          gradientUnits: 'userSpaceOnUse',
                          x1: geo.cx,
                          y1: geo.cy - geo.radius,
                          x2: geo.cx,
                          y2: geo.cy + geo.radius
                        },
                        [
                          h('stop', {
                            offset: '0%',
                            'stop-color': props.color,
                            'stop-opacity': '1'
                          }),
                          h('stop', {
                            offset: '100%',
                            'stop-color': props.color,
                            'stop-opacity': '0.55'
                          })
                        ]
                      )
                    ])
                  : null,
                h('path', { d: geo.trackPath, fill: props.trackColor, 'stroke-width': 0 }),
                ...geo.segmentPaths.map((seg, index) =>
                  h('path', {
                    key: `seg-${index}`,
                    d: seg.path,
                    fill: seg.color,
                    'stroke-width': 0
                  })
                ),
                valuePath.value
                  ? h('path', {
                      d: valuePath.value,
                      fill: props.gradient ? `url(#${valueGradientId})` : props.color,
                      'stroke-width': 0
                    })
                  : null,
                ...geo.ticks.flatMap((tick, index) => [
                  h('line', {
                    key: `tick-${index}`,
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
                      key: `tick-label-${index}`,
                      x: tick.labelX,
                      y: tick.labelY,
                      class: chartAxisTickTextClasses,
                      'text-anchor': 'middle',
                      'dominant-baseline': 'middle',
                      style: { fontSize: '10px' }
                    },
                    tick.label
                  )
                ]),
                h('path', { d: needlePath.value, fill: 'var(--tiger-text,#374151)' }),
                h('circle', {
                  cx: geo.cx,
                  cy: geo.cy,
                  r: 5,
                  fill: 'var(--tiger-text,#374151)'
                }),
                h(
                  'text',
                  {
                    x: geo.valueText.x,
                    y: geo.valueText.y,
                    class:
                      'fill-[color:var(--tiger-text,#374151)] text-lg font-semibold tabular-nums',
                    'text-anchor': 'middle',
                    'dominant-baseline': 'middle'
                  },
                  formattedValue.value
                ),
                geo.labelText
                  ? h(
                      'text',
                      {
                        x: geo.labelText.x,
                        y: geo.labelText.y,
                        class: chartAxisTickTextClasses,
                        'text-anchor': 'middle',
                        'dominant-baseline': 'middle'
                      },
                      geo.labelText.text
                    )
                  : null
              ]
            }
          ),
          props.showTooltip
            ? h(ChartTooltip, {
                content: tooltipContent.value,
                open: tooltip.value.open && tooltipContent.value !== '',
                x: tooltip.value.x,
                y: tooltip.value.y
              })
            : null
        ]
      )
    }
  }
})

export default GaugeChart
