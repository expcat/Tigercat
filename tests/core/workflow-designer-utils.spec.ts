/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  applyWorkflowDesignerView,
  buildWorkflowDesignerNodes,
  cloneWorkflowDesignerActors,
  cloneWorkflowDesignerStepWithNewKeys,
  cloneWorkflowSteps,
  collectWorkflowStepKeys,
  createWorkflowDesignerPaletteStep,
  createWorkflowDesignerStep,
  duplicateWorkflowStepAfterPath,
  findWorkflowDesignerNode,
  getWorkflowStepAtPath,
  insertWorkflowDesignerPaletteStep,
  insertWorkflowStepAfterPath,
  insertWorkflowStepAtPath,
  moveWorkflowStepAtPath,
  patchWorkflowDesignerButton,
  patchWorkflowStepAtPath,
  removeWorkflowStepAtPath,
  resolveWorkflowDesignerView,
  validateWorkflowDesigner,
  workflowDesignerApproverSourceFromStep,
  workflowDesignerApproverSummary,
  workflowDesignerEditableButtonPolicy,
  workflowDesignerFieldPermissionRows,
  workflowDesignerCanvasBaseStyles,
  workflowDesignerCardClasses,
  workflowDesignerChildrenClasses,
  workflowDesignerInsertRowClasses,
  workflowDesignerKindColor,
  workflowDesignerListClasses,
  workflowDesignerSignModeHint,
  tigercatPlugin
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

  it('patches actors and keeps actor in sync with the first name', () => {
    const next = patchWorkflowStepAtPath(tree, ['manager'], {
      actors: [{ name: 'Lin' }, { name: 'Chen' }]
    })
    expect(next[1]?.actors?.map((actor) => actor.name)).toEqual(['Lin', 'Chen'])
    expect(next[1]?.actor?.name).toBe('Lin')
    expect(next[1]?.children).toHaveLength(2)

    const cleared = patchWorkflowStepAtPath(next, ['manager'], { actors: [] })
    expect(cleared[1]?.actors).toBeUndefined()
    expect(cleared[1]?.actor).toBeUndefined()
  })

  it('finds a nested designer node by full path in a subpath view', () => {
    const nodes = buildWorkflowDesignerNodes(tree[1]!.children ?? [], ['manager'])
    expect(findWorkflowDesignerNode(nodes, ['manager', 'b'])?.title).toBe('Chen')
    expect(findWorkflowDesignerNode(nodes, ['manager'])).toBeUndefined()
  })

  it('maps kind colors and sign-mode hints', () => {
    expect(workflowDesignerKindColor('start')).not.toBe(workflowDesignerKindColor('condition'))
    expect(workflowDesignerKindColor('end')).not.toBe(workflowDesignerKindColor('cc'))
    expect(
      workflowDesignerSignModeHint('countersign', {
        signCountersignHint: 'all must approve',
        signOrsignHint: 'any one',
        signSequentialHint: 'one after another'
      })
    ).toBe('all must approve')
    expect(cloneWorkflowDesignerActors({ actor: { name: 'Ada' } })).toEqual([{ name: 'Ada' }])
  })

  it('inserts palette kinds as siblings after the path', () => {
    const result = insertWorkflowDesignerPaletteStep(tree, ['manager'], 'cc')
    expect(result.steps.map((item) => item.key)).toEqual([
      'start',
      'manager',
      result.path[0],
      'finance'
    ])
    expect(getWorkflowStepAtPath(result.steps, result.path)?.kind).toBe('cc')
    expect(result.steps[1]?.children?.map((item) => item.key)).toEqual(['a', 'b'])
  })

  it('creates a condition node with two branch stubs', () => {
    const created = createWorkflowDesignerPaletteStep(tree, 'condition')
    expect(created.kind).toBe('condition')
    expect(created.children).toHaveLength(2)
    expect(created.children?.every((child) => child.expression === '')).toBe(true)
  })

  it('copies a node after the path with new keys', () => {
    const next = duplicateWorkflowStepAfterPath(tree, ['manager'])
    expect(next.map((item) => item.key)).toEqual(['start', 'manager', 'manager-copy', 'finance'])
    expect(next[2]?.children?.map((item) => item.key)).toEqual(['a-copy', 'b-copy'])
    expect(tree.map((item) => item.key)).toEqual(['start', 'manager', 'finance'])
    const remapped = cloneWorkflowDesignerStepWithNewKeys(tree[1]!, next)
    expect(remapped.key).toBe('manager-copy-1')
  })

  it('blocks publish when start, end, approvers, or branches are missing', () => {
    const issues = validateWorkflowDesigner(tree)
    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(['missing_end', 'empty_approvers'])
    )
    expect(issues.every((issue) => issue.blocking)).toBe(true)

    const empty = validateWorkflowDesigner([])
    expect(empty.map((issue) => issue.code)).toEqual(['missing_start', 'missing_end'])

    const complete: WorkflowTimelineStep[] = [
      { key: 'start', kind: 'start', title: 'Start' },
      {
        key: 'manager',
        kind: 'approve',
        title: 'Manager',
        approverPolicy: { type: 'fixed', actors: [{ id: 'lin', name: 'Lin' }] }
      },
      {
        key: 'split',
        kind: 'condition',
        title: 'Amount',
        children: [
          { key: 'high', title: 'High', expression: 'amount > 1000' },
          { key: 'low', title: 'Low', expression: '' }
        ]
      },
      { key: 'end', kind: 'end', title: 'End' }
    ]
    expect(validateWorkflowDesigner(complete)).toEqual([])

    const noBranches = validateWorkflowDesigner([
      { key: 'start', kind: 'start' },
      { key: 'split', kind: 'condition', title: 'Split' },
      { key: 'end', kind: 'end' }
    ])
    expect(noBranches.some((issue) => issue.code === 'missing_branches')).toBe(true)
  })

  it('does not block empty approvers when empty policy skips', () => {
    const issues = validateWorkflowDesigner([
      { key: 'start', kind: 'start' },
      { key: 'manager', kind: 'approve', advanced: { emptyApprover: 'skip_pass' } },
      { key: 'end', kind: 'end' }
    ])
    expect(issues.some((issue) => issue.code === 'empty_approvers')).toBe(false)
  })

  it('blocks when every button is disabled', () => {
    const issues = validateWorkflowDesigner([
      { key: 'start', kind: 'start' },
      {
        key: 'manager',
        kind: 'approve',
        approverPolicy: { type: 'self' },
        buttonPolicy: {
          buttons: [
            { action: 'approve', enabled: false },
            { action: 'reject', enabled: false }
          ]
        }
      },
      { key: 'end', kind: 'end' }
    ])
    expect(issues.some((issue) => issue.code === 'buttons_all_disabled')).toBe(true)
  })

  it('summarizes approverPolicy and edits button / field matrices', () => {
    const step: WorkflowTimelineStep = {
      key: 'finance',
      kind: 'approve',
      approverPolicy: { type: 'role', key: 'finance' },
      buttonPolicy: {
        buttons: [{ action: 'approve', enabled: true, label: 'OK' }]
      },
      fieldPermissions: { amount: 'hidden' }
    }
    expect(workflowDesignerApproverSummary(step, { sourceRole: 'Role' })).toBe('Role: finance')
    expect(workflowDesignerApproverSourceFromStep(step).type).toBe('role')
    const buttons = patchWorkflowDesignerButton(
      workflowDesignerEditableButtonPolicy(step),
      'reject',
      {
        enabled: true,
        commentRequired: true
      }
    )
    expect(buttons.buttons.find((button) => button.action === 'reject')?.commentRequired).toBe(true)
    const rows = workflowDesignerFieldPermissionRows(
      {
        fields: [
          { name: 'amount', label: 'Amount' },
          { name: 'reason', label: 'Reason' }
        ]
      },
      step
    )
    expect(rows).toEqual([
      { name: 'amount', label: 'Amount', permission: 'hidden' },
      { name: 'reason', label: 'Reason', permission: 'readonly' }
    ])
  })
})

describe('WorkflowDesigner center-rail class tokens', () => {
  it('uses semantic flow/insert/children tokens without a left-edge spine', () => {
    expect(workflowDesignerListClasses).toBe('tiger-workflow-designer__flow')
    expect(workflowDesignerInsertRowClasses).toBe('tiger-workflow-designer__insert')
    expect(workflowDesignerChildrenClasses).toBe('tiger-workflow-designer__children')
    expect(workflowDesignerCardClasses).toContain('tiger-workflow-designer__card')
    expect(workflowDesignerListClasses).not.toMatch(/border-s-2/)
    expect(workflowDesignerInsertRowClasses).not.toMatch(/-ms-\[/)
    expect(workflowDesignerChildrenClasses).not.toMatch(/border-s-2/)
  })

  it('centers the canvas rail and insert control in plugin CSS', () => {
    expect(
      workflowDesignerCanvasBaseStyles['.tiger-workflow-designer__flow::before']
    ).toMatchObject({
      left: '50%',
      transform: 'translateX(-50%)',
      width: '0.125rem'
    })
    expect(workflowDesignerCanvasBaseStyles['.tiger-workflow-designer__insert']).toMatchObject({
      display: 'grid',
      gridTemplateColumns: '1fr auto 1fr'
    })
    expect(
      workflowDesignerCanvasBaseStyles['.tiger-workflow-designer__insert > :first-child']
    ).toMatchObject({
      gridColumn: '2',
      justifySelf: 'center'
    })
    expect(
      workflowDesignerCanvasBaseStyles['.tiger-workflow-designer__children']
    ).not.toHaveProperty('borderLeft')
    expect(
      workflowDesignerCanvasBaseStyles['.tiger-workflow-designer__children']
    ).not.toHaveProperty('borderInlineStart')
  })

  it('is injected by the default Tailwind plugin', () => {
    const rules: Record<string, unknown> = {}
    type PluginInstance = {
      handler: (api: { addBase: (rule: Record<string, unknown>) => void }) => void
    }
    const plugin = tigercatPlugin as unknown as PluginInstance
    plugin.handler({ addBase: (rule) => Object.assign(rules, rule) })
    expect(rules['.tiger-workflow-designer__flow::before']).toMatchObject({
      left: '50%',
      transform: 'translateX(-50%)'
    })
  })
})
