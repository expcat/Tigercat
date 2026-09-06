/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  countWorkflowStepsByStatus,
  EMPTY_WORKFLOW_TIMELINE_STEPS,
  getCurrentWorkflowStep,
  isWorkflowStepActive,
  isWorkflowStepPending,
  isWorkflowStepTerminal,
  isWorkflowTimelineTerminal,
  normalizeWorkflowTimelineSteps,
  sortWorkflowTimelineSteps,
  workflowStepHighlight,
  workflowStepsToTimelineItems,
  workflowStepStatusColor,
  WORKFLOW_STEP_STATUS_COLORS,
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
