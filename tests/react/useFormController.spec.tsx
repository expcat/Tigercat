/**
 * @vitest-environment happy-dom
 */

import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFormController } from '@expcat/tigercat-react'

describe('useFormController (React)', () => {
  describe('values', () => {
    it('initializes with given values', () => {
      const { result } = renderHook(() =>
        useFormController({ initialValues: { name: 'Alice', age: 30 } })
      )
      expect(result.current.values).toEqual({ name: 'Alice', age: 30 })
    })

    it('defaults to empty object', () => {
      const { result } = renderHook(() => useFormController())
      expect(result.current.values).toEqual({})
    })

    it('setFieldValue updates a single field', () => {
      const { result } = renderHook(() => useFormController({ initialValues: { name: '' } }))

      act(() => result.current.setFieldValue('name', 'Bob'))
      expect(result.current.values.name).toBe('Bob')
    })

    it('setValues updates multiple fields', () => {
      const { result } = renderHook(() => useFormController({ initialValues: { a: 1, b: 2 } }))

      act(() => result.current.setValues({ a: 10, b: 20 }))
      expect(result.current.values).toEqual({ a: 10, b: 20 })
    })

    it('getFieldValue reads a field', () => {
      const { result } = renderHook(() => useFormController({ initialValues: { x: 42 } }))
      expect(result.current.getFieldValue('x')).toBe(42)
    })
  })

  describe('validation', () => {
    it('validate returns true when no rules', async () => {
      const { result } = renderHook(() => useFormController({ initialValues: { name: '' } }))

      let valid = false
      await act(async () => {
        valid = await result.current.validate()
      })
      expect(valid).toBe(true)
      expect(result.current.errors).toEqual([])
    })

    it('validate catches required field errors', async () => {
      const { result } = renderHook(() =>
        useFormController({
          initialValues: { name: '' },
          rules: { name: { required: true, message: 'Name is required' } }
        })
      )

      let valid = true
      await act(async () => {
        valid = await result.current.validate()
      })
      expect(valid).toBe(false)
      expect(result.current.errors).toEqual([{ field: 'name', message: 'Name is required' }])
      expect(result.current.errorsByField.name).toBe('Name is required')
      expect(result.current.hasErrors).toBe(true)
    })

    it('validateField validates a single field', async () => {
      const { result } = renderHook(() =>
        useFormController({
          initialValues: { email: 'bad' },
          rules: { email: { type: 'email', message: 'Invalid email' } }
        })
      )

      let error: string | null = null
      await act(async () => {
        error = await result.current.validateField('email')
      })
      expect(error).toBe('Invalid email')
      expect(result.current.errorsByField.email).toBe('Invalid email')
    })

    it('validateFields validates subset', async () => {
      const { result } = renderHook(() =>
        useFormController({
          initialValues: { a: '', b: '' },
          rules: {
            a: { required: true, message: 'A required' },
            b: { required: true, message: 'B required' }
          }
        })
      )

      let valid = true
      await act(async () => {
        valid = await result.current.validateFields(['a'])
      })
      expect(valid).toBe(false)
      expect(result.current.errorsByField.a).toBe('A required')
      expect(result.current.errorsByField.b).toBeUndefined()
    })

    it('clearValidate clears all errors', async () => {
      const { result } = renderHook(() =>
        useFormController({
          initialValues: { name: '' },
          rules: { name: { required: true, message: 'Required' } }
        })
      )

      await act(async () => {
        await result.current.validate()
      })
      expect(result.current.hasErrors).toBe(true)

      act(() => result.current.clearValidate())
      expect(result.current.errors).toEqual([])
    })

    it('clearValidate clears specific field', async () => {
      const { result } = renderHook(() =>
        useFormController({
          initialValues: { a: '', b: '' },
          rules: {
            a: { required: true, message: 'A' },
            b: { required: true, message: 'B' }
          }
        })
      )

      await act(async () => {
        await result.current.validate()
      })
      expect(result.current.errors.length).toBe(2)

      act(() => result.current.clearValidate('a'))
      expect(result.current.errorsByField.a).toBeUndefined()
      expect(result.current.errorsByField.b).toBe('B')
    })
  })

  describe('reset', () => {
    it('resets values and clears errors', async () => {
      const { result } = renderHook(() =>
        useFormController({
          initialValues: { name: 'init' },
          rules: { name: { required: true, message: 'R' } }
        })
      )

      act(() => result.current.setFieldValue('name', ''))
      await act(async () => {
        await result.current.validate()
      })
      expect(result.current.hasErrors).toBe(true)

      act(() => result.current.reset())
      expect(result.current.values.name).toBe('init')
      expect(result.current.errors).toEqual([])
    })
  })

  describe('undo/redo', () => {
    it('canUndo/canRedo are false when undoable is off', () => {
      const { result } = renderHook(() => useFormController({ initialValues: { x: 1 } }))
      expect(result.current.canUndo).toBe(false)
      expect(result.current.canRedo).toBe(false)
    })

    it('supports undo and redo when undoable', () => {
      const { result } = renderHook(() =>
        useFormController({ initialValues: { x: 1 }, undoable: true })
      )

      act(() => result.current.setFieldValue('x', 2))
      act(() => result.current.setFieldValue('x', 3))
      expect(result.current.values.x).toBe(3)
      expect(result.current.canUndo).toBe(true)

      act(() => result.current.undo())
      expect(result.current.values.x).toBe(2)

      act(() => result.current.undo())
      expect(result.current.values.x).toBe(1)
      expect(result.current.canUndo).toBe(false)

      expect(result.current.canRedo).toBe(true)
      act(() => result.current.redo())
      expect(result.current.values.x).toBe(2)
    })
  })

  describe('Edge Cases', () => {})
})
