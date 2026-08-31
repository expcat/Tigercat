import type { InputStatus } from './input'
import type { TigerLocale, TigerLocaleCronEditor } from './locale'

export type CronEditorSize = 'sm' | 'md' | 'lg'

export type CronFieldKey = 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek'

export type CronFieldMode = 'any' | 'every' | 'specific' | 'range' | 'custom'

export interface CronFieldMeta {
  key: CronFieldKey
  label: string
  min: number
  max: number
  placeholder: string
}

export interface CronFieldControl {
  mode: CronFieldMode
  value?: number
  start?: number
  end?: number
  step?: number
  raw: string
}

export interface CronFieldDraft {
  mode: CronFieldMode
  raw: string
  valueText: string
  startText: string
  endText: string
  stepText: string
}

export interface CronValidationIssue {
  field: CronFieldKey | 'expression'
  message: string
}

export interface CronValidationResult {
  valid: boolean
  issues: CronValidationIssue[]
}

export interface CronEditorValidationLabels {
  expressionFieldsError?: string
  fieldRequiredError?: string
  invalidStepError?: string
  stepRangeError?: string
  fieldRangeError?: string
  rangeOrderError?: string
  invalidFieldError?: string
}

export interface CronPreset {
  label: string
  value: string
  description?: string
}

/**
 * Shared CronEditor props. Vue binds `modelValue` / `update:modelValue`.
 *
 * Dialect is **5-field numeric unix cron** (minute hour day-of-month month day-of-week).
 * Sunday is `0` or `7`. Names (`MON`, `JAN`), Quartz (`?` `L` `W` `#`), seconds, and
 * years are invalid. Unselected is `undefined` / `''` — not `* * * * *`.
 */
export interface CronEditorProps {
  /**
   * @default false
   */
  disabled?: boolean
  /**
   * @default false
   */
  readonly?: boolean
  /**
   * @default 'md'
   */
  size?: CronEditorSize
  presets?: CronPreset[]
  ariaLabel?: string
  className?: string
  /**
   * 5-field unix expression. `undefined` is unselected; `''` is cleared empty.
   */
  value?: string
  defaultValue?: string
  /** Locale object merged on top of ConfigProvider. Do not pass a language id. */
  locale?: Partial<TigerLocale>
  labels?: Partial<TigerLocaleCronEditor>
  status?: InputStatus
  name?: string
  id?: string
  onChange?: (value: string, validation: CronValidationResult) => void
  onValidate?: (validation: CronValidationResult) => void
}

export interface CronEditorRef {
  focus: () => void
}
