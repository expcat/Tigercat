import { defineComponent, h, ref, type PropType } from 'vue'
import {
  classNames,
  coerceClassValue,
  downloadChartSvg,
  getCartesianChartShellClasses,
  getW9DataLabels,
  resolveButtonClasses,
  layoutSankey,
  readPageWritingDirection,
  type ChartPadding,
  type SankeyChartProps as CoreSankeyChartProps,
  type SankeyLink,
  type SankeyNode
} from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'
import { ChartCanvas } from './ChartCanvas'

export type SankeyChartProps = CoreSankeyChartProps
export type VueSankeyChartProps = InstanceType<typeof SankeyChart>['$props']

export const SankeyChart = defineComponent({
  name: 'TigerSankeyChart',
  inheritAttrs: false,
  props: {
    nodes: { type: Array as PropType<SankeyNode[]>, required: true },
    links: { type: Array as PropType<SankeyLink[]>, required: true },
    width: { type: Number, default: 480 },
    height: { type: Number, default: 280 },
    padding: { type: [Number, Object] as PropType<ChartPadding>, default: 16 },
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
      if (svg instanceof SVGSVGElement) downloadChartSvg(svg, 'sankey')
    }
    return () => {
      const direction = readPageWritingDirection() === 'rtl' ? 'rtl' : 'ltr'
      return h(
        'div',
        {
          ...attrs,
          ref: hostRef,
          class: getCartesianChartShellClasses({
            showLegend: false,
            responsive: props.responsive,
            className: classNames(coerceClassValue(attrs.class), props.className)
          })
        },
        [
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
              responsive: props.responsive,
              padding: props.padding
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
                      fill: 'none',
                      stroke: 'var(--tiger-primary, #2563eb)',
                      'stroke-width': link.width,
                      opacity: 0.35
                    })
                  ),
                  ...laid.nodes.map((node) =>
                    h('rect', {
                      key: node.id,
                      'data-sankey-node': node.id,
                      role: 'img',
                      'aria-label': node.label,
                      x: node.x,
                      y: node.y,
                      width: node.width,
                      height: node.height,
                      fill: 'var(--tiger-primary, #2563eb)'
                    })
                  )
                ]
              }
            }
          )
        ]
      )
    }
  }
})
