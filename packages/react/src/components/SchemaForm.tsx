import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  classNames,
  clampSchemaFormSpan,
  collectSchemaFormConditions,
  collectSchemaFormRules,
  createSchemaFormModel,
  getSchemaFormFieldSpanClasses,
  getSchemaFormFieldsClasses,
  getSchemaFormLabels,
  mapSchemaFormValuesOut,
  mergeTigerLocale,
  resolveSchemaFormLayout,
  resolveSchemaFormWidgetType,
  schemaFormActionsClasses,
  schemaFormGroupClasses,
  schemaFormGroupDescriptionClasses,
  schemaFormGroupTitleClasses,
  schemaFormNestedGroupClasses,
  schemaFormRootClasses,
  type FormHandle,
  type FormSubmitEvent,
  type FormValues,
  type SchemaFormField,
  type SchemaFormLayoutGroup,
  type SchemaFormProps as CoreSchemaFormProps,
  type SchemaFormSubmitEvent
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

export interface SchemaFormProps
  extends
    Omit<CoreSchemaFormProps, 'style' | 'onChange' | 'onSubmit' | 'onReset'>,
    Omit<React.HTMLAttributes<HTMLFormElement>, 'onChange' | 'onSubmit' | 'onReset'> {
  renderField?: (field: SchemaFormField) => React.ReactNode
  onChange?: (values: FormValues) => void
  onSubmit?: (event: SchemaFormSubmitEvent) => void
  onReset?: () => void
  style?: React.CSSProperties
}

function renderWidget(field: SchemaFormField): React.ReactNode {
  const type = resolveSchemaFormWidgetType(field)
  const disabled = field.disabled
  const placeholder = field.placeholder
  if (type === 'textarea') {
    return <Textarea placeholder={placeholder} disabled={disabled} />
  }
  if (type === 'number') {
    return (
      <InputNumber placeholder={placeholder} disabled={disabled} min={field.min} max={field.max} />
    )
  }
  if (type === 'password') {
    return <Input type="password" placeholder={placeholder} disabled={disabled} />
  }
  if (type === 'select') {
    return <Select options={field.options ?? []} placeholder={placeholder} disabled={disabled} />
  }
  if (type === 'checkbox') {
    return <Checkbox disabled={disabled} />
  }
  if (type === 'switch') {
    return <Switch disabled={disabled} />
  }
  if (type === 'radio') {
    return (
      <RadioGroup disabled={disabled}>
        {(field.options ?? []).map((option) => (
          <Radio key={String(option.value)} value={option.value} disabled={option.disabled}>
            {option.label}
          </Radio>
        ))}
      </RadioGroup>
    )
  }
  return <Input placeholder={placeholder} disabled={disabled} />
}

function SchemaFormFieldCell({
  field,
  columns,
  renderField
}: {
  field: SchemaFormField
  columns: 1 | 2 | 3
  renderField?: (field: SchemaFormField) => React.ReactNode
}): React.ReactElement {
  const custom = renderField?.(field)
  const control = custom ?? renderWidget(field)
  return (
    <div
      className={getSchemaFormFieldSpanClasses(clampSchemaFormSpan(field.span, columns), columns)}
      data-schema-field={field.name}>
      <FormItem
        name={field.name}
        label={field.label}
        required={field.required}
        rules={field.rules}
        condition={field.condition}
        extra={field.extra}>
        {control}
      </FormItem>
    </div>
  )
}

function SchemaFormGroupView({
  group,
  nested,
  renderField
}: {
  group: SchemaFormLayoutGroup
  nested: boolean
  renderField?: (field: SchemaFormField) => React.ReactNode
}): React.ReactElement {
  return (
    <section
      className={nested ? schemaFormNestedGroupClasses : schemaFormGroupClasses}
      data-schema-group={group.key}>
      {group.title ? <h3 className={schemaFormGroupTitleClasses}>{group.title}</h3> : null}
      {group.description ? (
        <p className={schemaFormGroupDescriptionClasses}>{group.description}</p>
      ) : null}
      {group.fields.length > 0 ? (
        <div className={getSchemaFormFieldsClasses(group.columns)}>
          {group.fields.map((field) => (
            <SchemaFormFieldCell
              key={field.name}
              field={field}
              columns={group.columns}
              renderField={renderField}
            />
          ))}
        </div>
      ) : null}
      {group.groups.map((child) => (
        <SchemaFormGroupView key={child.key} group={child} nested renderField={renderField} />
      ))}
    </section>
  )
}

export const SchemaForm = forwardRef<FormHandle, SchemaFormProps>(function SchemaForm(
  {
    schema,
    model,
    defaultModel,
    rules,
    conditions,
    labelWidth,
    labelPosition,
    labelAlign,
    size,
    inlineMessage,
    showRequiredAsterisk,
    disabled = false,
    loading = false,
    validateDebounce,
    showActions = true,
    submitText,
    resetText,
    locale,
    labels: labelsOverride,
    ariaLabel,
    className,
    style,
    renderField,
    onChange,
    onSubmit,
    onReset,
    ...rest
  },
  ref
) {
  const config = useTigerConfig()
  const formRef = useRef<FormHandle>(null)
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const chromeLabels = useMemo(
    () => getSchemaFormLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )
  const initialModel = useMemo(
    () => createSchemaFormModel(schema, defaultModel),
    [schema, defaultModel]
  )
  const [innerModel, setInnerModel] = useState<FormValues>(initialModel)
  const controlled = model !== undefined
  const formModel = controlled ? model : innerModel
  const formRules = useMemo(() => collectSchemaFormRules(schema, rules), [schema, rules])
  const formConditions = useMemo(
    () => collectSchemaFormConditions(schema, conditions),
    [schema, conditions]
  )
  const layout = useMemo(() => resolveSchemaFormLayout(schema), [schema])

  const handleChange = useCallback(
    (values: FormValues) => {
      if (!controlled) setInnerModel(values)
      onChange?.(values)
    },
    [controlled, onChange]
  )

  const handleSubmit = useCallback(
    (event: FormSubmitEvent) => {
      onSubmit?.({
        ...event,
        mapped: mapSchemaFormValuesOut(schema, event.values)
      })
    },
    [onSubmit, schema]
  )

  const handleReset = useCallback(() => {
    formRef.current?.resetFields()
    if (!controlled) setInnerModel(createSchemaFormModel(schema, defaultModel))
    onReset?.()
  }, [controlled, defaultModel, onReset, schema])

  useImperativeHandle(ref, () => ({
    validate: () => formRef.current?.validate() ?? Promise.resolve(false),
    validateFields: (fieldNames) =>
      formRef.current?.validateFields(fieldNames) ?? Promise.resolve(false),
    validateField: (fieldName, rulesOverride, trigger) =>
      formRef.current?.validateField(fieldName, rulesOverride, trigger) ?? Promise.resolve(),
    clearValidate: (fieldNames) => formRef.current?.clearValidate(fieldNames),
    resetFields: () => formRef.current?.resetFields(),
    addField: (fieldName, defaultValue) => formRef.current?.addField(fieldName, defaultValue),
    removeField: (fieldName) => formRef.current?.removeField(fieldName),
    undo: () => formRef.current?.undo(),
    redo: () => formRef.current?.redo(),
    snapshotHistory: () => formRef.current?.snapshotHistory(),
    get canUndo() {
      return formRef.current?.canUndo ?? false
    },
    get canRedo() {
      return formRef.current?.canRedo ?? false
    }
  }))

  return (
    <Form
      {...rest}
      ref={formRef}
      model={formModel}
      rules={formRules}
      conditions={formConditions}
      labelWidth={labelWidth}
      labelPosition={labelPosition}
      labelAlign={labelAlign}
      size={size}
      inlineMessage={inlineMessage}
      showRequiredAsterisk={showRequiredAsterisk}
      disabled={disabled}
      loading={loading}
      validateDebounce={validateDebounce}
      locale={locale}
      className={classNames(schemaFormRootClasses, className)}
      style={style}
      aria-label={ariaLabel ?? chromeLabels.ariaLabel}
      data-tiger-schema-form=""
      onChange={handleChange}
      onSubmit={handleSubmit}>
      {layout.map((group) => (
        <SchemaFormGroupView
          key={group.key}
          group={group}
          nested={false}
          renderField={renderField}
        />
      ))}
      {showActions ? (
        <div className={schemaFormActionsClasses}>
          <Button htmlType="button" variant="outline" onClick={handleReset}>
            {resetText ?? chromeLabels.resetText}
          </Button>
          <Button htmlType="submit" variant="primary" loading={loading}>
            {submitText ?? chromeLabels.submitText}
          </Button>
        </div>
      ) : null}
    </Form>
  )
})

SchemaForm.displayName = 'TigerSchemaForm'

export default SchemaForm
