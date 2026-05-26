import React, { useMemo, useState } from 'react'
import type {
  CronEditorProps as CoreCronEditorProps,
  CronFieldControl,
  CronFieldMeta,
  CronValidationResult
} from '@expcat/tigercat-core'
import {
  buildCronFieldValue,
  classNames,
  cronEditorBaseClasses,
  cronEditorErrorClasses,
  cronEditorFieldClasses,
  cronEditorFieldsClasses,
  cronEditorLabelClasses,
  cronFieldMetas,
  defaultCronExpression,
  defaultCronPresets,
  getCronEditorControlClasses,
  getCronFieldIssue,
  getCronFieldValue,
  normalizeCronExpression,
  parseCronFieldControl,
  updateCronExpressionField,
  validateCronExpression
} from '@expcat/tigercat-core'

export interface CronEditorProps extends CoreCronEditorProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string, validation: CronValidationResult) => void
  onValidate?: (validation: CronValidationResult) => void
}

const modeOptions: Array<{ label: string; value: CronFieldControl['mode'] }> = [
  { label: 'Any', value: 'any' },
  { label: 'Every', value: 'every' },
  { label: 'Specific', value: 'specific' },
  { label: 'Range', value: 'range' },
  { label: 'Custom', value: 'custom' }
]

export const CronEditor: React.FC<CronEditorProps> = ({
  value,
  defaultValue = defaultCronExpression,
  disabled = false,
  readonly = false,
  size = 'md',
  presets = defaultCronPresets,
  ariaLabel = 'Cron editor',
  className,
  onChange,
  onValidate
}) => {
  const [innerValue, setInnerValue] = useState(defaultValue)
  const expression = value ?? innerValue
  const validation = useMemo(() => validateCronExpression(expression), [expression])
  const inactive = disabled || readonly

  function commit(nextValue: string) {
    const normalized = normalizeCronExpression(nextValue)
    const nextValidation = validateCronExpression(normalized)
    if (value === undefined) setInnerValue(normalized)
    onChange?.(normalized, nextValidation)
    onValidate?.(nextValidation)
  }

  function handleRawExpressionChange(nextValue: string) {
    const nextValidation = validateCronExpression(nextValue)
    if (value === undefined) setInnerValue(nextValue)
    onChange?.(nextValue, nextValidation)
    onValidate?.(nextValidation)
  }

  function handleFieldRawChange(meta: CronFieldMeta, raw: string) {
    commit(updateCronExpressionField(expression, meta.key, raw))
  }

  function handleModeChange(
    meta: CronFieldMeta,
    control: CronFieldControl,
    mode: CronFieldControl['mode']
  ) {
    const nextControl: CronFieldControl = {
      ...control,
      mode,
      value: control.value ?? meta.min,
      start: control.start ?? meta.min,
      end: control.end ?? meta.max,
      step: control.step ?? 1
    }
    handleFieldRawChange(meta, buildCronFieldValue(nextControl, meta))
  }

  function renderFieldControl(meta: CronFieldMeta, control: CronFieldControl) {
    if (control.mode === 'any') return null

    if (control.mode === 'every') {
      return (
        <input
          type="number"
          min={1}
          max={meta.max}
          className={getCronEditorControlClasses(size)}
          value={control.step ?? 1}
          disabled={inactive}
          aria-label={`${meta.label} step`}
          onChange={(event) =>
            handleFieldRawChange(
              meta,
              buildCronFieldValue({ ...control, step: Number(event.target.value) }, meta)
            )
          }
        />
      )
    }

    if (control.mode === 'specific') {
      return (
        <input
          type="number"
          min={meta.min}
          max={meta.max}
          className={getCronEditorControlClasses(size)}
          value={control.value ?? meta.min}
          disabled={inactive}
          aria-label={`${meta.label} value`}
          onChange={(event) =>
            handleFieldRawChange(
              meta,
              buildCronFieldValue({ ...control, value: Number(event.target.value) }, meta)
            )
          }
        />
      )
    }

    if (control.mode === 'range') {
      return (
        <div className="grid grid-cols-2 gap-1">
          <input
            type="number"
            min={meta.min}
            max={meta.max}
            className={getCronEditorControlClasses(size)}
            value={control.start ?? meta.min}
            disabled={inactive}
            aria-label={`${meta.label} range start`}
            onChange={(event) =>
              handleFieldRawChange(
                meta,
                buildCronFieldValue({ ...control, start: Number(event.target.value) }, meta)
              )
            }
          />
          <input
            type="number"
            min={meta.min}
            max={meta.max}
            className={getCronEditorControlClasses(size)}
            value={control.end ?? meta.max}
            disabled={inactive}
            aria-label={`${meta.label} range end`}
            onChange={(event) =>
              handleFieldRawChange(
                meta,
                buildCronFieldValue({ ...control, end: Number(event.target.value) }, meta)
              )
            }
          />
        </div>
      )
    }

    return (
      <input
        type="text"
        className={getCronEditorControlClasses(size)}
        value={control.raw}
        disabled={inactive}
        aria-label={`${meta.label} custom value`}
        onChange={(event) => handleFieldRawChange(meta, event.target.value)}
      />
    )
  }

  return (
    <div
      className={classNames(cronEditorBaseClasses, className)}
      role="group"
      aria-label={ariaLabel}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          className={classNames(getCronEditorControlClasses(size, !validation.valid), 'flex-1')}
          value={expression}
          disabled={disabled}
          readOnly={readonly}
          aria-label="Cron expression"
          onChange={(event) => handleRawExpressionChange(event.target.value)}
        />
        {presets.length > 0 && (
          <select
            className={getCronEditorControlClasses(size)}
            value={presets.some((preset) => preset.value === expression) ? expression : ''}
            disabled={inactive}
            aria-label="Cron preset"
            onChange={(event) => {
              if (event.target.value) commit(event.target.value)
            }}>
            <option value="">Preset</option>
            {presets.map((preset) => (
              <option key={preset.value} value={preset.value}>
                {preset.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {validation.issues
        .filter((issue) => issue.field === 'expression')
        .map((issue) => (
          <div key={issue.message} className={cronEditorErrorClasses}>
            {issue.message}
          </div>
        ))}

      <div className={cronEditorFieldsClasses}>
        {cronFieldMetas.map((meta) => {
          const raw = getCronFieldValue(expression, meta.key)
          const control = parseCronFieldControl(raw)
          const issue = getCronFieldIssue(validation, meta.key)

          return (
            <div key={meta.key} className={cronEditorFieldClasses}>
              <label className={cronEditorLabelClasses}>{meta.label}</label>
              <select
                className={getCronEditorControlClasses(size, !!issue)}
                value={control.mode}
                disabled={inactive}
                aria-label={`${meta.label} mode`}
                onChange={(event) =>
                  handleModeChange(meta, control, event.target.value as CronFieldControl['mode'])
                }>
                {modeOptions.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
              {renderFieldControl(meta, control)}
              {issue && <div className={cronEditorErrorClasses}>{issue.message}</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default CronEditor
