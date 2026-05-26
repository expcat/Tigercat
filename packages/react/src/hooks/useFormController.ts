import { useState, useCallback, useMemo, useRef } from 'react'
import {
  validateForm,
  validateField as validateFieldUtil,
  getValueByPath,
  createFormErrorMap,
  clearFieldErrors,
  createFormHistory,
  pushFormHistory,
  undoFormHistory,
  redoFormHistory,
  canUndo as canUndoFn,
  canRedo as canRedoFn,
  type FormController,
  type FormControllerOptions,
  type FormValues,
  type FormError,
  type FormRules
} from '@expcat/tigercat-core'

/**
 * Headless form controller hook.
 *
 * Returns a `FormController` that manages values, validation, and undo/redo
 * independently of any `<Form>` component.
 *
 * @example
 * ```tsx
 * const form = useFormController({
 *   initialValues: { name: '', email: '' },
 *   rules: { name: { required: true, message: 'Required' } }
 * })
 *
 * // Standalone usage
 * <input value={form.values.name} onChange={e => form.setFieldValue('name', e.target.value)} />
 * {form.errorsByField.name && <span>{form.errorsByField.name}</span>}
 * <button onClick={() => form.validate()}>Submit</button>
 * ```
 */
export function useFormController(options: FormControllerOptions = {}): FormController {
  const { initialValues = {}, rules, undoable = false, maxHistorySize = 50 } = options

  const [values, setValues] = useState<FormValues>(() => ({ ...initialValues }))
  const [errors, setErrors] = useState<FormError[]>([])
  const valuesRef = useRef<FormValues>(values)
  valuesRef.current = values

  const rulesRef = useRef<FormRules | undefined>(rules)
  rulesRef.current = rules

  const initialRef = useRef<FormValues>(initialValues)

  const [history, setHistory] = useState(() =>
    undoable ? createFormHistory(initialValues, maxHistorySize) : null
  )

  const errorsByField = useMemo(() => createFormErrorMap(errors), [errors])
  const hasErrors = errors.length > 0

  const setFieldValue = useCallback(
    (fieldName: string, value: unknown) => {
      setValues((prev) => {
        const next = { ...prev, [fieldName]: value }
        valuesRef.current = next
        return next
      })
      if (undoable) {
        setHistory((h) =>
          h ? pushFormHistory(h, { ...valuesRef.current, [fieldName]: value }) : h
        )
      }
    },
    [undoable]
  )

  const setBulkValues = useCallback(
    (partial: Partial<FormValues>) => {
      setValues((prev) => {
        const next = { ...prev, ...partial }
        valuesRef.current = next
        return next
      })
      if (undoable) {
        setHistory((h) => (h ? pushFormHistory(h, { ...valuesRef.current, ...partial }) : h))
      }
    },
    [undoable]
  )

  const getFieldValue = useCallback(
    (fieldName: string) => getValueByPath(valuesRef.current, fieldName),
    []
  )

  const validate = useCallback(async (): Promise<boolean> => {
    const r = rulesRef.current
    if (!r) {
      setErrors([])
      return true
    }
    const result = await validateForm(valuesRef.current, r)
    setErrors(result.errors)
    return result.valid
  }, [])

  const validateFields = useCallback(async (fieldNames: string[]): Promise<boolean> => {
    const r = rulesRef.current
    if (!r || fieldNames.length === 0) return true

    const nextErrors: FormError[] = []
    for (const name of fieldNames) {
      const fieldRules = r[name]
      if (!fieldRules) continue
      const error = await validateFieldUtil(
        name,
        getValueByPath(valuesRef.current, name),
        fieldRules,
        valuesRef.current
      )
      if (error) nextErrors.push({ field: name, message: error })
    }

    const fieldSet = new Set(fieldNames)
    setErrors((prev) => [...prev.filter((e) => !fieldSet.has(e.field)), ...nextErrors])
    return nextErrors.length === 0
  }, [])

  const validateField = useCallback(async (fieldName: string): Promise<string | null> => {
    const r = rulesRef.current
    const fieldRules = r?.[fieldName]
    if (!fieldRules) return null

    const error = await validateFieldUtil(
      fieldName,
      getValueByPath(valuesRef.current, fieldName),
      fieldRules,
      valuesRef.current
    )

    setErrors((prev) => {
      const filtered = prev.filter((e) => e.field !== fieldName)
      return error ? [...filtered, { field: fieldName, message: error }] : filtered
    })

    return error
  }, [])

  const clearValidate = useCallback((fieldNames?: string | string[]) => {
    if (!fieldNames) {
      setErrors([])
      return
    }
    const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames]
    setErrors((prev) => clearFieldErrors(fields, prev))
  }, [])

  const reset = useCallback(() => {
    const init = { ...initialRef.current }
    setValues(init)
    valuesRef.current = init
    setErrors([])
    if (undoable) {
      setHistory(createFormHistory(init, maxHistorySize))
    }
  }, [undoable, maxHistorySize])

  const undo = useCallback(() => {
    if (!undoable) return
    setHistory((h) => {
      if (!h) return h
      const next = undoFormHistory(h)
      if (!next) return h
      setValues(next.present)
      valuesRef.current = next.present
      return next
    })
  }, [undoable])

  const redo = useCallback(() => {
    if (!undoable) return
    setHistory((h) => {
      if (!h) return h
      const next = redoFormHistory(h)
      if (!next) return h
      setValues(next.present)
      valuesRef.current = next.present
      return next
    })
  }, [undoable])

  return {
    values,
    errors,
    errorsByField,
    hasErrors,
    setFieldValue,
    setValues: setBulkValues,
    getFieldValue,
    validate,
    validateFields,
    validateField,
    clearValidate,
    reset,
    undo,
    redo,
    get canUndo() {
      return undoable && history != null && canUndoFn(history)
    },
    get canRedo() {
      return undoable && history != null && canRedoFn(history)
    }
  }
}
