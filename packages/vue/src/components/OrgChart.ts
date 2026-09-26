import { computed, defineComponent, h, PropType, ref, useId } from 'vue'
import {
  classNames,
  coerceClassValue,
  computeOrgChartLayout,
  findOrgMatch,
  orgVisibleIds,
  getCartesianChartShellClasses,
  getChartLabels,
  mergeTigerLocale,
  normalizeChartPadding,
  getOrgChartNodeAriaLabel,
  getOrgChartNodeClipId,
  getOrgChartNodeMarkerGeometry,
  resolveLinkHref,
  getOrgChartNodeClasses,
  orgChartLinkClasses,
  orgChartNodeLabelClasses,
  orgChartNodeRectClasses,
  orgChartNodeStrokeClasses,
  orgChartNodeSubtitleClasses,
  orgChartNodeTitleClasses,
  type ChartPadding,
  type OrgChartLayoutNode,
  type OrgChartNode,
  type OrgChartProps as CoreOrgChartProps,
  type TigerLocale,
  type TigerLocaleChart
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { renderOrgBind } from './w9-chart-bind'
import { useTigerConfig } from './tiger-config'

export interface VueOrgChartProps extends CoreOrgChartProps {
  padding?: ChartPadding
  onNodeClick?: (node: OrgChartNode) => void
}

export type OrgChartProps = VueOrgChartProps

export const OrgChart = defineComponent({
  name: 'TigerOrgChart',
  inheritAttrs: false,
  props: {
    data: { type: [Object, Array] as PropType<OrgChartNode | OrgChartNode[]>, required: true },
    width: { type: Number, default: 720 },
    height: { type: Number, default: 420 },
    padding: { type: [Number, Object] as PropType<ChartPadding>, default: 24 },
    nodeWidth: { type: Number, default: 160 },
    nodeHeight: { type: Number, default: 72 },
    levelGap: { type: Number, default: 80 },
    siblingGap: { type: Number, default: 32 },
    orientation: { type: String as PropType<'vertical' | 'horizontal'>, default: 'vertical' },
    showAvatars: { type: Boolean, default: true },
    showSubtitles: { type: Boolean, default: true },
    hoverable: { type: Boolean, default: false },
    selectable: { type: Boolean, default: false },
    selectedId: {
      type: [String, Number, null] as PropType<string | number | null>,
      default: undefined
    },
    activeOpacity: { type: Number, default: 1 },
    inactiveOpacity: { type: Number, default: 0.25 },
    colors: { type: Array as PropType<string[]> },
    title: { type: String },
    desc: { type: String },
    ariaLabel: { type: String },
    locale: { type: Object as PropType<Partial<TigerLocale>>, default: undefined },
    labels: { type: Object as PropType<Partial<TigerLocaleChart>>, default: undefined },
    className: { type: String },
    bind: {
      type: Object as PropType<{
        nodes?: { id: string; label: string; children?: { id: string; label: string }[] }[]
        collapsed?: string[]
        query?: string
        zoom?: number
      }>,
      default: undefined
    },
    onNodeClick: { type: Function as PropType<(node: OrgChartNode) => void> }
  },
  emits: ['update:selectedId', 'node-click', 'node-hover'],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const markerClipPrefix = getOrgChartNodeClipId(useId())
    const orgZoom = ref(1)
    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const labels = computed(() => getChartLabels(mergedLocale.value, props.labels))
    const innerSelectedId = ref<string | number | null>(null)
    const hoveredId = ref<string | number | null>(null)
    const resolvedSelectedId = computed(() =>
      props.selectedId === undefined ? innerSelectedId.value : props.selectedId
    )
    const layout = computed(() =>
      computeOrgChartLayout(props.data, {
        nodeWidth: props.nodeWidth,
        nodeHeight: props.nodeHeight,
        levelGap: props.levelGap,
        siblingGap: props.siblingGap,
        orientation: props.orientation,
        colors: props.colors
      })
    )
    const resolvedPadding = computed(() => normalizeChartPadding(props.padding))
    const plotWidth = computed(() =>
      Math.max(
        props.width,
        layout.value.width + resolvedPadding.value.left + resolvedPadding.value.right
      )
    )
    const plotHeight = computed(() =>
      Math.max(
        props.height,
        layout.value.height + resolvedPadding.value.top + resolvedPadding.value.bottom
      )
    )
    const offsetX = computed(() =>
      Math.max(
        0,
        (plotWidth.value -
          resolvedPadding.value.left -
          resolvedPadding.value.right -
          layout.value.width) /
          2
      )
    )
    const offsetY = computed(() =>
      Math.max(
        0,
        (plotHeight.value -
          resolvedPadding.value.top -
          resolvedPadding.value.bottom -
          layout.value.height) /
          2
      )
    )
    const activeId = computed(() => resolvedSelectedId.value ?? hoveredId.value)

    const selectNode = (node: OrgChartLayoutNode) => {
      if (node.node.disabled) return
      if (props.selectable) {
        const nextId = resolvedSelectedId.value === node.id ? null : node.id
        if (props.selectedId === undefined) innerSelectedId.value = nextId
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
        'div',
        {
          class: getCartesianChartShellClasses({
            showLegend: false,
            className: classNames(coerceClassValue(attrs.class), props.className)
          })
        },
        [
          h(
            ChartCanvas,
            {
              width: plotWidth.value,
              height: plotHeight.value,
              padding: props.padding,
              title: props.title,
              desc: props.desc,
              'aria-label':
                props.ariaLabel ?? (props.title ? undefined : labels.value.orgChartAriaLabel)
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
                        const interactive =
                          (props.hoverable ||
                            props.selectable ||
                            typeof props.onNodeClick === 'function') &&
                          !node.node.disabled
                        const avatarHref = props.showAvatars
                          ? resolveLinkHref(node.node.avatar)
                          : undefined
                        const textStart = avatarHref ? 58 : 16
                        const geometry = getOrgChartNodeMarkerGeometry(node.width, node.height)
                        const clipId = `${markerClipPrefix}-${node.index}`
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
                            h('defs', [
                              h('clipPath', { id: clipId, clipPathUnits: 'userSpaceOnUse' }, [
                                h('rect', {
                                  x: geometry.clip.x,
                                  y: geometry.clip.y,
                                  width: geometry.clip.width,
                                  height: geometry.clip.height,
                                  rx: geometry.clip.rx
                                })
                              ])
                            ]),
                            h('rect', {
                              'data-org-node-part': 'card',
                              width: node.width,
                              height: node.height,
                              rx: geometry.radius,
                              class: orgChartNodeRectClasses
                            }),
                            h('rect', {
                              'data-org-node-part': 'marker',
                              x: geometry.marker.x,
                              y: geometry.marker.y,
                              width: geometry.marker.width,
                              height: geometry.marker.height,
                              fill: node.color,
                              stroke: 'none',
                              'clip-path': `url(#${clipId})`,
                              'aria-hidden': 'true'
                            }),
                            h('rect', {
                              'data-org-node-part': 'stroke',
                              width: node.width,
                              height: node.height,
                              rx: geometry.radius,
                              class: orgChartNodeStrokeClasses,
                              fill: 'none',
                              'stroke-width': selected
                                ? geometry.selectedStrokeWidth
                                : geometry.strokeWidth,
                              style: selected ? { stroke: node.color } : undefined
                            }),
                            avatarHref
                              ? h('image', {
                                  href: avatarHref,
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
          ),
          props.bind?.nodes
            ? h('div', { 'data-tiger-org-host': '' }, [
                renderOrgBind({
                  visible: orgVisibleIds(props.bind.nodes, props.bind.collapsed ?? []),
                  match: findOrgMatch(props.bind.nodes, props.bind.query ?? ''),
                  zoom: props.bind.zoom ?? orgZoom.value
                }),
                h(
                  'button',
                  {
                    type: 'button',
                    'data-tiger-org-zoom-in': '',
                    onClick: () => {
                      orgZoom.value += 0.25
                    }
                  },
                  '+'
                )
              ])
            : null
        ]
      )
  }
})

export default OrgChart
