/**
 * Column/row placement for WorkflowViewer.
 *
 * Sequential siblings share one trunk. A node with two or more children fans
 * those children into columns and the next sibling rejoins under them.
 * `step.loopTo` is a back-edge to another step key. People stay on the card
 * (`actors` / `tasks`); they are not columns.
 */

import type { WorkflowViewerNode } from './workflow-timeline-utils'
import { workflowColumnCenter, workflowViewerCardHalfValue } from './workflow-branch-geometry'

export type WorkflowViewerEdgeKind = 'sequence' | 'fork' | 'join' | 'loop' | 'riser'

export interface WorkflowViewerPlacement {
  key: string
  /** 1-based card row. Connector rows sit between these. */
  row: number
  /** 1-based column. */
  col: number
  colSpan: number
  /** First card of a side-by-side branch. */
  forkChild: boolean
  node: WorkflowViewerNode
}

export interface WorkflowViewerLayoutEdge {
  kind: WorkflowViewerEdgeKind
  from: string
  to: string
  /**
   * 1-based layout row of the card this connector sits under.
   * Loop edges leave this at 0 and use the endpoint placements instead.
   */
  row: number
  col: number
  colSpan: number
  /**
   * Column-fraction inset before the branch gap is applied, percent of the
   * edge cell. Painted bars use `workflowViewerBarStyle`, which shifts these
   * endpoints onto the column centers.
   */
  insetStart: number
  insetEnd: number
  /**
   * Direct branches of a fork. Join edges copy them, shifted into the join
   * cell. Risers read `col` / `endRow`.
   */
  slots?: WorkflowViewerBranchSlot[]
  /** Last layout row a riser runs through (the join connector row). */
  rowEnd?: number
}

export interface WorkflowViewerBranchSlot {
  key: string
  /** 1-based grid column where this branch starts. */
  col: number
  cols: number
  /** Columns before this branch inside the edge cell that paints the bar. */
  offset: number
  /** Layout row of this branch's last card. */
  endRow: number
}

export interface WorkflowViewerLayout {
  columns: number
  rows: number
  placements: WorkflowViewerPlacement[]
  edges: WorkflowViewerLayoutEdge[]
  hasFork: boolean
  hasLoop: boolean
}

interface Box {
  cols: number
  rows: number
}

const EMPTY_LAYOUT: WorkflowViewerLayout = {
  columns: 1,
  rows: 0,
  placements: [],
  edges: [],
  hasFork: false,
  hasLoop: false
}

function measureNode(node: WorkflowViewerNode): Box {
  if (node.children.length === 0) return { cols: 1, rows: 1 }
  if (node.children.length === 1) {
    const child = measureNode(node.children[0]!)
    return { cols: child.cols, rows: 1 + child.rows }
  }
  const boxes = node.children.map((child) => measureNode(child))
  return {
    cols: boxes.reduce((sum, box) => sum + box.cols, 0),
    rows: 1 + Math.max(...boxes.map((box) => box.rows))
  }
}

function measureList(nodes: readonly WorkflowViewerNode[]): Box {
  if (nodes.length === 0) return { cols: 1, rows: 0 }
  const boxes = nodes.map((node) => measureNode(node))
  return {
    cols: Math.max(...boxes.map((box) => box.cols)),
    rows: boxes.reduce((sum, box) => sum + box.rows, 0)
  }
}

function roundPercent(value: number): number {
  return Math.round(value * 1000) / 1000
}

/**
 * Place `nodes` into `placements` / `edges`. `span` is the trunk width the
 * list is centered in.
 */
function placeList(
  nodes: readonly WorkflowViewerNode[],
  startRow: number,
  col: number,
  span: number,
  placements: WorkflowViewerPlacement[],
  edges: WorkflowViewerLayoutEdge[]
): number {
  let cursor = startRow
  let previous: WorkflowViewerNode | null = null
  for (const node of nodes) {
    const box = measureNode(node)
    const forks = node.children.length > 1
    const offset = forks ? Math.max(0, Math.floor((span - box.cols) / 2)) : 0
    const nodeCol = col + offset
    const nodeSpan = forks ? box.cols : Math.max(box.cols, span)
    if (previous) {
      const forkEdge = edges.find((edge) => edge.kind === 'fork' && edge.from === previous?.key)
      if (forkEdge) {
        const forkStart = ((forkEdge.col - col) / span) * 100
        const forkWidth = (forkEdge.colSpan / span) * 100
        const branchOffset = forkEdge.col - col
        const joinRow = cursor - 1
        const slots = (forkEdge.slots ?? []).map((slot) => ({
          ...slot,
          offset: slot.offset + branchOffset
        }))
        edges.push({
          kind: 'join',
          from: previous.key,
          to: node.key,
          row: joinRow,
          col,
          colSpan: span,
          insetStart: roundPercent(forkStart + (forkEdge.insetStart / 100) * forkWidth),
          insetEnd: roundPercent(
            100 - (forkStart + forkWidth) + (forkEdge.insetEnd / 100) * forkWidth
          ),
          slots
        })
        for (const slot of forkEdge.slots ?? []) {
          edges.push({
            kind: 'riser',
            from: slot.key,
            to: node.key,
            row: slot.endRow,
            rowEnd: joinRow,
            col: slot.col,
            colSpan: slot.cols,
            insetStart: 0,
            insetEnd: 0
          })
        }
      } else {
        edges.push({
          kind: 'sequence',
          from: previous.key,
          to: node.key,
          row: cursor - 1,
          col,
          colSpan: span,
          insetStart: 50,
          insetEnd: 50
        })
      }
    }
    cursor = placeNode(node, cursor, nodeCol, nodeSpan, false, placements, edges)
    previous = node
  }
  return cursor
}

function placeNode(
  node: WorkflowViewerNode,
  row: number,
  col: number,
  span: number,
  forkChild: boolean,
  placements: WorkflowViewerPlacement[],
  edges: WorkflowViewerLayoutEdge[]
): number {
  placements.push({
    key: node.key,
    row,
    col,
    colSpan: span,
    forkChild,
    node
  })
  if (node.children.length === 0) return row + 1
  if (node.children.length === 1) {
    const child = node.children[0]!
    edges.push({
      kind: 'sequence',
      from: node.key,
      to: child.key,
      row,
      col,
      colSpan: span,
      insetStart: 50,
      insetEnd: 50
    })
    return placeNode(child, row + 1, col, span, false, placements, edges)
  }

  const boxes = node.children.map((child) => measureNode(child))
  const used = boxes.reduce((sum, box) => sum + box.cols, 0)
  const offset = Math.max(0, Math.floor((span - used) / 2))
  const forkCol = col + offset
  const firstCols = boxes[0]?.cols ?? 1
  const lastCols = boxes[boxes.length - 1]?.cols ?? 1
  const forkEdge: WorkflowViewerLayoutEdge = {
    kind: 'fork',
    from: node.key,
    to: node.children[node.children.length - 1]!.key,
    row,
    col: forkCol,
    colSpan: used,
    insetStart: roundPercent((firstCols / 2 / used) * 100),
    insetEnd: roundPercent((lastCols / 2 / used) * 100),
    slots: []
  }
  edges.push(forkEdge)

  let cursor = forkCol
  let maxRows = 0
  let slotOffset = 0
  node.children.forEach((child, index) => {
    const box = boxes[index]!
    const childCol = cursor
    const next = placeNode(child, row + 1, cursor, box.cols, true, placements, edges)
    forkEdge.slots?.push({
      key: child.key,
      col: childCol,
      cols: box.cols,
      offset: slotOffset,
      endRow: next - 1
    })
    slotOffset += box.cols
    maxRows = Math.max(maxRows, next - (row + 1))
    cursor += box.cols
  })
  return row + 1 + maxRows
}

function appendLoops(
  nodes: readonly WorkflowViewerNode[],
  placements: readonly WorkflowViewerPlacement[],
  edges: WorkflowViewerLayoutEdge[]
): void {
  const first = new Map<string, WorkflowViewerPlacement>()
  for (const placement of placements) {
    if (!first.has(placement.key)) first.set(placement.key, placement)
  }
  const visit = (list: readonly WorkflowViewerNode[]): void => {
    for (const node of list) {
      const target = node.step.loopTo
      if (
        typeof target === 'string' &&
        target.length > 0 &&
        target !== node.key &&
        first.has(node.key) &&
        first.has(target)
      ) {
        edges.push({
          kind: 'loop',
          from: node.key,
          to: target,
          row: 0,
          col: 0,
          colSpan: 0,
          insetStart: 0,
          insetEnd: 0
        })
      }
      if (node.children.length > 0) visit(node.children)
    }
  }
  visit(nodes)
}

/**
 * Grid placement for a viewer tree. Empty input is a one-column blank.
 * Duplicate keys keep the first placement for `loopTo` resolution.
 */
export function layoutWorkflowViewer(nodes: readonly WorkflowViewerNode[]): WorkflowViewerLayout {
  if (nodes.length === 0) return EMPTY_LAYOUT
  const list = measureList(nodes)
  const placements: WorkflowViewerPlacement[] = []
  const edges: WorkflowViewerLayoutEdge[] = []
  placeList(nodes, 1, 1, list.cols, placements, edges)
  appendLoops(nodes, placements, edges)
  return {
    columns: list.cols,
    rows: list.rows,
    placements,
    edges,
    hasFork: edges.some((edge) => edge.kind === 'fork'),
    hasLoop: edges.some((edge) => edge.kind === 'loop')
  }
}

/** CSS grid row for a card. Connector rows are the even rows between cards. */
export function workflowViewerCardGridRow(layoutRow: number): number {
  return layoutRow * 2 - 1
}

export function workflowViewerConnectorGridRow(layoutRow: number): number {
  return layoutRow * 2
}

export function workflowViewerGridStyle(layout: WorkflowViewerLayout): Record<string, string> {
  return {
    gridTemplateColumns: `repeat(${layout.columns}, minmax(12rem, 18rem))`,
    ...(layout.hasLoop ? { paddingInlineEnd: '3.5rem' } : {})
  }
}

export function workflowViewerEdgeGridStyle(
  edge: WorkflowViewerLayoutEdge
): Record<string, string | number> {
  const row =
    edge.kind === 'riser' && edge.rowEnd !== undefined
      ? `${workflowViewerConnectorGridRow(edge.row)} / ${workflowViewerConnectorGridRow(edge.rowEnd) + 1}`
      : workflowViewerConnectorGridRow(edge.row)
  return {
    gridRow: row,
    gridColumn: `${edge.col} / span ${edge.colSpan}`
  }
}

/**
 * Horizontal fork/join bar. Endpoints are the first and last branch centers,
 * including the column gap. `insetStart` / `insetEnd` stay the gap-free fraction.
 */
export function workflowViewerBarStyle(edge: WorkflowViewerLayoutEdge): Record<string, string> {
  const slots = edge.slots
  const first = slots?.[0]
  const last = slots && slots.length > 1 ? slots[slots.length - 1] : undefined
  if (!first || !last || edge.colSpan < 1) {
    return {
      left: `${edge.insetStart}%`,
      right: `${edge.insetEnd}%`
    }
  }
  const columnsAfter = edge.colSpan - (last.offset + last.cols)
  return {
    left: workflowColumnCenter(edge.colSpan, first.offset, first.cols),
    right: workflowColumnCenter(edge.colSpan, Math.max(0, columnsAfter), last.cols)
  }
}

export function workflowViewerCardGridStyle(
  placement: WorkflowViewerPlacement
): Record<string, string | number> {
  return {
    gridRow: workflowViewerCardGridRow(placement.row),
    gridColumn: `${placement.col} / span ${placement.colSpan}`
  }
}

/**
 * Overlay spanning the rows between the loop endpoints, on the wider card's
 * columns. The rail itself is offset to that card's right edge.
 */
export function workflowViewerLoopGridStyle(
  layout: WorkflowViewerLayout,
  edge: WorkflowViewerLayoutEdge
): Record<string, string> | null {
  const from = layout.placements.find((placement) => placement.key === edge.from)
  const to = layout.placements.find((placement) => placement.key === edge.to)
  if (!from || !to) return null
  const anchor = from.colSpan >= to.colSpan ? from : to
  const top = Math.min(from.row, to.row)
  const bottom = Math.max(from.row, to.row)
  return {
    display: 'grid',
    gridTemplateRows: 'subgrid',
    gridColumn: `${anchor.col} / span ${anchor.colSpan}`,
    gridRow: `${workflowViewerCardGridRow(top)} / ${workflowViewerConnectorGridRow(bottom)}`
  }
}

export type WorkflowViewerLoopPiece =
  'stem-start' | 'stem-mid' | 'stem-end' | 'arm-start' | 'arm-end' | 'label'

/**
 * Expression (no wrapping `calc`) for the right edge of a centered card capped
 * at twice `--tiger-workflow-card-half`. A narrower column fills the cell,
 * so that edge is `100%`.
 */
function workflowViewerCardRightExpr(): string {
  return `50% + min(50%, ${workflowViewerCardHalfValue()})`
}

/** Vertical return rail, one gap past the card's right edge. */
export function workflowViewerLoopRailStyle(): Record<string, string> {
  return { left: `calc(${workflowViewerCardRightExpr()} + 0.75rem)` }
}

/**
 * Grid track for one return-bracket piece. The track stretches the overlay
 * width and locks to the endpoint card rows via subgrid. The painted line is
 * `workflowViewerLoopMarkStyle` — a grid item's own percentage margin/inset
 * resolves against a smaller box, so the mark is absolutely positioned inside
 * this full-width track.
 */
export function workflowViewerLoopPieceStyle(
  piece: WorkflowViewerLoopPiece
): Record<string, string> {
  const track = { position: 'relative', width: '100%', gridColumn: '1 / -1' }
  if (piece === 'stem-start') {
    return { ...track, gridRow: '1', alignSelf: 'end', height: '50%' }
  }
  if (piece === 'stem-mid') {
    return { ...track, gridRow: '2 / -2', alignSelf: 'stretch' }
  }
  if (piece === 'stem-end') {
    return { ...track, gridRow: '-1', alignSelf: 'start', height: '50%' }
  }
  if (piece === 'arm-start') {
    return { ...track, gridRow: '1', alignSelf: 'center', height: '2px' }
  }
  if (piece === 'arm-end') {
    return { ...track, gridRow: '-1', alignSelf: 'center', height: '2px' }
  }
  return { ...track, gridRow: '1 / -1', alignSelf: 'stretch' }
}

/**
 * Painted segment inside a loop track. Arms start at the centered card's right
 * edge; stems sit one column gap further right and fill their track.
 */
export function workflowViewerLoopMarkStyle(
  piece: WorkflowViewerLoopPiece
): Record<string, string> {
  const cardRight = `calc(${workflowViewerCardRightExpr()})`
  const rail = workflowViewerLoopRailStyle().left ?? '0px'
  if (piece === 'arm-start' || piece === 'arm-end') {
    return {
      position: 'absolute',
      left: cardRight,
      top: '0',
      height: '2px',
      width: 'calc(0.75rem + 2px)'
    }
  }
  if (piece === 'label') {
    return {
      position: 'absolute',
      left: `calc(${workflowViewerCardRightExpr()} + 0.75rem + 4px)`,
      top: '50%',
      transform: 'translateY(-50%)'
    }
  }
  return {
    position: 'absolute',
    left: rail,
    top: '0',
    bottom: '0',
    width: '2px'
  }
}
