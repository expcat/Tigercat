/**
 * Framework-agnostic SchemaForm helpers: flatten fields, layout groups,
 * validation rules, conditions, and value mapping.
 *
 * Workflow node field permissions are a separate helper:
 * `applyWorkflowFieldPermissions` in `workflow-field-permissions.ts`.
 * Do not turn this module into a form designer.
 */

import { classNames } from './class-names'
import { hasRequiredRule } from './form-dependency-utils'
import { cloneFormValues, getValueByPath, setValueByPath } from './form-validation'
import type {
  FormConditions,
  FormFieldCondition,
  FormRule,
  FormRules,
  FormValues
} from '../types/form'
import type {
  SchemaFormField,
  SchemaFormGroup,
  SchemaFormLayoutGroup,
  SchemaFormSchema,
  SchemaFormWidgetType
} from '../types/schema-form'

export const SCHEMA_FORM_WIDGET_TYPES: readonly SchemaFormWidgetType[] = [
  'input',
  'textarea',
  'number',
  'password',
  'select',
  'checkbox',
  'switch',
  'radio'
]

export const schemaFormRootClasses = 'tiger-schema-form w-full'
export const schemaFormGroupClasses = 'tiger-schema-form__group space-y-4'
export const schemaFormGroupTitleClasses =
  'tiger-schema-form__group-title m-0 text-sm font-medium text-[var(--tiger-text,#111827)]'
export const schemaFormGroupDescriptionClasses =
  'tiger-schema-form__group-description m-0 text-xs text-[var(--tiger-text-muted,#6b7280)]'
export const schemaFormNestedGroupClasses =
  'tiger-schema-form__nested ps-3 border-s border-[var(--tiger-border,#e5e7eb)] space-y-4'
export const schemaFormExtraClasses =
  'tiger-schema-form__extra mt-1 text-xs text-[var(--tiger-text-muted,#6b7280)]'
export const schemaFormActionsClasses =
  'tiger-schema-form__actions flex items-center justify-end gap-3 pt-2'

const COLUMN_CLASSES: Record<1 | 2 | 3, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
}

const SPAN_CLASSES: Record<1 | 2 | 3, string> = {
  1: '',
  2: 'sm:col-span-2',
  3: 'sm:col-span-2 lg:col-span-3'
}

export function clampSchemaFormColumns(value: number | undefined): 1 | 2 | 3 {
  if (value === 2 || value === 3) return value
  return 1
}

export function clampSchemaFormSpan(span: number | undefined, columns: 1 | 2 | 3): 1 | 2 | 3 {
  if (span === 2 || span === 3) {
    return (span > columns ? columns : span) as 1 | 2 | 3
  }
  return 1
}

export function getSchemaFormFieldsClasses(columns: 1 | 2 | 3): string {
  return classNames('tiger-schema-form__fields grid gap-x-4 gap-y-0', COLUMN_CLASSES[columns])
}

export function getSchemaFormFieldSpanClasses(span: 1 | 2 | 3, columns: 1 | 2 | 3): string {
  const clamped = clampSchemaFormSpan(span, columns)
  return classNames('tiger-schema-form__field min-w-0', SPAN_CLASSES[clamped])
}

export function isSchemaFormWidgetType(value: unknown): value is SchemaFormWidgetType {
  return (
    typeof value === 'string' && (SCHEMA_FORM_WIDGET_TYPES as readonly string[]).includes(value)
  )
}

export function resolveSchemaFormWidgetType(field: SchemaFormField): SchemaFormWidgetType {
  return isSchemaFormWidgetType(field.type) ? field.type : 'input'
}

function isVisibleField(field: SchemaFormField | undefined): field is SchemaFormField {
  return Boolean(field && typeof field.name === 'string' && field.name.trim() && !field.hidden)
}

function walkGroups(
  groups: readonly SchemaFormGroup[] | undefined,
  visit: (group: SchemaFormGroup) => void
): void {
  if (!groups) return
  for (const group of groups) {
    visit(group)
    walkGroups(group.groups, visit)
  }
}

/**
 * Visible fields in document order (ungrouped first, then groups, nested last).
 */
export function flattenSchemaFormFields(schema: SchemaFormSchema | undefined): SchemaFormField[] {
  if (!schema) return []
  const fields: SchemaFormField[] = []
  const push = (list: readonly SchemaFormField[] | undefined) => {
    if (!list) return
    for (const field of list) {
      if (isVisibleField(field)) fields.push(field)
    }
  }
  push(schema.fields)
  walkGroups(schema.groups, (group) => push(group.fields))
  return fields
}

function toLayoutGroup(
  group: SchemaFormGroup,
  index: number,
  fallbackColumns: 1 | 2 | 3,
  keyPrefix: string
): SchemaFormLayoutGroup {
  const columns = clampSchemaFormColumns(group.columns ?? fallbackColumns)
  const key = group.key?.trim() || `${keyPrefix}${index}`
  const fields = (group.fields ?? []).filter(isVisibleField)
  const nested = (group.groups ?? []).map((child, childIndex) =>
    toLayoutGroup(child, childIndex, columns, `${key}.`)
  )
  return {
    key,
    title: group.title,
    description: group.description,
    columns,
    fields,
    groups: nested
  }
}

/**
 * Layout tree used by Vue/React. Empty schemas yield no groups.
 */
export function resolveSchemaFormLayout(
  schema: SchemaFormSchema | undefined
): SchemaFormLayoutGroup[] {
  if (!schema) return []
  const rootColumns = clampSchemaFormColumns(schema.columns)
  const layout: SchemaFormLayoutGroup[] = []
  const ungrouped = (schema.fields ?? []).filter(isVisibleField)
  if (ungrouped.length > 0) {
    layout.push({
      key: '_fields',
      columns: rootColumns,
      fields: ungrouped,
      groups: []
    })
  }
  const groups = schema.groups ?? []
  for (let index = 0; index < groups.length; index++) {
    layout.push(toLayoutGroup(groups[index]!, index, rootColumns, 'group-'))
  }
  return layout
}

function normalizeRules(field: SchemaFormField): FormRule | FormRule[] | undefined {
  const rules = field.rules
  if (field.required && !hasRequiredRule(rules)) {
    const requiredRule: FormRule = { required: true }
    if (!rules) return requiredRule
    return Array.isArray(rules) ? [requiredRule, ...rules] : [requiredRule, rules]
  }
  return rules
}

/**
 * Form `rules` derived from the schema. Caller `overlay` wins on the same name.
 */
export function collectSchemaFormRules(
  schema: SchemaFormSchema | undefined,
  overlay?: FormRules
): FormRules | undefined {
  const fields = flattenSchemaFormFields(schema)
  const rules: FormRules = {}
  for (const field of fields) {
    const fieldRules = normalizeRules(field)
    if (fieldRules) rules[field.name] = fieldRules
  }
  if (overlay) {
    for (const [name, rule] of Object.entries(overlay)) {
      rules[name] = rule
    }
  }
  return Object.keys(rules).length > 0 ? rules : undefined
}

/**
 * Form `conditions` derived from field `condition`. Overlay wins on the same name.
 */
export function collectSchemaFormConditions(
  schema: SchemaFormSchema | undefined,
  overlay?: FormConditions
): FormConditions | undefined {
  const fields = flattenSchemaFormFields(schema)
  const conditions: FormConditions = {}
  for (const field of fields) {
    if (field.condition) conditions[field.name] = field.condition
  }
  if (overlay) {
    for (const [name, condition] of Object.entries(overlay)) {
      conditions[name] = condition
    }
  }
  return Object.keys(conditions).length > 0 ? conditions : undefined
}

function fieldValuePath(field: SchemaFormField): string {
  const path = field.valuePath?.trim()
  return path || field.name
}

/**
 * Default form model from field `defaultValue`s.
 */
export function collectSchemaFormDefaults(schema: SchemaFormSchema | undefined): FormValues {
  const fields = flattenSchemaFormFields(schema)
  let values: FormValues = {}
  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      values = setValueByPath(values, field.name, field.defaultValue)
    }
  }
  return values
}

/**
 * Map a source object onto a form model (`valuePath` + `mapIn`).
 */
export function mapSchemaFormValuesIn(
  schema: SchemaFormSchema | undefined,
  source: FormValues | undefined
): FormValues {
  const fields = flattenSchemaFormFields(schema)
  let values = collectSchemaFormDefaults(schema)
  if (!source) return values
  for (const field of fields) {
    const raw = getValueByPath(source, fieldValuePath(field))
    if (raw === undefined && field.mapIn === undefined) continue
    const next = field.mapIn ? field.mapIn(raw) : raw
    if (next !== undefined) {
      values = setValueByPath(values, field.name, next)
    }
  }
  return values
}

/**
 * Map a form model onto an output object (`valuePath` + `mapOut`).
 */
export function mapSchemaFormValuesOut(
  schema: SchemaFormSchema | undefined,
  values: FormValues | undefined
): FormValues {
  const fields = flattenSchemaFormFields(schema)
  let output: FormValues = {}
  const model = values ?? {}
  for (const field of fields) {
    const current = getValueByPath(model, field.name)
    const next = field.mapOut ? field.mapOut(current) : current
    output = setValueByPath(output, fieldValuePath(field), next)
  }
  return output
}

/**
 * Merge schema defaults, mapped source, and an explicit model (explicit wins).
 */
export function createSchemaFormModel(
  schema: SchemaFormSchema | undefined,
  model?: FormValues,
  source?: FormValues
): FormValues {
  const mapped = source ? mapSchemaFormValuesIn(schema, source) : collectSchemaFormDefaults(schema)
  if (!model) return mapped
  return { ...mapped, ...cloneFormValues(model) }
}

export function mergeSchemaFormConditions(
  schema: SchemaFormSchema | undefined,
  overlay?: FormConditions
): FormConditions | undefined {
  return collectSchemaFormConditions(schema, overlay)
}

export function fieldConditionOf(field: SchemaFormField): FormFieldCondition | undefined {
  return field.condition
}
