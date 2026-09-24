import { defineComponent, h, ref, type PropType } from 'vue'
import {
  downloadChartSvg,
  getW9DataLabels,
  layoutWaterfall,
  type WaterfallChartProps as CoreWaterfallChartProps,
  type WaterfallDatum
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'

export type WaterfallChartProps = CoreWaterfallChartProps

const KIND_COLOR: Record<WaterfallDatum['kind'], string> = {
  increase: 'var(--tiger-success, #16a34a)',
  decrease: 'var(--tiger-danger, #dc2626)',
  total: 'var(--tiger-text-secondary, #64748b)'
}

export const WaterfallChart = defineComponent({
  name: 'TigerWaterfallChart',
  inheritAttrs: false,
  props: {
    data: { type: Array as PropType<WaterfallDatum[]>, required: true },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 280 },
    colors: {
      type: Object as PropType<CoreWaterfallChartProps['colors']>,
      default: undefined
    },
    title: { type: String, default: undefined },
    className: { type: String, default: undefined },
    responsive: { type: Boolean, default: true }
  },
  setup(props, { attrs }) {
    const hostRef = ref<HTMLElement | null>(null)
    const exportChart = () => {
      const svg = hostRef.value?.querySelector('svg')
      if (svg instanceof SVGSVGElement) downloadChartSvg(svg, 'waterfall')
    }
    return () => {
      const laid = layoutWaterfall(props.data)
      const samples = laid.flatMap((bar) => [bar.y0, bar.y1])
      const min = Math.min(0, ...samples, 0)
      const max = Math.max(0, ...samples, 1)
      const span = max - min || 1
      return h('div', { ref: hostRef, class: props.className, ...attrs }, [
        h(
          'button',
          { type: 'button', onClick: exportChart },
          getW9DataLabels().exportChart
        ),
        h(
          ChartCanvas,
          {
            width: props.width,
            height: props.height,
            title: props.title,
            responsive: props.responsive,
            padding: 24
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
