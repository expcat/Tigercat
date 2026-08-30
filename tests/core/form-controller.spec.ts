/**
 * @vitest-environment node
 */

import { describe, expect, it, vi } from 'vitest'
import {
  createFormEngine,
  cloneFormValues,
  setValueByPath,
  getValueByPath,
  createFormValidationDebouncer,
  isFormValidationCancelled,
  validateRule,
  getFormValidationLabels,
  extractFormChangeValue
} from '@expcat/tigercat-core'
import { zhTW } from '@expcat/tigercat-core/locales/zh-TW'

describe('setValueByPath', () => {
  it('writes a top-level key', () => {
    const next = setValueByPath({ name: '' }, 'name', 'Ada')
    expect(next).toEqual({ name: 'Ada' })
  })

  it('writes a nested path without a top-level dotted key', () => {
    const next = setValueByPath({ user: { email: '' } }, 'user.email', 'a@b.c')
    expect(next.user).toEqual({ email: 'a@b.c' })
    expect(next['user.email']).toBeUndefined()
    expect(getValueByPath(next, 'user.email')).toBe('a@b.c')
  })

  it('creates missing intermediate objects', () => {
    const next = setValueByPath({}, 'user.profile.name', 'Ada')
    expect(getValueByPath(next, 'user.profile.name')).toBe('Ada')
  })
})

describe('createFormEngine', () => {
  it('setFieldValue writes nested paths', () => {
    const engine = createFormEngine({ initialValues: { user: { email: '' } } })
    engine.setFieldValue('user.email', 'a@b.c')
    expect(engine.getFieldValue('user.email')).toBe('a@b.c')
    expect(engine.values['user.email']).toBeUndefined()
  })

  it('validateField does not throw on circular fieldDependencies', async () => {
    const engine = createFormEngine({
      initialValues: { a: '1', b: '2' },
      rules: {
        a: { required: true },
        b: { required: true }
      },
      fieldDependencies: { a: ['b'], b: ['a'] }
    })
    await expect(engine.validateField('a')).resolves.toBeNull()
  })

  it('accepts fieldDependencies as a plain object', async () => {
    const engine = createFormEngine({
      initialValues: { password: 'x', confirm: 'y' },
      rules: {
        confirm: {
          validator: (_value, values) =>
            values?.password === values?.confirm ? true : 'Must match'
        }
      },
      fieldDependencies: { confirm: ['password'] }
    })
    await engine.validateField('password')
    expect(engine.errorsByField.confirm).toBe('Must match')
  })

  it('clears errors on hidden fields and still revalidates dependents', async () => {
    const engine = createFormEngine({
      initialValues: { accountType: 'personal', companyName: 'Acme', city: '' },
      rules: {
        companyName: { required: true, message: 'Company required' },
        city: { required: true, message: 'City required' }
      },
      conditions: {
        companyName: { showWhen: { field: 'accountType', value: 'company' } }
      },
      fieldDependencies: { city: ['companyName'] }
    })

    await engine.validateField('companyName')
    expect(engine.errorsByField.companyName).toBeUndefined()
    expect(engine.errorsByField.city).toBe('City required')
  })

  it('snapshots on commit so undo restores nested values', () => {
    const engine = createFormEngine({
      initialValues: { user: { name: 'Ada' } },
      undoable: true
    })
    engine.setFieldValue('user.name', 'Grace')
    expect(engine.canUndo).toBe(true)
    engine.undo()
    expect(engine.getFieldValue('user.name')).toBe('Ada')
  })

  it('undo survives in-place nested mutation after snapshot', () => {
    const engine = createFormEngine({
      initialValues: { user: { name: 'Ada' } },
      undoable: true
    })
    engine.setFieldValue('user.name', 'Grace')
    const live = engine.getValues().user as { name: string }
    live.name = 'mutated'
    engine.undo()
    expect(engine.getFieldValue('user.name')).toBe('Ada')
  })

  it('does not build history when undoable is false', () => {
    const engine = createFormEngine({ initialValues: { x: 1 }, undoable: false })
    engine.setFieldValue('x', 2)
    expect(engine.canUndo).toBe(false)
  })

  it('uses locale messages for required errors', async () => {
    const engine = createFormEngine({
      initialValues: { name: '' },
      rules: { name: { required: true } },
      locale: zhTW
    })
    const error = await engine.validateField('name')
    expect(error).toBe(getFormValidationLabels(zhTW).required)
    expect(error).not.toBe('此字段为必填项')
    expect(error).not.toBe('This field is required')
  })
})

describe('cloneFormValues', () => {
  it('does not share nested references', () => {
    const source = { user: { name: 'Ada' } }
    const cloned = cloneFormValues(source)
    ;(cloned.user as { name: string }).name = 'Grace'
    expect(source.user.name).toBe('Ada')
  })
})

describe('typed validation', () => {
  it('rejects booleans and arrays for type number', async () => {
    expect(await validateRule(true, { type: 'number' })).toBe('Value must be a number')
    expect(await validateRule(false, { type: 'number' })).toBe('Value must be a number')
    expect(await validateRule([1], { type: 'number' })).toBe('Value must be a number')
    expect(await validateRule('123', { type: 'number' })).toBe(null)
  })

  it('rejects non-strings for email and Invalid Date for date', async () => {
    expect(await validateRule(1, { type: 'email' })).toBe('Please enter a valid email address')
    expect(await validateRule(new Date('invalid'), { type: 'date' })).toBe(
      'Please enter a valid date'
    )
  })
})

describe('extractFormChangeValue', () => {
  it('writes native radio value instead of checked', () => {
    const event = { target: { type: 'radio', value: 'a', checked: true } }
    expect(extractFormChangeValue(event)).toEqual({ found: true, value: 'a' })
  })

  it('writes native checkbox as boolean', () => {
    const event = { target: { type: 'checkbox', value: 'on', checked: true } }
    expect(extractFormChangeValue(event)).toEqual({ found: true, value: true })
  })

  it('does not write upload/signature payloads as field values', () => {
    expect(extractFormChangeValue({ empty: true })).toEqual({ found: false })
    expect(extractFormChangeValue({ fileList: [] })).toEqual({ found: false })
    expect(extractFormChangeValue({ originFileObj: {} })).toEqual({ found: false })
  })

  it('keeps primitives including 0 and empty string', () => {
    expect(extractFormChangeValue(0)).toEqual({ found: true, value: 0 })
    expect(extractFormChangeValue('')).toEqual({ found: true, value: '' })
    expect(extractFormChangeValue(undefined)).toEqual({ found: false })
  })
})

describe('createFormValidationDebouncer cancel', () => {
  it('rejects pending promises instead of resolving as valid', async () => {
    const debouncer = createFormValidationDebouncer({ delay: 200 })
    const promise = debouncer.schedule('name', () => undefined)
    debouncer.cancel('name')
    await expect(promise).rejects.toSatisfy(isFormValidationCancelled)
  })
})
