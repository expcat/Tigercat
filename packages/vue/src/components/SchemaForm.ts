import {
  computed,
  defineComponent,
  h,
  reactive,
  ref,
  watch,
  type PropType,
  type VNode,
  type VNodeChild
} from 'vue'
import {
  classNames,
  coerceClassValue,
  devWarn,
  formValuesEqual,
  formatExportCell,
  narrowWidgetParams,
  getSchemaFormLabels,
  mergeStyleValues,
  mergeTigerLocale,
  type ComponentSize,
  type FormConditions,
  type FormController,
  type FormFieldDependencies,
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
import {
  clampSchemaFormSpan,
  collectSchemaFormConditions,
  collectSchemaFormRules,
  collectChangedSchemaFormPaths,
  createSchemaFormModel,
  getSchemaFormFieldSpanClasses,
  getSchemaFormFieldsClasses,
  mapSchemaFormValuesOut,
  overlaySchemaFormDirtyValues,
  resolveSchemaFormLayout,
  resolveSchemaFormWidgetType,
  schemaFormActionsClasses,
  schemaFormGroupClasses,
  schemaFormGroupDescriptionClasses,
  schemaFormGroupTitleClasses,
  schemaFormNestedGroupClasses,
  schemaFormRootClasses
} from '@expcat/tigercat-core/schema-form'
import { useTigerConfig } from './tiger-config'
import { Form } from './Form'
import { FormItem } from './FormItem'
import { Input } from './Input'
import { InputNumber } from './InputNumber'
import { Textarea } from './Textarea'
import { Select } from './Select'
import { Checkbox } from './Checkbox'
import { Switch } from './Switch'
import { RadioGroup } from './RadioGroup'
import { DatePicker } from './DatePicker'
import { TimePicker } from './TimePicker'
import { Cascader } from './Cascader'
import { TreeSelect } from './TreeSelect'
import { Slider } from './Slider'
import { Upload } from './Upload'
import { ColorPicker } from './ColorPicker'
import { Rate } from './Rate'
import { TagsInput } from './TagsInput'
import { Button } from './Button'

export interface VueSchemaFormProps extends Omit<
  CoreSchemaFormProps,
  'style' | 'onChange' | 'onSubmit' | 'onReset' | 'value' | 'defaultValue'
> {
  style?: Record<string, unknown>
  modelValue?: FormValues
  defaultValue?: FormValues
}

export type SchemaFormProps = VueSchemaFormProps

function renderWidget(field: SchemaFormField): VNode | null {
  const type = resolveSchemaFormWidgetType(field)
  const disabled = field.disabled
  const placeholder = field.placeholder
  const params = narrowWidgetParams(type ?? 'input', field.widgetParams)
  if (type === 'textarea') {
    return h(Textarea, { placeholder, disabled })
  }
  if (type === 'number') {
    return h(InputNumber, {
      placeholder,
      disabled,
      min: (params.min as number | undefined) ?? field.min,
      max: (params.max as number | undefined) ?? field.max,
      step: params.step as number | undefined,
      precision: params.precision as number | undefined
    })
  }
  if (type === 'password') {
    return h(Input, { type: 'password', placeholder, disabled })
  }
  if (type === 'select') {
    return h(Select, {
      options: field.options ?? [],
      placeholder,
      disabled,
      multiple: params.multiple === true,
      searchable: params.showSearch === true
    })
  }
  if (type === 'checkbox') {
    return h(Checkbox, { disabled })
  }
  if (type === 'switch') {
    return h(Switch, { disabled })
  }
  if (type === 'radio') {
    return h(RadioGroup, { disabled, options: field.options })
  }
  if (type === 'date') {
    return h(DatePicker, { placeholder, disabled, range: field.range === true })
  }
  if (type === 'time') {
    return h(TimePicker, { placeholder, disabled, range: field.range === true })
  }
  if (type === 'cascader') {
    return h(Cascader, { options: field.options ?? [], placeholder, disabled })
  }
  if (type === 'tree-select') {
    return h(TreeSelect, { treeData: field.treeData, placeholder, disabled })
  }
  if (type === 'slider') {
    return h(Slider, {
      disabled,
      min: (params.min as number | undefined) ?? field.min,
      max: (params.max as number | undefined) ?? field.max,
      step: params.step as number | undefined
    })
  }
  if (type === 'upload') {
    return h(Upload, { disabled })
  }
  if (type === 'color') {
    return h(ColorPicker, { disabled })
  }
  if (type === 'rate') {
    return h(Rate, { disabled, count: field.max })
  }
  if (type === 'tags') {
    return h(TagsInput, { placeholder, disabled })
  }
  if (type == null) {
    devWarn(
      `schema-form:${field.name}`,
      `Unknown schema field type "${String(field.type)}" on "${field.name}". Pass a field slot instead of a built-in control.`
    )
    return null
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
    modelValue: {
      type: Object as PropType<FormValues>,
      default: undefined
    },
    defaultValue: {
      type: Object as PropType<FormValues>,
      default: undefined
    },
    source: {
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
    controller: {
      type: Object as PropType<FormController>,
      default: undefined
    },
    undoable: {
      type: Boolean,
      default: undefined
    },
    maxHistorySize: {
      type: Number,
      default: undefined
    },
    fieldDependencies: {
      type: Object as PropType<FormFieldDependencies>,
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
    'update:modelValue': (_values: FormValues) => true,
    change: (_values: FormValues) => true,
    submit: (_event: SchemaFormSubmitEvent) => true,
    reset: () => true,
    validate: (fieldName: string, isValid: boolean, _errorMessage?: string) =>
      typeof fieldName === 'string' && typeof isValid === 'boolean'
  },
  setup(props, { attrs, emit, slots, expose }) {
    const config = useTigerConfig()
    const formRef = ref<FormHandle | null>(null)
    const innerModel = reactive<FormValues>(
      createSchemaFormModel(props.schema, props.defaultValue, props.source)
    )
    const dirtyPaths = new Set<string>()
    let applyingSeed = false
    const replaceInnerModel = (next: FormValues) => {
      for (const key of Object.keys(innerModel)) {
        if (!Object.prototype.hasOwnProperty.call(next, key)) delete innerModel[key]
      }
      Object.assign(innerModel, next)
    }

    const mergedLocale = computed(() => mergeTigerLocale(config.value.locale, props.locale))
    const chromeLabels = computed(() => getSchemaFormLabels(mergedLocale.value, props.labels))
    const formModel = computed(() => props.modelValue ?? innerModel)
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
        handleReset()
      },
      setInitialValues: (values) => {
        formRef.value?.setInitialValues(values)
      },
      addField: (fieldName, defaultValue) => {
        formRef.value?.addField(fieldName, defaultValue)
      },
      removeField: (fieldName) => {
        formRef.value?.removeField(fieldName)
      },
      insertFieldArrayItem: (path, index, item) => {
        formRef.value?.insertFieldArrayItem(path, index, item)
      },
      removeFieldArrayItem: (path, index) => {
        formRef.value?.removeFieldArrayItem(path, index)
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
      if (!applyingSeed && props.modelValue === undefined) {
        for (const path of collectChangedSchemaFormPaths(innerModel, values)) dirtyPaths.add(path)
        applyingSeed = true
        replaceInnerModel(values)
        applyingSeed = false
      }
      emit('update:modelValue', values)
      emit('change', values)
    }

    watch(
      () => [props.schema, props.defaultValue, props.source] as const,
      () => {
        if (props.modelValue !== undefined) return
        const seed = createSchemaFormModel(props.schema, props.defaultValue, props.source)
        const next = overlaySchemaFormDirtyValues(seed, innerModel, dirtyPaths)
        formRef.value?.setInitialValues(seed)
        if (formValuesEqual(next, innerModel)) return
        applyingSeed = true
        replaceInnerModel(next)
        applyingSeed = false
      }
    )

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
      const seed = createSchemaFormModel(props.schema, props.defaultValue, props.source)
      dirtyPaths.clear()
      formRef.value?.setInitialValues(seed)
      if (props.modelValue === undefined) {
        applyingSeed = true
        replaceInnerModel(seed)
        applyingSeed = false
      }
      formRef.value?.resetFields()
      emit('update:modelValue', seed)
      emit('reset')
    }

    const renderField = (field: SchemaFormField, columns: 1 | 2 | 3): VNode => {
      if (field.readOnly) {
        const raw = formModel.value?.[field.name]
        return h(
          'div',
          {
            class: getSchemaFormFieldSpanClasses(clampSchemaFormSpan(field.span, columns), columns),
            'data-schema-field': field.name,
            'data-schema-readonly': ''
          },
          [
            field.label ? h('span', field.label) : null,
            h('span', formatExportCell(raw, formModel.value ?? {}))
          ]
        )
      }
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
              required: field.disabled || field.readOnly ? false : field.required,
              rules: field.disabled || field.readOnly ? undefined : formRules.value?.[field.name],
              disabled: field.disabled,
              condition: field.condition,
              extra: field.extra
            },
            { default: () => control }
          )
        ]
      )
    }

    const renderGroup = (group: SchemaFormLayoutGroup, nested: boolean): VNode => {
      return h(
        'fieldset',
        {
          class: nested ? schemaFormNestedGroupClasses : schemaFormGroupClasses,
          'data-schema-group': group.key
        },
        [
          group.title ? h('legend', { class: schemaFormGroupTitleClasses }, group.title) : null,
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
        Form,
        {
          ...hostAttrs,
          ref: formRef,
          class: rootClasses.value,
          style: rootStyle.value,
          'data-tiger-schema-form': '',
          modelValue: formModel.value,
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
          controller: props.controller,
          undoable: props.undoable,
          maxHistorySize: props.maxHistorySize,
          fieldDependencies: props.fieldDependencies,
          locale: props.locale,
          onValidate: (fieldName: string, valid: boolean, error?: string | null) =>
            emit('validate', fieldName, valid, error ?? undefined),
          'aria-label': props.ariaLabel ?? chromeLabels.value.ariaLabel,
          'onUpdate:modelValue': handleModelUpdate,
          onSubmit: publishSubmit
        },
        {
          default: () => [
            ...layout.value.map((group) => renderGroup(group, false)),
            props.showActions
              ? h('div', { class: schemaFormActionsClasses }, [
                  h(
                    Button,
                    { type: 'button', variant: 'outline', onClick: handleReset },
                    () => props.resetText ?? chromeLabels.value.resetText
                  ),
                  h(
                    Button,
                    {
                      type: 'submit',
                      variant: 'primary',
                      loading: props.loading
                    },
                    () => props.submitText ?? chromeLabels.value.submitText
                  )
                ])
              : null
          ]
        }
      )
    }
  }
})

export default SchemaForm
