import React, { useState } from 'react'
import {
  downloadChartSvg,
  drillBack,
  drillBreadcrumb,
  drillInto,
  drillVisibleNodes,
  formatChartTimeTick,
  getW9DataLabels,
  structuredTooltipRows,
  type LaidOutGroupedBar
} from '@expcat/tigercat-core'

export function BarBind({
  bars,
  line
}: {
  bars: readonly LaidOutGroupedBar[]
  line?: readonly { y: number }[]
}) {
  return (
    <div data-tiger-bar-layout={bars.some((bar) => bar.stacked) ? 'stacked' : 'grouped'}>
      {bars.map((bar, index) => (
        <span
          key={index}
          data-bar-series={bar.seriesKey}
          data-bar-slot={String(bar.slot)}
          data-bar-y0={String(bar.y0)}
          data-bar-y1={String(bar.y1)}
        />
      ))}
      {line?.length ? <span data-combo-line={line.map((point) => point.y).join(',')} /> : null}
    </div>
  )
}

export function AxisBind({
  ticks,
  reference,
  brush,
  secondAxis,
  tooltip,
  tooltipTotal,
  onExport
}: {
  ticks?: readonly (number | Date)[]
  reference?: { axis?: 'y' | 'y2'; value: number; end?: number } | null
  brush?: { start: number; end: number } | null
  secondAxis?: boolean
  tooltip?: { name: string; value: number }[]
  tooltipTotal?: number
  onExport?: () => void
}) {
  const labels = getW9DataLabels()
  const rows = tooltip ? structuredTooltipRows(tooltip, tooltipTotal ?? 0) : []
  return (
    <div data-tiger-axis-bind="">
      {(ticks ?? []).map((tick, index) => (
        <span key={index} data-time-tick={formatChartTimeTick(tick)} />
      ))}
      {reference ? (
        <span
          data-reference={String(reference.value)}
          data-reference-end={reference.end}
          data-reference-axis={reference.axis ?? 'y'}
        />
      ) : null}
      {brush ? (
        <span data-brush-start={String(brush.start)} data-brush-end={String(brush.end)} />
      ) : null}
      {secondAxis ? <span data-second-axis="" /> : null}
      {rows.map((row, index) => (
        <span key={`tip-${index}`} data-tooltip-row={`${row.name}:${row.value}:${row.percent}`} />
      ))}
      {onExport ? (
        <button type="button" data-tiger-export-chart="" onClick={onExport}>
          {labels.exportChart}
        </button>
      ) : null}
    </div>
  )
}

export function PieBind({
  labels,
  radii
}: {
  labels: { index: number; y: number }[]
  radii: number[]
}) {
  return (
    <div data-tiger-pie-bind="">
      {labels.map((label) => (
        <span key={label.index} data-pie-label={String(label.index)} data-pie-label-y={String(label.y)} />
      ))}
      {radii.map((radius, index) => (
        <span key={`r-${index}`} data-pie-radius={String(radius)} />
      ))}
    </div>
  )
}

export function RadarBind({ ratios }: { ratios: readonly number[] }) {
  return (
    <div data-tiger-radar-bind="">
      {ratios.map((ratio, index) => (
        <span key={index} data-radar-ratio={String(ratio)} />
      ))}
    </div>
  )
}

export function GaugeBind({ pointer, arc }: { pointer: boolean; arc: string }) {
  return (
    <div data-tiger-gauge-bind="" data-gauge-pointer={pointer ? 'true' : 'false'}>
      {arc}
    </div>
  )
}

export function HeatBind({
  stops,
  label
}: {
  stops: { offset: string; color: string }[]
  label: string
}) {
  return (
    <div data-tiger-heat-bind="" data-heat-label={label}>
      {stops.map((stop, index) => (
        <span key={index} data-heat-stop={stop.offset} data-heat-color={stop.color} />
      ))}
    </div>
  )
}

export function DrillBind({
  path,
  nodes,
  onCrumb,
  onOpen
}: {
  path: readonly string[]
  nodes: readonly { id: string }[]
  onCrumb?: (id: string) => void
  onOpen?: (id: string) => void
}) {
  return (
    <div data-tiger-drill="">
      {path.map((id) => (
        <button type="button" key={id} data-tiger-breadcrumb={id} onClick={() => onCrumb?.(id)}>
          {id}
        </button>
      ))}
      {nodes.map((node) => (
        <button type="button" key={node.id} data-drill-node={node.id} onClick={() => onOpen?.(node.id)}>
          {node.id}
        </button>
      ))}
    </div>
  )
}

export function GanttBind({
  milestones,
  anchors,
  windowCount
}: {
  milestones: readonly string[]
  anchors?: { x1: number; x2: number }
  windowCount: number
}) {
  return (
    <div data-tiger-gantt-bind="">
      {milestones.map((id) => (
        <span key={id} data-gantt-milestone={id} />
      ))}
      {anchors ? <span data-gantt-anchor={`${anchors.x1},${anchors.x2}`} /> : null}
      <span data-gantt-window={String(windowCount)} />
    </div>
  )
}

export function OrgBind({
  visible,
  match,
  zoom
}: {
  visible: readonly string[]
  match: string | null
  zoom: number
}) {
  return (
    <div data-tiger-org-bind="" data-org-zoom={String(zoom)}>
      {visible.map((id) => (
        <span key={id} data-org-visible={id} />
      ))}
      {match ? <span data-org-match={match} /> : null}
    </div>
  )
}

export function DrillHost({
  roots
}: {
  roots: readonly { id: string; children?: readonly { id: string; children?: readonly { id: string }[] }[] }[]
}) {
  const [path, setPath] = useState<string[]>([])
  return (
    <DrillBind
      path={drillBreadcrumb(path)}
      nodes={drillVisibleNodes(roots, path)}
      onCrumb={() => setPath(drillBack(path))}
      onOpen={(id) => setPath(drillInto(path, id))}
    />
  )
}

export { downloadChartSvg }
