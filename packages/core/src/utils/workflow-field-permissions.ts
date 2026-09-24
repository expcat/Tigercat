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
  WorkflowStepKind,
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
 * One default. A field is editable only when every supplied side allows it:
 * node kind `start` and view mode `initiate`. The stricter side wins.
 * A missing side does not open edits by itself when the other side is stricter.
 */
export function defaultWorkflowFieldPermission(
  kindOrMode: WorkflowStepKind | WorkflowFieldPermissionMode | undefined,
  mode?: WorkflowFieldPermissionMode
): FieldPermission {
  const kind =
    kindOrMode === 'start' ||
    kindOrMode === 'approve' ||
    kindOrMode === 'cc' ||
    kindOrMode === 'condition' ||
    kindOrMode === 'end'
      ? kindOrMode
      : undefined
  const resolvedMode =
    mode ??
    (kindOrMode === 'initiate' || kindOrMode === 'approve' || kindOrMode === 'readonly'
      ? kindOrMode
      : undefined)
  const kindEditable = kind === 'start'
  const modeEditable = resolvedMode === 'initiate'
  if (kind && resolvedMode) return kindEditable && modeEditable ? 'editable' : 'readonly'
  if (kind) return kindEditable ? 'editable' : 'readonly'
  if (resolvedMode) return modeEditable ? 'editable' : 'readonly'
  return 'readonly'
}

/**
 * Resolve one field path. Schema-hidden fields stay hidden; a node map
 * cannot open them. `readonly` mode never upgrades a field to editable.
 */
export function resolveWorkflowFieldPermission(
  field: SchemaFormField | string,
  permissions: Record<string, FieldPermission> | undefined,
  mode: WorkflowFieldPermissionMode,
  kind?: WorkflowStepKind
): FieldPermission {
  if (typeof field !== 'string' && field.hidden) return 'hidden'
  const name = typeof field === 'string' ? field : field.name
  const mapped = name ? permissions?.[name] : undefined
  let permission: FieldPermission
  if (isFieldPermission(mapped)) {
    permission = mapped
  } else {
    permission = defaultWorkflowFieldPermission(kind, mode)
  }
  if (mode === 'readonly' && permission === 'editable') return 'readonly'
  if (permission === 'hidden') return 'hidden'
  return permission
}

function applyPermissionToField(
  field: SchemaFormField,
  permissions: Record<string, FieldPermission> | undefined,
  mode: WorkflowFieldPermissionMode,
  kind?: WorkflowStepKind
): SchemaFormField {
  if (typeof field.name !== 'string' || !field.name.trim()) return { ...field }
  const permission = resolveWorkflowFieldPermission(field, permissions, mode, kind)
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
  mode: WorkflowFieldPermissionMode,
  kind?: WorkflowStepKind
): SchemaFormGroup[] | undefined {
  if (!groups) return undefined
  const next: SchemaFormGroup[] = []
  for (const group of groups) {
    const fields = group.fields?.map((field) =>
      applyPermissionToField(field, permissions, mode, kind)
    )
    const nested = mapGroups(group.groups, permissions, mode, kind)
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
 * The default permission is {@link defaultWorkflowFieldPermission}: editable
 * only when the node kind and the view mode are both the lenient side.
 * Schema-hidden fields stay hidden.
 */
export function applyWorkflowFieldPermissions(
  schema: SchemaFormSchema | undefined,
  permissions: Record<string, FieldPermission> | undefined,
  mode: WorkflowFieldPermissionMode | string,
  kind?: WorkflowStepKind
): SchemaFormSchema {
  const resolvedMode = resolveWorkflowFieldPermissionMode(mode)
  if (!schema) return {}
  const fields = schema.fields?.map((field) =>
    applyPermissionToField(field, permissions, resolvedMode, kind)
  )
  const groups = mapGroups(schema.groups, permissions, resolvedMode, kind)
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
  step: Pick<WorkflowTimelineStep, 'fieldPermissions' | 'kind'> | undefined,
  mode: WorkflowFieldPermissionMode | string
): SchemaFormSchema {
  return applyWorkflowFieldPermissions(schema, step?.fieldPermissions, mode, step?.kind)
}

/**
 * Visible, not-disabled field names after permission derivation.
 * Hosts should only accept client writes for these paths.
 */
export function listWorkflowEditableFieldNames(
  schema: SchemaFormSchema | undefined,
  permissions: Record<string, FieldPermission> | undefined,
  mode: WorkflowFieldPermissionMode | string,
  kind?: WorkflowStepKind
): string[] {
  const derived = applyWorkflowFieldPermissions(schema, permissions, mode, kind)
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
  mode: WorkflowFieldPermissionMode | string,
  kind?: WorkflowStepKind
): FormValues {
  const base = cloneFormValues(original ?? {})
  if (!submitted) return base
  const names = listWorkflowEditableFieldNames(schema, permissions, mode, kind)
  let next = base
  for (const name of names) {
    next = setValueByPath(next, name, getValueByPath(submitted, name))
  }
  return next
}
