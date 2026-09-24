import { defineComponent, h, ref, type PropType } from 'vue'
import {
  downloadChartSvg,
  getW9DataLabels,
  layoutSankey,
  readPageWritingDirection,
  type SankeyChartProps as CoreSankeyChartProps,
  type SankeyLink,
  type SankeyNode
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'

export type SankeyChartProps = CoreSankeyChartProps

export const SankeyChart = defineComponent({
  name: 'TigerSankeyChart',
  inheritAttrs: false,
  props: {
    nodes: { type: Array as PropType<SankeyNode[]>, required: true },
    links: { type: Array as PropType<SankeyLink[]>, required: true },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 280 },
    title: { type: String, default: undefined },
    className: { type: String, default: undefined },
    responsive: { type: Boolean, default: true }
  },
  setup(props, { attrs }) {
    const hostRef = ref<HTMLElement | null>(null)
    const exportChart = () => {
      const svg = hostRef.value?.querySelector('svg')
      if (svg instanceof SVGSVGElement) downloadChartSvg(svg, 'sankey')
    }
    return () => {
      const direction = readPageWritingDirection() === 'rtl' ? 'rtl' : 'ltr'
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
            padding: 16
          },
          {
            default: (ctx: { innerRect: { width: number; height: number } }) => {
              const laid = layoutSankey(
                props.nodes,
                props.links,
                ctx.innerRect.width,
                ctx.innerRect.height,
                direction
              )
              return [
                ...laid.links.map((link, index) =>
                  h('path', {
                    key: `link-${index}`,
                    'data-sankey-link': '',
                    d: link.path,
                    fill: 'var(--tiger-primary, #2563eb)',
                    opacity: 0.35
                  })
                ),
                ...laid.nodes.map((node) =>
                  h('rect', {
                    key: node.id,
                    'data-sankey-node': node.id,
                    x: node.x,
                    y: node.y,
                    width: node.width,
                    height: node.height,
                    fill: 'var(--tiger-text, #0f172a)'
                  })
                )
              ]
            }
          }
        )
      ])
    }
  }
})
