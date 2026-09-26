/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  buildWorkflowViewerTree,
  layoutWorkflowViewer,
  workflowViewerBarStyle,
  workflowViewerEdgeGridStyle,
  workflowViewerLoopMarkStyle,
  workflowViewerLoopPieceStyle
} from '@expcat/tigercat-core'
import type { WorkflowTimelineStep } from '@expcat/tigercat-core'

const approval: WorkflowTimelineStep[] = [
  { key: 'start', kind: 'start', title: 'Submit', status: 'approved' },
  { key: 'added', title: 'Expert', status: 'approved' },
  {
    key: 'cond',
    kind: 'condition',
    title: 'Amount',
    status: 'approved',
    children: [
      { key: 'low', title: 'Low', status: 'approved' },
      { key: 'high', title: 'High', status: 'pending' }
    ]
  },
  { key: 'manager', title: 'Manager', status: 'active', returnTarget: true },
  { key: 'finance', title: 'Finance', status: 'pending', loopTo: 'manager' }
]

describe('layoutWorkflowViewer', () => {
  it('returns a blank column for an empty tree', () => {
    expect(layoutWorkflowViewer([])).toEqual({
      columns: 1,
      rows: 0,
      placements: [],
      edges: [],
      hasFork: false,
      hasLoop: false
    })
  })

  it('places a linear list in one column with sequence edges', () => {
    const layout = layoutWorkflowViewer(
      buildWorkflowViewerTree([
        { key: 'a', title: 'A' },
        { key: 'b', title: 'B' }
      ])
    )
    expect(layout.columns).toBe(1)
    expect(layout.hasFork).toBe(false)
    expect(layout.placements.map((item) => [item.key, item.row, item.col, item.colSpan])).toEqual([
      ['a', 1, 1, 1],
      ['b', 2, 1, 1]
    ])
    expect(layout.edges).toEqual([
      expect.objectContaining({ kind: 'sequence', from: 'a', to: 'b', row: 1 })
    ])
  })

  it('fans condition children onto one row and rejoins the trunk', () => {
    const layout = layoutWorkflowViewer(buildWorkflowViewerTree(approval))
    const byKey = Object.fromEntries(layout.placements.map((item) => [item.key, item]))
    expect(layout.columns).toBe(2)
    expect(layout.hasFork).toBe(true)
    expect(byKey.cond?.colSpan).toBe(2)
    expect(byKey.low?.row).toBe(byKey.high?.row)
    expect(byKey.low?.col).not.toBe(byKey.high?.col)
    expect(byKey.low?.forkChild).toBe(true)
    expect(byKey.high?.forkChild).toBe(true)
    expect(byKey.manager?.row).toBe((byKey.low?.row ?? 0) + 1)
    expect(byKey.start?.colSpan).toBe(2)
    const fork = layout.edges.find((edge) => edge.kind === 'fork')
    expect(fork).toMatchObject({ from: 'cond', colSpan: 2, insetStart: 25, insetEnd: 25 })
    const axis = 'calc(1 * (100% - 1 * var(--tiger-workflow-branch-gap, 0.75rem)) / 4)'
    expect(workflowViewerBarStyle(fork!)).toEqual({ left: axis, right: axis })
    const join = layout.edges.find((edge) => edge.kind === 'join' && edge.to === 'manager')
    expect(join).toBeTruthy()
    expect(workflowViewerBarStyle(join!)).toEqual({ left: axis, right: axis })
    const risers = layout.edges.filter((edge) => edge.kind === 'riser')
    expect(risers.map((edge) => edge.from).sort()).toEqual(['high', 'low'])
    expect(risers.every((edge) => edge.row === edge.rowEnd && edge.row === join?.row)).toBe(true)
    expect(workflowViewerEdgeGridStyle(risers[0]!).gridRow).toBe(
      `${workflowViewerEdgeGridStyle(join!).gridRow} / ${Number(workflowViewerEdgeGridStyle(join!).gridRow) + 1}`
    )
    expect(workflowViewerLoopPieceStyle('arm-start')).toMatchObject({
      alignSelf: 'center',
      height: '2px',
      width: '100%'
    })
    expect(workflowViewerLoopMarkStyle('arm-start').left).toBe(
      'calc(50% + min(50%, var(--tiger-workflow-card-half, 9rem)))'
    )
    expect(workflowViewerLoopMarkStyle('stem-start').left).toBe(
      'calc(50% + min(50%, var(--tiger-workflow-card-half, 9rem)) + 0.75rem)'
    )
    expect(workflowViewerLoopPieceStyle('stem-start').alignSelf).toBe('end')
    expect(workflowViewerLoopPieceStyle('stem-end').alignSelf).toBe('start')
  })

  it('draws a loop edge for loopTo and ignores unknown or self targets', () => {
    const layout = layoutWorkflowViewer(buildWorkflowViewerTree(approval))
    expect(layout.hasLoop).toBe(true)
    expect(layout.edges.filter((edge) => edge.kind === 'loop')).toEqual([
      expect.objectContaining({ from: 'finance', to: 'manager' })
    ])

    const ignored = layoutWorkflowViewer(
      buildWorkflowViewerTree([
        { key: 'a', title: 'A', loopTo: 'missing' },
        { key: 'b', title: 'B', loopTo: 'b' }
      ])
    )
    expect(ignored.hasLoop).toBe(false)
  })

  it('keeps a single child on the parent column', () => {
    const layout = layoutWorkflowViewer(
      buildWorkflowViewerTree([
        {
          key: 'parent',
          title: 'Parent',
          children: [{ key: 'only', title: 'Only' }]
        }
      ])
    )
    expect(layout.hasFork).toBe(false)
    expect(layout.columns).toBe(1)
    expect(layout.placements.map((item) => item.key)).toEqual(['parent', 'only'])
    expect(layout.placements.every((item) => item.forkChild === false)).toBe(true)
    expect(layout.edges).toEqual([
      expect.objectContaining({ kind: 'sequence', from: 'parent', to: 'only' })
    ])
  })
})
