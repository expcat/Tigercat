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
  cronDraftErrorMessage,
  cronEditorBaseClasses,
  cronFormValue,
  cronEditorErrorClasses,
  cronEditorFieldClasses,
  cronEditorFieldsClasses,
  cronEditorLabelClasses,
  cronFieldMetas,
  cronFieldModes,
  formatCronControlLabel,
  describeCronExpression,
  describeNextCronRun,
  getCronEditorControlClasses,
  getCronEditorLabels,
  getCronExpressionIssue,
  getCronFieldIssue,
  getCronModeLabels,
  getDefaultCronPresets,
  isCronExpressionEmpty,
  isCronFieldCountValid,
  markFormItemGroupControl,
  mergeAriaDescribedBy,
  mergeTigerLocale,
  parseOptionalInt,
  seedCronFieldDrafts,
  updateCronExpressionField,
  validateCronExpressionWithLabels
} from '@expcat/tigercat-core'
import { useTigerConfig } from './tiger-config'
import { useControlledState } from '../hooks/useControlledState'
import { useFormItemControlContext } from './FormItemContext'

export interface CronEditorProps
  extends
    CoreCronEditorProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, keyof CoreCronEditorProps | 'onChange'> {
  value?: string | null
  defaultValue?: string | null
  onChange?: (value: string | null, validation: CronValidationResult) => void
  onValidate?: (validation: CronValidationResult) => void
  onBlur?: React.FocusEventHandler<HTMLElement>
  style?: React.CSSProperties
}

const CronEditorInner = forwardRef<HTMLInputElement, CronEditorProps>(function CronEditor(
  {
    value,
    defaultValue,
    disabled = false,
    readOnly = false,
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
    style,
    ...rest
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
  const status: InputStatus = statusProp ?? formItemControl?.status ?? 'default'
  const effectiveId = id ?? formItemControl?.id
  const effectiveName = name ?? formItemControl?.name
  const describedBy = mergeAriaDescribedBy(formItemControl?.describedBy, undefined)
  const labelledby = formItemControl?.labelId
  const parsedValue =
    value !== undefined ? value : (formItemControl?.value as string | null | undefined)
  const valueControlled = value !== undefined || formItemControl?.value !== undefined

  const modelSource = valueControlled ? (parsedValue == null ? '' : String(parsedValue)) : undefined
  const [expression, setExpression] = useControlledState<string | null, [CronValidationResult]>({
    value: valueControlled ? cronFormValue(modelSource) : undefined,
    defaultValue: cronFormValue(defaultValue),
    onChange: (next, validation) => {
      onChange?.(next, validation)
      onValidate?.(validation)
      formItemControl?.onChange?.(next)
    }
  })

  const externalRaw = valueControlled ? (modelSource ?? '') : (expression ?? '')
  const [expressionDraft, setExpressionDraft] = useState(() =>
    value !== undefined
      ? (value ?? '')
      : formItemControl?.value !== undefined
        ? parsedValue == null
          ? ''
          : String(parsedValue)
        : (defaultValue ?? '')
  )
  const echoedRef = useRef<string | null | undefined>(undefined)
  const draftRef = useRef(expressionDraft)
  draftRef.current = expressionDraft

  useEffect(() => {
    if (!valueControlled) return
    const next = externalRaw
    if (echoedRef.current !== undefined && (echoedRef.current ?? '') === next) {
      echoedRef.current = undefined
      return
    }
    if (next === draftRef.current) return
    if (next === '' && (cronFormValue(draftRef.current) ?? '') === '') return
    setExpressionDraft(next)
    setDrafts(seedCronFieldDrafts(next, stickyModes.current))
  }, [externalRaw, valueControlled])

  const validation = useMemo(
    () => validateCronExpressionWithLabels(expressionDraft, labels, fieldLabels),
    [expressionDraft, labels, fieldLabels]
  )
  const fieldsReady =
    !isCronExpressionEmpty(expressionDraft) && isCronFieldCountValid(expressionDraft)
  const submittedValue = cronFormValue(expressionDraft) ?? ''
  const instanceId = useId()
  const errorId = `${instanceId}-error`
  const stickyModes = useRef<Partial<Record<CronFieldKey, CronFieldMode>>>({})
  const [drafts, setDrafts] = useState<Record<CronFieldKey, CronFieldDraft>>(() =>
    seedCronFieldDrafts(expressionDraft, stickyModes.current)
  )
  const lastErrorRef = useRef<string | null>(null)

  useEffect(() => {
    const message = cronDraftErrorMessage(expressionDraft, validation)
    if (message === lastErrorRef.current) return
    const previous = lastErrorRef.current
    lastErrorRef.current = message
    if (message) formItemControl?.setError?.(message)
    else if (previous) formItemControl?.setError?.(null)
  }, [expressionDraft, formItemControl, validation])

  function commit(nextValue: string) {
    if (effectiveDisabled || readOnly) return
    const stored = cronFormValue(nextValue)
    const nextValidation = validateCronExpressionWithLabels(nextValue, labels, fieldLabels)
    const currentStored = cronFormValue(valueControlled ? externalRaw : expression)
    if (!valueControlled) setExpressionDraft(nextValue)
    if (currentStored !== stored) {
      if (!valueControlled) echoedRef.current = stored
      setExpression(stored, nextValidation)
      return
    }
    onValidate?.(nextValidation)
  }

  function handleRawExpressionChange(nextValue: string) {
    if (readOnly) return
    stickyModes.current = {}
    commit(nextValue)
    if (!valueControlled) setDrafts(seedCronFieldDrafts(nextValue, stickyModes.current))
  }

  function writeField(meta: CronFieldMeta, draft: CronFieldDraft) {
    if (!fieldsReady && isCronExpressionEmpty(expressionDraft)) {
      const parts = ['*', '*', '*', '*', '*']
      const index = cronFieldMetas.findIndex((item) => item.key === meta.key)
      parts[index] = buildCronFieldValueFromDraft(draft, meta)
      commit(parts.join(' '))
      return
    }
    if (!fieldsReady) return
    const raw = buildCronFieldValueFromDraft(draft, meta)
    const updated = updateCronExpressionField(expressionDraft, meta.key, raw)
    if (updated == null) return
    commit(updated)
  }

  function handleModeChange(meta: CronFieldMeta, mode: CronFieldMode) {
    if (effectiveDisabled || readOnly || !fieldsReady) return
    stickyModes.current[meta.key] = mode
    const next = applyCronFieldMode(drafts[meta.key], mode, meta)
    if (!valueControlled) setDrafts((prev) => ({ ...prev, [meta.key]: next }))
    writeField(meta, next)
  }

  function patchDraft(
    meta: CronFieldMeta,
    patch: Partial<CronFieldDraft>,
    commitNow: boolean,
    input?: HTMLInputElement
  ) {
    const previous = drafts[meta.key]
    const next = { ...previous, ...patch }
    if (!valueControlled || !commitNow) setDrafts((prev) => ({ ...prev, [meta.key]: next }))
    if (commitNow) writeField(meta, next)
    if (!valueControlled || !commitNow || !input) return
    input.value =
      patch.stepText !== undefined
        ? previous.stepText
        : patch.valueText !== undefined
          ? previous.valueText
          : patch.startText !== undefined
            ? previous.startText
            : patch.endText !== undefined
              ? previous.endText
              : previous.raw
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
          disabled={effectiveDisabled || !fieldsReady}
          readOnly={readOnly}
          aria-label={formatCronControlLabel(labels.stepAriaLabel, meta.label)}
          onChange={(event) => {
            if (readOnly) return
            const text = event.target.value
            patchDraft(
              meta,
              { stepText: text, mode: 'every' },
              parseOptionalInt(text) != null,
              event.target
            )
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
          disabled={effectiveDisabled || !fieldsReady}
          readOnly={readOnly}
          aria-label={formatCronControlLabel(labels.valueAriaLabel, meta.label)}
          onChange={(event) => {
            if (readOnly) return
            const text = event.target.value
            patchDraft(
              meta,
              { valueText: text, mode: 'specific' },
              parseOptionalInt(text) != null,
              event.target
            )
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
            disabled={effectiveDisabled || !fieldsReady}
            readOnly={readOnly}
            aria-label={formatCronControlLabel(labels.rangeStartAriaLabel, meta.label)}
            onChange={(event) => {
              if (readOnly) return
              const text = event.target.value
              patchDraft(
                meta,
                { startText: text, mode: 'range' },
                parseOptionalInt(text) != null && parseOptionalInt(draft.endText) != null,
                event.target
              )
            }}
          />
          <input
            type="text"
            inputMode="numeric"
            className={getCronEditorControlClasses(size, invalid)}
            value={draft.endText}
            disabled={effectiveDisabled || !fieldsReady}
            readOnly={readOnly}
            aria-label={formatCronControlLabel(labels.rangeEndAriaLabel, meta.label)}
            onChange={(event) => {
              if (readOnly) return
              const text = event.target.value
              patchDraft(
                meta,
                { endText: text, mode: 'range' },
                parseOptionalInt(draft.startText) != null && parseOptionalInt(text) != null,
                event.target
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
        disabled={effectiveDisabled || !fieldsReady}
        readOnly={readOnly}
        aria-label={formatCronControlLabel(labels.customValueAriaLabel, meta.label)}
        onChange={(event) => {
          if (readOnly) return
          patchDraft(meta, { raw: event.target.value, mode: 'custom' }, true, event.target)
        }}
      />
    )
  }

  const expressionIssue = getCronExpressionIssue(validation)
  const expressionInvalid = Boolean(expressionIssue) && !isCronExpressionEmpty(expressionDraft)
  const groupName = ariaLabel ?? labels.ariaLabel

  return (
    <div
      {...rest}
      className={classNames(cronEditorBaseClasses, className)}
      style={style}
      role="group"
      data-tiger-croneditor=""
      aria-label={labelledby ? undefined : groupName}
      aria-labelledby={labelledby}
      aria-describedby={describedBy}
      aria-invalid={status === 'error' || expressionInvalid ? true : undefined}
      onBlur={handleBlur}>
      {effectiveName ? (
        <input
          type="hidden"
          name={effectiveName}
          value={submittedValue}
          disabled={effectiveDisabled || undefined}
        />
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          ref={ref}
          type="text"
          id={effectiveId}
          className={classNames(getCronEditorControlClasses(size, expressionInvalid), 'flex-1')}
          value={expressionDraft}
          disabled={effectiveDisabled}
          readOnly={readOnly}
          aria-label={labels.expressionAriaLabel}
          aria-invalid={expressionInvalid || undefined}
          aria-describedby={expressionIssue ? errorId : describedBy}
          onChange={(event) => {
            handleRawExpressionChange(event.target.value)
            if (valueControlled) event.target.value = expressionDraft
          }}
        />
        {resolvedPresets.length > 0 && (
          <select
            className={getCronEditorControlClasses(size)}
            value={
              resolvedPresets.some((preset) => preset.value === expressionDraft)
                ? expressionDraft
                : ''
            }
            disabled={effectiveDisabled}
            aria-label={labels.presetAriaLabel}
            onChange={(event) => {
              if (readOnly || !event.target.value) return
              stickyModes.current = {}
              const nextValue = event.target.value
              commit(nextValue)
              if (!valueControlled) setDrafts(seedCronFieldDrafts(nextValue, stickyModes.current))
              else {
                event.target.value = resolvedPresets.some(
                  (preset) => preset.value === expressionDraft
                )
                  ? expressionDraft
                  : ''
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
        <div id={errorId} className={cronEditorErrorClasses} aria-live="polite">
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
                value={fieldsReady ? draft.mode : ''}
                disabled={effectiveDisabled || !fieldsReady}
                aria-invalid={issue ? true : undefined}
                aria-describedby={issue ? fieldErrorId : undefined}
                aria-label={formatCronControlLabel(labels.modeAriaLabel, meta.label)}
                onChange={(event) => {
                  handleModeChange(meta, event.target.value as CronFieldMode)
                  if (valueControlled) event.target.value = drafts[meta.key].mode
                }}>
                {fieldsReady ? null : <option value="">{'\u00a0'}</option>}
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
      {validation.valid && !isCronExpressionEmpty(expressionDraft) ? (
        <p
          className="min-w-0 break-words text-sm text-[var(--tiger-text-secondary)]"
          data-tiger-cron-summary="">
          {describeCronExpression(expressionDraft, mergedLocale, labels)}{' '}
          {describeNextCronRun(expressionDraft, mergedLocale, labels)}
        </p>
      ) : null}
    </div>
  )
})

export const CronEditor = markFormItemGroupControl(CronEditorInner)

export default CronEditor
