/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  assertWorkflowActionComment,
  getWorkflowReturnCandidates,
  isWorkflowAddsignAfterAllowed,
  reduceWorkflowAction,
  resolveWorkflowButtonPolicy,
  workflowActorProgress,
  workflowButtonCommentRequired,
  workflowInstanceUsesTasks,
  type WorkflowInstance,
  type WorkflowRuntimeAction,
  type WorkflowTask,
  type WorkflowTimelineActor,
  type WorkflowTimelineStep
} from '@expcat/tigercat-core'

const ada: WorkflowTimelineActor = { id: 'ada', name: 'Ada' }
const lin: WorkflowTimelineActor = { id: 'lin', name: 'Lin' }
const chen: WorkflowTimelineActor = { id: 'chen', name: 'Chen' }
const wu: WorkflowTimelineActor = { id: 'wu', name: 'Wu' }
const expert: WorkflowTimelineActor = { id: 'expert', name: 'Expert' }

function task(
  partial: Pick<WorkflowTask, 'id' | 'nodeKey' | 'assignee'> & Partial<WorkflowTask>
): WorkflowTask {
  return { status: 'pending', origin: 'definition', ...partial }
}

function instance(
  partial: Partial<WorkflowInstance> & { steps: WorkflowTimelineStep[] }
): WorkflowInstance {
  return { status: 'active', history: [], ...partial }
}

function act(
  inst: WorkflowInstance,
  action: WorkflowRuntimeAction['action'],
  extra: Omit<WorkflowRuntimeAction, 'action'> = {}
): WorkflowInstance {
  return reduceWorkflowAction(inst, { action, at: '2026-09-10T00:00:00Z', ...extra })
}

function nodeOf(inst: WorkflowInstance, key: string): WorkflowTimelineStep | undefined {
  const visit = (list: WorkflowTimelineStep[]): WorkflowTimelineStep | undefined => {
    for (const step of list) {
      if (step.key === key) return step
      if (step.children) {
        const nested = visit(step.children)
        if (nested) return nested
      }
    }
    return undefined
  }
  return visit(inst.steps)
}

function tasksOf(inst: WorkflowInstance, nodeKey: string): WorkflowTask[] {
  return (inst.tasks ?? []).filter((item) => item.nodeKey === nodeKey)
}

describe('assertWorkflowActionComment', () => {
  it('passes when not required and blocks empty when required', () => {
    expect(assertWorkflowActionComment(undefined, false)).toBe(true)
    expect(assertWorkflowActionComment('  ', false)).toBe(true)
    expect(assertWorkflowActionComment(undefined, true)).toBe(false)
    expect(assertWorkflowActionComment('   ', true)).toBe(false)
    expect(assertWorkflowActionComment('looks good', true)).toBe(true)
  })

  it('reads commentRequired from button policy with reject/return defaults', () => {
    expect(workflowButtonCommentRequired(undefined, 'approve')).toBe(false)
    expect(workflowButtonCommentRequired(undefined, 'reject')).toBe(true)
    expect(workflowButtonCommentRequired(undefined, 'return')).toBe(true)
    expect(
      workflowButtonCommentRequired(
        {
          buttonPolicy: {
            buttons: [{ action: 'approve', enabled: true, commentRequired: true }]
          }
        },
        'approve'
      )
    ).toBe(true)
    expect(resolveWorkflowButtonPolicy(undefined).buttons.map((button) => button.action)).toEqual([
      'approve',
      'reject',
      'transfer',
      'cancel',
      'comment'
    ])
  })
})

describe('reduceWorkflowAction — no tasks (2.4.2 node-level)', () => {
  const linear = (): WorkflowInstance =>
    instance({
      cursor: { nodeKey: 'mgr' },
      starter: ada,
      steps: [
        { key: 'start', kind: 'start', title: 'Start', status: 'approved', actor: ada },
        { key: 'mgr', kind: 'approve', title: 'Manager', status: 'active', actor: lin },
        { key: 'fin', kind: 'approve', title: 'Finance', status: 'pending', actor: chen }
      ]
    })

  it('approve advances the current node and does not invent tasks', () => {
    const next = act(linear(), 'approve', { actorId: 'lin', comment: 'ok' })
    expect(workflowInstanceUsesTasks(next)).toBe(false)
    expect(nodeOf(next, 'mgr')?.status).toBe('approved')
    expect(nodeOf(next, 'fin')?.status).toBe('active')
    expect(next.cursor).toEqual({ nodeKey: 'fin' })
    expect(next.status).toBe('active')
    expect(next.history?.at(-1)?.action).toBe('approve')
  })

  it('approve on the last node completes the instance', () => {
    const started = linear()
    const mid = act(started, 'approve', { actorId: 'lin' })
    const done = act(mid, 'approve', { actorId: 'chen', nodeKey: 'fin' })
    expect(done.status).toBe('approved')
    expect(nodeOf(done, 'fin')?.status).toBe('approved')
  })

  it('reject terminates the instance', () => {
    const next = act(linear(), 'reject', { actorId: 'lin', comment: 'no' })
    expect(next.status).toBe('rejected')
    expect(nodeOf(next, 'mgr')?.status).toBe('rejected')
    expect(nodeOf(next, 'fin')?.status).toBe('pending')
    expect(next).not.toBe(linear())
  })

  it('transfer swaps the actor and does not advance', () => {
    const next = act(linear(), 'transfer', { actorId: 'lin', assignee: wu })
    expect(next.cursor).toEqual({ nodeKey: 'mgr' })
    expect(nodeOf(next, 'mgr')?.status).toBe('active')
    expect(nodeOf(next, 'mgr')?.actor).toMatchObject({ id: 'wu' })
    expect(nodeOf(next, 'fin')?.status).toBe('pending')
  })

  it('comment writes history only', () => {
    const src = linear()
    const next = act(src, 'comment', { actorId: 'lin', comment: 'note' })
    expect(next.status).toBe('active')
    expect(nodeOf(next, 'mgr')?.status).toBe('active')
    expect(next.history?.at(-1)).toMatchObject({ action: 'comment', comment: 'note' })
    expect(src.history).toEqual([])
  })

  it('cancel terminates when the starter withdraws', () => {
    const next = act(linear(), 'cancel', { actorId: 'ada' })
    expect(next.status).toBe('canceled')
    expect(nodeOf(next, 'mgr')?.status).toBe('canceled')
  })

  it('cancel from a non-starter is a no-op', () => {
    const src = linear()
    expect(act(src, 'cancel', { actorId: 'lin' })).toBe(src)
  })

  it('inserts a before-addsign node and restores after it passes', () => {
    const added = act(linear(), 'addsign', {
      actorId: 'lin',
      position: 'before',
      assignees: [expert],
      tempNodeKey: 'add-before'
    })
    expect(added.steps.map((step) => step.key)).toEqual(['start', 'add-before', 'mgr', 'fin'])
    expect(nodeOf(added, 'add-before')?.temporary).toBe(true)
    expect(nodeOf(added, 'add-before')?.status).toBe('active')
    expect(nodeOf(added, 'mgr')?.status).toBe('pending')
    expect(added.cursor).toEqual({ nodeKey: 'add-before' })

    const restored = act(added, 'approve', { actorId: 'expert', nodeKey: 'add-before' })
    expect(nodeOf(restored, 'add-before')?.status).toBe('approved')
    expect(nodeOf(restored, 'mgr')?.status).toBe('active')
    expect(restored.cursor).toEqual({ nodeKey: 'mgr' })
  })

  it('inserts an after-addsign node and then continues', () => {
    const added = act(linear(), 'addsign', {
      actorId: 'lin',
      position: 'after',
      assignees: [expert],
      tempNodeKey: 'add-after'
    })
    expect(added.steps.map((step) => step.key)).toEqual(['start', 'mgr', 'add-after', 'fin'])
    expect(nodeOf(added, 'mgr')?.status).toBe('approved')
    expect(nodeOf(added, 'add-after')?.status).toBe('active')
    const done = act(added, 'approve', { actorId: 'expert', nodeKey: 'add-after' })
    expect(nodeOf(done, 'fin')?.status).toBe('active')
  })
})

describe('reduceWorkflowAction — countersign 2/3', () => {
  const countersign = (): WorkflowInstance =>
    instance({
      cursor: { nodeKey: 'cs' },
      starter: ada,
      steps: [
        { key: 'start', kind: 'start', status: 'approved', actor: ada },
        {
          key: 'cs',
          kind: 'approve',
          status: 'active',
          signMode: 'countersign',
          actors: [lin, chen, wu]
        },
        { key: 'end', kind: 'approve', status: 'pending', actor: ada }
      ],
      tasks: [
        task({ id: 't-lin', nodeKey: 'cs', assignee: lin }),
        task({ id: 't-chen', nodeKey: 'cs', assignee: chen }),
        task({ id: 't-wu', nodeKey: 'cs', assignee: wu })
      ]
    })

  it('keeps the node open at 2/3 and completes on the third approve', () => {
    const src = countersign()
    expect(workflowActorProgress(nodeOf(src, 'cs'), src.tasks)).toEqual({ approved: 0, total: 3 })
    const one = act(src, 'approve', { actorId: 'lin', taskId: 't-lin' })
    expect(workflowActorProgress(nodeOf(one, 'cs'), one.tasks)).toEqual({ approved: 1, total: 3 })
    expect(nodeOf(one, 'cs')?.status).toBe('active')
    const two = act(one, 'approve', { actorId: 'chen', taskId: 't-chen' })
    expect(workflowActorProgress(nodeOf(two, 'cs'), two.tasks)).toEqual({ approved: 2, total: 3 })
    expect(two.cursor).toEqual({ nodeKey: 'cs' })
    const three = act(two, 'approve', { actorId: 'wu', taskId: 't-wu' })
    expect(workflowActorProgress(nodeOf(three, 'cs'), three.tasks)).toEqual({
      approved: 3,
      total: 3
    })
    expect(nodeOf(three, 'cs')?.status).toBe('approved')
    expect(three.cursor).toEqual({ nodeKey: 'end' })
  })

  it('rejects the instance when one countersigner rejects', () => {
    const one = act(countersign(), 'approve', { actorId: 'lin', taskId: 't-lin' })
    const rejected = act(one, 'reject', { actorId: 'chen', taskId: 't-chen', comment: 'no' })
    expect(rejected.status).toBe('rejected')
    expect(tasksOf(rejected, 'cs').find((item) => item.id === 't-wu')?.status).toBe('canceled')
  })
})

describe('reduceWorkflowAction — orsign closes siblings', () => {
  it('approves the node and cancels the other pending task', () => {
    const src = instance({
      cursor: { nodeKey: 'or' },
      steps: [
        { key: 'start', kind: 'start', status: 'approved' },
        {
          key: 'or',
          kind: 'approve',
          status: 'active',
          signMode: 'orsign',
          actors: [lin, chen]
        }
      ],
      tasks: [
        task({ id: 't-lin', nodeKey: 'or', assignee: lin }),
        task({ id: 't-chen', nodeKey: 'or', assignee: chen })
      ]
    })
    const next = act(src, 'approve', { actorId: 'lin', taskId: 't-lin' })
    expect(nodeOf(next, 'or')?.status).toBe('approved')
    expect(next.status).toBe('approved')
    expect(tasksOf(next, 'or').find((item) => item.id === 't-chen')?.status).toBe('canceled')
  })
})

describe('reduceWorkflowAction — sequential', () => {
  it('wakes the next assignee and only then completes the node', () => {
    const src = instance({
      cursor: { nodeKey: 'seq' },
      steps: [
        {
          key: 'seq',
          kind: 'approve',
          status: 'active',
          signMode: 'sequential',
          actors: [lin, chen]
        }
      ],
      tasks: [
        task({ id: 't-lin', nodeKey: 'seq', assignee: lin, status: 'active' }),
        task({ id: 't-chen', nodeKey: 'seq', assignee: chen, status: 'pending' })
      ]
    })
    const first = act(src, 'approve', { actorId: 'lin', taskId: 't-lin' })
    expect(nodeOf(first, 'seq')?.status).toBe('active')
    expect(tasksOf(first, 'seq').find((item) => item.id === 't-chen')?.status).toBe('active')
    const second = act(first, 'approve', { actorId: 'chen', taskId: 't-chen' })
    expect(nodeOf(second, 'seq')?.status).toBe('approved')
    expect(second.status).toBe('approved')
  })
})

describe('reduceWorkflowAction — transfer / comment / cancel with tasks', () => {
  const pendingLin = (): WorkflowInstance =>
    instance({
      cursor: { nodeKey: 'mgr' },
      starter: ada,
      steps: [
        { key: 'start', kind: 'start', status: 'approved', actor: ada },
        { key: 'mgr', kind: 'approve', status: 'active', actors: [lin] }
      ],
      tasks: [task({ id: 't-lin', nodeKey: 'mgr', assignee: lin })]
    })

  it('transfer changes assignee and does not advance', () => {
    const next = act(pendingLin(), 'transfer', {
      actorId: 'lin',
      taskId: 't-lin',
      assignee: wu
    })
    expect(next.cursor).toEqual({ nodeKey: 'mgr' })
    expect(nodeOf(next, 'mgr')?.status).toBe('active')
    expect(tasksOf(next, 'mgr')[0]?.assignee.id).toBe('wu')
    expect(tasksOf(next, 'mgr')[0]?.origin).toBe('transfer')
  })

  it('comment does not change task status', () => {
    const next = act(pendingLin(), 'comment', { actorId: 'lin', comment: 'fyi' })
    expect(tasksOf(next, 'mgr')[0]?.status).toBe('pending')
    expect(nodeOf(next, 'mgr')?.status).toBe('active')
  })

  it('cancel from the starter cancels open tasks', () => {
    const next = act(pendingLin(), 'cancel', { actorId: 'ada' })
    expect(next.status).toBe('canceled')
    expect(tasksOf(next, 'mgr')[0]?.status).toBe('canceled')
  })
})

describe('reduceWorkflowAction — addsign insert', () => {
  const countersign = (): WorkflowInstance =>
    instance({
      cursor: { nodeKey: 'cs' },
      steps: [
        { key: 'start', kind: 'start', status: 'approved' },
        {
          key: 'cs',
          kind: 'approve',
          status: 'active',
          signMode: 'countersign',
          actors: [lin, chen, wu]
        },
        { key: 'end', kind: 'approve', status: 'pending' }
      ],
      tasks: [
        task({ id: 't-lin', nodeKey: 'cs', assignee: lin }),
        task({ id: 't-chen', nodeKey: 'cs', assignee: chen }),
        task({ id: 't-wu', nodeKey: 'cs', assignee: wu })
      ]
    })

  it('before-addsign blocks only the operator and restores that task', () => {
    const added = act(countersign(), 'addsign', {
      actorId: 'lin',
      taskId: 't-lin',
      position: 'before',
      assignees: [expert],
      tempNodeKey: 'n-star'
    })
    expect(added.steps.map((step) => step.key)).toEqual(['start', 'n-star', 'cs', 'end'])
    expect(tasksOf(added, 'cs').find((item) => item.id === 't-lin')?.status).toBe('blocked')
    expect(tasksOf(added, 'cs').find((item) => item.id === 't-chen')?.status).toBe('pending')
    expect(tasksOf(added, 'n-star')[0]?.assignee.id).toBe('expert')
    expect(nodeOf(added, 'n-star')?.origin).toMatchObject({
      type: 'addsign',
      position: 'before',
      fromTaskId: 't-lin'
    })

    const restored = act(added, 'approve', { actorId: 'expert', nodeKey: 'n-star' })
    expect(tasksOf(restored, 'cs').find((item) => item.id === 't-lin')?.status).toBe('pending')
    expect(restored.cursor).toEqual({ nodeKey: 'cs' })
    expect(nodeOf(restored, 'cs')?.status).toBe('active')
  })

  it('after-addsign from a non-last countersigner parks the intent', () => {
    const added = act(countersign(), 'addsign', {
      actorId: 'lin',
      taskId: 't-lin',
      position: 'after',
      assignees: [expert],
      tempNodeKey: 'n-after'
    })
    expect(tasksOf(added, 'cs').find((item) => item.id === 't-lin')?.status).toBe('approved')
    expect(nodeOf(added, 'cs')?.pendingAfterAddsign?.assignees[0]?.id).toBe('expert')
    expect(added.steps.map((step) => step.key)).toEqual(['start', 'cs', 'end'])

    const two = act(added, 'approve', { actorId: 'chen', taskId: 't-chen' })
    const last = act(two, 'approve', { actorId: 'wu', taskId: 't-wu' })
    expect(last.steps.map((step) => step.key)).toEqual(['start', 'cs', 'n-after', 'end'])
    expect(last.cursor).toEqual({ nodeKey: 'n-after' })
  })

  it('after-addsign from the last countersigner inserts immediately', () => {
    const src = countersign()
    const one = act(src, 'approve', { actorId: 'lin', taskId: 't-lin' })
    const two = act(one, 'approve', { actorId: 'chen', taskId: 't-chen' })
    expect(isWorkflowAddsignAfterAllowed(nodeOf(two, 'cs')!, two.tasks, 't-wu')).toBe(true)
    const added = act(two, 'addsign', {
      actorId: 'wu',
      taskId: 't-wu',
      position: 'after',
      assignees: [expert],
      tempNodeKey: 'n-last'
    })
    expect(added.steps.map((step) => step.key)).toEqual(['start', 'cs', 'n-last', 'end'])
    expect(nodeOf(added, 'cs')?.status).toBe('approved')
  })

  it('rejects after-addsign on orsign with two people', () => {
    const src = instance({
      cursor: { nodeKey: 'or' },
      steps: [
        {
          key: 'or',
          kind: 'approve',
          status: 'active',
          signMode: 'orsign',
          actors: [lin, chen]
        }
      ],
      tasks: [
        task({ id: 't-lin', nodeKey: 'or', assignee: lin }),
        task({ id: 't-chen', nodeKey: 'or', assignee: chen })
      ]
    })
    expect(isWorkflowAddsignAfterAllowed(src.steps[0]!, src.tasks, 't-lin')).toBe(false)
    expect(
      act(src, 'addsign', {
        actorId: 'lin',
        taskId: 't-lin',
        position: 'after',
        assignees: [expert]
      })
    ).toBe(src)
  })

  it('rejects addsign when the assignee is the operator', () => {
    const src = countersign()
    expect(act(src, 'addsign', { actorId: 'lin', taskId: 't-lin', assignees: [lin] })).toBe(src)
  })
})

describe('reduceWorkflowAction — return path', () => {
  const chain = (): WorkflowInstance =>
    instance({
      cursor: { nodeKey: 'c' },
      starter: ada,
      steps: [
        { key: 'start', kind: 'start', status: 'approved', actor: ada },
        { key: 'a', kind: 'approve', status: 'approved', actors: [lin] },
        { key: 'b', kind: 'approve', status: 'approved', actors: [chen] },
        { key: 'c', kind: 'approve', status: 'active', actors: [wu] }
      ],
      tasks: [
        task({ id: 't-lin', nodeKey: 'a', assignee: lin, status: 'approved' }),
        task({ id: 't-chen', nodeKey: 'b', assignee: chen, status: 'approved' }),
        task({ id: 't-wu', nodeKey: 'c', assignee: wu, status: 'pending' })
      ]
    })

  it('lists start plus approved approve nodes as return candidates', () => {
    const keys = getWorkflowReturnCandidates(chain()).map((step) => step.key)
    expect(keys).toEqual(['start', 'a', 'b'])
  })

  it('resequence rebuilds pending tasks from the target through the returner', () => {
    const next = act(chain(), 'return', {
      actorId: 'wu',
      taskId: 't-wu',
      targetNodeKey: 'a',
      resume: 'resequence',
      comment: 'please redo'
    })
    expect(next.cursor).toEqual({ nodeKey: 'a' })
    expect(nodeOf(next, 'a')?.status).toBe('active')
    expect(nodeOf(next, 'b')?.status).toBe('pending')
    expect(nodeOf(next, 'c')?.status).toBe('pending')
    expect(tasksOf(next, 'a')[0]?.status).toBe('active')
    expect(tasksOf(next, 'b')[0]?.status).toBe('pending')
    expect(next.resumeToNodeKey).toBeUndefined()

    const afterA = act(next, 'approve', { actorId: 'lin', nodeKey: 'a' })
    expect(afterA.cursor).toEqual({ nodeKey: 'b' })
    const afterB = act(afterA, 'approve', { actorId: 'chen', nodeKey: 'b' })
    expect(afterB.cursor).toEqual({ nodeKey: 'c' })
  })

  it('direct return skips intermediates and jumps back to the returner', () => {
    const next = act(chain(), 'return', {
      actorId: 'wu',
      taskId: 't-wu',
      targetNodeKey: 'a',
      resume: 'direct'
    })
    expect(next.cursor).toEqual({ nodeKey: 'a' })
    expect(next.resumeToNodeKey).toBe('c')
    expect(nodeOf(next, 'b')?.status).toBe('approved')
    expect(tasksOf(next, 'b')[0]?.status).toBe('approved')
    expect(tasksOf(next, 'c')[0]?.status).toBe('pending')

    const afterA = act(next, 'approve', { actorId: 'lin', nodeKey: 'a' })
    expect(afterA.cursor).toEqual({ nodeKey: 'c' })
    expect(nodeOf(afterA, 'b')?.status).toBe('approved')
    expect(afterA.resumeToNodeKey).toBeUndefined()
  })

  it('request_changes is return to start with direct resume', () => {
    const next = act(chain(), 'request_changes', {
      actorId: 'wu',
      taskId: 't-wu',
      comment: 'edit amount'
    })
    expect(next.cursor).toEqual({ nodeKey: 'start' })
    expect(next.resumeToNodeKey).toBe('c')
    expect(next.history?.at(-1)?.action).toBe('request_changes')
    const resubmitted = act(next, 'approve', { actorId: 'ada', nodeKey: 'start' })
    expect(resubmitted.cursor).toEqual({ nodeKey: 'c' })
  })
})

describe('workflowActorProgress prefers tasks', () => {
  it('counts tasks for a node and falls back to actors when tasks are omitted', () => {
    const step: WorkflowTimelineStep = {
      key: 'cs',
      actors: [
        { id: 'lin', name: 'Lin', status: 'approved' },
        { id: 'chen', name: 'Chen', status: 'pending' }
      ]
    }
    expect(workflowActorProgress(step)).toEqual({ approved: 1, total: 2 })
    expect(
      workflowActorProgress(step, [
        task({ id: 't-lin', nodeKey: 'cs', assignee: lin, status: 'approved' }),
        task({ id: 't-chen', nodeKey: 'cs', assignee: chen, status: 'pending' }),
        task({ id: 't-wu', nodeKey: 'cs', assignee: wu, status: 'pending' })
      ])
    ).toEqual({ approved: 1, total: 3 })
    expect(
      workflowActorProgress({
        ...step,
        tasks: [
          task({ id: 't-lin', nodeKey: 'cs', assignee: lin, status: 'approved' }),
          task({ id: 't-chen', nodeKey: 'cs', assignee: chen, status: 'approved' })
        ]
      })
    ).toEqual({ approved: 2, total: 2 })
  })
})

describe('reduceWorkflowAction — purity and no-ops', () => {
  it('does not mutate the input instance', () => {
    const src = instance({
      cursor: { nodeKey: 'mgr' },
      steps: [{ key: 'mgr', kind: 'approve', status: 'active', actor: lin }]
    })
    const snapshot = JSON.stringify(src)
    act(src, 'approve', { actorId: 'lin' })
    expect(JSON.stringify(src)).toBe(snapshot)
  })

  it('returns the same reference for illegal actions', () => {
    const src = instance({
      cursor: { nodeKey: 'mgr' },
      steps: [{ key: 'mgr', kind: 'approve', status: 'active', actor: lin }]
    })
    expect(act(src, 'transfer', { actorId: 'lin' })).toBe(src)
    expect(act(src, 'addsign', { actorId: 'lin', assignees: [] })).toBe(src)
    expect(act(src, 'return', { actorId: 'lin', targetNodeKey: 'missing' })).toBe(src)
  })

  it('does not run approve/reject after the instance is terminal', () => {
    const src = instance({
      status: 'rejected',
      cursor: { nodeKey: 'mgr' },
      steps: [{ key: 'mgr', kind: 'approve', status: 'rejected' }]
    })
    expect(act(src, 'approve', { actorId: 'lin' })).toBe(src)
    const commented = act(src, 'comment', { actorId: 'ada', comment: 'closed' })
    expect(commented.history?.at(-1)?.action).toBe('comment')
    expect(commented.status).toBe('rejected')
  })
})
