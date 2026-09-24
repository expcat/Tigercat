import { defineComponent, h, ref, type PropType, type VNode } from 'vue'
import {
  downloadChartSvg,
  drillBack,
  drillBreadcrumb,
  drillInto,
  drillVisibleNodes,
  formatChartTimeTick,
  getW9DataLabels,
  heatBandLabel,
  structuredTooltipRows,
  type LaidOutGroupedBar
} from '@expcat/tigercat-core'

export function renderBarBind(
  bars: readonly LaidOutGroupedBar[],
  line?: readonly { y: number }[]
): VNode {
  return h(
    'div',
    { 'data-tiger-bar-layout': bars.some((bar) => bar.stacked) ? 'stacked' : 'grouped' },
    [
      ...bars.map((bar, index) =>
        h('span', {
          key: index,
          'data-bar-series': bar.seriesKey,
          'data-bar-slot': String(bar.slot),
          'data-bar-y0': String(bar.y0),
          'data-bar-y1': String(bar.y1)
        })
      ),
      line?.length
        ? h('span', { 'data-combo-line': line.map((point) => point.y).join(',') })
        : null
    ]
  )
}

export function renderAxisBind(input: {
  ticks?: readonly (number | Date)[]
  reference?: { axis?: 'y' | 'y2'; value: number; end?: number } | null
  brush?: { start: number; end: number } | null
  secondAxis?: boolean
  tooltip?: { name: string; value: number }[]
  tooltipTotal?: number
  exportSvg?: SVGSVGElement | null
}): VNode {
  const labels = getW9DataLabels()
  const rows = input.tooltip
    ? structuredTooltipRows(input.tooltip, input.tooltipTotal ?? 0)
    : []
  return h('div', { 'data-tiger-axis-bind': '' }, [
    ...(input.ticks ?? []).map((tick, index) =>
      h('span', { key: index, 'data-time-tick': formatChartTimeTick(tick) })
    ),
    input.reference
      ? h('span', {
          'data-reference': String(input.reference.value),
          'data-reference-end': input.reference.end,
          'data-reference-axis': input.reference.axis ?? 'y'
        })
      : null,
    input.brush
      ? h('span', {
          'data-brush-start': String(input.brush.start),
          'data-brush-end': String(input.brush.end)
        })
      : null,
    input.secondAxis ? h('span', { 'data-second-axis': '' }) : null,
    ...rows.map((row, index) =>
      h('span', { key: `tip-${index}`, 'data-tooltip-row': `${row.name}:${row.value}:${row.percent}` })
    ),
    input.exportSvg
      ? h(
          'button',
          {
            type: 'button',
            'data-tiger-export-chart': '',
            onClick: () => downloadChartSvg(input.exportSvg as SVGSVGElement, 'chart.svg')
          },
          labels.exportChart
        )
      : null
  ])
}

export function renderPieBind(input: {
  labels: { index: number; y: number }[]
  radii: number[]
}): VNode {
  return h('div', { 'data-tiger-pie-bind': '' }, [
    ...input.labels.map((label) =>
      h('span', { key: label.index, 'data-pie-label': String(label.index), 'data-pie-label-y': String(label.y) })
    ),
    ...input.radii.map((radius, index) =>
      h('span', { key: `r-${index}`, 'data-pie-radius': String(radius) })
    )
  ])
}

export function renderRadarBind(ratios: readonly number[]): VNode {
  return h(
    'div',
    { 'data-tiger-radar-bind': '' },
    ratios.map((ratio, index) => h('span', { key: index, 'data-radar-ratio': String(ratio) }))
  )
}

export function renderGaugeBind(pointer: boolean, arc: string): VNode {
  return h('div', { 'data-tiger-gauge-bind': '', 'data-gauge-pointer': pointer ? 'true' : 'false' }, arc)
}

export function renderHeatBind(stops: { offset: string; color: string }[], label: string): VNode {
  return h('div', { 'data-tiger-heat-bind': '', 'data-heat-label': label }, [
    ...stops.map((stop, index) =>
      h('span', { key: index, 'data-heat-stop': stop.offset, 'data-heat-color': stop.color })
    )
  ])
}

export function renderDrillBind(
  path: readonly string[],
  nodes: readonly { id: string }[],
  onCrumb?: (id: string) => void,
  onOpen?: (id: string) => void
): VNode {
  return h('div', { 'data-tiger-drill': '' }, [
    ...path.map((id) =>
      h(
        'button',
        {
          type: 'button',
          key: id,
          'data-tiger-breadcrumb': id,
          onClick: () => onCrumb?.(id)
        },
        id
      )
    ),
    ...nodes.map((node) =>
      h(
        'button',
        {
          type: 'button',
          key: node.id,
          'data-drill-node': node.id,
          onClick: () => onOpen?.(node.id)
        },
        node.id
      )
    )
  ])
}

export function renderGanttBind(input: {
  milestones: readonly string[]
  anchors?: { x1: number; x2: number }
  windowCount: number
}): VNode {
  return h('div', { 'data-tiger-gantt-bind': '' }, [
    ...input.milestones.map((id) => h('span', { key: id, 'data-gantt-milestone': id })),
    input.anchors
      ? h('span', {
          'data-gantt-anchor': `${input.anchors.x1},${input.anchors.x2}`
        })
      : null,
    h('span', { 'data-gantt-window': String(input.windowCount) })
  ])
}

export function renderOrgBind(input: {
  visible: readonly string[]
  match: string | null
  zoom: number
}): VNode {
  return h('div', { 'data-tiger-org-bind': '', 'data-org-zoom': String(input.zoom) }, [
    ...input.visible.map((id) => h('span', { key: id, 'data-org-visible': id })),
    input.match ? h('span', { 'data-org-match': input.match }) : null
  ])
}

export function heatLabel(value: number, min: number, max: number): string {
  return heatBandLabel(value, min, max)
}

export const DrillHost = defineComponent({
  name: 'TigerDrillHost',
  props: {
    roots: {
      type: Array as PropType<{ id: string; children?: { id: string }[] }[]>,
      required: true
    }
  },
  setup(props) {
    const path = ref<string[]>([])
    return () =>
      renderDrillBind(
        drillBreadcrumb(path.value),
        drillVisibleNodes(props.roots, path.value),
        () => {
          path.value = drillBack(path.value)
        },
        (id: string) => {
          path.value = drillInto(path.value, id)
        }
      )
  }
})
