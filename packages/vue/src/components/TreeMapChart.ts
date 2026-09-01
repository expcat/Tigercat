import { defineComponent, computed, h, PropType, useId } from 'vue'
import {
  classNames,
  coerceClassValue,
  layoutTreeMap,
  getChartElementOpacity,
  getStableChartGradientPrefix,
  resolveChartPalette,
  buildChartLegendItems,
  chartLegendOrientationFromPosition,
  getCartesianChartShellClasses,
  chartMarkTabIndex,
  nextChartRovingIndex,
  isChartNavigationKey,
  getChartLabels,
  mergeTigerLocale,
  formatChartTemplate,
  treemapNodeTransitionClasses,
  DEFAULT_TREEMAP_WIDTH,
  DEFAULT_TREEMAP_HEIGHT,
  DEFAULT_TREEMAP_PADDING,
  DEFAULT_TREEMAP_GAP,
  DEFAULT_TREEMAP_NODE_RADIUS,
  DEFAULT_TREEMAP_MIN_LABEL_SIZE,
  type ChartLegendItem,
  type ChartLegendPosition,
  type ChartPadding,
  type TreeMapChartDatum,
  type TreeMapChartProps as CoreTreeMapChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { ChartLegend } from './ChartLegend'
import { ChartTooltip } from './ChartTooltip'
import { useChartInteraction } from '../composables/useChartInteraction'
import { useResponsiveChartSize } from '../composables/useResponsiveChartSize'
import { useTigerConfig } from './ConfigProvider'

export interface VueTreeMapChartProps extends CoreTreeMapChartProps {
  data: TreeMapChartDatum[]
  padding?: ChartPadding
  onNodeClick?: (index: number, datum: TreeMapChartDatum) => void
}

export type TreeMapChartProps = VueTreeMapChartProps

export const TreeMapChart = defineComponent({
  name: 'TigerTreeMapChart',
  inheritAttrs: false,
  props: {
    width: { type: Number, default: DEFAULT_TREEMAP_WIDTH },
    height: { type: Number, default: DEFAULT_TREEMAP_HEIGHT },
    padding: { type: [Number, Object] as PropType<ChartPadding>, default: DEFAULT_TREEMAP_PADDING },
    responsive: { type: Boolean, default: false },
    data: { type: Array as PropType<TreeMapChartDatum[]>, required: true },
    gap: { type: Number, default: DEFAULT_TREEMAP_GAP },
    showLabels: { type: Boolean, default: true },
    minLabelSize: { type: Number, default: DEFAULT_TREEMAP_MIN_LABEL_SIZE },
    nodeRadius: { type: Number, default: DEFAULT_TREEMAP_NODE_RADIUS },
    colors: { type: Array as PropType<string[]> },
    gradient: { type: Boolean, default: false },
    hoverable: { type: Boolean, default: false },
    hoveredIndex: { type: Number as PropType<number | null>, default: undefined },
    activeOpacity: { type: Number, default: 1 },
    inactiveOpacity: { type: Number, default: 0.25 },
    selectable: { type: Boolean, default: false },
    selectedIndex: { type: Number as PropType<number | null>, default: undefined },
    showLegend: { type: Boolean, default: false },
    legendPosition: { type: String as PropType<ChartLegendPosition>, default: 'bottom' },
    legendMarkerSize: { type: Number, default: 10 },
    legendGap: { type: Number, default: 8 },
    showTooltip: { type: Boolean, default: true },
    tooltipFormatter: {
      type: Function as PropType<(datum: TreeMapChartDatum, index: number) => string>
    },
    title: { type: String },
    desc: { type: String },
    className: { type: String },
    onNodeClick: {
      type: Function as PropType<(index: number, datum: TreeMapChartDatum) => void>
    }
  },
  emits: ['update:hoveredIndex', 'update:selectedIndex', 'node-click', 'node-hover'],
  setup(props, { emit, attrs }) {
    const config = useTigerConfig()
    const labels = computed(() => getChartLabels(mergeTigerLocale(config.value.locale)))
    const interactive = computed(
      () => props.hoverable || props.selectable || typeof props.onNodeClick === 'function'
    )
    const gradientPrefix = getStableChartGradientPrefix('treemap', useId())
    const { innerRect, onResolvedSizeChange } = useResponsiveChartSize(
      () => props.width,
      () => props.height,
      () => props.padding,
      () => props.responsive
    )
    const palette = computed(() => resolveChartPalette(props.colors))
    const nodes = computed(() =>
      layoutTreeMap(props.data, {
        width: innerRect.value.width,
        height: innerRect.value.height,
        gap: props.gap,
        colors: palette.value,
        minLabelSize: props.minLabelSize
      })
    )
    const {
      tooltipPosition,
      resolvedHoveredIndex,
      activeIndex,
      resolvedSelectedIndex,
      handleMouseEnter,
      handleMouseMove,
      handleMouseLeave,
      handleClick,
      handleKeyDown,
      handleLegendClick,
      handleLegendHover,
      handleLegendLeave
    } = useChartInteraction<TreeMapChartDatum>({
      hoverable: computed(() => props.hoverable),
      showTooltip: computed(() => props.showTooltip),
      hoveredIndexProp: () => props.hoveredIndex,
      selectable: computed(() => props.selectable),
      selectedIndexProp: () => props.selectedIndex,
      activeOpacity: computed(() => props.activeOpacity),
      inactiveOpacity: computed(() => props.inactiveOpacity),
      legendPosition: computed(() => props.legendPosition),
      getData: (index) => nodes.value[index]?.datum,
      onHoveredIndexChange: (index) => emit('update:hoveredIndex', index),
      onSelectedIndexChange: (index) => emit('update:selectedIndex', index),
      onHover: (index, datum) => emit('node-hover', index, datum),
      onClick: (index, datum) => {
        if (datum) props.onNodeClick?.(index, datum)
        emit('node-click', index, datum)
      }
    })
    const roots = computed(() => nodes.value.filter((node) => node.depth === 0))
    const rootTotal = computed(() => roots.value.reduce((sum, node) => sum + node.value, 0))
    const legendItems = computed<ChartLegendItem[]>(() =>
      buildChartLegendItems({
        data: roots.value.map((node) => node.datum),
        palette: palette.value,
        activeIndex: activeIndex.value,
        selectedIndex: resolvedSelectedIndex.value,
        getLabel: (d) => d.label,
        getColor: (_d, i) => roots.value[i]?.color ?? palette.value[i % palette.value.length]
      }).map((item, i) => ({ ...item, index: roots.value[i]?.index ?? item.index }))
    )
    const tooltipContent = computed(() => {
      if (resolvedHoveredIndex.value === null) return ''
      const node = nodes.value[resolvedHoveredIndex.value]
      if (!node) return ''
      if (props.tooltipFormatter) return props.tooltipFormatter(node.datum, node.index)
      const percent = rootTotal.value > 0 ? ((node.value / rootTotal.value) * 100).toFixed(1) : '0'
      return formatChartTemplate(labels.value.treemapTooltip, {
        label: node.label,
        value: node.value,
        percent
      })
    })

    const handleNodeKeyDown = (event: KeyboardEvent, visualIndex: number) => {
      const current = nodes.value
      if (isChartNavigationKey(event.key)) {
        event.preventDefault()
        const nextVisual = nextChartRovingIndex(visualIndex, event.key, current.length)
        const next = current[nextVisual]
        const node = (event.currentTarget as Element | null)?.parentElement?.querySelector(
          `[data-treemap-node][data-index="${next.index}"]`
        )
        if (node instanceof SVGElement) node.focus()
        handleMouseEnter(next.index, event)
        return
      }
      handleKeyDown(event, current[visualIndex].index)
    }

    return () => {
      const current = nodes.value
      const visualActive = current.findIndex(
        (node) => node.index === (activeIndex.value ?? resolvedHoveredIndex.value)
      )
      const chart = h(
        ChartCanvas,
        {
          width: props.width,
          height: props.height,
          padding: props.padding,
          responsive: props.responsive,
          title: props.title,
          desc: props.desc,
          onResolvedSizeChange
        },
        {
          default: () => [
            h('defs', [
              ...(props.gradient
                ? current.map((node) =>
                    h(
                      'linearGradient',
                      {
                        key: `grad-${node.index}`,
                        id: `${gradientPrefix}-${node.index}`,
                        gradientUnits: 'userSpaceOnUse',
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: innerRect.value.height
                      },
                      [
                        h('stop', {
                          offset: '0%',
                          'stop-color': node.color,
                          'stop-opacity': '1'
                        }),
                        h('stop', {
                          offset: '100%',
                          'stop-color': node.color,
                          'stop-opacity': '0.7'
                        })
                      ]
                    )
                  )
                : []),
              ...current.map((node) =>
                h(
                  'clipPath',
                  { key: `clip-${node.index}`, id: `${gradientPrefix}-clip-${node.index}` },
                  [h('rect', { x: node.x, y: node.y, width: node.w, height: node.h })]
                )
              )
            ]),
            h(
              'g',
              { 'data-series-type': 'treemap' },
              current.flatMap((node, visualIndex) => {
                const opacity = getChartElementOpacity(node.index, activeIndex.value, {
                  activeOpacity: props.activeOpacity,
                  inactiveOpacity: props.inactiveOpacity
                })
                const percent =
                  rootTotal.value > 0 ? ((node.value / rootTotal.value) * 100).toFixed(1) : '0'
                const ariaLabel = formatChartTemplate(labels.value.treemapTooltip, {
                  label: node.label,
                  value: node.value,
                  percent
                })
                const elems = [
                  h('rect', {
                    key: `node-${node.index}`,
                    x: node.x,
                    y: node.y,
                    width: node.w,
                    height: node.h,
                    rx: props.nodeRadius,
                    fill: props.gradient ? `url(#${gradientPrefix}-${node.index})` : node.color,
                    opacity,
                    'data-treemap-node': '',
                    'data-index': node.index,
                    class: classNames(
                      interactive.value && 'cursor-pointer',
                      treemapNodeTransitionClasses
                    ),
                    tabindex: interactive.value
                      ? chartMarkTabIndex(visualIndex, visualActive < 0 ? null : visualActive)
                      : undefined,
                    role: interactive.value ? 'button' : undefined,
                    'aria-hidden': interactive.value ? undefined : true,
                    'aria-label': interactive.value ? ariaLabel : undefined,
                    onMouseenter: (e: MouseEvent) => handleMouseEnter(node.index, e),
                    onMousemove: handleMouseMove,
                    onMouseleave: handleMouseLeave,
                    onFocus: (e: FocusEvent) => handleMouseEnter(node.index, e),
                    onClick: () => handleClick(node.index),
                    onKeydown: (e: KeyboardEvent) => handleNodeKeyDown(e, visualIndex)
                  })
                ]
                if (props.showLabels && node.showLabel) {
                  elems.push(
                    h(
                      'text',
                      {
                        key: `label-${node.index}`,
                        x: node.x + node.w / 2,
                        y: node.y + Math.min(14, node.h / 2),
                        fill: node.labelFill,
                        class: 'pointer-events-none select-none',
                        'text-anchor': 'middle',
                        'dominant-baseline': 'middle',
                        'font-size': node.fontSize,
                        'clip-path': `url(#${gradientPrefix}-clip-${node.index})`,
                        'aria-hidden': 'true'
                      },
                      node.label
                    )
                  )
                }
                return elems
              })
            )
          ]
        }
      )
      const tooltip = props.showTooltip
        ? h(ChartTooltip, {
            content: tooltipContent.value,
            open: resolvedHoveredIndex.value !== null && tooltipContent.value !== '',
            x: tooltipPosition.value.x,
            y: tooltipPosition.value.y
          })
        : null
      return h(
        'div',
        {
          class: getCartesianChartShellClasses({
            showLegend: props.showLegend,
            legendPosition: props.legendPosition,
            responsive: props.responsive,
            className: classNames(coerceClassValue(attrs.class), props.className)
          })
        },
        [
          chart,
          props.showLegend
            ? h(ChartLegend, {
                items: legendItems.value,
                orientation: chartLegendOrientationFromPosition(props.legendPosition),
                markerSize: props.legendMarkerSize,
                gap: props.legendGap,
                interactive: interactive.value,
                ariaLabel: labels.value.legendAriaLabel,
                onItemClick: handleLegendClick,
                onItemHover: handleLegendHover,
                onItemLeave: handleLegendLeave
              })
            : null,
          tooltip
        ]
      )
    }
  }
})

export default TreeMapChart
