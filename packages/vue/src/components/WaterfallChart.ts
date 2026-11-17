import { defineComponent, h, ref, type PropType } from 'vue'
import {
  downloadChartSvg,
  getW9DataLabels,
  getChartLabels,
  resolveButtonClasses,
  layoutWaterfall,
  type ChartPadding,
  type WaterfallChartProps as CoreWaterfallChartProps,
  type WaterfallDatum
} from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'
import { ChartCanvas } from './ChartCanvas'

export type WaterfallChartProps = CoreWaterfallChartProps
export type VueWaterfallChartProps = InstanceType<typeof WaterfallChart>['$props']

const KIND_COLOR: Record<WaterfallDatum['kind'], string> = {
  increase: 'var(--tiger-success, #16a34a)',
  decrease: 'var(--tiger-error, #dc2626)',
  total: 'var(--tiger-text-secondary, #64748b)'
}

export const WaterfallChart = defineComponent({
  name: 'TigerWaterfallChart',
  inheritAttrs: false,
  props: {
    data: { type: Array as PropType<WaterfallDatum[]>, required: true },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 280 },
    padding: { type: [Number, Object] as PropType<ChartPadding>, default: 24 },
    colors: {
      type: Object as PropType<CoreWaterfallChartProps['colors']>,
      default: undefined
    },
    title: { type: String, default: undefined },
    desc: { type: String, default: undefined },
    className: { type: String, default: undefined },
    responsive: { type: Boolean, default: true }
  },
  setup(props, { attrs }) {
    const config = useTigerConfig()
    const hostRef = ref<HTMLElement | null>(null)
    const exportChart = () => {
      const svg = hostRef.value?.querySelector('svg')
      if (svg instanceof SVGSVGElement) downloadChartSvg(svg, 'waterfall')
    }
    return () => {
      const labels = getChartLabels(config.value.locale)
      const laid = layoutWaterfall(props.data)
      const samples = laid.flatMap((bar) => [bar.y0, bar.y1])
      const min = Math.min(0, ...samples, 0)
      const max = Math.max(0, ...samples, 1)
      const span = max - min || 1
      return h('div', { ref: hostRef, class: props.className, ...attrs }, [
        h(
          'button',
          {
            type: 'button',
            class: resolveButtonClasses({ variant: 'outline', size: 'sm' }),
            onClick: exportChart
          },
          getW9DataLabels(config.value.locale).exportChart
        ),
        h(
          ChartCanvas,
          {
            width: props.width,
            height: props.height,
            title: props.title,
            desc: props.desc,
            'aria-label': props.title ? undefined : labels.waterfallChartAriaLabel,
            responsive: props.responsive,
            padding: props.padding
          },
          {
            default: (ctx: { innerRect: { width: number; height: number } }) => {
              const band = laid.length > 0 ? ctx.innerRect.width / laid.length : 0
              return laid.map((bar) => {
                const topValue = Math.max(bar.y0, bar.y1)
                const bottomValue = Math.min(bar.y0, bar.y1)
                const y = ((max - topValue) / span) * ctx.innerRect.height
                const height = Math.max(1, ((topValue - bottomValue) / span) * ctx.innerRect.height)
                const color = props.colors?.[bar.kind] ?? KIND_COLOR[bar.kind]
                return h('rect', {
                  key: bar.index,
                  'data-waterfall-bar': bar.kind,
                  role: 'img',
                  'aria-label': bar.label,
                  x: bar.index * band + 2,
                  y,
                  width: Math.max(1, band - 4),
                  height,
                  fill: color
                })
              })
            }
          }
        )
      ])
    }
  }
})
