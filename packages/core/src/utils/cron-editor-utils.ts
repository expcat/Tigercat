import { classNames } from './class-names'
import type {
  CronEditorSize,
  CronEditorValidationLabels,
  CronFieldControl,
  CronFieldDraft,
  CronFieldKey,
  CronFieldMeta,
  CronFieldMode,
  CronPreset,
  CronValidationIssue,
  CronValidationResult
} from '../types/cron-editor'
import type { TigerLocaleCronEditor } from '../types/locale'

export const CRON_FIELD_COUNT = 5

export const cronFieldMetas: CronFieldMeta[] = [
  { key: 'minute', label: 'Minute', min: 0, max: 59, placeholder: '0-59' },
  { key: 'hour', label: 'Hour', min: 0, max: 23, placeholder: '0-23' },
  { key: 'dayOfMonth', label: 'Day', min: 1, max: 31, placeholder: '1-31' },
  { key: 'month', label: 'Month', min: 1, max: 12, placeholder: '1-12' },
  { key: 'dayOfWeek', label: 'Weekday', min: 0, max: 7, placeholder: '0-7' }
]

/** Canonical every-minute expression. Not a default empty value. */
export const defaultCronExpression = '* * * * *'

export const defaultCronPresetValues: string[] = [
  '* * * * *',
  '0 * * * *',
  '0 0 * * *',
  '0 0 * * 1',
  '0 0 1 * *'
]

export function getDefaultCronPresets(labels: {
  everyMinutePreset: string
  hourlyPreset: string
  dailyPreset: string
  weeklyPreset: string
  monthlyPreset: string
}): CronPreset[] {
  return [
    { label: labels.everyMinutePreset, value: defaultCronPresetValues[0] },
    { label: labels.hourlyPreset, value: defaultCronPresetValues[1] },
    { label: labels.dailyPreset, value: defaultCronPresetValues[2] },
    { label: labels.weeklyPreset, value: defaultCronPresetValues[3] },
    { label: labels.monthlyPreset, value: defaultCronPresetValues[4] }
  ]
}

/** @deprecated Use `getDefaultCronPresets` with locale labels. */
export const defaultCronPresets: CronPreset[] = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Hourly', value: '0 * * * *' },
  { label: 'Daily', value: '0 0 * * *' },
  { label: 'Weekly', value: '0 0 * * 1' },
  { label: 'Monthly', value: '0 0 1 * *' }
]

export const cronFieldModes: CronFieldMode[] = ['any', 'every', 'specific', 'range', 'custom']

export const cronEditorBaseClasses = classNames(
  'inline-flex w-full flex-col gap-3 rounded-[var(--tiger-radius-md,0.5rem)] border p-3',
  'border-[var(--tiger-border,#d1d5db)]',
  'bg-[var(--tiger-surface,#ffffff)]',
  'text-[var(--tiger-text,#111827)]'
)

export const cronEditorFieldsClasses = 'grid gap-2 md:grid-cols-5'

export const cronEditorFieldClasses = classNames(
  'flex min-w-0 flex-col gap-2 rounded-[var(--tiger-radius-md,0.5rem)] border p-2',
  'border-[var(--tiger-border,#d1d5db)]',
  'bg-[var(--tiger-fill,#f9fafb)]'
)

export const cronEditorLabelClasses = 'text-xs font-medium text-[var(--tiger-text-muted,#6b7280)]'
export const cronEditorErrorClasses = 'text-xs text-[var(--tiger-error,#dc2626)]'

const controlSizeClasses: Record<CronEditorSize, string> = {
  sm: 'h-8 px-2 text-xs',
  md: 'h-9 px-2.5 text-sm',
  lg: 'h-10 px-3 text-base'
}

export function getCronEditorControlClasses(size: CronEditorSize, invalid = false): string {
  return classNames(
    'min-w-0 rounded-[var(--tiger-radius-sm,0.375rem)] border font-mono',
    'tiger-motion-aware [transition:var(--tiger-transition-base,border-color_150ms_ease,box-shadow_150ms_ease)]',
    'outline-none focus-visible:ring-2',
    'focus-visible:ring-[var(--tiger-focus-ring,var(--tiger-primary,#2563eb))]',
    controlSizeClasses[size],
    invalid ? 'border-[var(--tiger-error,#dc2626)]' : 'border-[var(--tiger-border,#d1d5db)]',
    'bg-[var(--tiger-surface,#ffffff)]',
    'disabled:cursor-not-allowed disabled:opacity-50'
  )
}

export function getCronExpressionParts(expression: string): string[] {
  return expression.trim().split(/\s+/).filter(Boolean)
}

export function isCronFieldCountValid(expression: string): boolean {
  return getCronExpressionParts(expression).length === CRON_FIELD_COUNT
}

export function isCronExpressionEmpty(expression: string | undefined | null): boolean {
  return expression == null || expression.trim() === ''
}

/**
 * Join whitespace-normalized parts. Empty stays empty — never becomes every-minute.
 */
export function normalizeCronExpression(expression: string): string {
  const parts = getCronExpressionParts(expression)
  return parts.join(' ')
}

export function getCronFieldValue(expression: string, field: CronFieldKey): string | undefined {
  const parts = getCronExpressionParts(expression)
  if (parts.length !== CRON_FIELD_COUNT) return undefined
  return parts[getCronFieldIndex(field)]
}

/**
 * Update one field. Returns null when the expression is not a 5-field unix cron
 * so callers keep the original instead of rewriting it to `* * * * *`.
 */
export function updateCronExpressionField(
  expression: string,
  field: CronFieldKey,
  value: string
): string | null {
  const parts = getCronExpressionParts(expression)
  if (parts.length !== CRON_FIELD_COUNT) return null
  parts[getCronFieldIndex(field)] = value.trim() === '' ? '*' : value.trim()
  return parts.join(' ')
}

export function parseCronFieldControl(raw: string): CronFieldControl {
  const value = raw.trim() || '*'

  if (value === '*') return { mode: 'any', raw: value }

  const everyMatch = value.match(/^\*\/(\d+)$/)
  if (everyMatch) return { mode: 'every', step: Number(everyMatch[1]), raw: value }

  const specificMatch = value.match(/^\d+$/)
  if (specificMatch) return { mode: 'specific', value: Number(value), raw: value }

  const rangeMatch = value.match(/^(\d+)-(\d+)$/)
  if (rangeMatch) {
    return {
      mode: 'range',
      start: Number(rangeMatch[1]),
      end: Number(rangeMatch[2]),
      raw: value
    }
  }

  return { mode: 'custom', raw: value }
}

export function seedCronFieldDraft(
  raw: string | undefined,
  stickyMode?: CronFieldMode
): CronFieldDraft {
  const parsed = parseCronFieldControl(raw ?? '*')
  const mode = stickyMode ?? parsed.mode
  return {
    mode,
    raw: parsed.raw,
    valueText: parsed.value != null ? String(parsed.value) : '',
    startText: parsed.start != null ? String(parsed.start) : '',
    endText: parsed.end != null ? String(parsed.end) : '',
    stepText: parsed.step != null ? String(parsed.step) : ''
  }
}

export function applyCronFieldMode(
  draft: CronFieldDraft,
  mode: CronFieldMode,
  meta: CronFieldMeta
): CronFieldDraft {
  if (mode === 'custom') {
    return { ...draft, mode: 'custom' }
  }
  if (mode === 'any') {
    return { ...draft, mode: 'any', raw: '*' }
  }
  if (mode === 'every') {
    const step = draft.stepText || '1'
    return { ...draft, mode: 'every', stepText: step, raw: `*/${step}` }
  }
  if (mode === 'specific') {
    const value = draft.valueText || String(meta.min)
    return { ...draft, mode: 'specific', valueText: value, raw: value }
  }
  const start = draft.startText || String(meta.min)
  const end = draft.endText || String(meta.max)
  return { ...draft, mode: 'range', startText: start, endText: end, raw: `${start}-${end}` }
}

/**
 * Build a field token from the visual control. Does not clamp or swap ranges.
 * Empty number drafts stay empty so the field can be invalid instead of `0`/`min`.
 */
export function buildCronFieldValue(control: CronFieldControl, meta: CronFieldMeta): string {
  if (control.mode === 'any') return '*'
  if (control.mode === 'every') {
    if (control.step == null || !Number.isFinite(control.step))
      return draftOrStar(control.raw, '*/1')
    return `*/${control.step}`
  }
  if (control.mode === 'specific') {
    if (control.value == null || !Number.isFinite(control.value)) {
      return draftOrStar(control.raw, String(meta.min))
    }
    return String(control.value)
  }
  if (control.mode === 'range') {
    if (
      control.start == null ||
      control.end == null ||
      !Number.isFinite(control.start) ||
      !Number.isFinite(control.end)
    ) {
      return draftOrStar(control.raw, `${meta.min}-${meta.max}`)
    }
    return `${control.start}-${control.end}`
  }
  return control.raw.trim() || '*'
}

export function buildCronFieldValueFromDraft(draft: CronFieldDraft, meta: CronFieldMeta): string {
  if (draft.mode === 'custom') return draft.raw.trim() || '*'
  if (draft.mode === 'any') return '*'
  if (draft.mode === 'every') {
    const step = parseOptionalInt(draft.stepText)
    return step == null
      ? draft.stepText.trim() === ''
        ? '*/'
        : `*/${draft.stepText.trim()}`
      : `*/${step}`
  }
  if (draft.mode === 'specific') {
    const value = parseOptionalInt(draft.valueText)
    return value == null ? draft.valueText.trim() : String(value)
  }
  const start = parseOptionalInt(draft.startText)
  const end = parseOptionalInt(draft.endText)
  if (start == null && end == null && !draft.startText.trim() && !draft.endText.trim()) {
    return `${meta.min}-${meta.max}`
  }
  return `${draft.startText.trim()}-${draft.endText.trim()}`
}

export function parseOptionalInt(raw: string): number | null {
  const trimmed = raw.trim()
  if (!trimmed || !/^-?\d+$/.test(trimmed)) return null
  return Number(trimmed)
}

export function validateCronExpression(expression: string): CronValidationResult {
  return validateCronExpressionWithLabels(expression)
}

export function validateCronExpressionWithLabels(
  expression: string,
  labels?: CronEditorValidationLabels,
  fieldLabels?: Partial<Record<CronFieldKey, string>>
): CronValidationResult {
  if (isCronExpressionEmpty(expression)) {
    return { valid: true, issues: [] }
  }

  const parts = getCronExpressionParts(expression)
  const issues: CronValidationIssue[] = []

  if (parts.length !== cronFieldMetas.length) {
    issues.push({
      field: 'expression',
      message: labels?.expressionFieldsError ?? 'Cron expression must contain 5 fields'
    })
  }

  cronFieldMetas.forEach((meta, index) => {
    const part = parts[index]
    if (!part) return
    const localizedMeta = { ...meta, label: fieldLabels?.[meta.key] ?? meta.label }
    const message = validateCronField(part, localizedMeta, labels)
    if (message) issues.push({ field: meta.key, message })
  })

  return { valid: issues.length === 0, issues }
}

export function validateCronField(
  value: string,
  meta: CronFieldMeta,
  labels?: CronEditorValidationLabels
): string | null {
  const trimmed = value.trim()
  if (!trimmed) {
    return formatCronValidationMessage(labels?.fieldRequiredError ?? '{field} is required', meta)
  }

  return (
    trimmed
      .split(',')
      .map((part) => validateCronFieldPart(part, meta, labels))
      .find((message): message is string => message !== null) ?? null
  )
}

export function getCronFieldIssue(
  result: CronValidationResult,
  field: CronFieldKey
): CronValidationIssue | undefined {
  return result.issues.find((issue) => issue.field === field)
}

export function getCronExpressionIssue(
  result: CronValidationResult
): CronValidationIssue | undefined {
  return result.issues.find((issue) => issue.field === 'expression')
}

export function formatCronControlLabel(template: string, field: string): string {
  return template.replace('{field}', field)
}

export function getCronModeLabels(
  labels: Pick<
    Required<TigerLocaleCronEditor>,
    'modeAnyLabel' | 'modeEveryLabel' | 'modeSpecificLabel' | 'modeRangeLabel' | 'modeCustomLabel'
  >
): Record<CronFieldMode, string> {
  return {
    any: labels.modeAnyLabel,
    every: labels.modeEveryLabel,
    specific: labels.modeSpecificLabel,
    range: labels.modeRangeLabel,
    custom: labels.modeCustomLabel
  }
}

function getCronFieldIndex(field: CronFieldKey): number {
  return cronFieldMetas.findIndex((meta) => meta.key === field)
}

function draftOrStar(raw: string, fallback: string): string {
  const trimmed = raw.trim()
  return trimmed || fallback
}

function validateCronFieldPart(
  part: string,
  meta: CronFieldMeta,
  labels?: CronEditorValidationLabels
): string | null {
  const [rangePart, stepPart] = part.split('/')
  if (part.split('/').length > 2) {
    return formatCronValidationMessage(
      labels?.invalidStepError ?? '{field} has an invalid step expression',
      meta
    )
  }

  if (stepPart !== undefined && !isCronIntegerInRange(stepPart, 1, meta.max)) {
    return formatCronValidationMessage(
      labels?.stepRangeError ?? '{field} step must be between 1 and {max}',
      meta
    )
  }

  if (rangePart === '*') return null

  const rangeMatch = rangePart.match(/^(\d+)-(\d+)$/)
  if (rangeMatch) {
    const start = Number(rangeMatch[1])
    const end = Number(rangeMatch[2])
    if (!isNumberInRange(start, meta.min, meta.max) || !isNumberInRange(end, meta.min, meta.max)) {
      return formatCronValidationMessage(
        labels?.fieldRangeError ?? '{field} must be between {min} and {max}',
        meta
      )
    }
    if (start > end) {
      return formatCronValidationMessage(
        labels?.rangeOrderError ?? '{field} range start must be less than or equal to end',
        meta
      )
    }
    return null
  }

  if (/^\d+$/.test(rangePart)) {
    return isCronIntegerInRange(rangePart, meta.min, meta.max)
      ? null
      : formatCronValidationMessage(
          labels?.fieldRangeError ?? '{field} must be between {min} and {max}',
          meta
        )
  }

  return formatCronValidationMessage(
    labels?.invalidFieldError ?? '{field} must be *, a number, a range, a step, or a comma list',
    meta
  )
}

function formatCronValidationMessage(template: string, meta: CronFieldMeta): string {
  return template
    .replace('{field}', meta.label)
    .replace('{min}', String(meta.min))
    .replace('{max}', String(meta.max))
}

function isCronIntegerInRange(value: string, min: number, max: number): boolean {
  if (!/^\d+$/.test(value)) return false
  return isNumberInRange(Number(value), min, max)
}

function isNumberInRange(value: number, min: number, max: number): boolean {
  return Number.isInteger(value) && value >= min && value <= max
}
