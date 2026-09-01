import { classNames } from './class-names'
import { DEFAULT_CHART_COLORS } from './chart-utils'
import { devWarn } from './dev-warn'
import type { OrgChartDirection, OrgChartNode } from '../types/org-chart'

export interface OrgChartLayoutOptions {
  nodeWidth?: number
  nodeHeight?: number
  levelGap?: number
  siblingGap?: number
  direction?: OrgChartDirection
  colors?: string[]
}

export interface OrgChartLayoutNode {
  id: string | number
  node: OrgChartNode
  depth: number
  index: number
  x: number
  y: number
  width: number
  height: number
  color: string
  parentId?: string | number
}

export interface OrgChartLayoutLink {
  sourceId: string | number
  targetId: string | number
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  path: string
}

export interface OrgChartLayoutResult {
  nodes: OrgChartLayoutNode[]
  links: OrgChartLayoutLink[]
  width: number
  height: number
  depth: number
}

interface InternalLayoutNode {
  node: OrgChartNode
  depth: number
  x: number
  y: number
  parentId?: string | number
  children: InternalLayoutNode[]
}

export const orgChartNodeClasses =
  'transition-[filter,opacity,stroke] motion-reduce:transition-none duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'

export const orgChartNodeRectClasses =
  'stroke-[var(--tiger-border,#d1d5db)] fill-[var(--tiger-surface,#ffffff)] drop-shadow-sm'

export const orgChartNodeLabelClasses =
  'pointer-events-none select-none fill-[var(--tiger-text,#111827)] text-sm font-semibold'

export const orgChartNodeTitleClasses =
  'pointer-events-none select-none fill-[var(--tiger-text-secondary,#6b7280)] text-xs'

export const orgChartNodeSubtitleClasses =
  'pointer-events-none select-none fill-[var(--tiger-text-secondary,#6b7280)] text-[11px]'

export const orgChartLinkClasses = 'fill-none stroke-[var(--tiger-border,#d1d5db)] stroke-2'

export function normalizeOrgChartData(data: OrgChartNode | OrgChartNode[]): OrgChartNode[] {
  return Array.isArray(data) ? data : [data]
}

export function getOrgChartNodeClasses(interactive: boolean, selected: boolean): string {
  return classNames(
    orgChartNodeClasses,
    interactive && 'cursor-pointer',
    selected && 'drop-shadow-md'
  )
}

export function getOrgChartNodeAriaLabel(node: OrgChartNode): string {
  const parts = [node.label, node.title, node.subtitle].filter(Boolean)
  return parts.join(', ')
}

export function getOrgChartLinkPath(
  link: Omit<OrgChartLayoutLink, 'path'>,
  direction: OrgChartDirection = 'vertical'
): string {
  if (direction === 'horizontal') {
    const midX = link.sourceX + (link.targetX - link.sourceX) / 2
    return `M ${link.sourceX} ${link.sourceY} L ${midX} ${link.sourceY} L ${midX} ${link.targetY} L ${link.targetX} ${link.targetY}`
  }
  const midY = link.sourceY + (link.targetY - link.sourceY) / 2
  return `M ${link.sourceX} ${link.sourceY} C ${link.sourceX} ${midY}, ${link.targetX} ${midY}, ${link.targetX} ${link.targetY}`
}

export function computeOrgChartLayout(
  data: OrgChartNode | OrgChartNode[],
  options: OrgChartLayoutOptions = {}
): OrgChartLayoutResult {
  const {
    nodeWidth = 160,
    nodeHeight = 72,
    levelGap = 80,
    siblingGap = 32,
    direction = 'vertical',
    colors = DEFAULT_CHART_COLORS
  } = options
  const roots = normalizeOrgChartData(data)
  if (roots.length === 0) return { nodes: [], links: [], width: 0, height: 0, depth: 0 }

  let nextLeaf = 0
  let maxDepth = 0
  const seen = new Set<string>()
  const visiting = new Set<string>()
  const internalRoots = roots.flatMap((root) => {
    const laid = layoutSubtree(root, 0, undefined, {
      nodeWidth,
      nodeHeight,
      levelGap,
      siblingGap,
      direction,
      nextLeaf: () => nextLeaf,
      setNextLeaf: (next) => {
        nextLeaf = next
      },
      setMaxDepth: (depth) => {
        maxDepth = Math.max(maxDepth, depth)
      },
      seen,
      visiting
    })
    return laid ? [laid] : []
  })

  const nodes: OrgChartLayoutNode[] = []
  const links: OrgChartLayoutLink[] = []

  const visit = (item: InternalLayoutNode, indexRef: { value: number }) => {
    const index = indexRef.value
    indexRef.value += 1
    nodes.push({
      id: item.node.id,
      node: item.node,
      depth: item.depth,
      index,
      x: item.x,
      y: item.y,
      width: nodeWidth,
      height: nodeHeight,
      color: item.node.color ?? colors[index % colors.length],
      parentId: item.parentId
    })

    item.children.forEach((child) => {
      const link =
        direction === 'horizontal'
          ? {
              sourceId: item.node.id,
              targetId: child.node.id,
              sourceX: item.x + nodeWidth,
              sourceY: item.y + nodeHeight / 2,
              targetX: child.x,
              targetY: child.y + nodeHeight / 2
            }
          : {
              sourceId: item.node.id,
              targetId: child.node.id,
              sourceX: item.x + nodeWidth / 2,
              sourceY: item.y + nodeHeight,
              targetX: child.x + nodeWidth / 2,
              targetY: child.y
            }
      links.push({ ...link, path: getOrgChartLinkPath(link, direction) })
      visit(child, indexRef)
    })
  }

  const indexRef = { value: 0 }
  internalRoots.forEach((root) => visit(root, indexRef))

  const leafSpan = nextLeaf - siblingGap
  const stackSpan =
    (maxDepth + 1) * (direction === 'horizontal' ? nodeWidth : nodeHeight) + maxDepth * levelGap

  return {
    nodes,
    links,
    width: direction === 'horizontal' ? stackSpan : Math.max(0, leafSpan),
    height: direction === 'horizontal' ? Math.max(0, leafSpan) : stackSpan,
    depth: maxDepth + 1
  }
}

export const layoutOrgChart = computeOrgChartLayout

function layoutSubtree(
  node: OrgChartNode,
  depth: number,
  parentId: string | number | undefined,
  context: {
    nodeWidth: number
    nodeHeight: number
    levelGap: number
    siblingGap: number
    direction: OrgChartDirection
    nextLeaf: () => number
    setNextLeaf: (next: number) => void
    setMaxDepth: (depth: number) => void
    seen: Set<string>
    visiting: Set<string>
  }
): InternalLayoutNode | null {
  const key = String(node.id)
  if (context.visiting.has(key)) {
    devWarn('OrgChart.cycle', 'OrgChart skipped a cyclic parent/child link')
    return null
  }
  if (context.seen.has(key)) {
    devWarn('OrgChart.duplicateId', 'OrgChart skipped a duplicate node id')
    return null
  }
  context.seen.add(key)
  context.visiting.add(key)
  context.setMaxDepth(depth)
  const children = node.children ?? []
  const alongStack =
    context.direction === 'horizontal'
      ? depth * (context.nodeWidth + context.levelGap)
      : depth * (context.nodeHeight + context.levelGap)

  if (children.length === 0) {
    const alongSiblings = context.nextLeaf()
    context.setNextLeaf(
      alongSiblings +
        (context.direction === 'horizontal' ? context.nodeHeight : context.nodeWidth) +
        context.siblingGap
    )
    context.visiting.delete(key)
    return {
      node,
      depth,
      x: context.direction === 'horizontal' ? alongStack : alongSiblings,
      y: context.direction === 'horizontal' ? alongSiblings : alongStack,
      parentId,
      children: []
    }
  }

  const childLayouts = children
    .map((child) => layoutSubtree(child, depth + 1, node.id, context))
    .filter((child): child is InternalLayoutNode => child !== null)
  context.visiting.delete(key)
  if (childLayouts.length === 0) {
    const alongSiblings = context.nextLeaf()
    context.setNextLeaf(
      alongSiblings +
        (context.direction === 'horizontal' ? context.nodeHeight : context.nodeWidth) +
        context.siblingGap
    )
    return {
      node,
      depth,
      x: context.direction === 'horizontal' ? alongStack : alongSiblings,
      y: context.direction === 'horizontal' ? alongSiblings : alongStack,
      parentId,
      children: []
    }
  }
  const first = childLayouts[0]
  const last = childLayouts[childLayouts.length - 1]
  if (context.direction === 'horizontal') {
    const y = first.y + (last.y - first.y) / 2
    return { node, depth, x: alongStack, y, parentId, children: childLayouts }
  }
  const x = first.x + (last.x - first.x) / 2
  return { node, depth, x, y: alongStack, parentId, children: childLayouts }
}
