/**
 * Derive a SchemaForm schema from node-level fieldPermissions.
 *
 * Hosts pass the initiate schema plus the current node's map, then render
 * SchemaForm. Hidden fields drop out of layout and required rules; readonly
 * fields render disabled. This is not a form designer.
 */

import type { FormValues } from '../types/form'
import type { SchemaFormField, SchemaFormGroup, SchemaFormSchema } from '../types/schema-form'
import type {
  FieldPermission,
  WorkflowFieldPermissionMode,
  WorkflowTimelineStep
} from '../types/workflow-timeline'
import { cloneFormValues, getValueByPath, setValueByPath } from './form-validation'
import { flattenSchemaFormFields } from './schema-form-utils'
import { isFieldPermission } from './workflow-runtime'

export const WORKFLOW_FIELD_PERMISSION_MODES: readonly WorkflowFieldPermissionMode[] = [
  'initiate',
  'approve',
  'readonly'
]

export function isWorkflowFieldPermissionMode(
  value: unknown
): value is WorkflowFieldPermissionMode {
  return value === 'initiate' || value === 'approve' || value === 'readonly'
}

/**
 * Unknown values fall back to `readonly` so a miswired host cannot open edits.
 */
export function resolveWorkflowFieldPermissionMode(mode: unknown): WorkflowFieldPermissionMode {
  return isWorkflowFieldPermissionMode(mode) ? mode : 'readonly'
}

/**
 * Default when a field path is missing from the node map.
 * Start / initiate = editable; approve / CC / done = readonly.
 */
export function defaultWorkflowFieldPermission(mode: WorkflowFieldPermissionMode): FieldPermission {
  return mode === 'initiate' ? 'editable' : 'readonly'
}

/**
 * Resolve one field path. Schema-hidden fields stay hidden when unmapped.
 * `readonly` mode never upgrades a field to editable; hidden stays hidden.
 */
export function resolveWorkflowFieldPermission(
  field: SchemaFormField | string,
  permissions: Record<string, FieldPermission> | undefined,
  mode: WorkflowFieldPermissionMode
): FieldPermission {
  const name = typeof field === 'string' ? field : field.name
  const mapped = name ? permissions?.[name] : undefined
  let permission: FieldPermission
  if (isFieldPermission(mapped)) {
    permission = mapped
  } else if (typeof field !== 'string' && field.hidden) {
    permission = 'hidden'
  } else {
    permission = defaultWorkflowFieldPermission(mode)
  }
  if (mode === 'readonly' && permission === 'editable') return 'readonly'
  return permission
}

function applyPermissionToField(
  field: SchemaFormField,
  permissions: Record<string, FieldPermission> | undefined,
  mode: WorkflowFieldPermissionMode
): SchemaFormField {
  if (typeof field.name !== 'string' || !field.name.trim()) return { ...field }
  const permission = resolveWorkflowFieldPermission(field, permissions, mode)
  if (permission === 'hidden') {
    return { ...field, hidden: true, required: false }
  }
  if (permission === 'readonly') {
    return { ...field, hidden: false, disabled: true }
  }
  return { ...field, hidden: false, disabled: false }
}

function mapGroups(
  groups: readonly SchemaFormGroup[] | undefined,
  permissions: Record<string, FieldPermission> | undefined,
  mode: WorkflowFieldPermissionMode
): SchemaFormGroup[] | undefined {
  if (!groups) return undefined
  const next: SchemaFormGroup[] = []
  for (const group of groups) {
    const fields = group.fields?.map((field) => applyPermissionToField(field, permissions, mode))
    const nested = mapGroups(group.groups, permissions, mode)
    const hasVisibleField = Boolean(fields?.some((field) => !field.hidden))
    const hasNested = Boolean(nested && nested.length > 0)
    if (!hasVisibleField && !hasNested) continue
    next.push({
      ...group,
      fields,
      groups: nested
    })
  }
  return next.length > 0 ? next : undefined
}

/**
 * Derive a SchemaForm-ready schema. Does not mutate `schema`.
 *
 * `initiate` — starter may edit; unmapped fields stay editable.
 * `approve` — apply current-node permissions; unmapped fields are readonly.
 * `readonly` — CC / done / ended; force ≥ readonly, keep hidden hidden.
 */
export function applyWorkflowFieldPermissions(
  schema: SchemaFormSchema | undefined,
  permissions: Record<string, FieldPermission> | undefined,
  mode: WorkflowFieldPermissionMode | string
): SchemaFormSchema {
  const resolvedMode = resolveWorkflowFieldPermissionMode(mode)
  if (!schema) return {}
  const fields = schema.fields?.map((field) =>
    applyPermissionToField(field, permissions, resolvedMode)
  )
  const groups = mapGroups(schema.groups, permissions, resolvedMode)
  return {
    ...schema,
    fields,
    groups
  }
}

/**
 * Convenience: use `step.fieldPermissions` as the map.
 */
export function applyWorkflowFieldPermissionsFromStep(
  schema: SchemaFormSchema | undefined,
  step: Pick<WorkflowTimelineStep, 'fieldPermissions'> | undefined,
  mode: WorkflowFieldPermissionMode | string
): SchemaFormSchema {
  return applyWorkflowFieldPermissions(schema, step?.fieldPermissions, mode)
}

/**
 * Visible, not-disabled field names after permission derivation.
 * Hosts should only accept client writes for these paths.
 */
export function listWorkflowEditableFieldNames(
  schema: SchemaFormSchema | undefined,
  permissions: Record<string, FieldPermission> | undefined,
  mode: WorkflowFieldPermissionMode | string
): string[] {
  const derived = applyWorkflowFieldPermissions(schema, permissions, mode)
  return flattenSchemaFormFields(derived)
    .filter((field) => !field.disabled)
    .map((field) => field.name)
}

/**
 * Merge a client submit over server `original`. Hidden and readonly paths
 * keep the original value; only editable paths overlay. Hosts should call
 * this before writing `formValues` so a client cannot post hidden fields.
 */
export function mergeWorkflowFormValues(
  original: FormValues | undefined,
  submitted: FormValues | undefined,
  schema: SchemaFormSchema | undefined,
  permissions: Record<string, FieldPermission> | undefined,
  mode: WorkflowFieldPermissionMode | string
): FormValues {
  const base = cloneFormValues(original ?? {})
  if (!submitted) return base
  const names = listWorkflowEditableFieldNames(schema, permissions, mode)
  let next = base
  for (const name of names) {
    next = setValueByPath(next, name, getValueByPath(submitted, name))
  }
  return next
}
