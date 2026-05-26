import { computed, defineComponent, h, PropType, ref } from 'vue'
import {
  classNames,
  computeOrgChartLayout,
  getChartInnerRect,
  getOrgChartNodeAriaLabel,
  getOrgChartNodeClasses,
  orgChartLinkClasses,
  orgChartNodeLabelClasses,
  orgChartNodeRectClasses,
  orgChartNodeSubtitleClasses,
  orgChartNodeTitleClasses,
  type ChartPadding,
  type OrgChartLayoutNode,
  type OrgChartNode,
  type OrgChartProps as CoreOrgChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'

export interface VueOrgChartProps extends CoreOrgChartProps {
  padding?: ChartPadding
}

export const OrgChart = defineComponent({
  name: 'TigerOrgChart',
  props: {
    data: { type: [Object, Array] as PropType<OrgChartNode | OrgChartNode[]>, required: true },
    width: { type: Number, default: 720 },
    height: { type: Number, default: 420 },
    padding: { type: [Number, Object] as PropType<ChartPadding>, default: 24 },
    nodeWidth: { type: Number, default: 160 },
    nodeHeight: { type: Number, default: 72 },
    levelGap: { type: Number, default: 80 },
    siblingGap: { type: Number, default: 32 },
    direction: { type: String as PropType<'vertical' | 'horizontal'>, default: 'vertical' },
    showAvatars: { type: Boolean, default: true },
    showSubtitles: { type: Boolean, default: true },
    hoverable: { type: Boolean, default: false },
    selectable: { type: Boolean, default: false },
    selectedId: {
      type: [String, Number, null] as PropType<string | number | null>,
      default: undefined
    },
    activeOpacity: { type: Number, default: 1 },
    inactiveOpacity: { type: Number, default: 0.35 },
    colors: { type: Array as PropType<string[]> },
    title: { type: String },
    desc: { type: String },
    ariaLabel: { type: String, default: 'Organization chart' },
    className: { type: String }
  },
  emits: ['update:selectedId', 'node-click', 'node-hover'],
  setup(props, { emit }) {
    const innerSelectedId = ref<string | number | null>(null)
    const hoveredId = ref<string | number | null>(null)
    const resolvedSelectedId = computed(() =>
      props.selectedId === undefined ? innerSelectedId.value : props.selectedId
    )
    const innerRect = computed(() => getChartInnerRect(props.width, props.height, props.padding))
    const layout = computed(() =>
      computeOrgChartLayout(props.data, {
        nodeWidth: props.nodeWidth,
        nodeHeight: props.nodeHeight,
        levelGap: props.levelGap,
        siblingGap: props.siblingGap,
        direction: props.direction,
        colors: props.colors
      })
    )
    const offsetX = computed(() => Math.max(0, (innerRect.value.width - layout.value.width) / 2))
    const offsetY = computed(() => Math.max(0, (innerRect.value.height - layout.value.height) / 2))
    const activeId = computed(() => resolvedSelectedId.value ?? hoveredId.value)

    const selectNode = (node: OrgChartLayoutNode) => {
      if (props.selectable && !node.node.disabled) {
        const nextId = resolvedSelectedId.value === node.id ? null : node.id
        innerSelectedId.value = nextId
        emit('update:selectedId', nextId)
      }
      emit('node-click', node.node)
    }

    const setHoveredNode = (node: OrgChartLayoutNode | null) => {
      if (!props.hoverable) return
      hoveredId.value = node?.id ?? null
      emit('node-hover', node?.node ?? null)
    }

    const getNodeOpacity = (node: OrgChartLayoutNode) => {
      if (activeId.value === null) return props.activeOpacity
      return activeId.value === node.id ? props.activeOpacity : props.inactiveOpacity
    }

    return () =>
      h(
        ChartCanvas,
        {
          width: props.width,
          height: props.height,
          padding: props.padding,
          title: props.title,
          desc: props.desc,
          className: classNames(props.className),
          role: 'img',
          'aria-label': props.ariaLabel
        },
        {
          default: () =>
            h(
              'g',
              {
                transform: `translate(${offsetX.value}, ${offsetY.value})`,
                'data-series-type': 'org-chart'
              },
              [
                h(
                  'g',
                  { 'data-org-chart-links': 'true' },
                  layout.value.links.map((link) =>
                    h('path', {
                      key: `${link.sourceId}-${link.targetId}`,
                      d: link.path,
                      class: orgChartLinkClasses
                    })
                  )
                ),
                h(
                  'g',
                  { 'data-org-chart-nodes': 'true' },
                  layout.value.nodes.map((node) => {
                    const selected = resolvedSelectedId.value === node.id
                    const interactive = (props.hoverable || props.selectable) && !node.node.disabled
                    const textStart = props.showAvatars && node.node.avatar ? 58 : 16
                    return h(
                      'g',
                      {
                        key: node.id,
                        transform: `translate(${node.x}, ${node.y})`,
                        class: getOrgChartNodeClasses(interactive, selected),
                        opacity: getNodeOpacity(node),
                        role: interactive ? 'button' : 'group',
                        tabindex: interactive ? 0 : undefined,
                        'aria-label': getOrgChartNodeAriaLabel(node.node),
                        onMouseenter: () => setHoveredNode(node),
                        onMouseleave: () => setHoveredNode(null),
                        onClick: () => selectNode(node),
                        onKeydown: (event: KeyboardEvent) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            selectNode(node)
                          }
                        }
                      },
                      [
                        h('rect', {
                          width: node.width,
                          height: node.height,
                          rx: 8,
                          class: orgChartNodeRectClasses,
                          stroke: selected ? node.color : undefined,
                          strokeWidth: selected ? 2 : 1
                        }),
                        h('rect', { width: 4, height: node.height, rx: 2, fill: node.color }),
                        props.showAvatars && node.node.avatar
                          ? h('image', {
                              href: node.node.avatar,
                              x: 16,
                              y: 16,
                              width: 32,
                              height: 32,
                              preserveAspectRatio: 'xMidYMid slice',
                              'aria-hidden': 'true'
                            })
                          : undefined,
                        h(
                          'text',
                          { x: textStart, y: 26, class: orgChartNodeLabelClasses },
                          node.node.label
                        ),
                        node.node.title
                          ? h(
                              'text',
                              { x: textStart, y: 44, class: orgChartNodeTitleClasses },
                              node.node.title
                            )
                          : undefined,
                        props.showSubtitles && node.node.subtitle
                          ? h(
                              'text',
                              { x: textStart, y: 60, class: orgChartNodeSubtitleClasses },
                              node.node.subtitle
                            )
                          : undefined
                      ]
                    )
                  })
                )
              ]
            )
        }
      )
  }
})

export default OrgChart
