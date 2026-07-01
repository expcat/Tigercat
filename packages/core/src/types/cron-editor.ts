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

export interface CronEditorProps {
  disabled?: boolean
  readonly?: boolean
  size?: CronEditorSize
  presets?: CronPreset[]
  ariaLabel?: string
  className?: string
}
