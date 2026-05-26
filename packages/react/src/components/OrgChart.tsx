import React, { useMemo, useState } from 'react'
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

export interface OrgChartProps extends Omit<CoreOrgChartProps, 'className'> {
  padding?: ChartPadding
  className?: string
  onNodeClick?: (node: OrgChartNode) => void
  onNodeHover?: (node: OrgChartNode | null) => void
  onSelectedIdChange?: (id: string | number | null) => void
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
  direction = 'vertical',
  showAvatars = true,
  showSubtitles = true,
  hoverable = false,
  selectable = false,
  selectedId,
  activeOpacity = 1,
  inactiveOpacity = 0.35,
  colors,
  title,
  desc,
  ariaLabel = 'Organization chart',
  className,
  onNodeClick,
  onNodeHover,
  onSelectedIdChange
}: OrgChartProps): React.ReactElement {
  const [innerSelectedId, setInnerSelectedId] = useState<string | number | null>(null)
  const [hoveredId, setHoveredId] = useState<string | number | null>(null)
  const resolvedSelectedId = selectedId === undefined ? innerSelectedId : selectedId
  const innerRect = useMemo(
    () => getChartInnerRect(width, height, padding),
    [height, padding, width]
  )
  const layout = useMemo(
    () =>
      computeOrgChartLayout(data, {
        nodeWidth,
        nodeHeight,
        levelGap,
        siblingGap,
        direction,
        colors
      }),
    [colors, data, direction, levelGap, nodeHeight, nodeWidth, siblingGap]
  )
  const offsetX = Math.max(0, (innerRect.width - layout.width) / 2)
  const offsetY = Math.max(0, (innerRect.height - layout.height) / 2)
  const activeId = resolvedSelectedId ?? hoveredId

  const selectNode = (node: OrgChartLayoutNode) => {
    if (selectable && !node.node.disabled) {
      const nextId = resolvedSelectedId === node.id ? null : node.id
      if (selectedId === undefined) setInnerSelectedId(nextId)
      onSelectedIdChange?.(nextId)
    }
    onNodeClick?.(node.node)
  }

  const setHoveredNode = (node: OrgChartLayoutNode | null) => {
    if (!hoverable) return
    setHoveredId(node?.id ?? null)
    onNodeHover?.(node?.node ?? null)
  }

  const getNodeOpacity = (node: OrgChartLayoutNode) => {
    if (activeId === null) return activeOpacity
    return activeId === node.id ? activeOpacity : inactiveOpacity
  }

  return (
    <ChartCanvas
      width={width}
      height={height}
      padding={padding}
      title={title}
      desc={desc}
      className={classNames(className)}
      role="img"
      aria-label={ariaLabel}>
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
            const interactive = (hoverable || selectable) && !node.node.disabled
            const textStart = showAvatars && node.node.avatar ? 58 : 16
            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className={getOrgChartNodeClasses(interactive, selected)}
                opacity={getNodeOpacity(node)}
                role={interactive ? 'button' : 'group'}
                tabIndex={interactive ? 0 : undefined}
                aria-label={getOrgChartNodeAriaLabel(node.node)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => selectNode(node)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    selectNode(node)
                  }
                }}>
                <rect
                  width={node.width}
                  height={node.height}
                  rx={8}
                  className={orgChartNodeRectClasses}
                  stroke={selected ? node.color : undefined}
                  strokeWidth={selected ? 2 : 1}
                />
                <rect width={4} height={node.height} rx={2} fill={node.color} />
                {showAvatars && node.node.avatar ? (
                  <image
                    href={node.node.avatar}
                    x={16}
                    y={16}
                    width={32}
                    height={32}
                    preserveAspectRatio="xMidYMid slice"
                    aria-hidden="true"
                  />
                ) : null}
                <text x={textStart} y={26} className={orgChartNodeLabelClasses}>
                  {node.node.label}
                </text>
                {node.node.title ? (
                  <text x={textStart} y={44} className={orgChartNodeTitleClasses}>
                    {node.node.title}
                  </text>
                ) : null}
                {showSubtitles && node.node.subtitle ? (
                  <text x={textStart} y={60} className={orgChartNodeSubtitleClasses}>
                    {node.node.subtitle}
                  </text>
                ) : null}
              </g>
            )
          })}
        </g>
      </g>
    </ChartCanvas>
  )
}

OrgChart.displayName = 'OrgChart'
