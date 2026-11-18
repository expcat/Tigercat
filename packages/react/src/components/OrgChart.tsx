import React, { useId, useMemo, useState } from 'react'
import {
  computeOrgChartLayout,
  findOrgMatch,
  orgVisibleIds,
  getCartesianChartShellClasses,
  getChartLabels,
  mergeTigerLocale,
  normalizeChartPadding,
  nextOrgChartNodeIndex,
  resolveChartWritingDirection,
  readPageWritingDirection,
  isChartNavigationKey,
  getOrgChartNodeAriaLabel,
  getOrgChartNodeClipId,
  getOrgChartNodeMarkerGeometry,
  getOrgChartNodeTextY,
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
  type OrgChartProps as CoreOrgChartProps
} from '@expcat/tigercat-core'
import { ChartCanvas } from './ChartCanvas'
import { useTigerConfig } from './tiger-config'
import { OrgBind } from './w9-chart-bind'

export interface OrgChartProps
  extends
    Omit<CoreOrgChartProps, 'className'>,
    Omit<React.HTMLAttributes<HTMLDivElement>, keyof CoreOrgChartProps> {
  padding?: ChartPadding
  className?: string
  onNodeClick?: (node: OrgChartNode) => void
  onNodeHover?: (node: OrgChartNode | null) => void
  onSelectedIdChange?: (id: string | number | null) => void
  bind?: {
    nodes?: { id: string; label: string; children?: { id: string; label: string }[] }[]
    collapsed?: string[]
    query?: string
    zoom?: number
  }
}

export function OrgChart({
  data,
  width = 720,
  height = 420,
  padding = 24,
  nodeWidth = 160,
  nodeHeight = 72,
  levelGap = 80,
  siblingGap = 32,
  orientation = 'vertical',
  showAvatars = true,
  showSubtitles = true,
  hoverable = false,
  selectable = false,
  selectedId,
  activeOpacity = 1,
  inactiveOpacity = 0.25,
  colors,
  title,
  desc,
  ariaLabel,
  locale,
  labels: labelsOverride,
  className,
  onNodeClick,
  onNodeHover,
  onSelectedIdChange,
  bind,
  responsive: _responsive,
  ...rest
}: OrgChartProps): React.ReactElement {
  const config = useTigerConfig()
  const direction = useMemo(
    () => resolveChartWritingDirection(config.direction, readPageWritingDirection()),
    [config.direction]
  )
  const markerClipPrefix = getOrgChartNodeClipId(useId())
  const [orgZoom, setOrgZoom] = useState(1)
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(
    () => getChartLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )
  const [innerSelectedId, setInnerSelectedId] = useState<string | number | null>(null)
  const [hoveredId, setHoveredId] = useState<string | number | null>(null)
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const resolvedSelectedId = selectedId === undefined ? innerSelectedId : selectedId
  const layout = useMemo(
    () =>
      computeOrgChartLayout(data, {
        nodeWidth,
        nodeHeight,
        levelGap,
        siblingGap,
        orientation,
        colors,
        direction
      }),
    [colors, data, direction, orientation, levelGap, nodeHeight, nodeWidth, siblingGap]
  )
  const resolvedPadding = normalizeChartPadding(padding)
  const plotWidth = Math.max(width, layout.width + resolvedPadding.left + resolvedPadding.right)
  const plotHeight = Math.max(height, layout.height + resolvedPadding.top + resolvedPadding.bottom)
  const offsetX = Math.max(
    0,
    (plotWidth - resolvedPadding.left - resolvedPadding.right - layout.width) / 2
  )
  const offsetY = Math.max(
    0,
    (plotHeight - resolvedPadding.top - resolvedPadding.bottom - layout.height) / 2
  )
  const activeId = resolvedSelectedId ?? hoveredId
  const canClick = hoverable || selectable || Boolean(onNodeClick)

  const selectNode = (node: OrgChartLayoutNode) => {
    if (node.node.disabled) return
    if (selectable) {
      const nextId = resolvedSelectedId === node.id ? null : node.id
      if (selectedId === undefined) setInnerSelectedId(nextId)
      onSelectedIdChange?.(nextId)
    }
    onNodeClick?.(node.node)
  }

  const setHoveredNode = (node: OrgChartLayoutNode | null) => {
    if (!hoverable && !onNodeHover) return
    if (!hoverable) return
    setHoveredId(node?.id ?? null)
    onNodeHover?.(node?.node ?? null)
  }

  const getNodeOpacity = (node: OrgChartLayoutNode) => {
    if (activeId === null) return activeOpacity
    return activeId === node.id ? activeOpacity : inactiveOpacity
  }

  const isInteractiveNode = (node: OrgChartLayoutNode) => canClick && !node.node.disabled
  const tabStop = (() => {
    if (
      focusedIndex !== null &&
      layout.nodes[focusedIndex] &&
      isInteractiveNode(layout.nodes[focusedIndex])
    ) {
      return focusedIndex
    }
    const first = layout.nodes.findIndex((node) => isInteractiveNode(node))
    return first < 0 ? null : first
  })()
  const handleNodeKeyDown = (event: React.KeyboardEvent, node: OrgChartLayoutNode) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      selectNode(node)
      return
    }
    if (!isChartNavigationKey(event.key)) return
    const next = nextOrgChartNodeIndex(
      node.index,
      event.key,
      layout.nodes,
      orientation,
      direction,
      isInteractiveNode
    )
    if (next === node.index) return
    event.preventDefault()
    setFocusedIndex(next)
    const nextEl = (event.currentTarget as Element | null)?.parentElement?.children[next]
    if (nextEl instanceof HTMLElement || nextEl instanceof SVGElement) nextEl.focus()
  }

  return (
    <div {...rest} className={getCartesianChartShellClasses({ showLegend: false, className })}>
      <ChartCanvas
        width={plotWidth}
        height={plotHeight}
        padding={padding}
        title={title}
        desc={desc}
        aria-label={ariaLabel ?? (title ? undefined : labels.orgChartAriaLabel)}>
        <g transform={`translate(${offsetX}, ${offsetY})`} data-series-type="org-chart">
          <g data-org-chart-links="true">
            {layout.links.map((link) => (
              <path
                key={`${link.sourceId}-${link.targetId}`}
                d={link.path}
                className={orgChartLinkClasses}
              />
            ))}
          </g>
          <g data-org-chart-nodes="true">
            {layout.nodes.map((node) => {
              const selected = resolvedSelectedId === node.id
              const interactive = canClick && !node.node.disabled
              const avatarHref = showAvatars ? resolveLinkHref(node.node.avatar) : undefined
              const textStart = avatarHref ? 58 : 16
              const geometry = getOrgChartNodeMarkerGeometry(node.width, node.height)
              const clipId = `${markerClipPrefix}-${node.index}`
              const labelY = getOrgChartNodeTextY('label', node.height)
              const titleY = node.node.title
                ? getOrgChartNodeTextY('title', node.height)
                : undefined
              const subtitleY =
                showSubtitles && node.node.subtitle
                  ? getOrgChartNodeTextY('subtitle', node.height)
                  : undefined
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className={getOrgChartNodeClasses(interactive, selected)}
                  opacity={getNodeOpacity(node)}
                  role={interactive ? 'button' : 'group'}
                  tabIndex={interactive ? (node.index === tabStop ? 0 : -1) : undefined}
                  aria-label={getOrgChartNodeAriaLabel(node.node)}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onFocus={() => {
                    if (interactive) setFocusedIndex(node.index)
                  }}
                  onClick={() => selectNode(node)}
                  onKeyDown={(event) => handleNodeKeyDown(event, node)}>
                  <defs>
                    <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
                      <rect
                        x={geometry.clip.x}
                        y={geometry.clip.y}
                        width={geometry.clip.width}
                        height={geometry.clip.height}
                        rx={geometry.clip.rx}
                      />
                    </clipPath>
                  </defs>
                  <rect
                    data-org-node-part="card"
                    width={node.width}
                    height={node.height}
                    rx={geometry.radius}
                    className={orgChartNodeRectClasses}
                  />
                  <rect
                    data-org-node-part="marker"
                    x={geometry.marker.x}
                    y={geometry.marker.y}
                    width={geometry.marker.width}
                    height={geometry.marker.height}
                    fill={node.color}
                    stroke="none"
                    clipPath={`url(#${clipId})`}
                    aria-hidden
                  />
                  <rect
                    data-org-node-part="stroke"
                    width={node.width}
                    height={node.height}
                    rx={geometry.radius}
                    className={orgChartNodeStrokeClasses}
                    fill="none"
                    strokeWidth={selected ? geometry.selectedStrokeWidth : geometry.strokeWidth}
                    style={selected ? { stroke: node.color } : undefined}
                  />
                  {avatarHref ? (
                    <image
                      href={avatarHref}
                      x={16}
                      y={16}
                      width={32}
                      height={32}
                      preserveAspectRatio="xMidYMid slice"
                      aria-hidden="true"
                    />
                  ) : null}
                  {labelY != null ? (
                    <text x={textStart} y={labelY} className={orgChartNodeLabelClasses}>
                      {node.node.label}
                    </text>
                  ) : null}
                  {titleY != null ? (
                    <text x={textStart} y={titleY} className={orgChartNodeTitleClasses}>
                      {node.node.title}
                    </text>
                  ) : null}
                  {subtitleY != null ? (
                    <text x={textStart} y={subtitleY} className={orgChartNodeSubtitleClasses}>
                      {node.node.subtitle}
                    </text>
                  ) : null}
                </g>
              )
            })}
          </g>
        </g>
      </ChartCanvas>
      {bind?.nodes ? (
        <div data-tiger-org-host="">
          <OrgBind
            visible={orgVisibleIds(bind.nodes, bind.collapsed ?? [])}
            match={findOrgMatch(bind.nodes, bind.query ?? '')}
            zoom={bind.zoom ?? orgZoom}
          />
          <button
            type="button"
            data-tiger-org-zoom-in=""
            onClick={() => setOrgZoom((value) => value + 0.25)}>
            +
          </button>
        </div>
      ) : null}
    </div>
  )
}

OrgChart.displayName = 'OrgChart'
