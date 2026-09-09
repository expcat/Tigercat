/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  applyWorkflowDesignerView,
  buildWorkflowDesignerNodes,
  cloneWorkflowSteps,
  collectWorkflowStepKeys,
  createWorkflowDesignerStep,
  getWorkflowStepAtPath,
  insertWorkflowStepAfterPath,
  insertWorkflowStepAtPath,
  moveWorkflowStepAtPath,
  patchWorkflowStepAtPath,
  removeWorkflowStepAtPath,
  resolveWorkflowDesignerView
} from '@expcat/tigercat-core'
import {
  applyWorkflowDesignerView as applyFromSubpath,
  getWorkflowStepAtPath as getFromSubpath,
  insertWorkflowStepAfterPath as insertAfterFromSubpath
} from '@expcat/tigercat-core/workflow-designer'
import type { WorkflowTimelineStep } from '@expcat/tigercat-core'

const tree: WorkflowTimelineStep[] = [
  { key: 'start', kind: 'start', title: 'Submit' },
  {
    key: 'manager',
    title: 'Manager',
    signMode: 'countersign',
    children: [
      { key: 'a', title: 'Lin' },
      { key: 'b', title: 'Chen' }
    ]
  },
  { key: 'finance', title: 'Finance' }
]

describe('workflow-designer helpers', () => {
  it('clones the tree so source is not mutated', () => {
    const cloned = cloneWorkflowSteps(tree)
    cloned[1]!.title = 'Changed'
    cloned[1]!.children![0]!.title = 'Patched'
    expect(tree[1]?.title).toBe('Manager')
    expect(tree[1]?.children?.[0]?.title).toBe('Lin')
  })

  it('gets a nested step by path', () => {
    expect(getWorkflowStepAtPath(tree, ['manager', 'b'])?.title).toBe('Chen')
    expect(getWorkflowStepAtPath(tree, ['missing'])).toBeUndefined()
    expect(getWorkflowStepAtPath(tree, [])).toBeUndefined()
  })

  it('patches a nested title without dropping children', () => {
    const next = patchWorkflowStepAtPath(tree, ['manager'], { title: 'Director' })
    expect(next[1]?.title).toBe('Director')
    expect(next[1]?.children).toHaveLength(2)
    expect(tree[1]?.title).toBe('Manager')
  })

  it('inserts, moves, and removes steps at a parent path', () => {
    const created = createWorkflowDesignerStep(tree, { title: 'HR', kind: 'cc' })
    const withChild = insertWorkflowStepAtPath(tree, ['manager'], created)
    expect(withChild[1]?.children?.map((step) => step.key)).toEqual(['a', 'b', created.key])

    const moved = moveWorkflowStepAtPath(withChild, ['manager', 'b'], -1)
    expect(moved[1]?.children?.map((step) => step.key)).toEqual(['b', 'a', created.key])

    const removed = removeWorkflowStepAtPath(moved, ['manager', 'a'])
    expect(removed[1]?.children?.map((step) => step.key)).toEqual(['b', created.key])
  })

  it('creates unique keys that skip existing step-N ids', () => {
    const keys = collectWorkflowStepKeys(tree)
    expect(keys.has('manager')).toBe(true)
    const first = createWorkflowDesignerStep(tree)
    expect(first.key).toBe('step-1')
    const second = createWorkflowDesignerStep([...tree, first])
    expect(second.key).toBe('step-2')
  })

  it('resolves and applies a subpath edit list', () => {
    const view = resolveWorkflowDesignerView(tree, ['manager'])
    expect(view.valid).toBe(true)
    expect(view.list.map((step) => step.key)).toEqual(['a', 'b'])

    const edited = view.list.map((step) =>
      step.key === 'a' ? { ...step, title: 'Lin Wei' } : step
    )
    const next = applyWorkflowDesignerView(tree, ['manager'], edited)
    expect(next[1]?.children?.[0]?.title).toBe('Lin Wei')
    expect(next[0]?.title).toBe('Submit')
    expect(tree[1]?.children?.[0]?.title).toBe('Lin')
  })

  it('treats a missing subpath as invalid and does not write it', () => {
    const view = resolveWorkflowDesignerView(tree, ['ghost'])
    expect(view.valid).toBe(false)
    expect(view.list).toEqual([])
    const next = applyWorkflowDesignerView(tree, ['ghost'], [{ key: 'x', title: 'Nope' }])
    expect(next).toEqual(cloneWorkflowSteps(tree))
    expect(next[0]).not.toBe(tree[0])
  })

  it('builds designer nodes with full paths and move flags', () => {
    const nodes = buildWorkflowDesignerNodes(tree)
    expect(nodes[1]?.path).toEqual(['manager'])
    expect(nodes[1]?.children[0]?.path).toEqual(['manager', 'a'])
    expect(nodes[0]?.canMoveUp).toBe(false)
    expect(nodes[0]?.canMoveDown).toBe(true)
    expect(nodes[2]?.canMoveDown).toBe(false)
  })

  it('joins actor names from actors when building designer nodes', () => {
    const nodes = buildWorkflowDesignerNodes([
      {
        key: 'manager',
        title: 'Manager',
        actor: { name: 'Ada' },
        actors: [{ name: 'Lin' }, { name: 'Chen' }]
      }
    ])
    expect(nodes[0]?.actorNames).toEqual(['Lin', 'Chen'])
    expect(nodes[0]?.actorName).toBe('Lin, Chen')
  })

  it('inserts a sibling after the path instead of nesting a child', () => {
    const created = createWorkflowDesignerStep(tree, { title: 'HR', kind: 'cc' })
    const next = insertWorkflowStepAfterPath(tree, ['manager'], created)
    expect(next.map((item) => item.key)).toEqual(['start', 'manager', created.key, 'finance'])
    expect(next[1]?.children?.map((item) => item.key)).toEqual(['a', 'b'])
    expect(tree.map((item) => item.key)).toEqual(['start', 'manager', 'finance'])

    const nested = insertWorkflowStepAfterPath(tree, ['manager', 'a'], created)
    expect(nested[1]?.children?.map((item) => item.key)).toEqual(['a', created.key, 'b'])
  })

  it('re-exports path helpers from the tree-shake subpath', () => {
    expect(getFromSubpath(tree, ['finance'])?.title).toBe('Finance')
    const next = applyFromSubpath(tree, [], [{ key: 'only', title: 'One' }])
    expect(next).toEqual([{ key: 'only', title: 'One' }])
    const after = insertAfterFromSubpath(tree, ['start'], { key: 'extra', title: 'Extra' })
    expect(after.map((item) => item.key)).toEqual(['start', 'extra', 'manager', 'finance'])
  })
})
