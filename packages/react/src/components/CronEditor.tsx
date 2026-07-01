import React, { useMemo, useState } from 'react'
import type {
  CronEditorProps as CoreCronEditorProps,
  CronFieldControl,
  CronFieldMeta,
  CronPreset,
  CronValidationResult,
  TigerLocale,
  TigerLocaleCronEditor
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
  getCronEditorControlClasses,
  getCronEditorLabels,
  getCronFieldIssue,
  getCronFieldValue,
  mergeTigerLocale,
  normalizeCronExpression,
  parseCronFieldControl,
  updateCronExpressionField,
  validateCronExpressionWithLabels
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'

export interface CronEditorProps extends CoreCronEditorProps {
  value?: string
  defaultValue?: string
  /** Locale overrides merged on top of ConfigProvider locale */
  locale?: Partial<TigerLocale>
  /** Text/aria label overrides */
  labels?: Partial<TigerLocaleCronEditor>
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

function formatCronControlLabel(template: string, field: string): string {
  return template.replace('{field}', field)
}

export const CronEditor: React.FC<CronEditorProps> = ({
  value,
  defaultValue = defaultCronExpression,
  disabled = false,
  readonly = false,
  size = 'md',
  presets,
  ariaLabel,
  locale,
  labels: labelsOverride,
  className,
  onChange,
  onValidate
}) => {
  const config = useTigerConfig()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(
    () => getCronEditorLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )
  const fieldLabels = useMemo<Record<CronFieldMeta['key'], string>>(
    () => ({
      minute: labels.minuteLabel,
      hour: labels.hourLabel,
      dayOfMonth: labels.dayOfMonthLabel,
      month: labels.monthLabel,
      dayOfWeek: labels.dayOfWeekLabel
    }),
    [labels]
  )
  const localizedMetas = useMemo<CronFieldMeta[]>(
    () => cronFieldMetas.map((meta) => ({ ...meta, label: fieldLabels[meta.key] })),
    [fieldLabels]
  )
  const resolvedPresets = useMemo<CronPreset[]>(
    () =>
      presets ?? [
        { label: labels.everyMinutePreset, value: '* * * * *' },
        { label: labels.hourlyPreset, value: '0 * * * *' },
        { label: labels.dailyPreset, value: '0 0 * * *' },
        { label: labels.weeklyPreset, value: '0 0 * * 1' },
        { label: labels.monthlyPreset, value: '0 0 1 * *' }
      ],
    [labels, presets]
  )
  const modeLabels = useMemo<Record<CronFieldControl['mode'], string>>(
    () => ({
      any: labels.modeAnyLabel,
      every: labels.modeEveryLabel,
      specific: labels.modeSpecificLabel,
      range: labels.modeRangeLabel,
      custom: labels.modeCustomLabel
    }),
    [labels]
  )
  const [innerValue, setInnerValue] = useState(defaultValue)
  const expression = value ?? innerValue
  const validation = useMemo(
    () => validateCronExpressionWithLabels(expression, labels, fieldLabels),
    [expression, labels, fieldLabels]
  )
  const inactive = disabled || readonly

  function commit(nextValue: string) {
    const normalized = normalizeCronExpression(nextValue)
    const nextValidation = validateCronExpressionWithLabels(normalized, labels, fieldLabels)
    if (value === undefined) setInnerValue(normalized)
    onChange?.(normalized, nextValidation)
    onValidate?.(nextValidation)
  }

  function handleRawExpressionChange(nextValue: string) {
    const nextValidation = validateCronExpressionWithLabels(nextValue, labels, fieldLabels)
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
          aria-label={formatCronControlLabel(labels.stepAriaLabel, meta.label)}
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
          aria-label={formatCronControlLabel(labels.valueAriaLabel, meta.label)}
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
            aria-label={formatCronControlLabel(labels.rangeStartAriaLabel, meta.label)}
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
            aria-label={formatCronControlLabel(labels.rangeEndAriaLabel, meta.label)}
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
        aria-label={formatCronControlLabel(labels.customValueAriaLabel, meta.label)}
        onChange={(event) => handleFieldRawChange(meta, event.target.value)}
      />
    )
  }

  return (
    <div
      className={classNames(cronEditorBaseClasses, className)}
      role="group"
      aria-label={ariaLabel ?? labels.ariaLabel}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          className={classNames(getCronEditorControlClasses(size, !validation.valid), 'flex-1')}
          value={expression}
          disabled={disabled}
          readOnly={readonly}
          aria-label={labels.expressionAriaLabel}
          onChange={(event) => handleRawExpressionChange(event.target.value)}
        />
        {resolvedPresets.length > 0 && (
          <select
            className={getCronEditorControlClasses(size)}
            value={resolvedPresets.some((preset) => preset.value === expression) ? expression : ''}
            disabled={inactive}
            aria-label={labels.presetAriaLabel}
            onChange={(event) => {
              if (event.target.value) commit(event.target.value)
            }}>
            <option value="">{labels.presetPlaceholder}</option>
            {resolvedPresets.map((preset) => (
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
        {localizedMetas.map((meta) => {
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
                aria-label={formatCronControlLabel(labels.modeAriaLabel, meta.label)}
                onChange={(event) =>
                  handleModeChange(meta, control, event.target.value as CronFieldControl['mode'])
                }>
                {modeOptions.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {modeLabels[mode.value]}
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
