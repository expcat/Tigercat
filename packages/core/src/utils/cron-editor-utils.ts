import { classNames } from './class-names'
import type {
  CronEditorSize,
  CronFieldControl,
  CronFieldKey,
  CronFieldMeta,
  CronPreset,
  CronValidationIssue,
  CronValidationResult
} from '../types/cron-editor'

export const cronFieldMetas: CronFieldMeta[] = [
  { key: 'minute', label: 'Minute', min: 0, max: 59, placeholder: '0-59' },
  { key: 'hour', label: 'Hour', min: 0, max: 23, placeholder: '0-23' },
  { key: 'dayOfMonth', label: 'Day', min: 1, max: 31, placeholder: '1-31' },
  { key: 'month', label: 'Month', min: 1, max: 12, placeholder: '1-12' },
  { key: 'dayOfWeek', label: 'Weekday', min: 0, max: 7, placeholder: '0-7' }
]

export const defaultCronExpression = '* * * * *'

export const defaultCronPresets: CronPreset[] = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Hourly', value: '0 * * * *' },
  { label: 'Daily', value: '0 0 * * *' },
  { label: 'Weekly', value: '0 0 * * 1' },
  { label: 'Monthly', value: '0 0 1 * *' }
]

export const cronEditorBaseClasses = classNames(
  'inline-flex w-full flex-col gap-3 rounded-[var(--tiger-radius-md,0.5rem)] border p-3',
  'border-[var(--tiger-croneditor-border,var(--tiger-border,#d1d5db))]',
  'bg-[var(--tiger-croneditor-bg,var(--tiger-surface,#ffffff))]',
  'text-[var(--tiger-croneditor-text,var(--tiger-text,#111827))]'
)

export const cronEditorFieldsClasses = 'grid gap-2 sm:grid-cols-5'

export const cronEditorFieldClasses = classNames(
  'flex min-w-0 flex-col gap-2 rounded-[var(--tiger-radius-md,0.5rem)] border p-2',
  'border-[var(--tiger-croneditor-field-border,var(--tiger-border,#d1d5db))]',
  'bg-[var(--tiger-croneditor-field-bg,var(--tiger-fill,#f9fafb))]'
)

export const cronEditorLabelClasses = 'text-xs font-medium text-[var(--tiger-text-muted,#6b7280)]'
export const cronEditorErrorClasses = 'text-xs text-[var(--tiger-danger,#dc2626)]'

const controlSizeClasses: Record<CronEditorSize, string> = {
  sm: 'h-8 px-2 text-xs',
  md: 'h-9 px-2.5 text-sm',
  lg: 'h-10 px-3 text-base'
}

export function getCronEditorControlClasses(size: CronEditorSize, invalid = false): string {
  return classNames(
    'min-w-0 rounded-[var(--tiger-radius-sm,0.375rem)] border font-mono outline-none transition-colors',
    controlSizeClasses[size],
    invalid
      ? 'border-[var(--tiger-danger,#dc2626)] focus:border-[var(--tiger-danger,#dc2626)]'
      : 'border-[var(--tiger-croneditor-control-border,var(--tiger-border,#d1d5db))] focus:border-[var(--tiger-primary,#2563eb)]',
    'bg-[var(--tiger-croneditor-control-bg,var(--tiger-surface,#ffffff))]',
    'disabled:cursor-not-allowed disabled:opacity-50'
  )
}

export function getCronExpressionParts(expression: string): string[] {
  return expression.trim().split(/\s+/).filter(Boolean)
}

export function normalizeCronExpression(expression: string): string {
  const parts = getCronExpressionParts(expression)
  return parts.length === 0 ? defaultCronExpression : parts.join(' ')
}

export function getCronFieldValue(expression: string, field: CronFieldKey): string {
  const parts = getSafeCronExpressionParts(expression)
  return parts[getCronFieldIndex(field)]
}

export function updateCronExpressionField(
  expression: string,
  field: CronFieldKey,
  value: string
): string {
  const parts = getSafeCronExpressionParts(expression)
  parts[getCronFieldIndex(field)] = value.trim() || '*'
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

export function buildCronFieldValue(control: CronFieldControl, meta: CronFieldMeta): string {
  if (control.mode === 'any') return '*'
  if (control.mode === 'every') return `*/${clampCronNumber(control.step ?? 1, 1, meta.max)}`
  if (control.mode === 'specific') {
    return String(clampCronNumber(control.value ?? meta.min, meta.min, meta.max))
  }
  if (control.mode === 'range') {
    const start = clampCronNumber(control.start ?? meta.min, meta.min, meta.max)
    const end = clampCronNumber(control.end ?? start, meta.min, meta.max)
    return `${Math.min(start, end)}-${Math.max(start, end)}`
  }
  return control.raw.trim() || '*'
}

export function validateCronExpression(expression: string): CronValidationResult {
  const parts = getCronExpressionParts(expression)
  const issues: CronValidationIssue[] = []

  if (parts.length !== cronFieldMetas.length) {
    issues.push({ field: 'expression', message: 'Cron expression must contain 5 fields' })
  }

  cronFieldMetas.forEach((meta, index) => {
    const part = parts[index]
    if (!part) return
    const message = validateCronField(part, meta)
    if (message) issues.push({ field: meta.key, message })
  })

  return { valid: issues.length === 0, issues }
}

export function validateCronField(value: string, meta: CronFieldMeta): string | null {
  const trimmed = value.trim()
  if (!trimmed) return `${meta.label} is required`

  return (
    trimmed
      .split(',')
      .map((part) => validateCronFieldPart(part, meta))
      .find((message): message is string => message !== null) ?? null
  )
}

export function getCronFieldIssue(
  result: CronValidationResult,
  field: CronFieldKey
): CronValidationIssue | undefined {
  return result.issues.find((issue) => issue.field === field)
}

function getSafeCronExpressionParts(expression: string): string[] {
  const parts = getCronExpressionParts(expression)
  if (parts.length === cronFieldMetas.length) return parts
  return getCronExpressionParts(defaultCronExpression)
}

function getCronFieldIndex(field: CronFieldKey): number {
  return cronFieldMetas.findIndex((meta) => meta.key === field)
}

function validateCronFieldPart(part: string, meta: CronFieldMeta): string | null {
  const [rangePart, stepPart] = part.split('/')
  if (part.split('/').length > 2) return `${meta.label} has an invalid step expression`

  if (stepPart !== undefined && !isCronIntegerInRange(stepPart, 1, meta.max)) {
    return `${meta.label} step must be between 1 and ${meta.max}`
  }

  if (rangePart === '*') return null

  const rangeMatch = rangePart.match(/^(\d+)-(\d+)$/)
  if (rangeMatch) {
    const start = Number(rangeMatch[1])
    const end = Number(rangeMatch[2])
    if (!isNumberInRange(start, meta.min, meta.max) || !isNumberInRange(end, meta.min, meta.max)) {
      return `${meta.label} must be between ${meta.min} and ${meta.max}`
    }
    if (start > end) return `${meta.label} range start must be less than or equal to end`
    return null
  }

  if (/^\d+$/.test(rangePart)) {
    return isCronIntegerInRange(rangePart, meta.min, meta.max)
      ? null
      : `${meta.label} must be between ${meta.min} and ${meta.max}`
  }

  return `${meta.label} must be *, a number, a range, a step, or a comma list`
}

function isCronIntegerInRange(value: string, min: number, max: number): boolean {
  if (!/^\d+$/.test(value)) return false
  return isNumberInRange(Number(value), min, max)
}

function isNumberInRange(value: number, min: number, max: number): boolean {
  return Number.isInteger(value) && value >= min && value <= max
}

function clampCronNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min
  return Math.max(min, Math.min(max, Math.round(value)))
}
