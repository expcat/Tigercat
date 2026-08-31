import React, { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react'
import type {
  CronEditorProps as CoreCronEditorProps,
  CronFieldDraft,
  CronFieldKey,
  CronFieldMeta,
  CronFieldMode,
  CronPreset,
  CronValidationResult,
  InputStatus
} from '@expcat/tigercat-core'
import {
  applyCronFieldMode,
  buildCronFieldValueFromDraft,
  classNames,
  cronEditorBaseClasses,
  cronEditorErrorClasses,
  cronEditorFieldClasses,
  cronEditorFieldsClasses,
  cronEditorLabelClasses,
  cronFieldMetas,
  cronFieldModes,
  formatCronControlLabel,
  getCronEditorControlClasses,
  getCronEditorLabels,
  getCronExpressionIssue,
  getCronFieldIssue,
  getCronFieldValue,
  getCronModeLabels,
  getDefaultCronPresets,
  isCronExpressionEmpty,
  isCronFieldCountValid,
  markFormItemGroupControl,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  parseOptionalInt,
  seedCronFieldDraft,
  updateCronExpressionField,
  validateCronExpressionWithLabels
} from '@expcat/tigercat-core'
import { useTigerConfig } from './ConfigProvider'
import { useControlledState } from '../hooks/useControlledState'
import { useFormItemControlContext } from './FormItemContext'

export interface CronEditorProps extends CoreCronEditorProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string, validation: CronValidationResult) => void
  onValidate?: (validation: CronValidationResult) => void
  onBlur?: React.FocusEventHandler<HTMLElement>
  style?: React.CSSProperties
}

const CronEditorInner = forwardRef<HTMLInputElement, CronEditorProps>(function CronEditor(
  {
    value,
    defaultValue,
    disabled = false,
    readonly = false,
    size = 'md',
    presets,
    ariaLabel,
    locale,
    labels: labelsOverride,
    className,
    name,
    id,
    status: statusProp,
    onChange,
    onValidate,
    onBlur,
    style
  },
  ref
) {
  const config = useTigerConfig()
  const formItemControl = useFormItemControlContext()
  const mergedLocale = useMemo(
    () => mergeTigerLocale(config.locale, locale),
    [config.locale, locale]
  )
  const labels = useMemo(
    () => getCronEditorLabels(mergedLocale, labelsOverride),
    [mergedLocale, labelsOverride]
  )
  const fieldLabels = useMemo<Record<CronFieldKey, string>>(
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
    () => (presets === undefined ? getDefaultCronPresets(labels) : presets),
    [labels, presets]
  )
  const modeLabels = useMemo(() => getCronModeLabels(labels), [labels])
  const effectiveDisabled = Boolean(disabled || formItemControl?.disabled)
  const inactive = effectiveDisabled || readonly
  const status: InputStatus = statusProp ?? formItemControl?.status ?? 'default'
  const effectiveId = id ?? formItemControl?.id
  const effectiveName = name ?? formItemControl?.name
  const describedBy = mergeAriaDescribedBy(formItemControl?.describedBy, undefined)
  const labelledby = formItemControl?.labelId
  const parsedValue = value !== undefined ? value : (formItemControl?.value as string | undefined)

  const [expression, setExpression] = useControlledState<string, [CronValidationResult]>({
    value: value !== undefined || formItemControl?.value !== undefined ? parsedValue : undefined,
    defaultValue: defaultValue ?? '',
    onChange: (next, validation) => {
      onChange?.(next, validation)
      onValidate?.(validation)
      formItemControl?.onChange?.(next)
    }
  })

  const currentExpression = expression ?? ''
  const validation = useMemo(
    () => validateCronExpressionWithLabels(currentExpression, labels, fieldLabels),
    [currentExpression, labels, fieldLabels]
  )
  const fieldsReady = isCronFieldCountValid(currentExpression)
  const instanceId = useId()
  const errorId = `${instanceId}-error`
  const stickyModes = useRef<Partial<Record<CronFieldKey, CronFieldMode>>>({})
  const [drafts, setDrafts] = useState<Record<CronFieldKey, CronFieldDraft>>(() =>
    seedAllDrafts(currentExpression, stickyModes.current)
  )

  useEffect(() => {
    setDrafts(seedAllDrafts(currentExpression, stickyModes.current))
  }, [currentExpression])

  function commit(nextValue: string) {
    const nextValidation = validateCronExpressionWithLabels(nextValue, labels, fieldLabels)
    setExpression(nextValue, nextValidation)
  }

  function handleRawExpressionChange(nextValue: string) {
    stickyModes.current = {}
    const nextValidation = validateCronExpressionWithLabels(nextValue, labels, fieldLabels)
    setExpression(nextValue, nextValidation)
  }

  function writeField(meta: CronFieldMeta, draft: CronFieldDraft) {
    const raw = buildCronFieldValueFromDraft(draft, meta)
    if (isCronExpressionEmpty(currentExpression)) {
      const parts = ['*', '*', '*', '*', '*']
      const index = cronFieldMetas.findIndex((item) => item.key === meta.key)
      parts[index] = raw
      commit(parts.join(' '))
      return
    }
    const updated = updateCronExpressionField(currentExpression, meta.key, raw)
    if (updated == null) return
    commit(updated)
  }

  function handleModeChange(meta: CronFieldMeta, mode: CronFieldMode) {
    stickyModes.current[meta.key] = mode
    const next = applyCronFieldMode(drafts[meta.key], mode, meta)
    setDrafts((prev) => ({ ...prev, [meta.key]: next }))
    writeField(meta, next)
  }

  function patchDraft(meta: CronFieldMeta, patch: Partial<CronFieldDraft>, commitNow: boolean) {
    const next = { ...drafts[meta.key], ...patch }
    setDrafts((prev) => ({ ...prev, [meta.key]: next }))
    if (commitNow) writeField(meta, next)
  }

  function handleBlur(event: React.FocusEvent<HTMLElement>) {
    const next = event.relatedTarget as Node | null
    const root = event.currentTarget.closest('[data-tiger-croneditor]')
    if (root && next && root.contains(next)) return
    formItemControl?.onBlur?.()
    onBlur?.(event)
  }

  function renderFieldControl(meta: CronFieldMeta, draft: CronFieldDraft, invalid: boolean) {
    if (draft.mode === 'any') return null

    if (draft.mode === 'every') {
      return (
        <input
          type="text"
          inputMode="numeric"
          className={getCronEditorControlClasses(size, invalid)}
          value={draft.stepText}
          disabled={inactive || !fieldsReady}
          aria-label={formatCronControlLabel(labels.stepAriaLabel, meta.label)}
          onChange={(event) => {
            const text = event.target.value
            patchDraft(meta, { stepText: text, mode: 'every' }, parseOptionalInt(text) != null)
          }}
        />
      )
    }

    if (draft.mode === 'specific') {
      return (
        <input
          type="text"
          inputMode="numeric"
          className={getCronEditorControlClasses(size, invalid)}
          value={draft.valueText}
          disabled={inactive || !fieldsReady}
          aria-label={formatCronControlLabel(labels.valueAriaLabel, meta.label)}
          onChange={(event) => {
            const text = event.target.value
            patchDraft(meta, { valueText: text, mode: 'specific' }, parseOptionalInt(text) != null)
          }}
        />
      )
    }

    if (draft.mode === 'range') {
      return (
        <div className="grid grid-cols-2 gap-1">
          <input
            type="text"
            inputMode="numeric"
            className={getCronEditorControlClasses(size, invalid)}
            value={draft.startText}
            disabled={inactive || !fieldsReady}
            aria-label={formatCronControlLabel(labels.rangeStartAriaLabel, meta.label)}
            onChange={(event) => {
              const text = event.target.value
              patchDraft(
                meta,
                { startText: text, mode: 'range' },
                parseOptionalInt(text) != null && parseOptionalInt(draft.endText) != null
              )
            }}
          />
          <input
            type="text"
            inputMode="numeric"
            className={getCronEditorControlClasses(size, invalid)}
            value={draft.endText}
            disabled={inactive || !fieldsReady}
            aria-label={formatCronControlLabel(labels.rangeEndAriaLabel, meta.label)}
            onChange={(event) => {
              const text = event.target.value
              patchDraft(
                meta,
                { endText: text, mode: 'range' },
                parseOptionalInt(draft.startText) != null && parseOptionalInt(text) != null
              )
            }}
          />
        </div>
      )
    }

    return (
      <input
        type="text"
        className={getCronEditorControlClasses(size, invalid)}
        value={draft.raw}
        disabled={inactive || !fieldsReady}
        aria-label={formatCronControlLabel(labels.customValueAriaLabel, meta.label)}
        onChange={(event) => patchDraft(meta, { raw: event.target.value, mode: 'custom' }, true)}
      />
    )
  }

  const expressionIssue = getCronExpressionIssue(validation)
  const expressionInvalid = Boolean(expressionIssue) && !isCronExpressionEmpty(currentExpression)
  const groupName = ariaLabel ?? labels.ariaLabel

  return (
    <div
      className={classNames(cronEditorBaseClasses, className)}
      style={style}
      role="group"
      data-tiger-croneditor=""
      aria-label={labelledby ? undefined : groupName}
      aria-labelledby={labelledby}
      aria-describedby={describedBy}
      aria-invalid={status === 'error' || expressionInvalid ? true : undefined}
      onBlur={handleBlur}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          ref={ref}
          type="text"
          id={effectiveId}
          name={effectiveName}
          className={classNames(getCronEditorControlClasses(size, expressionInvalid), 'flex-1')}
          value={currentExpression}
          disabled={effectiveDisabled}
          readOnly={readonly}
          aria-label={labels.expressionAriaLabel}
          aria-invalid={expressionInvalid || undefined}
          aria-describedby={expressionIssue ? errorId : describedBy}
          onChange={(event) => handleRawExpressionChange(event.target.value)}
        />
        {resolvedPresets.length > 0 && (
          <select
            className={getCronEditorControlClasses(size)}
            value={
              resolvedPresets.some((preset) => preset.value === currentExpression)
                ? currentExpression
                : ''
            }
            disabled={inactive}
            aria-label={labels.presetAriaLabel}
            onChange={(event) => {
              if (event.target.value) {
                stickyModes.current = {}
                commit(event.target.value)
              }
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

      {expressionIssue ? (
        <div id={errorId} className={cronEditorErrorClasses} role="alert">
          {expressionIssue.message}
        </div>
      ) : null}

      <div className={cronEditorFieldsClasses}>
        {localizedMetas.map((meta) => {
          const draft = drafts[meta.key]
          const issue = getCronFieldIssue(validation, meta.key)
          const modeId = `${instanceId}-${meta.key}-mode`
          const fieldErrorId = `${instanceId}-${meta.key}-error`

          return (
            <div key={meta.key} className={cronEditorFieldClasses}>
              <label className={cronEditorLabelClasses} htmlFor={modeId}>
                {meta.label}
              </label>
              <select
                id={modeId}
                className={getCronEditorControlClasses(size, Boolean(issue))}
                value={draft.mode}
                disabled={inactive || !fieldsReady}
                aria-invalid={issue ? true : undefined}
                aria-describedby={issue ? fieldErrorId : undefined}
                aria-label={formatCronControlLabel(labels.modeAriaLabel, meta.label)}
                onChange={(event) => handleModeChange(meta, event.target.value as CronFieldMode)}>
                {cronFieldModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {modeLabels[mode]}
                  </option>
                ))}
              </select>
              {renderFieldControl(meta, draft, Boolean(issue))}
              {issue ? (
                <div id={fieldErrorId} className={cronEditorErrorClasses}>
                  {issue.message}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
})

export const CronEditor = markFormItemGroupControl(CronEditorInner)

function seedAllDrafts(
  expression: string,
  sticky: Partial<Record<CronFieldKey, CronFieldMode>>
): Record<CronFieldKey, CronFieldDraft> {
  const ready = isCronFieldCountValid(expression)
  return Object.fromEntries(
    cronFieldMetas.map((meta) => {
      const raw = ready ? (getCronFieldValue(expression, meta.key) ?? '*') : '*'
      return [meta.key, seedCronFieldDraft(raw, sticky[meta.key])]
    })
  ) as Record<CronFieldKey, CronFieldDraft>
}

export default CronEditor
