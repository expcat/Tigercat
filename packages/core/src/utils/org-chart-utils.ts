import { classNames } from './class-names'
import { DEFAULT_CHART_COLORS } from './chart-utils'
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
  'transition-[filter,opacity,stroke] duration-150 ease-out focus:outline-none'

export const orgChartNodeRectClasses =
  'stroke-[var(--tiger-border,#d1d5db)] fill-[var(--tiger-bg,#ffffff)] drop-shadow-sm'

export const orgChartNodeLabelClasses =
  'pointer-events-none select-none fill-[var(--tiger-text,#111827)] text-sm font-semibold'

export const orgChartNodeTitleClasses =
  'pointer-events-none select-none fill-[var(--tiger-text-muted,#6b7280)] text-xs'

export const orgChartNodeSubtitleClasses =
  'pointer-events-none select-none fill-[var(--tiger-text-muted,#6b7280)] text-[11px]'

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

export function getOrgChartLinkPath(link: Omit<OrgChartLayoutLink, 'path'>): string {
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

  let nextLeafX = 0
  let maxDepth = 0
  const internalRoots = roots.map((root) =>
    layoutSubtree(root, 0, undefined, {
      nodeWidth,
      nodeHeight,
      levelGap,
      siblingGap,
      nextLeafX: () => nextLeafX,
      setNextLeafX: (next) => {
        nextLeafX = next
      },
      setMaxDepth: (depth) => {
        maxDepth = Math.max(maxDepth, depth)
      }
    })
  )

  const nodes: OrgChartLayoutNode[] = []
  const links: OrgChartLayoutLink[] = []

  const visit = (item: InternalLayoutNode, indexRef: { value: number }) => {
    const index = indexRef.value
    indexRef.value += 1
    const baseNode: OrgChartLayoutNode = {
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
    }
    nodes.push(direction === 'horizontal' ? flipLayoutNode(baseNode) : baseNode)

    item.children.forEach((child) => {
      const sourceX = item.x + nodeWidth / 2
      const sourceY = item.y + nodeHeight
      const targetX = child.x + nodeWidth / 2
      const targetY = child.y
      const verticalLink = {
        sourceId: item.node.id,
        targetId: child.node.id,
        sourceX,
        sourceY,
        targetX,
        targetY
      }
      const link = direction === 'horizontal' ? flipLayoutLink(verticalLink) : verticalLink
      links.push({ ...link, path: getOrgChartLinkPath(link) })
      visit(child, indexRef)
    })
  }

  const indexRef = { value: 0 }
  internalRoots.forEach((root) => visit(root, indexRef))

  const width = roots.length === 0 ? 0 : nextLeafX - siblingGap
  const height = (maxDepth + 1) * nodeHeight + maxDepth * levelGap

  return {
    nodes,
    links,
    width: direction === 'horizontal' ? height : width,
    height: direction === 'horizontal' ? width : height,
    depth: maxDepth + 1
  }
}

function layoutSubtree(
  node: OrgChartNode,
  depth: number,
  parentId: string | number | undefined,
  context: {
    nodeWidth: number
    nodeHeight: number
    levelGap: number
    siblingGap: number
    nextLeafX: () => number
    setNextLeafX: (next: number) => void
    setMaxDepth: (depth: number) => void
  }
): InternalLayoutNode {
  context.setMaxDepth(depth)
  const children = node.children ?? []
  const y = depth * (context.nodeHeight + context.levelGap)

  if (children.length === 0) {
    const x = context.nextLeafX()
    context.setNextLeafX(x + context.nodeWidth + context.siblingGap)
    return { node, depth, x, y, parentId, children: [] }
  }

  const childLayouts = children.map((child) => layoutSubtree(child, depth + 1, node.id, context))
  const first = childLayouts[0]
  const last = childLayouts[childLayouts.length - 1]
  const x = first.x + (last.x - first.x) / 2

  return { node, depth, x, y, parentId, children: childLayouts }
}

function flipLayoutNode(node: OrgChartLayoutNode): OrgChartLayoutNode {
  return {
    ...node,
    x: node.y,
    y: node.x,
    width: node.height,
    height: node.width
  }
}

function flipLayoutLink(link: Omit<OrgChartLayoutLink, 'path'>): Omit<OrgChartLayoutLink, 'path'> {
  return {
    sourceId: link.sourceId,
    targetId: link.targetId,
    sourceX: link.sourceY,
    sourceY: link.sourceX,
    targetX: link.targetY,
    targetY: link.targetX
  }
}
