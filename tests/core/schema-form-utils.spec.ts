/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  collectSchemaFormConditions,
  collectSchemaFormDefaults,
  collectSchemaFormRules,
  createSchemaFormModel,
  flattenSchemaFormFields,
  mapSchemaFormValuesIn,
  mapSchemaFormValuesOut,
  resolveSchemaFormLayout,
  resolveSchemaFormWidgetType
} from '@expcat/tigercat-core'
import {
  flattenSchemaFormFields as flattenFromSubpath,
  mapSchemaFormValuesOut as mapOutFromSubpath
} from '@expcat/tigercat-core/schema-form'
import type { SchemaFormSchema } from '@expcat/tigercat-core'

const schema: SchemaFormSchema = {
  fields: [{ name: 'title', label: 'Title', required: true, defaultValue: 'Draft' }],
  groups: [
    {
      key: 'profile',
      title: 'Profile',
      columns: 2,
      fields: [
        { name: 'name', label: 'Name', required: true },
        { name: 'role', type: 'select', options: [{ label: 'Admin', value: 'admin' }] }
      ],
      groups: [
        {
          key: 'address',
          title: 'Address',
          fields: [
            { name: 'address.city', label: 'City', defaultValue: 'Shanghai' },
            { name: 'hiddenNote', hidden: true, defaultValue: 'nope' }
          ]
        }
      ]
    }
  ]
}

describe('schema-form helpers', () => {
  it('flattens visible fields including nested groups and skips hidden', () => {
    const fields = flattenSchemaFormFields(schema)
    expect(fields.map((field) => field.name)).toEqual(['title', 'name', 'role', 'address.city'])
    expect(flattenFromSubpath(schema).map((field) => field.name)).toEqual(
      fields.map((field) => field.name)
    )
  })

  it('builds a nested layout tree for groups', () => {
    const layout = resolveSchemaFormLayout(schema)
    expect(layout).toHaveLength(2)
    expect(layout[0]?.key).toBe('_fields')
    expect(layout[0]?.fields[0]?.name).toBe('title')
    expect(layout[1]?.key).toBe('profile')
    expect(layout[1]?.title).toBe('Profile')
    expect(layout[1]?.columns).toBe(2)
    expect(layout[1]?.groups[0]?.key).toBe('address')
    expect(layout[1]?.groups[0]?.fields.map((field) => field.name)).toEqual(['address.city'])
  })

  it('collects required rules and overlay rules', () => {
    const rules = collectSchemaFormRules(schema, {
      name: [{ required: true, message: 'Name is required' }]
    })
    expect(rules?.title).toEqual({ required: true })
    expect(rules?.name).toEqual([{ required: true, message: 'Name is required' }])
    expect(rules?.['address.city']).toBeUndefined()
  })

  it('collects field conditions', () => {
    const withCondition: SchemaFormSchema = {
      fields: [
        { name: 'kind', defaultValue: 'org' },
        {
          name: 'company',
          condition: { showWhen: { field: 'kind', operator: 'equals', value: 'org' } }
        }
      ]
    }
    const conditions = collectSchemaFormConditions(withCondition)
    expect(conditions?.company).toEqual({
      showWhen: { field: 'kind', operator: 'equals', value: 'org' }
    })
  })

  it('collects defaults including dotted nested paths and skips hidden', () => {
    expect(collectSchemaFormDefaults(schema)).toEqual({
      title: 'Draft',
      address: { city: 'Shanghai' }
    })
  })

  it('maps source values in and out with valuePath and transforms', () => {
    const mappingSchema: SchemaFormSchema = {
      fields: [
        {
          name: 'displayName',
          valuePath: 'user.name',
          mapIn: (raw) => String(raw ?? '').toUpperCase(),
          mapOut: (value) => String(value ?? '').toLowerCase()
        },
        { name: 'age', type: 'number', valuePath: 'user.age' }
      ]
    }
    const inbound = mapSchemaFormValuesIn(mappingSchema, {
      user: { name: 'Ada', age: 37 }
    })
    expect(inbound).toEqual({ displayName: 'ADA', age: 37 })
    const outbound = mapSchemaFormValuesOut(mappingSchema, { displayName: 'ADA', age: 37 })
    expect(outbound).toEqual({ user: { name: 'ada', age: 37 } })
    expect(mapOutFromSubpath(mappingSchema, inbound)).toEqual({ user: { name: 'ada', age: 37 } })
  })

  it('merges explicit model over schema defaults', () => {
    expect(createSchemaFormModel(schema, { title: 'Live' })).toEqual({
      title: 'Live',
      address: { city: 'Shanghai' }
    })
  })

  it('falls unknown widget types back to input', () => {
    expect(resolveSchemaFormWidgetType({ name: 'x' })).toBe('input')
    expect(resolveSchemaFormWidgetType({ name: 'x', type: 'textarea' })).toBe('textarea')
  })
})
