/**
 * Framework-agnostic helpers for the simple JSON-tree WorkflowDesigner.
 * Paths are arrays of step `key`s. This is not a BPMN graph.
 */

import { classNames } from './class-names'
import type { WorkflowDesignerPath, WorkflowDesignerStepPatch } from '../types/workflow-designer'
import type { TigerLocaleWorkflowTimeline } from '../types/locale'
import type {
  WorkflowSignMode,
  WorkflowStepKind,
  WorkflowTimelineActor,
  WorkflowTimelineStep
} from '../types/workflow-timeline'
import {
  resolveWorkflowSignMode,
  resolveWorkflowStepActors,
  resolveWorkflowStepKind,
  workflowSignModeLabel,
  workflowStepKindLabel,
  WORKFLOW_SIGN_MODES,
  WORKFLOW_STEP_KINDS
} from './workflow-timeline-utils'

export const EMPTY_WORKFLOW_DESIGNER_STEPS: WorkflowTimelineStep[] = []

export const workflowDesignerRootClasses = 'tiger-workflow-designer w-full'
export const workflowDesignerShellClasses = 'flex flex-col gap-3 lg:flex-row lg:items-start'
export const workflowDesignerTreeClasses = 'flex min-w-0 flex-1 flex-col gap-3'
export const workflowDesignerListClasses = 'm-0 flex list-none flex-col gap-3 p-0'
export const workflowDesignerItemClasses = 'flex min-w-0 flex-col gap-2'
export const workflowDesignerCardClasses =
  'min-w-0 cursor-pointer rounded-lg border border-[var(--tiger-border,#d1d5db)] bg-[var(--tiger-bg,#fff)] px-3 py-2 shadow-sm'
export const workflowDesignerCardSelectedClasses =
  'border-[var(--tiger-primary,#2563eb)] ring-2 ring-[var(--tiger-primary,#2563eb)] ring-offset-1'
export const workflowDesignerSummaryClasses = 'flex min-w-0 flex-col gap-1'
export const workflowDesignerSummaryRowClasses = 'flex min-w-0 items-center gap-2'
export const workflowDesignerSummaryTitleClasses =
  'min-w-0 truncate text-sm font-medium text-[var(--tiger-text,#111827)]'
export const workflowDesignerSummaryActorsClasses = 'text-sm text-[var(--tiger-text-muted,#6b7280)]'
export const workflowDesignerKindDotClasses = 'inline-block h-2 w-2 shrink-0 rounded-full'
export const workflowDesignerToolbarClasses = 'mt-2 flex flex-wrap items-center gap-1'
export const workflowDesignerInsertRowClasses = 'flex justify-start'
export const workflowDesignerPanelClasses =
  'min-w-0 rounded-lg border border-[var(--tiger-border,#d1d5db)] bg-[var(--tiger-bg,#fff)] px-3 py-3 lg:w-80 lg:shrink-0'
export const workflowDesignerFieldsClasses = 'flex flex-col gap-2'
export const workflowDesignerFieldClasses = 'flex min-w-0 flex-col gap-1'
export const workflowDesignerLabelClasses =
  'text-xs font-medium text-[var(--tiger-text-muted,#6b7280)]'
export const workflowDesignerHintClasses = 'text-xs text-[var(--tiger-text-muted,#6b7280)]'
export const workflowDesignerControlClasses =
  'w-full rounded-md border border-[var(--tiger-border,#d1d5db)] bg-[var(--tiger-bg,#fff)] px-2 py-1 text-sm text-[var(--tiger-text,#111827)]'
export const workflowDesignerActorRowClasses = 'flex min-w-0 items-center gap-1'
export const workflowDesignerEmptyClasses = 'text-sm text-[var(--tiger-text-muted,#6b7280)]'
export const workflowDesignerChildrenClasses =
  'ms-4 border-s border-[var(--tiger-border,#d1d5db)] ps-3'
export const workflowDesignerActionButtonClasses =
  'inline-flex items-center rounded-md border border-[var(--tiger-border,#d1d5db)] bg-[var(--tiger-bg,#fff)] px-2 py-1 text-xs text-[var(--tiger-text,#111827)] disabled:cursor-not-allowed disabled:opacity-50'

export const WORKFLOW_DESIGNER_KIND_COLORS: Record<WorkflowStepKind, string> = {
  start: 'var(--tiger-primary,#2563eb)',
  approve: 'var(--tiger-success,#16a34a)',
  cc: 'var(--tiger-text-muted,#6b7280)',
  condition: 'var(--tiger-warning,#d97706)'
}

export function workflowDesignerKindColor(kind: WorkflowStepKind): string {
  return WORKFLOW_DESIGNER_KIND_COLORS[kind]
}

export function workflowDesignerPathKey(path: WorkflowDesignerPath): string {
  return path.join('\0')
}

export function workflowDesignerSignModeHint(
  mode: WorkflowSignMode,
  labels: Pick<
    TigerLocaleWorkflowTimeline,
    'signSequentialHint' | 'signCountersignHint' | 'signOrsignHint'
  >
): string {
  if (mode === 'countersign') return labels.signCountersignHint ?? ''
  if (mode === 'orsign') return labels.signOrsignHint ?? ''
  return labels.signSequentialHint ?? ''
}

export interface WorkflowDesignerNode {
  key: string
  path: string[]
  step: WorkflowTimelineStep
  kind: WorkflowStepKind
  signMode: WorkflowSignMode
  title: string
  actorName: string
  actorNames: string[]
  index: number
  canMoveUp: boolean
  canMoveDown: boolean
  children: WorkflowDesignerNode[]
}

export interface WorkflowDesignerView {
  list: WorkflowTimelineStep[]
  valid: boolean
  parentPath: string[]
}

function cloneStep(step: WorkflowTimelineStep): WorkflowTimelineStep {
  const next: WorkflowTimelineStep = {
    ...step,
    actor: step.actor ? { ...step.actor } : undefined,
    actors: step.actors ? step.actors.map((actor) => ({ ...actor })) : undefined,
    children: step.children ? cloneWorkflowSteps(step.children) : undefined
  }
  if (step.tasks) {
    next.tasks = step.tasks.map((task) => ({ ...task, assignee: { ...task.assignee } }))
  }
  if (step.fieldPermissions) next.fieldPermissions = { ...step.fieldPermissions }
  if (step.buttonPolicy) {
    next.buttonPolicy = {
      ...step.buttonPolicy,
      buttons: step.buttonPolicy.buttons.map((button) => ({ ...button })),
      addsign: step.buttonPolicy.addsign
        ? { positions: [...step.buttonPolicy.addsign.positions] }
        : step.buttonPolicy.addsign
    }
  }
  if (step.approverPolicy) {
    next.approverPolicy = Array.isArray(step.approverPolicy)
      ? step.approverPolicy.map((source) =>
          source.type === 'fixed'
            ? { type: 'fixed', actors: source.actors.map((actor) => ({ ...actor })) }
            : { ...source }
        )
      : step.approverPolicy.type === 'fixed'
        ? { type: 'fixed', actors: step.approverPolicy.actors.map((actor) => ({ ...actor })) }
        : { ...step.approverPolicy }
  }
  if (step.advanced) {
    next.advanced = {
      ...step.advanced,
      timeout: step.advanced.timeout ? { ...step.advanced.timeout } : step.advanced.timeout
    }
  }
  if (step.origin) next.origin = { ...step.origin }
  if (step.pendingAfterAddsign) {
    next.pendingAfterAddsign = {
      ...step.pendingAfterAddsign,
      assignees: step.pendingAfterAddsign.assignees.map((actor) => ({ ...actor }))
    }
  }
  return next
}

function workflowDesignerActorNames(step: WorkflowTimelineStep): string[] {
  const names: string[] = []
  for (const actor of resolveWorkflowStepActors(step)) {
    if (typeof actor.name === 'string' && actor.name.trim() !== '') names.push(actor.name)
  }
  return names
}

export function cloneWorkflowSteps(
  steps: readonly WorkflowTimelineStep[] | undefined
): WorkflowTimelineStep[] {
  if (!steps || steps.length === 0) return []
  return steps.map(cloneStep)
}

export function collectWorkflowStepKeys(
  steps: readonly WorkflowTimelineStep[] | undefined
): Set<string> {
  const keys = new Set<string>()
  const visit = (list: readonly WorkflowTimelineStep[]): void => {
    for (const step of list) {
      keys.add(step.key)
      if (step.children && step.children.length > 0) visit(step.children)
    }
  }
  if (steps && steps.length > 0) visit(steps)
  return keys
}

export function createWorkflowDesignerStep(
  existing: readonly WorkflowTimelineStep[] | undefined = EMPTY_WORKFLOW_DESIGNER_STEPS,
  patch: Partial<WorkflowTimelineStep> = {}
): WorkflowTimelineStep {
  const keys = collectWorkflowStepKeys(existing)
  let next = 1
  while (keys.has(`step-${next}`)) next += 1
  const requested = patch.key != null ? String(patch.key) : ''
  const key = requested && !keys.has(requested) ? requested : `step-${next}`
  return {
    kind: 'approve',
    title: '',
    status: 'pending',
    ...patch,
    key
  }
}

function findIndexByKey(list: readonly WorkflowTimelineStep[], key: string): number {
  return list.findIndex((step) => step.key === key)
}

export function getWorkflowStepAtPath(
  steps: readonly WorkflowTimelineStep[] | undefined,
  path: WorkflowDesignerPath | undefined
): WorkflowTimelineStep | undefined {
  if (!steps || !path || path.length === 0) return undefined
  let list: readonly WorkflowTimelineStep[] | undefined = steps
  let current: WorkflowTimelineStep | undefined
  for (const key of path) {
    if (!list) return undefined
    current = list.find((step) => step.key === key)
    if (!current) return undefined
    list = current.children
  }
  return current
}

function updateListAt(
  steps: readonly WorkflowTimelineStep[],
  parentPath: WorkflowDesignerPath,
  update: (list: WorkflowTimelineStep[]) => WorkflowTimelineStep[]
): WorkflowTimelineStep[] {
  if (parentPath.length === 0) return update(cloneWorkflowSteps(steps))

  const [head, ...rest] = parentPath
  let found = false
  const next = steps.map((step) => {
    if (step.key !== head) return cloneStep(step)
    found = true
    return {
      ...cloneStep(step),
      children: updateListAt(step.children ?? [], rest, update)
    }
  })
  return found ? next : cloneWorkflowSteps(steps)
}

export function patchWorkflowStepAtPath(
  steps: readonly WorkflowTimelineStep[],
  path: WorkflowDesignerPath,
  patch: WorkflowDesignerStepPatch
): WorkflowTimelineStep[] {
  if (path.length === 0) return cloneWorkflowSteps(steps)
  const parentPath = path.slice(0, -1)
  const key = path[path.length - 1]
  if (key == null) return cloneWorkflowSteps(steps)
  return updateListAt(steps, parentPath, (list) =>
    list.map((step) => {
      if (step.key !== key) return step
      const nextActors =
        patch.actors === undefined
          ? step.actors
          : patch.actors == null || patch.actors.length === 0
            ? undefined
            : patch.actors.map((actor) => ({ ...actor }))
      const nextActor =
        patch.actors !== undefined
          ? nextActors?.[0]
          : patch.actor === undefined
            ? step.actor
            : patch.actor == null
              ? undefined
              : { ...step.actor, ...patch.actor }
      return {
        ...step,
        ...patch,
        actor: nextActor,
        actors: nextActors,
        key: step.key,
        children: step.children
      }
    })
  )
}

export function insertWorkflowStepAtPath(
  steps: readonly WorkflowTimelineStep[],
  parentPath: WorkflowDesignerPath,
  step: WorkflowTimelineStep,
  index?: number
): WorkflowTimelineStep[] {
  return updateListAt(steps, parentPath, (list) => {
    const copy = list.slice()
    const at = index == null || index > copy.length ? copy.length : Math.max(0, index)
    copy.splice(at, 0, cloneStep(step))
    return copy
  })
}

/**
 * Insert `step` as a sibling after the node at `path`.
 * Does not nest the new node under the target.
 */
export function insertWorkflowStepAfterPath(
  steps: readonly WorkflowTimelineStep[],
  path: WorkflowDesignerPath,
  step: WorkflowTimelineStep
): WorkflowTimelineStep[] {
  if (path.length === 0) return cloneWorkflowSteps(steps)
  const parentPath = path.slice(0, -1)
  const key = path[path.length - 1]
  if (key == null) return cloneWorkflowSteps(steps)

  const siblings =
    parentPath.length === 0 ? steps : (getWorkflowStepAtPath(steps, parentPath)?.children ?? null)
  if (!siblings) return cloneWorkflowSteps(steps)
  const index = findIndexByKey(siblings, key)
  if (index < 0) return cloneWorkflowSteps(steps)
  return insertWorkflowStepAtPath(steps, parentPath, step, index + 1)
}

export function removeWorkflowStepAtPath(
  steps: readonly WorkflowTimelineStep[],
  path: WorkflowDesignerPath
): WorkflowTimelineStep[] {
  if (path.length === 0) return cloneWorkflowSteps(steps)
  const parentPath = path.slice(0, -1)
  const key = path[path.length - 1]
  if (key == null) return cloneWorkflowSteps(steps)
  return updateListAt(steps, parentPath, (list) => list.filter((step) => step.key !== key))
}

export function moveWorkflowStepAtPath(
  steps: readonly WorkflowTimelineStep[],
  path: WorkflowDesignerPath,
  delta: number
): WorkflowTimelineStep[] {
  if (path.length === 0 || delta === 0) return cloneWorkflowSteps(steps)
  const parentPath = path.slice(0, -1)
  const key = path[path.length - 1]
  if (key == null) return cloneWorkflowSteps(steps)
  return updateListAt(steps, parentPath, (list) => {
    const index = findIndexByKey(list, key)
    if (index < 0) return list
    const nextIndex = index + delta
    if (nextIndex < 0 || nextIndex >= list.length) return list
    const copy = list.slice()
    const [item] = copy.splice(index, 1)
    if (!item) return list
    copy.splice(nextIndex, 0, item)
    return copy
  })
}

/**
 * Resolve the sibling list the designer should edit.
 * `path` is the parent path of that list (empty = root).
 */
export function resolveWorkflowDesignerView(
  steps: readonly WorkflowTimelineStep[] | undefined,
  path?: WorkflowDesignerPath
): WorkflowDesignerView {
  const parentPath = path ? [...path] : []
  if (!steps) {
    return { list: [], valid: parentPath.length === 0, parentPath }
  }
  if (parentPath.length === 0) {
    return { list: cloneWorkflowSteps(steps), valid: true, parentPath }
  }
  const parent = getWorkflowStepAtPath(steps, parentPath)
  if (!parent) return { list: [], valid: false, parentPath }
  return { list: cloneWorkflowSteps(parent.children), valid: true, parentPath }
}

/**
 * Write an edited sibling list back into the full tree at `path`.
 */
export function applyWorkflowDesignerView(
  steps: readonly WorkflowTimelineStep[],
  path: WorkflowDesignerPath | undefined,
  list: readonly WorkflowTimelineStep[]
): WorkflowTimelineStep[] {
  const parentPath = path ? [...path] : []
  if (parentPath.length === 0) return cloneWorkflowSteps(list)
  if (!getWorkflowStepAtPath(steps, parentPath)) return cloneWorkflowSteps(steps)
  return updateListAt(steps, parentPath, () => cloneWorkflowSteps(list))
}

export function buildWorkflowDesignerNodes(
  list: readonly WorkflowTimelineStep[],
  parentPath: WorkflowDesignerPath = []
): WorkflowDesignerNode[] {
  return list.map((step, index) => {
    const path = [...parentPath, step.key]
    const children = step.children ?? EMPTY_WORKFLOW_DESIGNER_STEPS
    const actorNames = workflowDesignerActorNames(step)
    return {
      key: step.key,
      path,
      step,
      kind: resolveWorkflowStepKind(step),
      signMode: resolveWorkflowSignMode(step),
      title: step.title ?? step.label ?? '',
      actorName: actorNames.join(', '),
      actorNames,
      index,
      canMoveUp: index > 0,
      canMoveDown: index < list.length - 1,
      children: buildWorkflowDesignerNodes(children, path)
    }
  })
}

export function findWorkflowDesignerNode(
  nodes: readonly WorkflowDesignerNode[],
  path: WorkflowDesignerPath | undefined
): WorkflowDesignerNode | undefined {
  if (!path || path.length === 0) return undefined
  for (const node of nodes) {
    if (workflowDesignerPathKey(node.path) === workflowDesignerPathKey(path)) return node
    const nested = findWorkflowDesignerNode(node.children, path)
    if (nested) return nested
  }
  return undefined
}

export function cloneWorkflowDesignerActors(
  step: Pick<WorkflowTimelineStep, 'actor' | 'actors'> | undefined
): WorkflowTimelineActor[] {
  return resolveWorkflowStepActors(step).map((actor) => ({ ...actor }))
}

export function workflowDesignerCardClassName(selected: boolean): string {
  return classNames(
    workflowDesignerCardClasses,
    selected ? workflowDesignerCardSelectedClasses : null
  )
}

export function workflowDesignerKindOptions(
  labels?: Partial<{
    kindStart?: string
    kindApprove?: string
    kindCc?: string
    kindCondition?: string
  }>
): Array<{ value: WorkflowStepKind; label: string }> {
  return WORKFLOW_STEP_KINDS.map((kind) => ({
    value: kind,
    label: workflowStepKindLabel(kind, labels)
  }))
}

export function workflowDesignerSignModeOptions(
  labels?: Partial<{ signSequential?: string; signCountersign?: string; signOrsign?: string }>
): Array<{ value: WorkflowSignMode; label: string }> {
  return WORKFLOW_SIGN_MODES.map((mode) => ({
    value: mode,
    label: workflowSignModeLabel(mode, labels)
  }))
}
