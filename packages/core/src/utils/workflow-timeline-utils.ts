/**
 * Framework-agnostic helpers for approval / workflow timelines.
 * Normalize, select, and convert {@link WorkflowTimelineStep} lists onto
 * existing {@link TimelineItem}.
 */

import type { ButtonVariant } from '../types/button'
import type { TagVariant } from '../types/tag'
import type { TimelineItem } from '../types/timeline'
import type {
  WorkflowActionBarItem,
  WorkflowTimelineStep,
  WorkflowTimelineStepStatus
} from '../types/workflow-timeline'

export const EMPTY_WORKFLOW_TIMELINE_STEPS: WorkflowTimelineStep[] = []

export const EMPTY_WORKFLOW_ACTION_BAR_ITEMS: WorkflowActionBarItem[] = []

/**
 * Default English labels for status tags. Bindings may override via locale later.
 */
export const WORKFLOW_STEP_STATUS_LABELS: Record<WorkflowTimelineStepStatus, string> = {
  pending: 'Pending',
  active: 'Active',
  approved: 'Approved',
  rejected: 'Rejected',
  canceled: 'Canceled'
}

/**
 * Tag variants that match approval status cues.
 */
export const WORKFLOW_STEP_STATUS_TAG_VARIANTS: Record<WorkflowTimelineStepStatus, TagVariant> = {
  pending: 'default',
  active: 'primary',
  approved: 'success',
  rejected: 'danger',
  canceled: 'default'
}

export const WORKFLOW_STEP_STATUSES: readonly WorkflowTimelineStepStatus[] = [
  'pending',
  'active',
  'approved',
  'rejected',
  'canceled'
]

export const WORKFLOW_TERMINAL_STEP_STATUSES: readonly WorkflowTimelineStepStatus[] = [
  'approved',
  'rejected',
  'canceled'
]

const STATUS_SET = new Set<string>(WORKFLOW_STEP_STATUSES)
const TERMINAL_STATUS_SET = new Set<string>(WORKFLOW_TERMINAL_STEP_STATUSES)

/**
 * CSS color hints for Timeline dots. Data only — no framework nodes.
 */
export const WORKFLOW_STEP_STATUS_COLORS: Record<WorkflowTimelineStepStatus, string> = {
  pending: 'var(--tiger-border,#d1d5db)',
  active: 'var(--tiger-primary,#2563eb)',
  approved: 'var(--tiger-success,#16a34a)',
  rejected: 'var(--tiger-error,#dc2626)',
  canceled: 'var(--tiger-text-muted,#6b7280)'
}

export type WorkflowStepHighlight = 'active' | 'pending' | null

export type WorkflowStepStatusCounts = Record<WorkflowTimelineStepStatus, number>

/**
 * A TimelineItem that carries the source step and resolved status,
 * so Vue/React renderers do not need unsafe casts.
 */
export interface WorkflowTimelineItem extends TimelineItem {
  status: WorkflowTimelineStepStatus
  step: WorkflowTimelineStep
}

export function isWorkflowTimelineStepStatus(value: unknown): value is WorkflowTimelineStepStatus {
  return typeof value === 'string' && STATUS_SET.has(value)
}

export function resolveWorkflowStepStatus(
  step: Pick<WorkflowTimelineStep, 'status'> | undefined
): WorkflowTimelineStepStatus {
  return isWorkflowTimelineStepStatus(step?.status) ? step.status : 'pending'
}

export function workflowStepStatusColor(status: WorkflowTimelineStepStatus): string {
  return WORKFLOW_STEP_STATUS_COLORS[status]
}

export function isWorkflowStepActive(step: WorkflowTimelineStep): boolean {
  return resolveWorkflowStepStatus(step) === 'active'
}

export function isWorkflowStepPending(step: WorkflowTimelineStep): boolean {
  return resolveWorkflowStepStatus(step) === 'pending'
}

export function isWorkflowStepTerminal(step: WorkflowTimelineStep): boolean {
  return TERMINAL_STATUS_SET.has(resolveWorkflowStepStatus(step))
}

/**
 * Highlight hint for pending / active steps. Terminal steps return `null`.
 */
export function workflowStepHighlight(step: WorkflowTimelineStep): WorkflowStepHighlight {
  const status = resolveWorkflowStepStatus(step)
  if (status === 'active') return 'active'
  if (status === 'pending') return 'pending'
  return null
}

function emptyStatusCounts(): WorkflowStepStatusCounts {
  return {
    pending: 0,
    active: 0,
    approved: 0,
    rejected: 0,
    canceled: 0
  }
}

function visitSteps(
  steps: readonly WorkflowTimelineStep[],
  visit: (step: WorkflowTimelineStep) => void
): void {
  for (const step of steps) {
    visit(step)
    if (step.children && step.children.length > 0) {
      visitSteps(step.children, visit)
    }
  }
}

function flattenSteps(steps: readonly WorkflowTimelineStep[]): WorkflowTimelineStep[] {
  const result: WorkflowTimelineStep[] = []
  visitSteps(steps, (step) => {
    result.push(step)
  })
  return result
}

/**
 * Stable display order: explicit `order` when any sibling has it (missing
 * values sort last), otherwise input order. Original index is the tiebreaker.
 */
export function sortWorkflowTimelineSteps(
  steps: readonly WorkflowTimelineStep[]
): WorkflowTimelineStep[] {
  if (steps.length <= 1) return [...steps]

  const hasOrder = steps.some((step) => step.order != null)
  if (!hasOrder) return [...steps]

  return steps
    .map((step, index) => ({ step, index }))
    .sort((a, b) => {
      const aOrder = a.step.order ?? Number.POSITIVE_INFINITY
      const bOrder = b.step.order ?? Number.POSITIVE_INFINITY
      if (aOrder !== bOrder) return aOrder - bOrder
      return a.index - b.index
    })
    .map(({ step }) => step)
}

function copyActor(actor: WorkflowTimelineStep['actor']): WorkflowTimelineStep['actor'] {
  return actor == null ? actor : { ...actor }
}

function copyStep(step: WorkflowTimelineStep): WorkflowTimelineStep {
  const next: WorkflowTimelineStep = {
    ...step,
    status: resolveWorkflowStepStatus(step)
  }
  if (step.title == null && step.label != null) next.title = step.label
  if (step.actor) next.actor = copyActor(step.actor)
  if (step.children) {
    next.children = normalizeWorkflowTimelineSteps(step.children)
  }
  return next
}

/**
 * Copy steps, default unknown/omitted status to `pending`, fill `title` from
 * `label` when needed, and stably sort each sibling list. Does not mutate input.
 */
export function normalizeWorkflowTimelineSteps(
  steps: readonly WorkflowTimelineStep[] | undefined
): WorkflowTimelineStep[] {
  if (!steps || steps.length === 0) return EMPTY_WORKFLOW_TIMELINE_STEPS
  return sortWorkflowTimelineSteps(steps.map(copyStep))
}

/**
 * First `active` step in display order (parent then children).
 * `undefined` when none are active.
 */
export function getCurrentWorkflowStep(
  steps: readonly WorkflowTimelineStep[] | undefined
): WorkflowTimelineStep | undefined {
  if (!steps || steps.length === 0) return undefined
  let current: WorkflowTimelineStep | undefined
  visitSteps(steps, (step) => {
    if (current) return
    if (isWorkflowStepActive(step)) current = step
  })
  return current
}

/**
 * An instance is terminal when it has a rejected or canceled step, or when
 * every step is terminal (typically all approved). Empty lists are not terminal.
 */
export function isWorkflowTimelineTerminal(
  steps: readonly WorkflowTimelineStep[] | undefined
): boolean {
  if (!steps || steps.length === 0) return false

  let sawStep = false
  let sawRejectedOrCanceled = false
  let sawOpen = false

  visitSteps(steps, (step) => {
    sawStep = true
    const status = resolveWorkflowStepStatus(step)
    if (status === 'rejected' || status === 'canceled') {
      sawRejectedOrCanceled = true
    } else if (status === 'pending' || status === 'active') {
      sawOpen = true
    }
  })

  if (!sawStep) return false
  if (sawRejectedOrCanceled) return true
  return !sawOpen
}

/**
 * Counts by resolved status, including nested children.
 */
export function countWorkflowStepsByStatus(
  steps: readonly WorkflowTimelineStep[] | undefined
): WorkflowStepStatusCounts {
  const counts = emptyStatusCounts()
  if (!steps || steps.length === 0) return counts
  visitSteps(steps, (step) => {
    counts[resolveWorkflowStepStatus(step)] += 1
  })
  return counts
}

function stepToTimelineItem(step: WorkflowTimelineStep): WorkflowTimelineItem {
  const status = resolveWorkflowStepStatus(step)
  const item: WorkflowTimelineItem = {
    key: step.key,
    color: workflowStepStatusColor(status),
    status,
    step
  }
  if (step.time != null) item.label = step.time
  const content = step.title ?? step.label
  if (content != null) item.content = content
  return item
}

/**
 * Convert approval steps to {@link TimelineItem} rows.
 * Nested children flatten after their parent. Color/status are data hints.
 */
export function workflowStepsToTimelineItems(
  steps: readonly WorkflowTimelineStep[] | undefined
): WorkflowTimelineItem[] {
  const normalized = normalizeWorkflowTimelineSteps(steps)
  if (normalized === EMPTY_WORKFLOW_TIMELINE_STEPS) return []
  return flattenSteps(normalized).map(stepToTimelineItem)
}

export function workflowStepStatusLabel(status: WorkflowTimelineStepStatus): string {
  return WORKFLOW_STEP_STATUS_LABELS[status]
}

export function workflowStepStatusTagVariant(status: WorkflowTimelineStepStatus): TagVariant {
  return WORKFLOW_STEP_STATUS_TAG_VARIANTS[status]
}

export interface WorkflowActionButtonProps {
  variant: ButtonVariant
  danger: boolean
}

/**
 * Map an action-bar item onto Button `variant` / `danger`.
 * `danger` variant is outline + danger because Button has no danger variant.
 */
export function resolveWorkflowActionButtonProps(
  item: Pick<WorkflowActionBarItem, 'action' | 'variant'>
): WorkflowActionButtonProps {
  if (item.variant === 'danger') return { variant: 'outline', danger: true }
  if (item.variant) return { variant: item.variant, danger: false }
  if (item.action === 'approve') return { variant: 'primary', danger: false }
  if (item.action === 'reject' || item.action === 'cancel') {
    return { variant: 'outline', danger: true }
  }
  if (item.action === 'comment') return { variant: 'ghost', danger: false }
  return { variant: 'outline', danger: false }
}

/**
 * Action bar visibility: explicit `showActions` wins; otherwise show when
 * there are items and an `active` current step.
 */
export function shouldShowWorkflowActions(
  steps: readonly WorkflowTimelineStep[] | undefined,
  actions: readonly WorkflowActionBarItem[] | undefined,
  showActions?: boolean
): boolean {
  if (showActions === false) return false
  if (!actions || actions.length === 0) return false
  if (showActions === true) return true
  return getCurrentWorkflowStep(steps) != null
}
