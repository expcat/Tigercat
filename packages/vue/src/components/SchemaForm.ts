import {
  computed,
  defineComponent,
  h,
  reactive,
  ref,
  type PropType,
  type VNode,
  type VNodeChild
} from 'vue'
import {
  classNames,
  clampSchemaFormSpan,
  coerceClassValue,
  collectSchemaFormConditions,
  collectSchemaFormRules,
  createSchemaFormModel,
  getSchemaFormFieldSpanClasses,
  getSchemaFormFieldsClasses,
  getSchemaFormLabels,
  mapSchemaFormValuesOut,
  mergeStyleValues,
  mergeTigerLocale,
  resolveSchemaFormLayout,
  resolveSchemaFormWidgetType,
  schemaFormActionsClasses,
  schemaFormExtraClasses,
  schemaFormGroupClasses,
  schemaFormGroupDescriptionClasses,
  schemaFormGroupTitleClasses,
  schemaFormNestedGroupClasses,
  schemaFormRootClasses,
  type ComponentSize,
  type FormConditions,
  type FormHandle,
  type FormLabelAlign,
  type FormLabelPosition,
  type FormRules,
  type FormSubmitEvent,
  type FormValues,
  type SchemaFormField,
  type SchemaFormLayoutGroup,
  type SchemaFormProps as CoreSchemaFormProps,
  type SchemaFormSchema,
  type SchemaFormSubmitEvent,
  type TigerLocale,
  type TigerLocaleSchemaForm
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { Form } from './Form'
import { FormItem } from './FormItem'
import { Input } from './Input'
import { InputNumber } from './InputNumber'
import { Textarea } from './Textarea'
import { Select } from './Select'
import { Checkbox } from './Checkbox'
import { Switch } from './Switch'
import { Radio } from './Radio'
import { RadioGroup } from './RadioGroup'
import { Button } from './Button'

export interface VueSchemaFormProps extends Omit<
  CoreSchemaFormProps,
  'style' | 'onChange' | 'onSubmit' | 'onReset'
> {
  style?: Record<string, unknown>
}

export type SchemaFormProps = VueSchemaFormProps

function renderWidget(field: SchemaFormField): VNode {
  const type = resolveSchemaFormWidgetType(field)
  const disabled = field.disabled
  const placeholder = field.placeholder
  if (type === 'textarea') {
    return h(Textarea, { placeholder, disabled })
  }
  if (type === 'number') {
    return h(InputNumber, { placeholder, disabled, min: field.min, max: field.max })
  }
  if (type === 'password') {
    return h(Input, { type: 'password', placeholder, disabled })
  }
  if (type === 'select') {
    return h(Select, { options: field.options ?? [], placeholder, disabled })
  }
  if (type === 'checkbox') {
    return h(Checkbox, { disabled })
  }
  if (type === 'switch') {
    return h(Switch, { disabled })
  }
  if (type === 'radio') {
    return h(
      RadioGroup,
      { disabled },
      {
        default: () =>
          (field.options ?? []).map((option) =>
            h(Radio, { value: option.value, disabled: option.disabled }, () => option.label)
          )
      }
    )
  }
  return h(Input, { placeholder, disabled })
}

export const SchemaForm = defineComponent({
  name: 'TigerSchemaForm',
  inheritAttrs: false,
  props: {
    schema: {
      type: Object as PropType<SchemaFormSchema>,
      required: true
    },
    model: {
      type: Object as PropType<FormValues>,
      default: undefined
    },
    defaultModel: {
      type: Object as PropType<FormValues>,
      default: undefined
    },
    rules: {
      type: Object as PropType<FormRules>,
      default: undefined
    },
    conditions: {
      type: Object as PropType<FormConditions>,
      default: undefined
    },
    labelWidth: {
      type: [String, Number] as PropType<string | number>,
      default: undefined
    },
    labelPosition: {
      type: String as PropType<FormLabelPosition>,
      default: undefined
    },
    labelAlign: {
      type: String as PropType<FormLabelAlign>,
      default: undefined
    },
    size: {
      type: String as PropType<ComponentSize>,
      default: undefined
    },
    inlineMessage: {
      type: Boolean,
      default: undefined
    },
    showRequiredAsterisk: {
      type: Boolean,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    validateDebounce: {
      type: Number,
      default: undefined
    },
    showActions: {
      type: Boolean,
      default: true
    },
    submitText: {
      type: String,
      default: undefined
    },
    resetText: {
      type: String,
      default: undefined
    },
    locale: {
      type: Object as PropType<Partial<TigerLocale>>,
      default: undefined
    },
    labels: {
      type: Object as PropType<Partial<TigerLocaleSchemaForm>>,
      default: undefined
    },
    ariaLabel: {
      type: String,
      default: undefined
    },
    className: {
      type: String,
      default: undefined
    },
    style: {
      type: Object as PropType<Record<string, unknown>>,
      default: undefined
    }
  },
  emits: {
    'update:model': (_values: FormValues) => true,
    change: (_values: FormValues) => true,
    submit: (_event: SchemaFormSubmitEvent) => true,
    reset: () => true
  },
  setup(props, { attrs, emit, slots, expose }) {
    const config = useTigerConfig()
    const formRef = ref<FormHandle | null>(null)
    const innerModel = reactive<FormValues>(createSchemaFormModel(props.schema, props.defaultModel))

    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const chromeLabels = computed(() => getSchemaFormLabels(mergedLocale.value, props.labels))
    const formModel = computed(() => props.model ?? innerModel)
    const formRules = computed(() => collectSchemaFormRules(props.schema, props.rules))
    const formConditions = computed(() =>
      collectSchemaFormConditions(props.schema, props.conditions)
    )
    const layout = computed(() => resolveSchemaFormLayout(props.schema))
    const rootClasses = computed(() =>
      classNames(schemaFormRootClasses, props.className, coerceClassValue(attrs.class))
    )
    const rootStyle = computed(() => mergeStyleValues(attrs.style, props.style))

    const handle: FormHandle = {
      validate: () => formRef.value?.validate() ?? Promise.resolve(false),
      validateFields: (fieldNames) =>
        formRef.value?.validateFields(fieldNames) ?? Promise.resolve(false),
      validateField: (fieldName, rulesOverride, trigger) =>
        formRef.value?.validateField(fieldName, rulesOverride, trigger) ?? Promise.resolve(),
      clearValidate: (fieldNames) => formRef.value?.clearValidate(fieldNames),
      resetFields: () => {
        formRef.value?.resetFields()
      },
      addField: (fieldName, defaultValue) => {
        formRef.value?.addField(fieldName, defaultValue)
      },
      removeField: (fieldName) => {
        formRef.value?.removeField(fieldName)
      },
      undo: () => {
        formRef.value?.undo()
      },
      redo: () => {
        formRef.value?.redo()
      },
      snapshotHistory: () => {
        formRef.value?.snapshotHistory()
      },
      get canUndo() {
        return formRef.value?.canUndo ?? false
      },
      get canRedo() {
        return formRef.value?.canRedo ?? false
      }
    }

    expose(handle)

    const handleModelUpdate = (values: FormValues) => {
      emit('update:model', values)
      emit('change', values)
    }

    const publishSubmit = (event: FormSubmitEvent) => {
      const payload: SchemaFormSubmitEvent = {
        valid: event.valid,
        values: event.values,
        errors: event.errors,
        mapped: mapSchemaFormValuesOut(props.schema, event.values)
      }
      emit('submit', payload)
      const extra = (attrs as Record<string, unknown>).onSubmit
      if (typeof extra === 'function') {
        ;(extra as (next: SchemaFormSubmitEvent) => void)(payload)
      }
    }

    const handleReset = () => {
      formRef.value?.resetFields()
      emit('reset')
    }

    const handleActionSubmit = async () => {
      const valid = (await formRef.value?.validate()) ?? false
      publishSubmit({
        valid,
        values: { ...formModel.value },
        errors: []
      })
    }

    const renderField = (field: SchemaFormField, columns: 1 | 2 | 3): VNode => {
      const custom = slots.field?.({ field })
      const control: VNodeChild =
        custom && (Array.isArray(custom) ? custom.length > 0 : true) ? custom : renderWidget(field)
      return h(
        'div',
        {
          class: getSchemaFormFieldSpanClasses(clampSchemaFormSpan(field.span, columns), columns),
          'data-schema-field': field.name
        },
        [
          h(
            FormItem,
            {
              name: field.name,
              label: field.label,
              required: field.required,
              rules: field.rules,
              condition: field.condition
            },
            { default: () => control }
          ),
          field.extra ? h('p', { class: schemaFormExtraClasses }, field.extra) : null
        ]
      )
    }

    const renderGroup = (group: SchemaFormLayoutGroup, nested: boolean): VNode => {
      return h(
        'section',
        {
          class: nested ? schemaFormNestedGroupClasses : schemaFormGroupClasses,
          'data-schema-group': group.key
        },
        [
          group.title ? h('h3', { class: schemaFormGroupTitleClasses }, group.title) : null,
          group.description
            ? h('p', { class: schemaFormGroupDescriptionClasses }, group.description)
            : null,
          group.fields.length > 0
            ? h(
                'div',
                { class: getSchemaFormFieldsClasses(group.columns) },
                group.fields.map((field) => renderField(field, group.columns))
              )
            : null,
          ...group.groups.map((child) => renderGroup(child, true))
        ]
      )
    }

    return () => {
      const {
        class: _class,
        style: _style,
        onSubmit: _onSubmit,
        onChange: _onChange,
        onReset: _onReset,
        ...hostAttrs
      } = attrs as Record<string, unknown>
      return h(
        'div',
        {
          ...hostAttrs,
          class: rootClasses.value,
          style: rootStyle.value,
          'data-tiger-schema-form': ''
        },
        [
          h(
            Form,
            {
              ref: formRef,
              model: formModel.value,
              rules: formRules.value,
              conditions: formConditions.value,
              labelWidth: props.labelWidth,
              labelPosition: props.labelPosition,
              labelAlign: props.labelAlign,
              size: props.size,
              inlineMessage: props.inlineMessage,
              showRequiredAsterisk: props.showRequiredAsterisk,
              disabled: props.disabled,
              loading: props.loading,
              validateDebounce: props.validateDebounce,
              locale: props.locale,
              'aria-label': props.ariaLabel ?? chromeLabels.value.ariaLabel,
              'onUpdate:model': handleModelUpdate,
              onSubmit: publishSubmit
            },
            {
              default: () => [
                ...layout.value.map((group) => renderGroup(group, false)),
                props.showActions
                  ? h('div', { class: schemaFormActionsClasses }, [
                      h(
                        Button,
                        { htmlType: 'button', variant: 'outline', onClick: handleReset },
                        () => props.resetText ?? chromeLabels.value.resetText
                      ),
                      h(
                        Button,
                        {
                          htmlType: 'button',
                          variant: 'primary',
                          loading: props.loading,
                          onClick: handleActionSubmit
                        },
                        () => props.submitText ?? chromeLabels.value.submitText
                      )
                    ])
                  : null
              ]
            }
          )
        ]
      )
    }
  }
})

export default SchemaForm
