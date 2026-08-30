import { onUnmounted, reactive, ref } from 'vue'
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
export function useFormController(options: FormControllerOptions = {}): FormController {
  const engine: FormEngine = createFormEngine({
    initialValues: options.initialValues,
    undoable: options.undoable,
    maxHistorySize: options.maxHistorySize,
    getRules: () => options.rules,
    getConditions: () => options.conditions,
    getFieldDependencies: () => options.fieldDependencies,
    getMessages: () => getFormValidationLabels(options.locale),
    getValidateDebounce: () => options.validateDebounce ?? 0
  })

  const values = reactive<FormValues>(cloneFormValues(engine.getValues()))
  const errors = ref(engine.getErrors())
  const canUndo = ref(engine.canUndo)
  const canRedo = ref(engine.canRedo)

  const stop = engine.subscribe(() => {
    assignFormValues(values, engine.getValues())
    errors.value = engine.getErrors()
    canUndo.value = engine.canUndo
    canRedo.value = engine.canRedo
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
    getFieldConditionState: engine.getFieldConditionState,
    replaceValues: engine.replaceValues,
    setOptions: engine.setOptions,
    getValues: engine.getValues,
    getErrors: engine.getErrors,
    dispose: engine.dispose
  } as FormController
}
