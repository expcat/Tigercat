/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  buildWorkflowViewerTree,
  countWorkflowStepsByStatus,
  EMPTY_WORKFLOW_TIMELINE_STEPS,
  getCurrentWorkflowStep,
  getWorkflowActionConfirmCopy,
  getWorkflowCurrentPathKeys,
  getWorkflowRollbackStep,
  isWorkflowStepActive,
  isWorkflowStepPending,
  isWorkflowStepTerminal,
  isWorkflowTimelineTerminal,
  normalizeWorkflowTimelineSteps,
  resolveWorkflowActionButtonProps,
  resolveWorkflowSignMode,
  resolveWorkflowStepActors,
  resolveWorkflowStepKind,
  shouldConfirmWorkflowAction,
  shouldShowWorkflowActions,
  sortWorkflowActionBarItems,
  sortWorkflowTimelineSteps,
  workflowActorProgress,
  workflowActionNeedsConfirm,
  workflowSignModeLabel,
  workflowStepHighlight,
  workflowStepKindLabel,
  workflowStepsToTimelineItems,
  workflowStepStatusColor,
  workflowStepStatusLabel,
  workflowStepStatusTagVariant,
  WORKFLOW_STEP_STATUS_COLORS,
  type WorkflowActionBarItem,
  type WorkflowTimeline,
  type WorkflowTimelineStep
} from '@expcat/tigercat-core'

function step(partial: WorkflowTimelineStep): WorkflowTimelineStep {
  return partial
}

describe('normalizeWorkflowTimelineSteps', () => {
  it('returns the shared empty list for undefined or empty input', () => {
    expect(normalizeWorkflowTimelineSteps(undefined)).toBe(EMPTY_WORKFLOW_TIMELINE_STEPS)
    expect(normalizeWorkflowTimelineSteps([])).toBe(EMPTY_WORKFLOW_TIMELINE_STEPS)
  })

  it('defaults omitted and unknown status to pending and fills title from label', () => {
    const steps: WorkflowTimeline = [
      step({ key: 'a', label: 'Submit' }),
      step({ key: 'b', title: 'Review', status: 'active' }),
      step({ key: 'c', title: 'Bad', status: 'unknown' as WorkflowTimelineStep['status'] })
    ]

    const normalized = normalizeWorkflowTimelineSteps(steps)

    expect(
      normalized.map((item) => ({ key: item.key, status: item.status, title: item.title }))
    ).toEqual([
      { key: 'a', status: 'pending', title: 'Submit' },
      { key: 'b', status: 'active', title: 'Review' },
      { key: 'c', status: 'pending', title: 'Bad' }
    ])
  })

  it('stably sorts by order when present and keeps input order otherwise', () => {
    const unordered: WorkflowTimeline = [
      step({ key: 'c', title: 'C', order: 3 }),
      step({ key: 'a', title: 'A', order: 1 }),
      step({ key: 'b', title: 'B', order: 2 })
    ]

    expect(sortWorkflowTimelineSteps(unordered).map((item) => item.key)).toEqual(['a', 'b', 'c'])
    expect(normalizeWorkflowTimelineSteps(unordered).map((item) => item.key)).toEqual([
      'a',
      'b',
      'c'
    ])

    const tied: WorkflowTimeline = [
      step({ key: 'first', order: 1 }),
      step({ key: 'second', order: 1 }),
      step({ key: 'third', order: 2 })
    ]
    expect(sortWorkflowTimelineSteps(tied).map((item) => item.key)).toEqual([
      'first',
      'second',
      'third'
    ])

    const plain: WorkflowTimeline = [
      step({ key: 'later', title: 'Later' }),
      step({ key: 'earlier', title: 'Earlier' })
    ]
    expect(normalizeWorkflowTimelineSteps(plain).map((item) => item.key)).toEqual([
      'later',
      'earlier'
    ])
  })

  it('sorts missing order last when any sibling has order', () => {
    const steps: WorkflowTimeline = [
      step({ key: 'no-order' }),
      step({ key: 'first', order: 1 }),
      step({ key: 'also-missing' })
    ]

    expect(normalizeWorkflowTimelineSteps(steps).map((item) => item.key)).toEqual([
      'first',
      'no-order',
      'also-missing'
    ])
  })

  it('normalizes nested children without mutating the input tree', () => {
    const child = step({ key: 'cc', label: 'CC', order: 2 })
    const sibling = step({ key: 'parallel', label: 'Parallel', order: 1 })
    const input: WorkflowTimeline = [
      step({
        key: 'review',
        title: 'Review',
        status: 'active',
        actor: { id: 'u1', name: 'Ada' },
        children: [child, sibling]
      })
    ]

    const normalized = normalizeWorkflowTimelineSteps(input)

    expect(normalized[0]?.children?.map((item) => item.key)).toEqual(['parallel', 'cc'])
    expect(normalized[0]?.children?.[0]?.status).toBe('pending')
    expect(normalized[0]?.children?.[0]?.title).toBe('Parallel')
    expect(input[0]?.children).toEqual([child, sibling])
    expect(input[0]?.actor).toEqual({ id: 'u1', name: 'Ada' })
    expect(normalized[0]?.actor).toEqual({ id: 'u1', name: 'Ada' })
    expect(normalized[0]?.actor).not.toBe(input[0]?.actor)
  })
})

describe('workflow step selectors', () => {
  it('highlights pending and active steps and treats the rest as terminal', () => {
    expect(workflowStepHighlight(step({ key: 'a', status: 'active' }))).toBe('active')
    expect(workflowStepHighlight(step({ key: 'p' }))).toBe('pending')
    expect(workflowStepHighlight(step({ key: 'ok', status: 'approved' }))).toBe(null)
    expect(isWorkflowStepActive(step({ key: 'a', status: 'active' }))).toBe(true)
    expect(isWorkflowStepPending(step({ key: 'p' }))).toBe(true)
    expect(isWorkflowStepTerminal(step({ key: 'ok', status: 'approved' }))).toBe(true)
    expect(isWorkflowStepTerminal(step({ key: 'no', status: 'rejected' }))).toBe(true)
    expect(isWorkflowStepTerminal(step({ key: 'x', status: 'canceled' }))).toBe(true)
    expect(isWorkflowStepTerminal(step({ key: 'a', status: 'active' }))).toBe(false)
  })

  it('returns the first active step including nested children', () => {
    const steps: WorkflowTimeline = [
      step({
        key: 'submit',
        status: 'approved',
        children: [step({ key: 'cc', status: 'approved' })]
      }),
      step({
        key: 'manager',
        status: 'pending',
        children: [step({ key: 'now', status: 'active' })]
      }),
      step({ key: 'later', status: 'active' })
    ]

    expect(getCurrentWorkflowStep(steps)?.key).toBe('now')
    expect(getCurrentWorkflowStep([])).toBeUndefined()
    expect(getCurrentWorkflowStep(undefined)).toBeUndefined()
    expect(getCurrentWorkflowStep([step({ key: 'done', status: 'approved' })])).toBeUndefined()
  })

  it('detects terminal timelines and does not treat empty lists as terminal', () => {
    expect(isWorkflowTimelineTerminal(undefined)).toBe(false)
    expect(isWorkflowTimelineTerminal([])).toBe(false)

    expect(
      isWorkflowTimelineTerminal([
        step({ key: 'a', status: 'approved' }),
        step({ key: 'b', status: 'approved' })
      ])
    ).toBe(true)

    expect(
      isWorkflowTimelineTerminal([
        step({ key: 'a', status: 'approved' }),
        step({ key: 'b', status: 'rejected' }),
        step({ key: 'c', status: 'pending' })
      ])
    ).toBe(true)

    expect(
      isWorkflowTimelineTerminal([
        step({
          key: 'a',
          status: 'approved',
          children: [step({ key: 'cc', status: 'canceled' })]
        })
      ])
    ).toBe(true)

    expect(
      isWorkflowTimelineTerminal([
        step({ key: 'a', status: 'approved' }),
        step({ key: 'b', status: 'active' })
      ])
    ).toBe(false)
  })

  it('counts statuses including nested children', () => {
    expect(countWorkflowStepsByStatus(undefined)).toEqual({
      pending: 0,
      active: 0,
      approved: 0,
      rejected: 0,
      canceled: 0
    })

    const steps: WorkflowTimeline = [
      step({
        key: 'a',
        status: 'approved',
        children: [step({ key: 'cc' }), step({ key: 'skipped', status: 'canceled' })]
      }),
      step({ key: 'b', status: 'active' }),
      step({ key: 'c', status: 'rejected' })
    ]

    expect(countWorkflowStepsByStatus(steps)).toEqual({
      pending: 1,
      active: 1,
      approved: 1,
      rejected: 1,
      canceled: 1
    })
  })
})

describe('workflowStepsToTimelineItems', () => {
  it('maps an empty list to an empty TimelineItem array', () => {
    expect(workflowStepsToTimelineItems(undefined)).toEqual([])
    expect(workflowStepsToTimelineItems([])).toEqual([])
  })

  it('maps status onto TimelineItem color hints and copies time / title', () => {
    const items = workflowStepsToTimelineItems([
      step({
        key: 'review',
        title: 'Manager',
        status: 'approved',
        action: 'approve',
        comment: 'LGTM',
        time: '2026-09-07T01:00:00+08:00',
        actor: { id: 'u1', name: 'Ada', avatar: 'https://example.test/a.png' }
      }),
      step({ key: 'now', label: 'Director', status: 'active' }),
      step({ key: 'wait', title: 'VP', status: 'pending' }),
      step({ key: 'no', title: 'Reject', status: 'rejected' }),
      step({ key: 'stop', title: 'Cancel', status: 'canceled' })
    ])

    expect(
      items.map((item) => ({ key: item.key, color: item.color, status: item.status }))
    ).toEqual([
      { key: 'review', color: WORKFLOW_STEP_STATUS_COLORS.approved, status: 'approved' },
      { key: 'now', color: WORKFLOW_STEP_STATUS_COLORS.active, status: 'active' },
      { key: 'wait', color: WORKFLOW_STEP_STATUS_COLORS.pending, status: 'pending' },
      { key: 'no', color: WORKFLOW_STEP_STATUS_COLORS.rejected, status: 'rejected' },
      { key: 'stop', color: WORKFLOW_STEP_STATUS_COLORS.canceled, status: 'canceled' }
    ])
    expect(items[0]?.label).toBe('2026-09-07T01:00:00+08:00')
    expect(items[0]?.content).toBe('Manager')
    expect(items[0]?.step.comment).toBe('LGTM')
    expect(items[0]?.step.actor?.name).toBe('Ada')
    expect(items[1]?.content).toBe('Director')
    expect(typeof items[0]?.color).toBe('string')
    expect(workflowStepStatusColor('active')).toBe(WORKFLOW_STEP_STATUS_COLORS.active)
  })

  it('flattens nested children after their parent in display order', () => {
    const items = workflowStepsToTimelineItems([
      step({
        key: 'manager',
        title: 'Manager',
        status: 'active',
        children: [
          step({ key: 'cc-b', title: 'CC B', order: 2 }),
          step({ key: 'cc-a', title: 'CC A', order: 1 })
        ]
      }),
      step({ key: 'director', title: 'Director' })
    ])

    expect(items.map((item) => item.key)).toEqual(['manager', 'cc-a', 'cc-b', 'director'])
    expect(items[1]?.status).toBe('pending')
    expect(items[1]?.content).toBe('CC A')
  })
})

describe('workflow step status presentation', () => {
  it('maps status onto English labels and Tag variants', () => {
    expect(workflowStepStatusLabel('active')).toBe('Active')
    expect(workflowStepStatusTagVariant('approved')).toBe('success')
    expect(workflowStepStatusTagVariant('rejected')).toBe('danger')
    expect(workflowStepStatusTagVariant('pending')).toBe('default')
  })

  it('uses overlay labels when provided', () => {
    expect(workflowStepStatusLabel('approved', { approved: '已通过' })).toBe('已通过')
    expect(workflowStepStatusLabel('pending', { approved: '已通过' })).toBe('Pending')
  })

  it('uses ccNotified for terminal carbon-copy steps', () => {
    expect(workflowStepStatusLabel('approved', undefined, 'cc')).toBe('CC sent')
    expect(workflowStepStatusLabel('rejected', { ccNotified: '已抄送' }, 'cc')).toBe('已抄送')
    expect(workflowStepStatusLabel('canceled', { ccNotified: 'CC sent' }, 'cc')).toBe('CC sent')
    expect(workflowStepStatusLabel('active', { ccNotified: '已抄送' }, 'cc')).toBe('Active')
    expect(workflowStepStatusLabel('approved', { ccNotified: '已抄送' }, 'approve')).toBe(
      'Approved'
    )
  })
})

describe('resolveWorkflowStepActors', () => {
  it('prefers actors, wraps a singular actor, and returns empty when neither is set', () => {
    expect(resolveWorkflowStepActors(undefined)).toEqual([])
    expect(resolveWorkflowStepActors(step({ key: 'none' }))).toEqual([])
    expect(
      resolveWorkflowStepActors(step({ key: 'one', actor: { id: 'u1', name: 'Ada' } }))
    ).toEqual([{ id: 'u1', name: 'Ada' }])
    expect(
      resolveWorkflowStepActors(
        step({
          key: 'list',
          actors: [
            { id: 'u2', name: 'Lin' },
            { id: 'u3', name: 'Chen' }
          ]
        })
      ).map((actor) => actor.name)
    ).toEqual(['Lin', 'Chen'])
    expect(
      resolveWorkflowStepActors(
        step({
          key: 'both',
          actor: { id: 'u1', name: 'Ada' },
          actors: [{ id: 'u2', name: 'Lin' }]
        })
      )
    ).toEqual([{ id: 'u2', name: 'Lin' }])
    expect(
      resolveWorkflowStepActors(
        step({
          key: 'empty-list',
          actor: { id: 'u1', name: 'Ada' },
          actors: []
        })
      )
    ).toEqual([{ id: 'u1', name: 'Ada' }])
  })
})

describe('workflowActorProgress', () => {
  it('counts approved actors for countersign and ignores children', () => {
    expect(workflowActorProgress(undefined)).toEqual({ approved: 0, total: 0 })
    expect(workflowActorProgress(step({ key: 'none' }))).toEqual({ approved: 0, total: 0 })

    const countersign = step({
      key: 'manager',
      status: 'active',
      signMode: 'countersign',
      actors: [
        { id: 'u1', name: 'Lin', status: 'approved' },
        { id: 'u2', name: 'Chen', status: 'pending' }
      ],
      children: [
        { key: 'fake-a', title: 'Not an actor', status: 'approved' },
        { key: 'fake-b', title: 'Also not', status: 'approved' }
      ]
    })
    expect(workflowActorProgress(countersign)).toEqual({ approved: 1, total: 2 })
  })

  it('uses singular actor plus step status when there is no actors list', () => {
    expect(
      workflowActorProgress(step({ key: 'one', actor: { name: 'Ada' }, status: 'approved' }))
    ).toEqual({ approved: 1, total: 1 })
    expect(
      workflowActorProgress(step({ key: 'open', actor: { name: 'Ada' }, status: 'active' }))
    ).toEqual({ approved: 0, total: 1 })
    expect(
      workflowActorProgress(
        step({
          key: 'actor-status',
          actor: { name: 'Ada', status: 'approved' },
          status: 'pending'
        })
      )
    ).toEqual({ approved: 1, total: 1 })
  })
})

describe('resolveWorkflowActionButtonProps', () => {
  it('uses explicit variant and maps danger onto outline + danger', () => {
    expect(resolveWorkflowActionButtonProps({ action: 'approve', variant: 'ghost' })).toEqual({
      variant: 'ghost',
      danger: false
    })
    expect(resolveWorkflowActionButtonProps({ action: 'comment', variant: 'danger' })).toEqual({
      variant: 'outline',
      danger: true
    })
  })

  it('defaults variant from the action when variant is omitted', () => {
    expect(resolveWorkflowActionButtonProps({ action: 'approve' })).toEqual({
      variant: 'primary',
      danger: false
    })
    expect(resolveWorkflowActionButtonProps({ action: 'reject' })).toEqual({
      variant: 'outline',
      danger: true
    })
    expect(resolveWorkflowActionButtonProps({ action: 'cancel' })).toEqual({
      variant: 'outline',
      danger: true
    })
    expect(resolveWorkflowActionButtonProps({ action: 'comment' })).toEqual({
      variant: 'ghost',
      danger: false
    })
    expect(resolveWorkflowActionButtonProps({ action: 'transfer' })).toEqual({
      variant: 'outline',
      danger: false
    })
  })
})

describe('shouldShowWorkflowActions', () => {
  const actions: WorkflowActionBarItem[] = [{ key: 'approve', label: 'Approve', action: 'approve' }]
  const active: WorkflowTimeline = [step({ key: 'now', status: 'active' })]
  const pending: WorkflowTimeline = [step({ key: 'wait', status: 'pending' })]

  it('shows the bar when a step is active and actions exist', () => {
    expect(shouldShowWorkflowActions(active, actions)).toBe(true)
    expect(shouldShowWorkflowActions(pending, actions)).toBe(false)
    expect(shouldShowWorkflowActions(active, [])).toBe(false)
  })

  it('lets showActions force the bar on or off', () => {
    expect(shouldShowWorkflowActions(pending, actions, true)).toBe(true)
    expect(shouldShowWorkflowActions(active, actions, false)).toBe(false)
  })
})

describe('workflow step kind and sign mode', () => {
  it('defaults omitted kind to approve and sign mode to sequential', () => {
    expect(resolveWorkflowStepKind(step({ key: 'a' }))).toBe('approve')
    expect(resolveWorkflowSignMode(step({ key: 'a' }))).toBe('sequential')
    expect(resolveWorkflowStepKind(step({ key: 's', kind: 'start' }))).toBe('start')
    expect(resolveWorkflowSignMode(step({ key: 'c', signMode: 'countersign' }))).toBe('countersign')
    expect(resolveWorkflowStepKind(step({ key: 'bad', kind: 'gateway' as never }))).toBe('approve')
  })

  it('fills kind and signMode when normalizing', () => {
    const normalized = normalizeWorkflowTimelineSteps([
      step({ key: 'start', kind: 'start', title: 'Start' }),
      step({ key: 'cc', kind: 'cc', signMode: 'orsign' })
    ])
    expect(normalized.map((item) => ({ kind: item.kind, signMode: item.signMode }))).toEqual([
      { kind: 'start', signMode: 'sequential' },
      { kind: 'cc', signMode: 'orsign' }
    ])
  })

  it('reads kind and sign-mode labels from overlay', () => {
    expect(workflowStepKindLabel('cc')).toBe('CC')
    expect(workflowStepKindLabel('start', { kindStart: '发起' })).toBe('发起')
    expect(workflowSignModeLabel('countersign')).toBe('Countersign')
    expect(workflowSignModeLabel('orsign', { signOrsign: '或签' })).toBe('或签')
  })
})

describe('workflow action confirm recipe', () => {
  it('needs confirm for approve reject cancel transfer but not comment', () => {
    expect(workflowActionNeedsConfirm('approve')).toBe(true)
    expect(workflowActionNeedsConfirm('reject')).toBe(true)
    expect(workflowActionNeedsConfirm('cancel')).toBe(true)
    expect(workflowActionNeedsConfirm('transfer')).toBe(true)
    expect(workflowActionNeedsConfirm('comment')).toBe(false)
  })

  it('returns confirm copy and danger okType for reject and cancel', () => {
    expect(getWorkflowActionConfirmCopy('comment')).toBeNull()
    expect(getWorkflowActionConfirmCopy('approve')?.okType).toBe('primary')
    expect(getWorkflowActionConfirmCopy('reject')?.okType).toBe('danger')
    expect(getWorkflowActionConfirmCopy('reject', { confirmReject: '确认驳回？' })?.title).toBe(
      '确认驳回？'
    )
  })

  it('includes a reject description and drops the this-step wording', () => {
    const reject = getWorkflowActionConfirmCopy('reject')
    expect(reject?.okType).toBe('danger')
    expect(reject?.description).toBe('The requester will be notified.')
    expect(getWorkflowActionConfirmCopy('approve')?.title).toBe('Approve this request?')
    expect(getWorkflowActionConfirmCopy('approve')?.title).not.toMatch(/step/i)
    expect(getWorkflowActionConfirmCopy('transfer')?.title).not.toMatch(/step/i)
    expect(getWorkflowActionConfirmCopy('approve')?.description).toBeUndefined()
    expect(
      getWorkflowActionConfirmCopy('reject', undefined, { commentRequired: true })
        ?.commentPlaceholder
    ).toBe('Comment required')
  })

  it('sorts action-bar items approve reject transfer cancel comment without shuffling extras', () => {
    const items: WorkflowActionBarItem[] = [
      { key: 'c', label: 'Comment', action: 'comment' },
      { key: 't', label: 'Transfer', action: 'transfer' },
      { key: 'r', label: 'Reject', action: 'reject' },
      { key: 'a', label: 'Approve', action: 'approve' },
      { key: 'x', label: 'Extra', action: 'comment' },
      { key: 'n', label: 'Cancel', action: 'cancel' }
    ]
    expect(sortWorkflowActionBarItems(items).map((item) => item.key)).toEqual([
      'a',
      'r',
      't',
      'n',
      'c',
      'x'
    ])
    expect(items.map((item) => item.key)).toEqual(['c', 't', 'r', 'a', 'x', 'n'])
  })

  it('lets per-item confirm override the bar flag', () => {
    expect(shouldConfirmWorkflowAction({ action: 'approve' })).toBe(false)
    expect(shouldConfirmWorkflowAction({ action: 'approve' }, true)).toBe(true)
    expect(shouldConfirmWorkflowAction({ action: 'comment' }, true)).toBe(false)
    expect(shouldConfirmWorkflowAction({ action: 'reject', confirm: false }, true)).toBe(false)
    expect(shouldConfirmWorkflowAction({ action: 'reject', confirm: true }, false)).toBe(true)
  })
})

describe('workflow current path and rollback', () => {
  it('marks the path from start to the active step and parallel taken children', () => {
    const steps: WorkflowTimeline = [
      step({
        key: 'start',
        kind: 'start',
        status: 'approved',
        children: [step({ key: 'cc', kind: 'cc', status: 'canceled' })]
      }),
      step({
        key: 'manager',
        status: 'active',
        signMode: 'countersign',
        children: [step({ key: 'a', status: 'approved' }), step({ key: 'b', status: 'pending' })]
      }),
      step({ key: 'finance', status: 'pending' })
    ]

    expect([...getWorkflowCurrentPathKeys(steps)].sort()).toEqual([
      'a',
      'b',
      'cc',
      'manager',
      'start'
    ])
    expect(getWorkflowRollbackStep(steps)).toBeUndefined()
  })

  it('stops at the rollback point when no step is active', () => {
    const steps: WorkflowTimeline = [
      step({ key: 'start', kind: 'start', status: 'approved' }),
      step({ key: 'manager', status: 'rejected', rollbackPoint: true }),
      step({ key: 'finance', status: 'pending' })
    ]

    expect([...getWorkflowCurrentPathKeys(steps)]).toEqual(['start', 'manager'])
    expect(getWorkflowRollbackStep(steps)?.key).toBe('manager')
  })

  it('keeps untaken condition branches off the current path', () => {
    const steps: WorkflowTimeline = [
      step({ key: 'start', kind: 'start', status: 'approved' }),
      step({
        key: 'cond',
        kind: 'condition',
        status: 'approved',
        children: [
          step({ key: 'yes', title: '<=5000', status: 'approved' }),
          step({ key: 'no', title: '>5000', status: 'pending' })
        ]
      }),
      step({ key: 'now', status: 'active' })
    ]

    const keys = getWorkflowCurrentPathKeys(steps)
    expect(keys.has('yes')).toBe(true)
    expect(keys.has('no')).toBe(false)
    expect(keys.has('now')).toBe(true)
  })

  it('infers the last rejected step as the rollback point', () => {
    expect(getWorkflowRollbackStep(undefined)).toBeUndefined()
    expect(
      getWorkflowRollbackStep([
        step({ key: 'a', status: 'approved' }),
        step({ key: 'b', status: 'rejected' }),
        step({ key: 'c', status: 'rejected' })
      ])?.key
    ).toBe('c')
  })
})

describe('buildWorkflowViewerTree', () => {
  it('keeps children nested and annotates path plus rollback', () => {
    const tree = buildWorkflowViewerTree([
      step({
        key: 'start',
        kind: 'start',
        status: 'approved',
        children: [step({ key: 'cc', kind: 'cc', status: 'canceled' })]
      }),
      step({ key: 'reject', status: 'rejected' }),
      step({ key: 'later', status: 'pending' })
    ])

    expect(tree.map((node) => node.key)).toEqual(['start', 'reject', 'later'])
    expect(tree[0]?.children[0]?.kind).toBe('cc')
    expect(tree[0]?.onPath).toBe(true)
    expect(tree[1]?.rollbackPoint).toBe(true)
    expect(tree[1]?.onPath).toBe(true)
    expect(tree[2]?.onPath).toBe(false)
  })

  it('returns the shared empty list for missing steps', () => {
    expect(buildWorkflowViewerTree(undefined)).toEqual([])
    expect(buildWorkflowViewerTree([])).toEqual([])
  })
})
