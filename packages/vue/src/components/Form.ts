import {
  defineComponent,
  provide,
  computed,
  h,
  ref,
  watch,
  onBeforeUnmount,
  inject,
  PropType,
  type ComputedRef
} from 'vue'
import {
  classNames,
  assignFormValues,
  createFormEngine,
  createFormErrorMap,
  focusFirstInvalidField,
  mergeTigerLocale,
  getFormValidationLabels,
  type FormRules,
  type FormValues,
  type FormError,
  type FormConditions,
  type FormFieldCondition,
  type FormConditionState,
  type FormLabelPosition,
  type FormLabelAlign,
  type ComponentSize,
  type FormRule,
  type FormRuleTrigger,
  type FormController,
  type FormEngine,
  type FormHandle,
  type FormFieldDependencies,
  type TigerLocale
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export const FormContextKey = Symbol('FormContext')

export interface FormContext {
  model: FormValues
  rules?: FormRules
  labelWidth?: string | number
  labelPosition: FormLabelPosition
  labelAlign?: FormLabelAlign
  size: ComponentSize
  inlineMessage: boolean
  showRequiredAsterisk: boolean
  disabled: boolean
  loading: boolean
  errors: FormError[]
  errorsByField: Record<string, string | undefined>
  registerFieldRules: (fieldName: string, rules?: FormRule | FormRule[]) => void
  registerFieldCondition: (fieldName: string, condition?: FormFieldCondition) => void
  getFieldConditionState: (
    fieldName: string,
    conditionOverride?: FormFieldCondition
  ) => FormConditionState
  validateField: (
    fieldName: string,
    rulesOverride?: FormRule | FormRule[],
    trigger?: FormRuleTrigger
  ) => Promise<void>
  clearValidate: (fieldNames?: string | string[]) => void
  getFieldValue: (fieldName: string) => unknown
  updateValue: (fieldName: string, value: unknown) => void
  validate: () => Promise<boolean>
  validateFields: (fieldNames: string[]) => Promise<boolean>
  getValues: () => FormValues
  submit: () => Promise<boolean>
}

export function useFormContext(): ComputedRef<FormContext> | null {
  return inject<ComputedRef<FormContext> | null>(FormContextKey, null)
}

export type { FormHandle }

export interface VueFormProps {
  model?: FormValues
  controller?: FormController
  rules?: FormRules
  labelWidth?: string | number
  labelPosition?: FormLabelPosition
  labelAlign?: FormLabelAlign
  size?: ComponentSize
  inlineMessage?: boolean
  showRequiredAsterisk?: boolean
  disabled?: boolean
  loading?: boolean
  fieldDependencies?: FormFieldDependencies
  conditions?: FormConditions
  validateDebounce?: number
  undoable?: boolean
  maxHistorySize?: number
  locale?: Partial<TigerLocale>
}

function isFormEngine(controller: FormController): controller is FormEngine {
  return typeof (controller as FormEngine).replaceValues === 'function'
}

export const Form = defineComponent({
  name: 'TigerForm',
  props: {
    model: {
      type: Object as PropType<FormValues>,
      default: () => ({})
    },
    controller: {
      type: Object as PropType<FormController>,
      default: undefined
    },
    rules: {
      type: Object as PropType<FormRules>
    },
    labelWidth: {
      type: [String, Number] as PropType<string | number>
    },
    labelPosition: {
      type: String as PropType<FormLabelPosition>,
      default: 'left' as FormLabelPosition
    },
    labelAlign: {
      type: String as PropType<FormLabelAlign>,
      default: undefined
    },
    size: {
      type: String as PropType<ComponentSize>,
      default: 'md' as ComponentSize
    },
    inlineMessage: {
      type: Boolean,
      default: true
    },
    showRequiredAsterisk: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    fieldDependencies: {
      type: Object as PropType<FormFieldDependencies>,
      default: undefined
    },
    conditions: {
      type: Object as PropType<FormConditions>,
      default: undefined
    },
    validateDebounce: {
      type: Number,
      default: 0
    },
    undoable: {
      type: Boolean,
      default: false
    },
    maxHistorySize: {
      type: Number,
      default: 50
    },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    }
  },
  emits: {
    submit: (_data: { valid: boolean; values: FormValues; errors: FormError[] }) => true,
    validate: (fieldName: string, isValid: boolean, _errorMessage?: string) =>
      typeof fieldName === 'string' && typeof isValid === 'boolean',
    'update:model': (_values: FormValues) => true
  },
  setup(props, { slots, emit, expose }) {
    const config = useTigerConfig()
    const formElementRef = ref<HTMLFormElement | null>(null)
    const ownedEngine =
      props.controller && isFormEngine(props.controller)
        ? null
        : createFormEngine({
            initialValues: props.model ?? {},
            undoable: props.undoable,
            maxHistorySize: props.maxHistorySize,
            getRules: () => props.rules,
            getConditions: () => props.conditions,
            getFieldDependencies: () => props.fieldDependencies,
            getMessages: () =>
              getFormValidationLabels(mergeTigerLocale(config.value.locale, props.locale)),
            getValidateDebounce: () => props.validateDebounce,
            onValidate: (fieldName, valid, error) =>
              emit('validate', fieldName, valid, error ?? undefined),
            onValuesChange: (next) => {
              if (props.model) {
                assignFormValues(props.model, next)
              }
              emit('update:model', next)
            }
          })

    const engine = (): FormEngine => {
      if (props.controller && isFormEngine(props.controller)) {
        return props.controller
      }
      if (!ownedEngine) {
        throw new Error('Form is missing a form engine')
      }
      return ownedEngine
    }

    const version = ref(0)
    const stop = engine().subscribe(() => {
      version.value += 1
    })

    watch(
      () => props.model,
      (next) => {
        if (props.controller || !next) return
        engine().replaceValues(next)
      },
      { deep: true }
    )

    watch(
      () =>
        [
          props.controller,
          props.rules,
          props.conditions,
          props.fieldDependencies,
          props.validateDebounce,
          props.locale,
          config.value.locale
        ] as const,
      () => {
        if (props.controller && isFormEngine(props.controller)) {
          props.controller.setOptions({
            rules: props.rules,
            conditions: props.conditions,
            fieldDependencies: props.fieldDependencies,
            validateDebounce: props.validateDebounce,
            messages: getFormValidationLabels(mergeTigerLocale(config.value.locale, props.locale))
          })
        }
      }
    )

    onBeforeUnmount(() => {
      stop()
      ownedEngine?.dispose()
    })

    const errors = computed(() => {
      version.value
      return engine().getErrors()
    })
    const errorsByField = computed(() => createFormErrorMap(errors.value))
    const values = computed(() => {
      version.value
      return engine().getValues()
    })
    const canUndoNow = computed(() => {
      version.value
      return engine().canUndo
    })
    const canRedoNow = computed(() => {
      version.value
      return engine().canRedo
    })

    const validateField = async (
      fieldName: string,
      rulesOverride?: FormRule | FormRule[],
      trigger?: FormRuleTrigger
    ): Promise<void> => {
      await engine().validateField(fieldName, rulesOverride, trigger)
    }

    const submitForm = async (): Promise<boolean> => {
      if (props.loading) return false
      const current = engine()
      const valid = await current.validate()
      if (!valid) {
        focusFirstInvalidField(formElementRef.value)
      }
      emit('submit', { valid, values: current.getValues(), errors: current.getErrors() })
      return valid
    }

    const handleSubmit = async (event: Event): Promise<void> => {
      event.preventDefault()
      await submitForm()
    }

    const handleReset = (event: Event): void => {
      event.preventDefault()
      engine().reset()
    }

    const formContextValue = computed<FormContext>(() => ({
      model: values.value,
      rules: props.rules,
      labelWidth: props.labelWidth,
      labelPosition: props.labelPosition,
      labelAlign: props.labelAlign,
      size: props.size,
      inlineMessage: props.inlineMessage,
      showRequiredAsterisk: props.showRequiredAsterisk,
      disabled: props.disabled,
      loading: props.loading,
      errors: errors.value,
      errorsByField: errorsByField.value,
      registerFieldRules: (fieldName, nextRules) =>
        engine().registerFieldRules(fieldName, nextRules),
      registerFieldCondition: (fieldName, condition) =>
        engine().registerFieldCondition(fieldName, condition),
      getFieldConditionState: (fieldName, override) =>
        engine().getFieldConditionState(fieldName, override),
      validateField,
      clearValidate: (fieldNames) => engine().clearValidate(fieldNames),
      getFieldValue: (fieldName) => engine().getFieldValue(fieldName),
      updateValue: (fieldName, value) => engine().setFieldValue(fieldName, value),
      validate: () => engine().validate(),
      validateFields: (fieldNames) => engine().validateFields(fieldNames),
      getValues: () => engine().getValues(),
      submit: submitForm
    }))

    provide<ComputedRef<FormContext>>(FormContextKey, formContextValue)

    const handle: FormHandle = {
      validate: () => engine().validate(),
      validateFields: (fieldNames) => engine().validateFields(fieldNames),
      validateField,
      clearValidate: (fieldNames) => engine().clearValidate(fieldNames),
      resetFields: () => engine().reset(),
      addField: (fieldName, defaultValue) => engine().addField(fieldName, defaultValue),
      removeField: (fieldName) => engine().removeField(fieldName),
      undo: () => engine().undo(),
      redo: () => engine().redo(),
      snapshotHistory: () => engine().snapshotHistory(),
      get canUndo() {
        return canUndoNow.value
      },
      get canRedo() {
        return canRedoNow.value
      }
    }

    expose(handle)

    const formClasses = computed(() =>
      classNames(
        'tiger-form',
        `tiger-form--label-${props.labelPosition}`,
        props.disabled && 'tiger-form--disabled',
        props.loading && 'tiger-form--loading'
      )
    )

    return () =>
      h(
        'form',
        {
          ref: formElementRef,
          class: formClasses.value,
          noValidate: true,
          'aria-busy': props.loading || undefined,
          onSubmit: handleSubmit,
          onReset: handleReset
        },
        [
          h(
            'fieldset',
            {
              disabled: props.disabled || props.loading,
              class: 'contents m-0 min-w-0 border-0 p-0'
            },
            slots.default?.()
          )
        ]
      )
  }
})

export default Form
