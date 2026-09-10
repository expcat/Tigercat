/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  applyWorkflowFieldPermissions,
  applyWorkflowFieldPermissionsFromStep,
  collectSchemaFormRules,
  defaultWorkflowFieldPermission,
  flattenSchemaFormFields,
  isWorkflowFieldPermissionMode,
  listWorkflowEditableFieldNames,
  mergeWorkflowFormValues,
  resolveSchemaFormLayout,
  resolveWorkflowFieldPermission,
  resolveWorkflowFieldPermissionMode,
  type FieldPermission,
  type SchemaFormSchema,
  type WorkflowTimelineStep
} from '@expcat/tigercat-core'
import {
  applyWorkflowFieldPermissions as applyFromSubpath,
  mergeWorkflowFormValues as mergeFromSubpath
} from '@expcat/tigercat-core/schema-form'

const schema: SchemaFormSchema = {
  fields: [
    { name: 'reason', label: 'Reason', required: true },
    { name: 'amount', label: 'Amount', type: 'number', required: true }
  ],
  groups: [
    {
      key: 'finance',
      title: 'Finance',
      fields: [
        { name: 'budget.code', label: 'Budget code' },
        { name: 'secretNote', label: 'Secret', hidden: true }
      ]
    }
  ]
}

const approvePermissions: Record<string, FieldPermission> = {
  reason: 'readonly',
  amount: 'hidden',
  'budget.code': 'editable'
}

describe('applyWorkflowFieldPermissions', () => {
  it('initiate keeps unmapped fields editable and applies the map', () => {
    const derived = applyWorkflowFieldPermissions(schema, approvePermissions, 'initiate')
    const fields = flattenSchemaFormFields(derived)
    expect(fields.map((field) => field.name)).toEqual(['reason', 'budget.code'])
    expect(fields.find((field) => field.name === 'reason')?.disabled).toBe(true)
    expect(fields.find((field) => field.name === 'budget.code')?.disabled).toBe(false)
    expect(flattenSchemaFormFields(schema).map((field) => field.name)).toEqual([
      'reason',
      'amount',
      'budget.code'
    ])
    expect(applyFromSubpath(schema, approvePermissions, 'initiate')).toEqual(derived)
  })

  it('approve defaults unmapped visible fields to readonly', () => {
    const derived = applyWorkflowFieldPermissions(schema, { amount: 'hidden' }, 'approve')
    const fields = flattenSchemaFormFields(derived)
    expect(fields.map((field) => field.name)).toEqual(['reason', 'budget.code'])
    expect(fields.every((field) => field.disabled)).toBe(true)
    expect(collectSchemaFormRules(derived)?.amount).toBeUndefined()
    expect(collectSchemaFormRules(derived)?.reason).toEqual({ required: true })
  })

  it('readonly mode forces editable permissions down to readonly and keeps hidden hidden', () => {
    const derived = applyWorkflowFieldPermissions(
      schema,
      { reason: 'editable', amount: 'hidden' },
      'readonly'
    )
    const fields = flattenSchemaFormFields(derived)
    expect(fields.map((field) => field.name)).toEqual(['reason', 'budget.code'])
    expect(fields.find((field) => field.name === 'reason')?.disabled).toBe(true)
    expect(fields.find((field) => field.name === 'amount')).toBeUndefined()
  })

  it('does not mutate the source schema', () => {
    const copy = structuredClone(schema)
    applyWorkflowFieldPermissions(schema, approvePermissions, 'approve')
    expect(schema).toEqual(copy)
  })

  it('prunes groups that only contain hidden fields', () => {
    const derived = applyWorkflowFieldPermissions(
      schema,
      { reason: 'hidden', amount: 'hidden', 'budget.code': 'hidden' },
      'approve'
    )
    expect(derived.groups).toBeUndefined()
    expect(resolveSchemaFormLayout(derived)).toEqual([])
  })

  it('keeps schema-hidden fields hidden when they are unmapped', () => {
    const derived = applyWorkflowFieldPermissions(schema, undefined, 'initiate')
    expect(flattenSchemaFormFields(derived).map((field) => field.name)).toEqual([
      'reason',
      'amount',
      'budget.code'
    ])
    expect(derived.groups?.[0]?.fields?.find((field) => field.name === 'secretNote')?.hidden).toBe(
      true
    )
  })

  it('returns an empty schema when the source is omitted', () => {
    expect(applyWorkflowFieldPermissions(undefined, undefined, 'initiate')).toEqual({})
  })

  it('reads permissions from a step', () => {
    const step: WorkflowTimelineStep = {
      key: 'manager',
      fieldPermissions: approvePermissions
    }
    const derived = applyWorkflowFieldPermissionsFromStep(schema, step, 'approve')
    expect(flattenSchemaFormFields(derived).map((field) => field.name)).toEqual([
      'reason',
      'budget.code'
    ])
  })
})

describe('permission mode helpers', () => {
  it('defaults missing paths by mode and never upgrades readonly mode', () => {
    expect(defaultWorkflowFieldPermission('initiate')).toBe('editable')
    expect(defaultWorkflowFieldPermission('approve')).toBe('readonly')
    expect(resolveWorkflowFieldPermission('reason', undefined, 'initiate')).toBe('editable')
    expect(resolveWorkflowFieldPermission('reason', { reason: 'editable' }, 'readonly')).toBe(
      'readonly'
    )
    expect(resolveWorkflowFieldPermissionMode('nope')).toBe('readonly')
    expect(isWorkflowFieldPermissionMode('approve')).toBe(true)
    expect(isWorkflowFieldPermissionMode('write')).toBe(false)
  })
})

describe('mergeWorkflowFormValues', () => {
  it('overlays only editable paths onto the original values', () => {
    const original = { reason: 'Travel', amount: 1200, budget: { code: 'A-1' } }
    const submitted = { reason: 'hacked', amount: 9, budget: { code: 'B-2' } }
    const merged = mergeWorkflowFormValues(
      original,
      submitted,
      schema,
      approvePermissions,
      'approve'
    )
    expect(merged).toEqual({ reason: 'Travel', amount: 1200, budget: { code: 'B-2' } })
    expect(mergeFromSubpath(original, submitted, schema, approvePermissions, 'approve')).toEqual(
      merged
    )
    expect(listWorkflowEditableFieldNames(schema, approvePermissions, 'approve')).toEqual([
      'budget.code'
    ])
  })

  it('keeps original values when submitted is omitted', () => {
    const original = { reason: 'Travel' }
    expect(
      mergeWorkflowFormValues(original, undefined, schema, approvePermissions, 'approve')
    ).toEqual({ reason: 'Travel' })
  })
})
