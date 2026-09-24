import { classNames } from './class-names'
import { DEFAULT_CHART_COLORS } from './chart/color'
import { createChartTreeVisit } from './chart/tree-visit'
import { devWarn } from './dev-warn'
import type { OrgChartDirection, OrgChartNode } from '../types/org-chart'

export interface OrgChartLayoutOptions {
  nodeWidth?: number
  nodeHeight?: number
  levelGap?: number
  siblingGap?: number
  orientation?: OrgChartDirection
  colors?: string[]
  direction?: 'ltr' | 'rtl'
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
  'stroke-[var(--tiger-border)] fill-[var(--tiger-surface)] drop-shadow-sm'

export const orgChartNodeLabelClasses =
  'pointer-events-none select-none fill-[var(--tiger-text)] text-sm font-semibold'

export const orgChartNodeTitleClasses =
  'pointer-events-none select-none fill-[var(--tiger-text-secondary)] text-xs'

export const orgChartNodeSubtitleClasses =
  'pointer-events-none select-none fill-[var(--tiger-text-secondary)] text-[11px]'

export const orgChartLinkClasses = 'fill-none stroke-[var(--tiger-border)] stroke-2'

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
  orientation: OrgChartDirection = 'vertical'
): string {
  if (orientation === 'horizontal') {
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
    orientation = 'vertical',
    colors = DEFAULT_CHART_COLORS,
    direction = 'ltr'
  } = options
  const roots = normalizeOrgChartData(data)
  if (roots.length === 0) return { nodes: [], links: [], width: 0, height: 0, depth: 0 }

  let nextLeaf = 0
  let maxDepth = 0
  const treeVisit = createChartTreeVisit()
  const internalRoots = roots.flatMap((root) => {
    const laid = layoutSubtree(root, 0, undefined, {
      nodeWidth,
      nodeHeight,
      levelGap,
      siblingGap,
      orientation,
      nextLeaf: () => nextLeaf,
      setNextLeaf: (next) => {
        nextLeaf = next
      },
      setMaxDepth: (depth) => {
        maxDepth = Math.max(maxDepth, depth)
      },
      visit: treeVisit
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
        orientation === 'horizontal'
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
      links.push({ ...link, path: getOrgChartLinkPath(link, orientation) })
      visit(child, indexRef)
    })
  }

  const indexRef = { value: 0 }
  internalRoots.forEach((root) => visit(root, indexRef))

  if (orientation === 'horizontal' && direction === 'rtl' && nodes.length > 0) {
    const maxX = nodes.reduce((max, node) => Math.max(max, node.x + node.width), 0)
    for (const node of nodes) node.x = maxX - node.x - node.width
    for (const link of links) {
      const source = nodes.find((node) => node.id === link.sourceId)
      const target = nodes.find((node) => node.id === link.targetId)
      if (!source || !target) continue
      link.sourceX = source.x
      link.sourceY = source.y + nodeHeight / 2
      link.targetX = target.x + target.width
      link.targetY = target.y + target.height / 2
      link.path = getOrgChartLinkPath(link, orientation)
    }
  }

  const leafSpan = nextLeaf - siblingGap
  const stackSpan =
    (maxDepth + 1) * (orientation === 'horizontal' ? nodeWidth : nodeHeight) + maxDepth * levelGap

  return {
    nodes,
    links,
    width: orientation === 'horizontal' ? stackSpan : Math.max(0, leafSpan),
    height: orientation === 'horizontal' ? Math.max(0, leafSpan) : stackSpan,
    depth: maxDepth + 1
  }
}

export const layoutOrgChart = computeOrgChartLayout

export function nextOrgChartNodeIndex(
  index: number,
  key: string,
  nodes: readonly Pick<OrgChartLayoutNode, 'id' | 'parentId' | 'depth' | 'x' | 'y'>[],
  orientation: OrgChartDirection = 'vertical',
  direction: 'ltr' | 'rtl' = 'ltr'
): number {
  const current = nodes[index]
  if (!current) return index
  const parentKey = current.parentId === undefined ? null : String(current.parentId)
  const children = nodes.filter((node) => String(node.parentId ?? '') === String(current.id))
  const siblings = nodes.filter((node) => {
    const parent = node.parentId === undefined ? null : String(node.parentId)
    return parent === parentKey && node.depth === current.depth
  })
  const ordered = siblings
    .slice()
    .sort((a, b) => (orientation === 'horizontal' ? a.y - b.y : a.x - b.x))
  const siblingIndex = ordered.findIndex((node) => node.id === current.id)
  const previous = siblingIndex > 0 ? ordered[siblingIndex - 1] : undefined
  const next = siblingIndex >= 0 ? ordered[siblingIndex + 1] : undefined
  const firstChild = children
    .slice()
    .sort((a, b) => (orientation === 'horizontal' ? a.y - b.y : a.x - b.x))[0]
  const parent = nodes.find((node) => String(node.id) === parentKey)

  const towardParent =
    orientation === 'horizontal' ? (direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp'
  const towardChild =
    orientation === 'horizontal' ? (direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown'
  const towardPrevious = orientation === 'horizontal' ? 'ArrowUp' : 'ArrowLeft'
  const towardNext = orientation === 'horizontal' ? 'ArrowDown' : 'ArrowRight'

  const target =
    key === towardParent
      ? parent
      : key === towardChild
        ? firstChild
        : key === towardPrevious
          ? previous
          : key === towardNext
            ? next
            : undefined
  if (!target) return index
  const nextIndex = nodes.findIndex((node) => node.id === target.id)
  return nextIndex < 0 ? index : nextIndex
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
    orientation: OrgChartDirection
    nextLeaf: () => number
    setNextLeaf: (next: number) => void
    setMaxDepth: (depth: number) => void
    visit: ReturnType<typeof createChartTreeVisit>
  }
): InternalLayoutNode | null {
  const key = String(node.id)
  if (
    !context.visit.enter(
      key,
      ['OrgChart.cycle', 'OrgChart skipped a cyclic parent/child link'],
      ['OrgChart.duplicateId', 'OrgChart skipped a duplicate node id']
    )
  ) {
    return null
  }
  context.setMaxDepth(depth)
  const children = node.children ?? []
  const alongStack =
    context.orientation === 'horizontal'
      ? depth * (context.nodeWidth + context.levelGap)
      : depth * (context.nodeHeight + context.levelGap)

  if (children.length === 0) {
    const alongSiblings = context.nextLeaf()
    context.setNextLeaf(
      alongSiblings +
        (context.orientation === 'horizontal' ? context.nodeHeight : context.nodeWidth) +
        context.siblingGap
    )
    context.visit.leave(key)
    return {
      node,
      depth,
      x: context.orientation === 'horizontal' ? alongStack : alongSiblings,
      y: context.orientation === 'horizontal' ? alongSiblings : alongStack,
      parentId,
      children: []
    }
  }

  const childLayouts = children
    .map((child) => layoutSubtree(child, depth + 1, node.id, context))
    .filter((child): child is InternalLayoutNode => child !== null)
  context.visit.leave(key)
  if (childLayouts.length === 0) {
    const alongSiblings = context.nextLeaf()
    context.setNextLeaf(
      alongSiblings +
        (context.orientation === 'horizontal' ? context.nodeHeight : context.nodeWidth) +
        context.siblingGap
    )
    return {
      node,
      depth,
      x: context.orientation === 'horizontal' ? alongStack : alongSiblings,
      y: context.orientation === 'horizontal' ? alongSiblings : alongStack,
      parentId,
      children: []
    }
  }
  const first = childLayouts[0]
  const last = childLayouts[childLayouts.length - 1]
  if (context.orientation === 'horizontal') {
    const y = first.y + (last.y - first.y) / 2
    return { node, depth, x: alongStack, y, parentId, children: childLayouts }
  }
  const x = first.x + (last.x - first.x) / 2
  return { node, depth, x, y: alongStack, parentId, children: childLayouts }
}
