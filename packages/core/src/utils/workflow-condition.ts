/**
 * One condition selection shared by the designer, the viewer, and the reducer.
 * Unselected branches are not entered.
 */

import type { WorkflowBranchCondition, WorkflowTimelineStep } from '../types/workflow-timeline'
import { getValueByPath } from './form-validation'

function finiteNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

function valuesEqual(actual: unknown, expected: unknown): boolean {
  if (Object.is(actual, expected)) return true
  if (actual == null || expected == null) return false
  const left = finiteNumber(actual)
  const right = finiteNumber(expected)
  if (left != null && right != null) return left === right
  return String(actual) === String(expected)
}

export function workflowConditionMatches(
  condition: WorkflowBranchCondition | undefined,
  formValues: Record<string, unknown> | undefined
): boolean {
  if (!condition || condition.field.trim() === '') return false
  const actual = getValueByPath(formValues ?? {}, condition.field)
  const operator = condition.operator
  if (operator === 'empty') return actual == null || actual === ''
  if (operator === 'notEmpty') return !(actual == null || actual === '')
  if (operator === 'contains') {
    if (Array.isArray(actual)) {
      return actual.some((item) => valuesEqual(item, condition.value))
    }
    return String(actual ?? '').includes(String(condition.value ?? ''))
  }
  if (operator === 'gt' || operator === 'gte' || operator === 'lt' || operator === 'lte') {
    const left = finiteNumber(actual)
    const right = finiteNumber(condition.value)
    if (left == null || right == null) return false
    if (operator === 'gt') return left > right
    if (operator === 'gte') return left >= right
    if (operator === 'lt') return left < right
    return left <= right
  }
  if (operator === 'neq') return !valuesEqual(actual, condition.value)
  return valuesEqual(actual, condition.value)
}

/**
 * First branch whose condition matches. A branch with no field is the else
 * branch and is used only when nothing else matches. Returns undefined when
 * no branch can be entered.
 */
export function selectWorkflowConditionBranch(
  node: Pick<WorkflowTimelineStep, 'children'>,
  formValues: Record<string, unknown> | undefined
): WorkflowTimelineStep | undefined {
  const children = node.children ?? []
  const matched = children.find(
    (child) =>
      Boolean(child.condition?.field.trim()) &&
      workflowConditionMatches(child.condition, formValues)
  )
  if (matched) return matched
  return children.find((child) => !child.condition?.field.trim())
}
