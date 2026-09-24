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
  evaluateFieldRules,
  firstFieldRuleError,
  formValuesEqual,
  getValueByPath,
  insertFieldArrayItem,
  isFormValidationCancelled,
  FormValidationSupersededError,
  removeFieldArrayItem,
  setValueByPath,
  shiftFieldArrayErrors,
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
  registerFieldDisabled: (fieldName: string, disabled: boolean | null) => void
  getMountedFieldNames: () => string[]
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
  const fieldDisabled: Record<string, boolean> = {}
  const mountedFields = new Set<string>()

  let values: FormValues = cloneFormValues(options.initialValues ?? {})
  let initialValues: FormValues = cloneFormValues(options.initialValues ?? {})
  let errors: FormError[] = []
  let errorAnnouncement: 'polite' | 'assertive' = 'polite'
  let undoable = options.undoable ?? false
  let maxHistorySize = options.maxHistorySize ?? 50
  let history: FormHistoryState | null = undoable ? createFormHistory(values, maxHistorySize) : null
  let validateGeneration = 0
  /** Per-field outcomes aligned to the last merged rule list. `undefined` was not run. */
  const ruleOutcomes = new Map<string, Array<string | null | undefined>>()

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

  function normalizeRuleList(rules?: FormRule | FormRule[]): FormRule[] {
    if (!rules) return []
    return (Array.isArray(rules) ? rules : [rules]).filter((rule): rule is FormRule => Boolean(rule))
  }

  function mergeRuleLists(
    base?: FormRule | FormRule[],
    extra?: FormRule | FormRule[]
  ): FormRule | FormRule[] | undefined {
    const merged = [...normalizeRuleList(base), ...normalizeRuleList(extra)]
    if (merged.length === 0) return undefined
    if (merged.length === 1) return merged[0]
    return merged
  }

  function getMergedRules(): FormRules | undefined {
    const formLevel = readRules() ?? {}
    const names = new Set<string>([...Object.keys(formLevel), ...Object.keys(fieldRules)])
    const merged: FormRules = {}
    for (const fieldName of names) {
      const combined = mergeRuleLists(formLevel[fieldName], fieldRules[fieldName])
      if (combined) merged[fieldName] = combined
    }
    return Object.keys(merged).length > 0 ? merged : undefined
  }

  function getEffectiveRules(model: FormValues = values): FormRules | undefined {
    return resolveConditionalFormRules(model, getMergedRules(), getEffectiveConditions())
  }

  function resolveFieldRules(
    fieldName: string,
    rulesOverride?: FormRule | FormRule[],
    model: FormValues = values
  ): FormRule | FormRule[] | undefined {
    const itemRules = rulesOverride !== undefined ? rulesOverride : fieldRules[fieldName]
    const fieldRule = mergeRuleLists(readRules()?.[fieldName], itemRules)
    const resolved = resolveConditionalFormRules(
      model,
      fieldRule ? { [fieldName]: fieldRule } : undefined,
      getEffectiveConditions()
    )
    return resolved?.[fieldName]
  }

  function rememberRuleOutcomes(
    fieldName: string,
    outcomes: Array<string | null | undefined>
  ): string | null {
    const previous = ruleOutcomes.get(fieldName)
    const sameLength = previous && previous.length === outcomes.length
    const merged = outcomes.map((outcome, index) => {
      if (outcome !== undefined) return outcome
      return sameLength ? previous[index] : undefined
    })
    const ran = outcomes.some((outcome) => outcome !== undefined)
    if (!ran) {
      return errors.find((entry) => entry.field === fieldName)?.message ?? null
    }
    ruleOutcomes.set(fieldName, merged)
    return firstFieldRuleError(merged)
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
    const changed = !formValuesEqual(values, next)
    if (!changed) return
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
    if (!conditionState.shown || conditionState.disabled || fieldDisabled[fieldName]) {
      ruleOutcomes.delete(fieldName)
      patchFieldError(fieldName, null)
      onValidate?.(fieldName, true, null)
    } else {
      const fieldRule = resolveFieldRules(fieldName, rulesOverride)
      if (fieldRule) {
        const evaluation = await evaluateFieldRules(
          fieldName,
          getValueByPath(values, fieldName),
          fieldRule,
          values,
          trigger,
          readMessages()
        )
        const ran = evaluation.outcomes.some((outcome) => outcome !== undefined)
        if (ran) {
          const error = rememberRuleOutcomes(fieldName, evaluation.outcomes)
          patchFieldError(fieldName, error)
          onValidate?.(fieldName, !error, error)
        }
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
    errorAnnouncement = 'polite'
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

  async function runValidate(snapshot: FormValues, generation: number): Promise<boolean> {
    debouncer.cancel()
    const effectiveRules = getEffectiveRules(snapshot)
    if (generation !== validateGeneration) {
      throw new FormValidationSupersededError()
    }
    if (!effectiveRules) {
      errors = []
      ruleOutcomes.clear()
      emit()
      return true
    }
    const order = getValidationOrder(Object.keys(effectiveRules), getDependencyMap())
    const nextErrors: FormError[] = []
    const nextOutcomes = new Map<string, Array<string | null | undefined>>()
    for (const fieldName of order) {
      if (generation !== validateGeneration) {
        throw new FormValidationSupersededError()
      }
      const fieldRule = effectiveRules[fieldName]
      if (!fieldRule) continue
      const evaluation = await evaluateFieldRules(
        fieldName,
        getValueByPath(snapshot, fieldName),
        fieldRule,
        snapshot,
        undefined,
        readMessages()
      )
      nextOutcomes.set(fieldName, evaluation.outcomes)
      const error = firstFieldRuleError(evaluation.outcomes)
      if (error) nextErrors.push({ field: fieldName, message: error })
    }
    if (generation !== validateGeneration) {
      throw new FormValidationSupersededError()
    }
    ruleOutcomes.clear()
    for (const [fieldName, outcomes] of nextOutcomes) {
      ruleOutcomes.set(fieldName, outcomes)
    }
    errors = nextErrors
    emit()
    return nextErrors.length === 0
  }

  async function validate(): Promise<boolean> {
    const generation = ++validateGeneration
    const snapshot = cloneFormValues(values)
    errorAnnouncement = 'assertive'
    try {
      return await runValidate(snapshot, generation)
    } catch (error) {
      if (generation !== validateGeneration) {
        throw new FormValidationSupersededError()
      }
      throw error
    }
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
      ruleOutcomes.clear()
      emit()
      return
    }
    const fields = Array.isArray(fieldNames) ? fieldNames : [fieldNames]
    fields.forEach((fieldName) => {
      debouncer.cancel(fieldName)
      ruleOutcomes.delete(fieldName)
    })
    errors = errors.filter((entry) => !fields.includes(entry.field))
    emit()
  }

  function setFieldError(fieldName: string, message: string | null): void {
    if (!fieldName) return
    ruleOutcomes.delete(fieldName)
    patchFieldError(fieldName, message)
    onValidate?.(fieldName, !message, message)
    emit()
  }

  function setInitialValues(next: FormValues): void {
    if (formValuesEqual(initialValues, next)) return
    initialValues = cloneFormValues(next ?? {})
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
    if (formValuesEqual(values, next)) return
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

  function registerFieldDisabled(fieldName: string, disabled: boolean | null): void {
    if (!fieldName) return
    if (disabled == null) {
      mountedFields.delete(fieldName)
      delete fieldDisabled[fieldName]
      return
    }
    mountedFields.add(fieldName)
    if (disabled) fieldDisabled[fieldName] = true
    else delete fieldDisabled[fieldName]
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
    ruleOutcomes.delete(fieldName)
    errors = errors.filter((entry) => entry.field !== fieldName)
    if (undoable && history) {
      history = pushFormHistory(history, values)
    }
    onValuesChange?.(cloneFormValues(values))
    emit()
  }

  function insertArrayItem(path: string, index: number, item: unknown = {}): void {
    if (!path) return
    const next = insertFieldArrayItem(values, path, index, item)
    errors = shiftFieldArrayErrors(errors, path, index, 'insert')
    commitValues(next, true)
  }

  function removeArrayItem(path: string, index: number): void {
    if (!path) return
    const next = removeFieldArrayItem(values, path, index)
    if (next === values) return
    errors = shiftFieldArrayErrors(errors, path, index, 'remove')
    for (const name of Array.from(ruleOutcomes.keys())) {
      if (name.startsWith(`${path}[${index}]`)) ruleOutcomes.delete(name)
    }
    commitValues(next, true)
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
    get errorAnnouncement() {
      return errorAnnouncement
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
    insertFieldArrayItem: insertArrayItem,
    removeFieldArrayItem: removeArrayItem,
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
    registerFieldDisabled,
    getMountedFieldNames: () => Array.from(mountedFields),
    getFieldConditionState,
    setFieldError,
    setInitialValues,
    replaceValues,
    setOptions,
    dispose
  }
}
