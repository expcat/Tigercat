import { describe, expect, it, vi } from 'vitest'
import {
  getValueByPath,
  validateRule,
  validateField,
  validateForm,
  getFieldError,
  clearFieldErrors,
  hasErrors,
  getErrorFields
} from '@expcat/tigercat-core'

describe('form-validation', () => {
  describe('getValueByPath', () => {
    it('gets top-level value', () => {
      expect(getValueByPath({ name: 'John' }, 'name')).toBe('John')
    })

    it('gets nested value with dot notation', () => {
      expect(getValueByPath({ user: { name: 'John' } }, 'user.name')).toBe('John')
    })

    it('gets deeply nested value', () => {
      expect(getValueByPath({ a: { b: { c: 'deep' } } }, 'a.b.c')).toBe('deep')
    })

    it('returns undefined for non-existent path', () => {
      expect(getValueByPath({ name: 'John' }, 'age')).toBe(undefined)
    })

    it('returns undefined for non-existent nested path', () => {
      expect(getValueByPath({ user: {} }, 'user.name')).toBe(undefined)
    })

    it('returns undefined for null values', () => {
      expect(getValueByPath(undefined, 'name')).toBe(undefined)
    })

    it('returns undefined for empty path', () => {
      expect(getValueByPath({ name: 'John' }, '')).toBe(undefined)
    })

    it('handles array-like paths through objects', () => {
      // Note: This is object access, not array access
      expect(getValueByPath({ items: { '0': 'first' } }, 'items.0')).toBe('first')
    })
  })

  describe('validateRule', () => {
    describe('required validation', () => {
      it('fails for empty string when required', async () => {
        const result = await validateRule('', { required: true })
        expect(result).toBe('This field is required')
      })

      it('fails for null when required', async () => {
        const result = await validateRule(null, { required: true })
        expect(result).toBe('This field is required')
      })

      it('fails for undefined when required', async () => {
        const result = await validateRule(undefined, { required: true })
        expect(result).toBe('This field is required')
      })

      it('fails for empty array when required', async () => {
        const result = await validateRule([], { required: true })
        expect(result).toBe('This field is required')
      })

      it('passes for non-empty value when required', async () => {
        const result = await validateRule('value', { required: true })
        expect(result).toBe(null)
      })

      it('uses custom message when provided', async () => {
        const result = await validateRule('', { required: true, message: 'Custom required' })
        expect(result).toBe('Custom required')
      })
    })

    describe('type validation', () => {
      it('validates string type', async () => {
        expect(await validateRule('text', { type: 'string' })).toBe(null)
        expect(await validateRule(123, { type: 'string' })).toBe('Value must be a string')
      })

      it('validates number type', async () => {
        expect(await validateRule(123, { type: 'number' })).toBe(null)
        expect(await validateRule('123', { type: 'number' })).toBe(null) // Numeric string is valid
        expect(await validateRule('abc', { type: 'number' })).toBe('Value must be a number')
      })

      it('validates boolean type', async () => {
        expect(await validateRule(true, { type: 'boolean' })).toBe(null)
        expect(await validateRule(false, { type: 'boolean' })).toBe(null)
        expect(await validateRule('true', { type: 'boolean' })).toBe('Value must be a boolean')
      })

      it('validates array type', async () => {
        expect(await validateRule([1, 2, 3], { type: 'array' })).toBe(null)
        expect(await validateRule('not array', { type: 'array' })).toBe('Value must be an array')
      })

      it('validates object type', async () => {
        expect(await validateRule({ key: 'value' }, { type: 'object' })).toBe(null)
        expect(await validateRule([1, 2], { type: 'object' })).toBe('Value must be an object')
      })

      it('validates email type', async () => {
        expect(await validateRule('test@example.com', { type: 'email' })).toBe(null)
        expect(await validateRule('invalid-email', { type: 'email' })).toBe(
          'Please enter a valid email address'
        )
      })

      it('validates url type', async () => {
        expect(await validateRule('https://example.com', { type: 'url' })).toBe(null)
        expect(await validateRule('not-a-url', { type: 'url' })).toBe('Please enter a valid URL')
      })

      it('validates date type', async () => {
        expect(await validateRule(new Date(), { type: 'date' })).toBe(null)
        expect(await validateRule('2024-01-01', { type: 'date' })).toBe(null)
        expect(await validateRule('invalid-date', { type: 'date' })).toBe(
          'Please enter a valid date'
        )
      })
    })

    describe('range validation', () => {
      it('validates string min length', async () => {
        expect(await validateRule('ab', { min: 3 })).toBe('Minimum length is 3 characters')
        expect(await validateRule('abc', { min: 3 })).toBe(null)
      })

      it('validates string max length', async () => {
        expect(await validateRule('abcd', { max: 3 })).toBe('Maximum length is 3 characters')
        expect(await validateRule('abc', { max: 3 })).toBe(null)
      })

      it('validates number min value', async () => {
        expect(await validateRule(5, { min: 10 })).toBe('Minimum value is 10')
        expect(await validateRule(10, { min: 10 })).toBe(null)
      })

      it('validates number max value', async () => {
        expect(await validateRule(15, { max: 10 })).toBe('Maximum value is 10')
        expect(await validateRule(10, { max: 10 })).toBe(null)
      })

      it('validates array min length', async () => {
        expect(await validateRule([1], { min: 2 })).toBe('Minimum 2 items required')
        expect(await validateRule([1, 2], { min: 2 })).toBe(null)
      })

      it('validates array max length', async () => {
        expect(await validateRule([1, 2, 3], { max: 2 })).toBe('Maximum 2 items allowed')
        expect(await validateRule([1, 2], { max: 2 })).toBe(null)
      })
    })

    describe('pattern validation', () => {
      it('validates against regex pattern', async () => {
        expect(await validateRule('abc123', { pattern: /^[a-z]+$/ })).toBe(
          'Value does not match the required pattern'
        )
        expect(await validateRule('abc', { pattern: /^[a-z]+$/ })).toBe(null)
      })

      it('uses custom message for pattern failure', async () => {
        expect(await validateRule('123', { pattern: /^[a-z]+$/, message: 'Letters only' })).toBe(
          'Letters only'
        )
      })
    })

    describe('custom validator', () => {
      it('supports sync validator function', async () => {
        const validator = (value: unknown) => {
          if (value !== 'valid') return 'Must be valid'
          return null
        }
        expect(await validateRule('invalid', { validator })).toBe('Must be valid')
        expect(await validateRule('valid', { validator })).toBe(null)
      })

      it('supports async validator function', async () => {
        const validator = async (value: unknown) => {
          await new Promise((resolve) => setTimeout(resolve, 10))
          if (value !== 'valid') return 'Must be valid'
          return null
        }
        expect(await validateRule('invalid', { validator })).toBe('Must be valid')
        expect(await validateRule('valid', { validator })).toBe(null)
      })

      it('receives allValues for cross-field validation', async () => {
        const validator = vi.fn((value, allValues) => {
          if (allValues?.password !== allValues?.confirmPassword) {
            return 'Passwords must match'
          }
          return null
        })

        const allValues = { password: 'secret', confirmPassword: 'different' }
        await validateRule('different', { validator }, allValues)

        expect(validator).toHaveBeenCalledWith('different', allValues)
      })
    })

    describe('transform', () => {
      it('transforms value before validation', async () => {
        const transform = (value: unknown) => String(value).trim()
        expect(await validateRule('  ', { required: true, transform })).toBe(
          'This field is required'
        )
        expect(await validateRule('  value  ', { required: true, transform })).toBe(null)
      })
    })

    describe('skip validation when not required and empty', () => {
      it('skips type validation for empty optional field', async () => {
        expect(await validateRule('', { type: 'email' })).toBe(null)
        expect(await validateRule(null, { type: 'email' })).toBe(null)
      })

      it('skips range validation for empty optional field', async () => {
        expect(await validateRule('', { min: 5 })).toBe(null)
      })
    })
  })

  describe('validateField', () => {
    it('validates field with single rule', async () => {
      const rules = { required: true }
      const result = await validateField('name', '', rules)
      expect(result).toBe('This field is required')
    })

    it('validates field with multiple rules (array)', async () => {
      const rules = [{ required: true }, { type: 'email' as const }]
      const result = await validateField('email', '', rules)
      expect(result).toBe('This field is required')
    })

    it('returns null when valid', async () => {
      const rules = { required: true }
      const result = await validateField('name', 'John', rules)
      expect(result).toBe(null)
    })

    it('respects trigger option', async () => {
      const rules = [
        { required: true, trigger: 'blur' as const },
        { min: 3, trigger: 'change' as const }
      ]

      // Only blur rules should run
      const blurResult = await validateField('name', 'Jo', rules, {}, 'blur')
      expect(blurResult).toBe(null)

      // Only change rules should run
      const changeResult = await validateField('name', 'Jo', rules, {}, 'change')
      expect(changeResult).toBe('Minimum length is 3 characters')
    })

    it('returns null when rules is undefined', async () => {
      const result = await validateField('name', 'value', undefined)
      expect(result).toBe(null)
    })
  })

  describe('validateForm', () => {
    it('validates all fields in form', async () => {
      const values = { name: '', email: 'invalid' }
      const rules = {
        name: { required: true },
        email: [{ required: true }, { type: 'email' as const }]
      }

      const result = await validateForm(values, rules)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(2)
      expect(getFieldError('name', result.errors)).toBe('This field is required')
      expect(getFieldError('email', result.errors)).toBe('Please enter a valid email address')
    })

    it('returns valid result when all fields pass', async () => {
      const values = { name: 'John', email: 'john@example.com' }
      const rules = {
        name: { required: true },
        email: [{ required: true }, { type: 'email' as const }]
      }

      const result = await validateForm(values, rules)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('validates nested field paths', async () => {
      const values = { user: { name: '' } }
      const rules = { 'user.name': { required: true } }

      const result = await validateForm(values, rules)

      expect(result.valid).toBe(false)
      expect(getFieldError('user.name', result.errors)).toBe('This field is required')
    })
  })

  describe('error utilities', () => {
    const sampleErrors = [
      { field: 'name', message: 'Name is required' },
      { field: 'email', message: 'Invalid email' },
      { field: 'age', message: 'Must be a number' }
    ]

    describe('getFieldError', () => {
      it('returns error message for existing field', () => {
        expect(getFieldError('name', sampleErrors)).toBe('Name is required')
      })

      it('returns undefined for non-existent field', () => {
        expect(getFieldError('password', sampleErrors)).toBe(undefined)
      })
    })

    describe('clearFieldErrors', () => {
      it('clears single field error', () => {
        const result = clearFieldErrors('name', sampleErrors)
        expect(result).toHaveLength(2)
        expect(getFieldError('name', result)).toBe(undefined)
      })

      it('clears multiple field errors', () => {
        const result = clearFieldErrors(['name', 'email'], sampleErrors)
        expect(result).toHaveLength(1)
        expect(getFieldError('age', result)).toBe('Must be a number')
      })
    })

    describe('hasErrors', () => {
      it('returns true when errors exist', () => {
        expect(hasErrors(sampleErrors)).toBe(true)
      })

      it('returns false for empty array', () => {
        expect(hasErrors([])).toBe(false)
      })
    })

    describe('getErrorFields', () => {
      it('returns array of field names with errors', () => {
        const fields = getErrorFields(sampleErrors)
        expect(fields).toEqual(['name', 'email', 'age'])
      })

      it('returns empty array for no errors', () => {
        expect(getErrorFields([])).toEqual([])
      })
    })
  })
})
