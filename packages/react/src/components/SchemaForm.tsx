import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  classNames,
  devWarn,
  formatExportCell,
  getSchemaFormLabels,
  narrowWidgetParams,
  mergeTigerLocale,
  type FormHandle,
  type FormRules,
  type FormSubmitEvent,
  type FormValues,
  type SchemaFormField,
  type SchemaFormLayoutGroup,
  type SchemaFormProps as CoreSchemaFormProps,
  type SchemaFormSubmitEvent
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

export interface SchemaFormProps
  extends
    Omit<CoreSchemaFormProps, 'style' | 'onChange' | 'onSubmit' | 'onReset'>,
    Omit<
      React.HTMLAttributes<HTMLFormElement>,
      'onChange' | 'onSubmit' | 'onReset' | 'value' | 'defaultValue' | 'content'
    > {
  renderField?: (field: SchemaFormField) => React.ReactNode
  onChange?: (values: FormValues) => void
  onSubmit?: (event: SchemaFormSubmitEvent) => void
  onReset?: () => void
  onValidate?: (fieldName: string, valid: boolean, error?: string | null) => void
  style?: React.CSSProperties
}

function renderWidget(field: SchemaFormField): React.ReactNode {
  const type = resolveSchemaFormWidgetType(field)
  const disabled = field.disabled
  const placeholder = field.placeholder
  const params = narrowWidgetParams(type ?? 'input', field.widgetParams)
  if (type === 'textarea') {
    return <Textarea placeholder={placeholder} disabled={disabled} />
  }
  if (type === 'number') {
    return (
      <InputNumber
        placeholder={placeholder}
        disabled={disabled}
        min={(params.min as number | undefined) ?? field.min}
        max={(params.max as number | undefined) ?? field.max}
        step={params.step as number | undefined}
        precision={params.precision as number | undefined}
      />
    )
  }
  if (type === 'password') {
    return <Input type="password" placeholder={placeholder} disabled={disabled} />
  }
  if (type === 'select') {
    return (
      <Select
        options={field.options ?? []}
        placeholder={placeholder}
        disabled={disabled}
        multiple={params.multiple === true}
        searchable={params.showSearch === true}
      />
    )
  }
  if (type === 'checkbox') {
    return <Checkbox disabled={disabled} />
  }
  if (type === 'switch') {
    return <Switch disabled={disabled} />
  }
  if (type === 'radio') {
    return <RadioGroup disabled={disabled} options={field.options} />
  }
  if (type === 'date') {
    return <DatePicker placeholder={placeholder} disabled={disabled} range={field.range === true} />
  }
  if (type === 'time') {
    return <TimePicker placeholder={placeholder} disabled={disabled} range={field.range === true} />
  }
  if (type === 'cascader') {
    return <Cascader options={field.options ?? []} placeholder={placeholder} disabled={disabled} />
  }
  if (type === 'tree-select') {
    return <TreeSelect treeData={field.treeData} placeholder={placeholder} disabled={disabled} />
  }
  if (type === 'slider') {
    return (
      <Slider
        disabled={disabled}
        min={(params.min as number | undefined) ?? field.min}
        max={(params.max as number | undefined) ?? field.max}
        step={params.step as number | undefined}
      />
    )
  }
  if (type === 'upload') {
    return <Upload disabled={disabled} />
  }
  if (type === 'color') {
    return <ColorPicker disabled={disabled} />
  }
  if (type === 'rate') {
    return <Rate disabled={disabled} count={field.max} />
  }
  if (type === 'tags') {
    return <TagsInput placeholder={placeholder} disabled={disabled} />
  }
  if (type == null) {
    devWarn(
      `schema-form:${field.name}`,
      `Unknown schema field type "${String(field.type)}" on "${field.name}". Pass renderField instead of a built-in control.`
    )
    return null
  }
  return <Input placeholder={placeholder} disabled={disabled} />
}

function SchemaFormFieldCell({
  field,
  columns,
  renderField,
  fieldRules,
  values
}: {
  field: SchemaFormField
  columns: 1 | 2 | 3
  renderField?: (field: SchemaFormField) => React.ReactNode
  fieldRules?: FormRules
  values?: FormValues
}): React.ReactElement {
  if (field.readOnly) {
    return (
      <div
        className={getSchemaFormFieldSpanClasses(clampSchemaFormSpan(field.span, columns), columns)}
        data-schema-field={field.name}
        data-schema-readonly="">
        {field.label ? <span>{field.label}</span> : null}
        <span>{formatExportCell(values?.[field.name], values ?? {})}</span>
      </div>
    )
  }
  const custom = renderField?.(field)
  const control = custom ?? renderWidget(field)
  return (
    <div
      className={getSchemaFormFieldSpanClasses(clampSchemaFormSpan(field.span, columns), columns)}
      data-schema-field={field.name}>
      <FormItem
        name={field.name}
        label={field.label}
        required={field.disabled || field.readOnly ? false : field.required}
        rules={field.disabled || field.readOnly ? undefined : fieldRules?.[field.name]}
        disabled={field.disabled}
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
  renderField,
  fieldRules,
  values
}: {
  group: SchemaFormLayoutGroup
  nested: boolean
  renderField?: (field: SchemaFormField) => React.ReactNode
  fieldRules?: FormRules
  values?: FormValues
}): React.ReactElement {
  return (
    <fieldset
      className={nested ? schemaFormNestedGroupClasses : schemaFormGroupClasses}
      data-schema-group={group.key}>
      {group.title ? <legend className={schemaFormGroupTitleClasses}>{group.title}</legend> : null}
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
              fieldRules={fieldRules}
              values={values}
            />
          ))}
        </div>
      ) : null}
      {group.groups.map((child) => (
        <SchemaFormGroupView
          key={child.key}
          group={child}
          nested
          renderField={renderField}
          fieldRules={fieldRules}
          values={values}
        />
      ))}
    </fieldset>
  )
}

export const SchemaForm = forwardRef<FormHandle, SchemaFormProps>(function SchemaForm(
  {
    schema,
    value,
    defaultValue,
    source,
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
    controller,
    undoable,
    maxHistorySize,
    fieldDependencies,
    onValidate,
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
    () => createSchemaFormModel(schema, defaultValue, source),
    [schema, defaultValue, source]
  )
  const [innerModel, setInnerModel] = useState<FormValues>(initialModel)
  const dirtyPathsRef = useRef(new Set<string>())
  const controlled = value !== undefined
  const formModel = controlled ? value : innerModel
  const formRules = useMemo(() => collectSchemaFormRules(schema, rules), [schema, rules])
  const formConditions = useMemo(
    () => collectSchemaFormConditions(schema, conditions),
    [schema, conditions]
  )
  const layout = useMemo(() => resolveSchemaFormLayout(schema), [schema])

  const handleChange = useCallback(
    (values: FormValues) => {
      if (!controlled) {
        setInnerModel((current) => {
          for (const path of collectChangedSchemaFormPaths(current, values)) {
            dirtyPathsRef.current.add(path)
          }
          return values
        })
      }
      onChange?.(values)
    },
    [controlled, onChange]
  )

  useEffect(() => {
    if (controlled) return
    const seed = createSchemaFormModel(schema, defaultValue, source)
    formRef.current?.setInitialValues(seed)
    setInnerModel((current) => overlaySchemaFormDirtyValues(seed, current, dirtyPathsRef.current))
  }, [controlled, schema, defaultValue, source])

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
    const seed = createSchemaFormModel(schema, defaultValue, source)
    dirtyPathsRef.current.clear()
    formRef.current?.setInitialValues(seed)
    if (!controlled) setInnerModel(seed)
    formRef.current?.resetFields()
    onChange?.(seed)
    onReset?.()
  }, [controlled, defaultValue, onChange, onReset, schema, source])

  useImperativeHandle(ref, () => ({
    validate: () => formRef.current?.validate() ?? Promise.resolve(false),
    validateFields: (fieldNames) =>
      formRef.current?.validateFields(fieldNames) ?? Promise.resolve(false),
    validateField: (fieldName, rulesOverride, trigger) =>
      formRef.current?.validateField(fieldName, rulesOverride, trigger) ?? Promise.resolve(),
    clearValidate: (fieldNames) => formRef.current?.clearValidate(fieldNames),
    resetFields: () => {
      handleReset()
    },
    setInitialValues: (values) => formRef.current?.setInitialValues(values),
    addField: (fieldName, defaultValue) => formRef.current?.addField(fieldName, defaultValue),
    removeField: (fieldName) => formRef.current?.removeField(fieldName),
    insertFieldArrayItem: (path, index, item) =>
      formRef.current?.insertFieldArrayItem(path, index, item),
    removeFieldArrayItem: (path, index) => formRef.current?.removeFieldArrayItem(path, index),
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
      value={formModel}
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
      controller={controller}
      undoable={undoable}
      maxHistorySize={maxHistorySize}
      fieldDependencies={fieldDependencies}
      onValidate={onValidate}
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
          fieldRules={formRules}
          values={formModel}
        />
      ))}
      {showActions ? (
        <div className={schemaFormActionsClasses}>
          <Button type="button" variant="outline" onClick={handleReset}>
            {resetText ?? chromeLabels.resetText}
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {submitText ?? chromeLabels.submitText}
          </Button>
        </div>
      ) : null}
    </Form>
  )
})

SchemaForm.displayName = 'TigerSchemaForm'

export default SchemaForm
