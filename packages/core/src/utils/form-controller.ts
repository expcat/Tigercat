/**
 * One form engine for Vue, React, and `useFormController`.
 *
 * Owns values, errors, field registration, trigger validation, dependency
 * revalidation, debounce, and undo history. Framework layers only bind the
 * form DOM, provide/context, and locale.
 */

import type {
  FormConditionState,
  FormConditions,
  FormController,
  FormControllerOptions,
  FormError,
  FormFieldCondition,
  FormFieldDependencies,
  FormRule,
  FormRules,
  FormRuleTrigger,
  FormValues
} from '../types/form'
import {
  createFormConditionDependencies,
  getDependentFields,
  getValidationOrder,
  normalizeFieldDependencies,
  resolveConditionalFormRules,
  resolveFormFieldConditionState
} from './form-dependency-utils'
import {
  canRedo as canRedoFn,
  canUndo as canUndoFn,
  createFormHistory,
  pushFormHistory,
  redoFormHistory,
  undoFormHistory,
  type FormHistoryState
} from './form-history-utils'
import { getFormValidationLabels } from './locale-utils'
import {
  cloneFormValues,
  createFormErrorMap,
  createFormValidationDebouncer,
  getValueByPath,
  isFormValidationCancelled,
  setValueByPath,
  validateField as validateFieldUtil,
  validateFormFields,
  type FormValidationDebouncer,
  type FormValidationMessages
} from './form-validation'

export interface FormEngineOptions extends FormControllerOptions {
  getRules?: () => FormRules | undefined
  getConditions?: () => FormConditions | undefined
  getFieldDependencies?: () => FormFieldDependencies | undefined
  getMessages?: () => FormValidationMessages
  getValidateDebounce?: () => number
  onValidate?: (fieldName: string, valid: boolean, error?: string | null) => void
  onValuesChange?: (values: FormValues) => void
}

export interface FormEngineSetOptions {
  rules?: FormRules
  conditions?: FormConditions
  fieldDependencies?: FormFieldDependencies
  validateDebounce?: number
  messages?: FormValidationMessages
  locale?: FormControllerOptions['locale']
  undoable?: boolean
  maxHistorySize?: number
  onValidate?: FormEngineOptions['onValidate']
  onValuesChange?: FormEngineOptions['onValuesChange']
}

export interface FormEngine extends FormController {
  subscribe: (listener: () => void) => () => void
  registerFieldRules: (fieldName: string, rules?: FormRule | FormRule[]) => void
  registerFieldCondition: (fieldName: string, condition?: FormFieldCondition) => void
  getFieldConditionState: (
    fieldName: string,
    conditionOverride?: FormFieldCondition
  ) => FormConditionState
  getValues: () => FormValues
  getErrors: () => FormError[]
  replaceValues: (next: FormValues, options?: { emit?: boolean }) => void
  setOptions: (options: FormEngineSetOptions) => void
  dispose: () => void
}

export function createFormEngine(options: FormEngineOptions = {}): FormEngine {
  const listeners = new Set<() => void>()
  const fieldRules: Record<string, FormRule | FormRule[]> = {}
  const fieldConditions: FormConditions = {}

  let values: FormValues = cloneFormValues(options.initialValues ?? {})
  const initialValues: FormValues = cloneFormValues(options.initialValues ?? {})
  let errors: FormError[] = []
  let undoable = options.undoable ?? false
  let maxHistorySize = options.maxHistorySize ?? 50
  let history: FormHistoryState | null = undoable ? createFormHistory(values, maxHistorySize) : null
  let inflightValidate: Promise<boolean> | null = null

  let formRules = options.rules
  let formConditions = options.conditions
  let formDependencies = options.fieldDependencies
  let messages: FormValidationMessages | undefined
  let onValidate = options.onValidate
  let onValuesChange = options.onValuesChange

  const readRules = (): FormRules | undefined => options.getRules?.() ?? formRules
  const readConditions = (): FormConditions | undefined =>
    options.getConditions?.() ?? formConditions
  const readDependencies = (): FormFieldDependencies | undefined =>
    options.getFieldDependencies?.() ?? formDependencies
  const readMessages = (): FormValidationMessages =>
    options.getMessages?.() ?? messages ?? getFormValidationLabels(options.locale)
  let debounceDelay = options.validateDebounce ?? 0
  const readDebounce = (): number => options.getValidateDebounce?.() ?? debounceDelay

  let lastDebounce = readDebounce()
  let debouncer: FormValidationDebouncer = createFormValidationDebouncer({
    delay: lastDebounce
  })

  function emit(): void {
    for (const listener of listeners) listener()
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }

  function rebuildDebouncer(): void {
    lastDebounce = readDebounce()
    debouncer.cancel()
    debouncer = createFormValidationDebouncer({ delay: lastDebounce })
  }

  function ensureDebouncer(): void {
    if (readDebounce() === lastDebounce) return
    rebuildDebouncer()
  }

  function getEffectiveConditions(): FormConditions | undefined {
    const merged = { ...(readConditions() ?? {}), ...fieldConditions }
    return Object.keys(merged).length > 0 ? merged : undefined
  }

  function getMergedFieldCondition(
    fieldName: string,
    conditionOverride?: FormFieldCondition
  ): FormFieldCondition | undefined {
    const base = getEffectiveConditions()?.[fieldName]
    return base || conditionOverride ? { ...(base ?? {}), ...(conditionOverride ?? {}) } : undefined
  }

  function getFieldConditionState(
    fieldName: string,
    conditionOverride?: FormFieldCondition
  ): FormConditionState {
    return resolveFormFieldConditionState(
      values,
      getMergedFieldCondition(fieldName, conditionOverride)
    )
  }

  function getMergedRules(): FormRules | undefined {
    const merged = { ...(readRules() ?? {}), ...fieldRules }
    return Object.keys(merged).length > 0 ? merged : undefined
  }

  function getEffectiveRules(): FormRules | undefined {
    return resolveConditionalFormRules(values, getMergedRules(), getEffectiveConditions())
  }

  function resolveFieldRules(
    fieldName: string,
    rulesOverride?: FormRule | FormRule[]
  ): FormRule | FormRule[] | undefined {
    const fieldRule = rulesOverride ?? fieldRules[fieldName] ?? readRules()?.[fieldName]
    const resolved = resolveConditionalFormRules(
      values,
      fieldRule ? { [fieldName]: fieldRule } : undefined,
      getEffectiveConditions()
    )
    return resolved?.[fieldName]
  }

  function getDependencyMap(): Map<string, string[]> | undefined {
    const conditionDependencies = createFormConditionDependencies(getEffectiveConditions())
    const userDependencies = normalizeFieldDependencies(readDependencies())
    if (!userDependencies && conditionDependencies.size === 0) {
      return undefined
    }

    const merged = new Map<string, string[]>(userDependencies ?? [])
    for (const [fieldName, dependencies] of conditionDependencies.entries()) {
      const current = merged.get(fieldName) ?? []
      merged.set(fieldName, Array.from(new Set([...current, ...dependencies])))
    }
    return merged
  }

  function patchFieldError(fieldName: string, error: string | null): void {
    const existing = errors.find((entry) => entry.field === fieldName)
    const existingMessage = existing?.message ?? null
    if (!error && existingMessage === null) return
    if (error && error === existingMessage) return
    errors = errors.filter((entry) => entry.field !== fieldName)
    if (error) {
      errors = [...errors, { field: fieldName, message: error }]
    }
  }

  function commitValues(next: FormValues, snapshot: boolean): void {
    values = next
    if (snapshot && undoable && history) {
      history = pushFormHistory(history, values)
    }
    onValuesChange?.(cloneFormValues(values))
    emit()
  }

  async function validateFieldNow(
    fieldName: string,
    rulesOverride?: FormRule | FormRule[],
    trigger?: FormRuleTrigger,
    visited: Set<string> = new Set()
  ): Promise<string | null> {
    if (visited.has(fieldName)) {
      return errors.find((entry) => entry.field === fieldName)?.message ?? null
    }
    visited.add(fieldName)

    const conditionState = getFieldConditionState(fieldName)
    if (!conditionState.shown || conditionState.disabled) {
      patchFieldError(fieldName, null)
      onValidate?.(fieldName, true, null)
    } else {
      const fieldRule = resolveFieldRules(fieldName, rulesOverride)
      if (fieldRule) {
        const error = await validateFieldUtil(
          fieldName,
          getValueByPath(values, fieldName),
          fieldRule,
          values,
          trigger,
          readMessages()
        )
        patchFieldError(fieldName, error)
        onValidate?.(fieldName, !error, error)
      }
    }

    const dependencyMap = getDependencyMap()
    if (dependencyMap) {
      const dependents = getDependentFields(fieldName, dependencyMap)
      const order = getValidationOrder(dependents, dependencyMap)
      for (const dependent of order) {
        await validateFieldNow(dependent, undefined, undefined, visited)
      }
    }

    emit()
    return errors.find((entry) => entry.field === fieldName)?.message ?? null
  }

  async function validateField(
    fieldName: string,
    rulesOverride?: FormRule | FormRule[],
    trigger?: FormRuleTrigger
  ): Promise<string | null> {
    ensureDebouncer()
    if (trigger === 'change' && readDebounce() > 0) {
      try {
        await debouncer.schedule(fieldName, () =>
          validateFieldNow(fieldName, rulesOverride, trigger)
        )
      } catch (error) {
        if (isFormValidationCancelled(error)) return null
        throw error
      }
      return errors.find((entry) => entry.field === fieldName)?.message ?? null
    }

    debouncer.cancel(fieldName)
    return validateFieldNow(fieldName, rulesOverride, trigger)
  }

  async function runValidate(): Promise<boolean> {
    debouncer.cancel()
    const effectiveRules = getEffectiveRules()
    if (!effectiveRules) {
      errors = []
      emit()
      return true
    }
    const order = getValidationOrder(Object.keys(effectiveRules), getDependencyMap())
    const result = await validateFormFields(
      values,
      effectiveRules,
      order,
      undefined,
      readMessages()
    )
    errors = result.errors
    emit()
    return result.valid
  }

  async function validate(): Promise<boolean> {
    if (inflightValidate) return inflightValidate
    inflightValidate = runValidate().finally(() => {
      inflightValidate = null
    })
    return inflightValidate
  }

  async function validateFields(fieldNames: string[]): Promise<boolean> {
    if (!fieldNames || fieldNames.length === 0) {
      return true
    }

    fieldNames.forEach((fieldName) => debouncer.cancel(fieldName))
    const visited = new Set<string>()
    const dependencyMap = getDependencyMap()
    const order = getValidationOrder(fieldNames, dependencyMap)
    for (const fieldName of order) {
      await validateFieldNow(fieldName, undefined, undefined, visited)
    }
    const requested = new Set(fieldNames)
    return !errors.some((entry) => requested.has(entry.field))
  }

  function clearValidate(fieldNames?: string | string[]): void {
    if (!fieldNames) {
      debouncer.cancel()
      errors = []
      emit()
      return
    }
    const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames]
    fields.forEach((fieldName) => debouncer.cancel(fieldName))
    errors = errors.filter((entry) => !fields.includes(entry.field))
    emit()
  }

  function setFieldValue(fieldName: string, value: unknown): void {
    commitValues(setValueByPath(values, fieldName, value), true)
  }

  function setBulkValues(partial: Partial<FormValues>): void {
    let next = values
    for (const [fieldName, value] of Object.entries(partial)) {
      next = setValueByPath(next, fieldName, value)
    }
    commitValues(next, true)
  }

  function replaceValues(next: FormValues, options?: { emit?: boolean }): void {
    values = cloneFormValues(next)
    if (options?.emit !== false) {
      emit()
    }
  }

  function getFieldValue(fieldName: string): unknown {
    return getValueByPath(values, fieldName)
  }

  function registerFieldRules(fieldName: string, nextRules?: FormRule | FormRule[]): void {
    if (!fieldName) return
    if (!nextRules) {
      delete fieldRules[fieldName]
      return
    }
    fieldRules[fieldName] = nextRules
  }

  function registerFieldCondition(fieldName: string, condition?: FormFieldCondition): void {
    if (!fieldName) return
    if (!condition) {
      delete fieldConditions[fieldName]
      return
    }
    fieldConditions[fieldName] = condition
  }

  function reset(): void {
    debouncer.cancel()
    values = cloneFormValues(initialValues)
    errors = []
    if (undoable) {
      history = createFormHistory(values, maxHistorySize)
    }
    onValuesChange?.(cloneFormValues(values))
    emit()
  }

  function addField(fieldName: string, defaultValue?: unknown): void {
    if (!fieldName) return
    commitValues({ ...values, [fieldName]: defaultValue ?? null }, true)
  }

  function removeField(fieldName: string): void {
    if (!fieldName) return
    const { [fieldName]: _removed, ...rest } = values
    values = rest
    errors = errors.filter((entry) => entry.field !== fieldName)
    if (undoable && history) {
      history = pushFormHistory(history, values)
    }
    onValuesChange?.(cloneFormValues(values))
    emit()
  }

  function snapshotHistory(): void {
    if (!undoable) return
    if (!history) {
      history = createFormHistory(values, maxHistorySize)
    }
    history = pushFormHistory(history, values)
    emit()
  }

  function undo(): void {
    if (!undoable || !history) return
    const next = undoFormHistory(history)
    if (!next) return
    history = next
    values = cloneFormValues(next.present)
    onValuesChange?.(cloneFormValues(values))
    emit()
  }

  function redo(): void {
    if (!undoable || !history) return
    const next = redoFormHistory(history)
    if (!next) return
    history = next
    values = cloneFormValues(next.present)
    onValuesChange?.(cloneFormValues(values))
    emit()
  }

  function setOptions(patch: FormEngineSetOptions): void {
    if (patch.rules !== undefined) formRules = patch.rules
    if (patch.conditions !== undefined) formConditions = patch.conditions
    if (patch.fieldDependencies !== undefined) formDependencies = patch.fieldDependencies
    if (patch.messages !== undefined) messages = patch.messages
    if (patch.locale !== undefined) messages = getFormValidationLabels(patch.locale)
    if (patch.onValidate !== undefined) onValidate = patch.onValidate
    if (patch.onValuesChange !== undefined) onValuesChange = patch.onValuesChange
    if (patch.maxHistorySize !== undefined) maxHistorySize = patch.maxHistorySize
    if (patch.validateDebounce !== undefined) {
      debounceDelay = patch.validateDebounce
      rebuildDebouncer()
    }
    if (patch.undoable !== undefined && patch.undoable !== undoable) {
      undoable = patch.undoable
      history = undoable ? createFormHistory(values, maxHistorySize) : null
    }
  }

  function dispose(): void {
    debouncer.cancel()
    listeners.clear()
  }

  return {
    get values() {
      return values
    },
    get errors() {
      return errors
    },
    get errorsByField() {
      return createFormErrorMap(errors)
    },
    get hasErrors() {
      return errors.length > 0
    },
    getValues: () => values,
    getErrors: () => errors,
    setFieldValue,
    setValues: setBulkValues,
    getFieldValue,
    validate,
    validateFields,
    validateField,
    clearValidate,
    reset,
    resetFields: reset,
    addField,
    removeField,
    undo,
    redo,
    snapshotHistory,
    get canUndo() {
      return Boolean(undoable && history && canUndoFn(history))
    },
    get canRedo() {
      return Boolean(undoable && history && canRedoFn(history))
    },
    subscribe,
    registerFieldRules,
    registerFieldCondition,
    getFieldConditionState,
    replaceValues,
    setOptions,
    dispose
  }
}
