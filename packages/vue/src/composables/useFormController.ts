import { onUnmounted, reactive, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import {
  assignFormValues,
  cloneFormValues,
  createFormEngine,
  getFormValidationLabels,
  type FormController,
  type FormControllerOptions,
  type FormEngine,
  type FormValues
} from '@expcat/tigercat-core'

/**
 * Headless form controller. The same engine `<Form>` uses.
 *
 * Pass the return value to `<Form :controller="ctrl">` so hook writes and
 * Form validation share one store. `resetFields` on Form is `ctrl.reset()`.
 */
export function useFormController(
  source: MaybeRefOrGetter<FormControllerOptions> = {}
): FormController {
  const readOptions = (): FormControllerOptions => toValue(source) ?? {}
  const initial = readOptions()
  const engine: FormEngine = createFormEngine({
    initialValues: initial.initialValues,
    undoable: initial.undoable,
    maxHistorySize: initial.maxHistorySize,
    getRules: () => readOptions().rules,
    getConditions: () => readOptions().conditions,
    getFieldDependencies: () => readOptions().fieldDependencies,
    getMessages: () => getFormValidationLabels(readOptions().locale),
    getValidateDebounce: () => readOptions().validateDebounce ?? 0
  })

  watch(
    () => readOptions().initialValues,
    (next) => {
      if (next) engine.setInitialValues(next)
    },
    { deep: true }
  )

  const values = reactive<FormValues>(cloneFormValues(engine.getValues()))
  const errors = ref(engine.getErrors())
  const canUndo = ref(engine.canUndo)
  const canRedo = ref(engine.canRedo)
  const errorAnnouncement = ref(engine.errorAnnouncement)

  const stop = engine.subscribe(() => {
    assignFormValues(values, engine.getValues())
    errors.value = engine.getErrors()
    canUndo.value = engine.canUndo
    canRedo.value = engine.canRedo
    errorAnnouncement.value = engine.errorAnnouncement
  })

  onUnmounted(() => {
    stop()
    engine.dispose()
  })

  return {
    get values() {
      return values
    },
    get errors() {
      return errors.value
    },
    get errorsByField() {
      return engine.errorsByField
    },
    get hasErrors() {
      return engine.hasErrors
    },
    setFieldValue: engine.setFieldValue,
    setValues: engine.setValues,
    getFieldValue: engine.getFieldValue,
    validate: engine.validate,
    validateFields: engine.validateFields,
    validateField: engine.validateField,
    clearValidate: engine.clearValidate,
    reset: engine.reset,
    resetFields: engine.reset,
    addField: engine.addField,
    removeField: engine.removeField,
    undo: engine.undo,
    redo: engine.redo,
    snapshotHistory: engine.snapshotHistory,
    get canUndo() {
      return canUndo.value
    },
    get canRedo() {
      return canRedo.value
    },
    subscribe: engine.subscribe,
    registerFieldRules: engine.registerFieldRules,
    registerFieldCondition: engine.registerFieldCondition,
    registerFieldDisabled: engine.registerFieldDisabled,
    getMountedFieldNames: engine.getMountedFieldNames,
    getFieldConditionState: engine.getFieldConditionState,
    setFieldError: engine.setFieldError,
    setInitialValues: engine.setInitialValues,
    get errorAnnouncement() {
      return errorAnnouncement.value
    },
    replaceValues: engine.replaceValues,
    setOptions: engine.setOptions,
    getValues: engine.getValues,
    getErrors: engine.getErrors,
    dispose: engine.dispose
  } as FormController
}
