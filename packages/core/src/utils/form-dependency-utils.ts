/**
 * Form field dependency utilities
 * Manages field-to-field dependency graph for conditional validation and visibility
 */

import type {
  FormCondition,
  FormConditionInput,
  FormConditionLogic,
  FormConditions,
  FormConditionState,
  FormFieldCondition,
  FormRule,
  FormRules,
  FormValues
} from '../types/form'
import { getValueByPath } from './form-validation'

/**
 * Get fields that depend on a given field
 * When `fieldName` changes, all returned fields should be re-evaluated
 */
export function getDependentFields(
  fieldName: string,
  dependencies: Map<string, string[]> | undefined
): string[] {
  if (!dependencies) return []
  const result: string[] = []

  for (const [dependent, deps] of dependencies.entries()) {
    if (deps.includes(fieldName)) {
      result.push(dependent)
    }
  }

  return result
}

/**
 * Get all fields that a given field depends on
 */
export function getFieldDependencies(
  fieldName: string,
  dependencies: Map<string, string[]> | undefined
): string[] {
  if (!dependencies) return []
  return dependencies.get(fieldName) ?? []
}

/**
 * Build a topological order for validating dependent fields
 * Ensures fields are validated after their dependencies
 */
export function getValidationOrder(
  fieldNames: string[],
  dependencies: Map<string, string[]> | undefined
): string[] {
  if (!dependencies) return [...fieldNames]
  const depMap = dependencies
  const visited = new Set<string>()
  const result: string[] = []

  function visit(field: string) {
    if (visited.has(field)) return
    visited.add(field)

    const deps = depMap.get(field) ?? []
    for (const dep of deps) {
      if (fieldNames.includes(dep)) {
        visit(dep)
      }
    }

    result.push(field)
  }

  for (const field of fieldNames) {
    visit(field)
  }

  return result
}

function isConditionValueEmpty(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    value === '' ||
    (Array.isArray(value) && value.length === 0)
  )
}

function compareNumericValues(actual: unknown, expected: unknown): [number, number] | null {
  const actualNumber = Number(actual)
  const expectedNumber = Number(expected)

  if (!Number.isFinite(actualNumber) || !Number.isFinite(expectedNumber)) {
    return null
  }

  return [actualNumber, expectedNumber]
}

function valueIncludes(container: unknown, value: unknown): boolean {
  if (Array.isArray(container)) {
    return container.some((item) => Object.is(item, value))
  }

  if (typeof container === 'string') {
    return container.includes(String(value ?? ''))
  }

  return false
}

export function evaluateFormCondition(condition: FormCondition, values: FormValues): boolean {
  const actual = getValueByPath(values, condition.field)
  const operator = condition.operator ?? (condition.value === undefined ? 'truthy' : 'equals')

  switch (operator) {
    case 'equals':
      return Object.is(actual, condition.value)
    case 'notEquals':
      return !Object.is(actual, condition.value)
    case 'truthy':
      return Boolean(actual)
    case 'falsy':
      return !actual
    case 'empty':
      return isConditionValueEmpty(actual)
    case 'notEmpty':
      return !isConditionValueEmpty(actual)
    case 'includes':
      return valueIncludes(actual, condition.value)
    case 'notIncludes':
      return !valueIncludes(actual, condition.value)
    case 'gt': {
      const pair = compareNumericValues(actual, condition.value)
      return pair ? pair[0] > pair[1] : false
    }
    case 'gte': {
      const pair = compareNumericValues(actual, condition.value)
      return pair ? pair[0] >= pair[1] : false
    }
    case 'lt': {
      const pair = compareNumericValues(actual, condition.value)
      return pair ? pair[0] < pair[1] : false
    }
    case 'lte': {
      const pair = compareNumericValues(actual, condition.value)
      return pair ? pair[0] <= pair[1] : false
    }
  }
}

export function evaluateFormConditions(
  conditions: FormConditionInput | undefined,
  values: FormValues,
  logic: FormConditionLogic = 'all'
): boolean {
  if (!conditions) return true

  const conditionList = Array.isArray(conditions) ? conditions : [conditions]
  if (conditionList.length === 0) return true

  return logic === 'any'
    ? conditionList.some((condition) => evaluateFormCondition(condition, values))
    : conditionList.every((condition) => evaluateFormCondition(condition, values))
}

export function resolveFormFieldConditionState(
  values: FormValues,
  condition?: FormFieldCondition
): FormConditionState {
  if (!condition) {
    return { shown: true, disabled: false, required: false }
  }

  const logic = condition.logic ?? 'all'
  const passes = (input: FormConditionInput | undefined, defaultValue: boolean): boolean => {
    return input ? evaluateFormConditions(input, values, logic) : defaultValue
  }
  const shown = passes(condition.showWhen, true) && !passes(condition.hiddenWhen, false)
  const disabled = passes(condition.disabledWhen, false) || !passes(condition.enabledWhen, true)
  const required = passes(condition.requiredWhen, false)

  return { shown, disabled, required }
}

export function resolveFormConditionState(
  fieldName: string,
  values: FormValues,
  conditions?: FormConditions
): FormConditionState {
  return resolveFormFieldConditionState(values, conditions?.[fieldName])
}

function hasRequiredRule(rules: FormRule | FormRule[]): boolean {
  const ruleList = Array.isArray(rules) ? rules : [rules]
  return ruleList.some((rule) => !!rule.required)
}

function addRequiredRule(rules: FormRule | FormRule[] | undefined): FormRule | FormRule[] {
  if (!rules) return { required: true }
  if (hasRequiredRule(rules)) return rules
  return Array.isArray(rules) ? [{ required: true }, ...rules] : [{ required: true }, rules]
}

export function resolveConditionalFormRules(
  values: FormValues,
  rules: FormRules | undefined,
  conditions: FormConditions | undefined
): FormRules | undefined {
  if (!rules && !conditions) return rules

  const resolved: FormRules = {}
  const fieldNames = new Set<string>([
    ...Object.keys(rules ?? {}),
    ...Object.keys(conditions ?? {})
  ])

  for (const fieldName of fieldNames) {
    const state = resolveFormConditionState(fieldName, values, conditions)
    if (!state.shown || state.disabled) continue

    const fieldRules = rules?.[fieldName]
    if (state.required) {
      resolved[fieldName] = addRequiredRule(fieldRules)
    } else if (fieldRules) {
      resolved[fieldName] = fieldRules
    }
  }

  return Object.keys(resolved).length > 0 ? resolved : undefined
}

function collectConditionFields(input: FormConditionInput | undefined, fields: Set<string>): void {
  if (!input) return
  const conditionList = Array.isArray(input) ? input : [input]
  conditionList.forEach((condition) => fields.add(condition.field))
}

export function getFormConditionDependencies(condition?: FormFieldCondition): string[] {
  if (!condition) return []

  const fields = new Set<string>()
  collectConditionFields(condition.showWhen, fields)
  collectConditionFields(condition.hiddenWhen, fields)
  collectConditionFields(condition.disabledWhen, fields)
  collectConditionFields(condition.enabledWhen, fields)
  collectConditionFields(condition.requiredWhen, fields)

  return Array.from(fields)
}

export function createFormConditionDependencies(
  conditions?: FormConditions
): Map<string, string[]> {
  const dependencies = new Map<string, string[]>()
  if (!conditions) return dependencies

  for (const [fieldName, condition] of Object.entries(conditions)) {
    const fields = getFormConditionDependencies(condition)
    if (fields.length > 0) {
      dependencies.set(fieldName, fields)
    }
  }

  return dependencies
}
