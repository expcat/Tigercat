/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { useFormController } from '@expcat/tigercat-vue'

describe('useFormController (Vue)', () => {
  describe('values', () => {
    it('initializes with given values', () => {
      const form = useFormController({ initialValues: { name: 'Alice', age: 30 } })
      expect(form.values).toEqual({ name: 'Alice', age: 30 })
    })

    it('defaults to empty object', () => {
      const form = useFormController()
      expect(form.values).toEqual({})
    })

    it('setFieldValue updates a single field', () => {
      const form = useFormController({ initialValues: { name: '' } })
      form.setFieldValue('name', 'Bob')
      expect(form.values.name).toBe('Bob')
    })

    it('setValues updates multiple fields', () => {
      const form = useFormController({ initialValues: { a: 1, b: 2 } })
      form.setValues({ a: 10, b: 20 })
      expect(form.values.a).toBe(10)
      expect(form.values.b).toBe(20)
    })

    it('getFieldValue reads a field', () => {
      const form = useFormController({ initialValues: { x: 42 } })
      expect(form.getFieldValue('x')).toBe(42)
    })
  })

  describe('validation', () => {
    it('validate returns true when no rules', async () => {
      const form = useFormController({ initialValues: { name: '' } })
      const valid = await form.validate()
      expect(valid).toBe(true)
      expect(form.errors).toEqual([])
    })

    it('validate catches required field errors', async () => {
      const form = useFormController({
        initialValues: { name: '' },
        rules: { name: { required: true, message: 'Name is required' } }
      })

      const valid = await form.validate()
      expect(valid).toBe(false)
      expect(form.errors).toEqual([{ field: 'name', message: 'Name is required' }])
      expect(form.errorsByField.name).toBe('Name is required')
      expect(form.hasErrors).toBe(true)
    })

    it('validateField validates a single field', async () => {
      const form = useFormController({
        initialValues: { email: 'bad' },
        rules: { email: { type: 'email', message: 'Invalid email' } }
      })

      const error = await form.validateField('email')
      expect(error).toBe('Invalid email')
      expect(form.errorsByField.email).toBe('Invalid email')
    })

    it('validateFields validates subset', async () => {
      const form = useFormController({
        initialValues: { a: '', b: '' },
        rules: {
          a: { required: true, message: 'A required' },
          b: { required: true, message: 'B required' }
        }
      })

      const valid = await form.validateFields(['a'])
      expect(valid).toBe(false)
      expect(form.errorsByField.a).toBe('A required')
      expect(form.errorsByField.b).toBeUndefined()
    })

    it('clearValidate clears all errors', async () => {
      const form = useFormController({
        initialValues: { name: '' },
        rules: { name: { required: true, message: 'Required' } }
      })

      await form.validate()
      expect(form.hasErrors).toBe(true)

      form.clearValidate()
      expect(form.errors).toEqual([])
    })

    it('clearValidate clears specific field', async () => {
      const form = useFormController({
        initialValues: { a: '', b: '' },
        rules: {
          a: { required: true, message: 'A' },
          b: { required: true, message: 'B' }
        }
      })

      await form.validate()
      expect(form.errors.length).toBe(2)

      form.clearValidate('a')
      expect(form.errorsByField.a).toBeUndefined()
      expect(form.errorsByField.b).toBe('B')
    })
  })

  describe('reset', () => {
    it('resets values and clears errors', async () => {
      const form = useFormController({
        initialValues: { name: 'init' },
        rules: { name: { required: true, message: 'R' } }
      })

      form.setFieldValue('name', '')
      await form.validate()
      expect(form.hasErrors).toBe(true)

      form.reset()
      expect(form.values.name).toBe('init')
      expect(form.errors).toEqual([])
    })
  })

  describe('undo/redo', () => {
    it('canUndo/canRedo are false when undoable is off', () => {
      const form = useFormController({ initialValues: { x: 1 } })
      expect(form.canUndo).toBe(false)
      expect(form.canRedo).toBe(false)
    })

    it('supports undo and redo when undoable', () => {
      const form = useFormController({ initialValues: { x: 1 }, undoable: true })

      form.setFieldValue('x', 2)
      form.setFieldValue('x', 3)
      expect(form.values.x).toBe(3)
      expect(form.canUndo).toBe(true)

      form.undo()
      expect(form.values.x).toBe(2)

      form.undo()
      expect(form.values.x).toBe(1)
      expect(form.canUndo).toBe(false)

      expect(form.canRedo).toBe(true)
      form.redo()
      expect(form.values.x).toBe(2)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty or minimal props without errors', () => {
      const form = useFormController()
      expect(form.getFieldValue('missing')).toBeUndefined()
    })
  })
})
