import { describe, expect, it } from 'vitest'
import {
  buildCronFieldValue,
  cronFieldMetas,
  defaultCronExpression,
  defaultCronPresets,
  getCronEditorControlClasses,
  getCronExpressionParts,
  getCronFieldIssue,
  getCronFieldValue,
  normalizeCronExpression,
  parseCronFieldControl,
  updateCronExpressionField,
  validateCronExpression,
  validateCronField
} from '@expcat/tigercat-core'

const minuteMeta = cronFieldMetas[0]
const hourMeta = cronFieldMetas[1]

describe('cron-editor-utils', () => {
  it('defines five cron fields', () => {
    expect(cronFieldMetas.map((field) => field.key)).toEqual([
      'minute',
      'hour',
      'dayOfMonth',
      'month',
      'dayOfWeek'
    ])
  })

  it('provides default expression and presets', () => {
    expect(defaultCronExpression).toBe('* * * * *')
    expect(defaultCronPresets.map((preset) => preset.value)).toContain('0 0 * * *')
  })

  it('splits and normalizes expressions', () => {
    expect(getCronExpressionParts(' 0  12 * * 1 ')).toEqual(['0', '12', '*', '*', '1'])
    expect(normalizeCronExpression('')).toBe(defaultCronExpression)
    expect(normalizeCronExpression('0 12 * * 1')).toBe('0 12 * * 1')
  })

  it('reads and updates a field safely', () => {
    expect(getCronFieldValue('0 12 * * 1', 'hour')).toBe('12')
    expect(updateCronExpressionField('0 12 * * 1', 'minute', '15')).toBe('15 12 * * 1')
  })

  it('falls back to default expression before updating malformed expressions', () => {
    expect(updateCronExpressionField('bad', 'hour', '6')).toBe('* 6 * * *')
  })

  it('parses common field controls', () => {
    expect(parseCronFieldControl('*')).toEqual({ mode: 'any', raw: '*' })
    expect(parseCronFieldControl('*/5')).toEqual({ mode: 'every', step: 5, raw: '*/5' })
    expect(parseCronFieldControl('12')).toEqual({ mode: 'specific', value: 12, raw: '12' })
    expect(parseCronFieldControl('2-6')).toEqual({ mode: 'range', start: 2, end: 6, raw: '2-6' })
    expect(parseCronFieldControl('1,2,3')).toEqual({ mode: 'custom', raw: '1,2,3' })
  })

  it('builds field values from visual controls', () => {
    expect(buildCronFieldValue({ mode: 'any', raw: '*' }, minuteMeta)).toBe('*')
    expect(buildCronFieldValue({ mode: 'every', step: 70, raw: '*/70' }, minuteMeta)).toBe('*/59')
    expect(buildCronFieldValue({ mode: 'specific', value: -1, raw: '-1' }, hourMeta)).toBe('0')
    expect(buildCronFieldValue({ mode: 'range', start: 18, end: 6, raw: '18-6' }, hourMeta)).toBe(
      '6-18'
    )
    expect(buildCronFieldValue({ mode: 'custom', raw: '1,2,3' }, minuteMeta)).toBe('1,2,3')
  })

  it('validates common cron expressions', () => {
    expect(validateCronExpression('* * * * *').valid).toBe(true)
    expect(validateCronExpression('*/5 9-17 * * 1-5').valid).toBe(true)
    expect(validateCronExpression('0,15,30,45 8 * * 1').valid).toBe(true)
  })

  it('rejects expressions with the wrong number of fields', () => {
    const result = validateCronExpression('* * *')

    expect(result.valid).toBe(false)
    expect(result.issues[0]).toMatchObject({ field: 'expression' })
  })

  it('rejects out of range values', () => {
    const result = validateCronExpression('60 24 32 13 8')

    expect(result.valid).toBe(false)
    expect(result.issues.map((issue) => issue.field)).toEqual([
      'minute',
      'hour',
      'dayOfMonth',
      'month',
      'dayOfWeek'
    ])
  })

  it('rejects reversed ranges', () => {
    expect(validateCronField('10-5', minuteMeta)).toBe(
      'Minute range start must be less than or equal to end'
    )
  })

  it('rejects invalid steps', () => {
    expect(validateCronField('*/0', minuteMeta)).toBe('Minute step must be between 1 and 59')
    expect(validateCronField('*/x', minuteMeta)).toBe('Minute step must be between 1 and 59')
  })

  it('rejects unsupported field text', () => {
    expect(validateCronField('MON', cronFieldMetas[4])).toBe(
      'Weekday must be *, a number, a range, a step, or a comma list'
    )
  })

  it('finds field issues', () => {
    const result = validateCronExpression('60 * * * *')

    expect(getCronFieldIssue(result, 'minute')?.message).toBe('Minute must be between 0 and 59')
    expect(getCronFieldIssue(result, 'hour')).toBeUndefined()
  })

  it('returns style classes for sizes and invalid state', () => {
    expect(getCronEditorControlClasses('sm')).toContain('h-8')
    expect(getCronEditorControlClasses('lg', true)).toContain(
      'border-[var(--tiger-danger,#dc2626)]'
    )
  })
})
