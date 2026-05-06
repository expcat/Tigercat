import { reactive, ref, computed } from 'vue'
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
 * Headless form controller composable.
 *
 * Returns a `FormController` with reactive `values` and `errors` that can
 * be used independently of `<Form>`.
 *
 * @example
 * ```ts
 * const form = useFormController({
 *   initialValues: { name: '', email: '' },
 *   rules: { name: { required: true, message: '必填' } }
 * })
 *
 * // In template: v-model bound to form.values.name
 * // form.errorsByField.name for error display
 * // form.validate() on submit
 * ```
 */
export function useFormController(options: FormControllerOptions = {}): FormController {
  const {
    initialValues = {},
    rules,
    undoable = false,
    maxHistorySize = 50
  } = options

  const values = reactive<FormValues>({ ...initialValues })
  const errors = ref<FormError[]>([])
  const rulesRef = ref<FormRules | undefined>(rules)

  let history = undoable ? createFormHistory({ ...initialValues }, maxHistorySize) : null

  const errorsByField = computed(() => createFormErrorMap(errors.value))
  const hasErrors = computed(() => errors.value.length > 0)

  function setFieldValue(fieldName: string, value: unknown) {
    values[fieldName] = value
    if (undoable && history) {
      history = pushFormHistory(history, { ...values })
    }
  }

  function setValues(partial: Partial<FormValues>) {
    Object.assign(values, partial)
    if (undoable && history) {
      history = pushFormHistory(history, { ...values })
    }
  }

  function getFieldValue(fieldName: string): unknown {
    return getValueByPath(values, fieldName)
  }

  async function validate(): Promise<boolean> {
    const r = rulesRef.value
    if (!r) {
      errors.value = []
      return true
    }
    const result = await validateForm({ ...values }, r)
    errors.value = result.errors
    return result.valid
  }

  async function validateFields(fieldNames: string[]): Promise<boolean> {
    const r = rulesRef.value
    if (!r || fieldNames.length === 0) return true

    const nextErrors: FormError[] = []
    const snapshot = { ...values }
    for (const name of fieldNames) {
      const fieldRules = r[name]
      if (!fieldRules) continue
      const error = await validateFieldUtil(name, getValueByPath(snapshot, name), fieldRules, snapshot)
      if (error) nextErrors.push({ field: name, message: error })
    }

    const fieldSet = new Set(fieldNames)
    errors.value = [
      ...errors.value.filter((e) => !fieldSet.has(e.field)),
      ...nextErrors
    ]
    return nextErrors.length === 0
  }

  async function validateField(fieldName: string): Promise<string | null> {
    const r = rulesRef.value
    const fieldRules = r?.[fieldName]
    if (!fieldRules) return null

    const snapshot = { ...values }
    const error = await validateFieldUtil(
      fieldName,
      getValueByPath(snapshot, fieldName),
      fieldRules,
      snapshot
    )

    const filtered = errors.value.filter((e) => e.field !== fieldName)
    errors.value = error ? [...filtered, { field: fieldName, message: error }] : filtered

    return error
  }

  function clearValidate(fieldNames?: string | string[]) {
    if (!fieldNames) {
      errors.value = []
      return
    }
    const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames]
    errors.value = clearFieldErrors(fields, errors.value)
  }

  function reset() {
    Object.keys(values).forEach((k) => delete values[k])
    Object.assign(values, initialValues)
    errors.value = []
    if (undoable) {
      history = createFormHistory({ ...initialValues }, maxHistorySize)
    }
  }

  function undo() {
    if (!undoable || !history) return
    const next = undoFormHistory(history)
    if (!next) return
    history = next
    Object.keys(values).forEach((k) => delete values[k])
    Object.assign(values, next.present)
  }

  function redo() {
    if (!undoable || !history) return
    const next = redoFormHistory(history)
    if (!next) return
    history = next
    Object.keys(values).forEach((k) => delete values[k])
    Object.assign(values, next.present)
  }

  return {
    get values() { return values },
    get errors() { return errors.value },
    get errorsByField() { return errorsByField.value },
    get hasErrors() { return hasErrors.value },
    setFieldValue,
    setValues,
    getFieldValue,
    validate,
    validateFields,
    validateField,
    clearValidate,
    reset,
    undo,
    redo,
    get canUndo() { return undoable && history != null && canUndoFn(history) },
    get canRedo() { return undoable && history != null && canRedoFn(history) }
  }
}
