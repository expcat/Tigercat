import { describe, expect, it } from 'vitest'
import {
  applyCronFieldMode,
  buildCronFieldValue,
  buildCronFieldValueFromDraft,
  cronFieldMetas,
  defaultCronExpression,
  defaultCronPresetValues,
  getCronExpressionParts,
  getCronFieldIssue,
  getCronFieldValue,
  isCronExpressionEmpty,
  normalizeCronExpression,
  parseCronFieldControl,
  seedCronFieldDraft,
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

  it('keeps empty distinct from every-minute', () => {
    expect(defaultCronExpression).toBe('* * * * *')
    expect(defaultCronPresetValues).toContain('0 0 * * *')
    expect(normalizeCronExpression('')).toBe('')
    expect(isCronExpressionEmpty('')).toBe(true)
    expect(isCronExpressionEmpty('* * * * *')).toBe(false)
  })

  it('splits expressions without inventing five stars', () => {
    expect(getCronExpressionParts(' 0  12 * * 1 ')).toEqual(['0', '12', '*', '*', '1'])
    expect(getCronFieldValue('0 0 0 * * *', 'minute')).toBeUndefined()
    expect(updateCronExpressionField('0 0 0 * * *', 'minute', '15')).toBeNull()
    expect(updateCronExpressionField('bad', 'hour', '6')).toBeNull()
  })

  it('updates a field only when the expression already has five parts', () => {
    expect(getCronFieldValue('0 12 * * 1', 'hour')).toBe('12')
    expect(updateCronExpressionField('0 12 * * 1', 'minute', '15')).toBe('15 12 * * 1')
  })

  it('parses common field controls', () => {
    expect(parseCronFieldControl('*')).toEqual({ mode: 'any', raw: '*' })
    expect(parseCronFieldControl('*/5')).toEqual({ mode: 'every', step: 5, raw: '*/5' })
    expect(parseCronFieldControl('12')).toEqual({ mode: 'specific', value: 12, raw: '12' })
    expect(parseCronFieldControl('2-6')).toEqual({ mode: 'range', start: 2, end: 6, raw: '2-6' })
    expect(parseCronFieldControl('1,2,3')).toEqual({ mode: 'custom', raw: '1,2,3' })
  })

  it('keeps custom mode when switching from any', () => {
    const draft = applyCronFieldMode(seedCronFieldDraft('*'), 'custom', minuteMeta)
    expect(draft.mode).toBe('custom')
    expect(draft.raw).toBe('*')
    expect(buildCronFieldValueFromDraft(draft, minuteMeta)).toBe('*')
  })

  it('does not clamp or reverse ranges when building visual values', () => {
    expect(buildCronFieldValue({ mode: 'every', step: 70, raw: '*/70' }, minuteMeta)).toBe('*/70')
    expect(buildCronFieldValue({ mode: 'specific', value: 99, raw: '99' }, hourMeta)).toBe('99')
    expect(buildCronFieldValue({ mode: 'range', start: 12, end: 1, raw: '12-1' }, hourMeta)).toBe(
      '12-1'
    )
  })

  it('validates common cron expressions', () => {
    expect(validateCronExpression('* * * * *').valid).toBe(true)
    expect(validateCronExpression('*/5 9-17 * * 1-5').valid).toBe(true)
    expect(validateCronExpression('').valid).toBe(true)
  })

  it('rejects expressions with the wrong number of fields without rewriting them', () => {
    const result = validateCronExpression('0 0 0 * * *')

    expect(result.valid).toBe(false)
    expect(result.issues[0]).toMatchObject({ field: 'expression' })
  })

  it('rejects out of range values instead of clamping them', () => {
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

  it('rejects unsupported weekday names', () => {
    expect(validateCronField('MON', cronFieldMetas[4])).toMatch(/Weekday/)
  })

  it('finds field issues', () => {
    const result = validateCronExpression('60 * * * *')

    expect(getCronFieldIssue(result, 'minute')?.message).toMatch(/0 and 59/)
    expect(getCronFieldIssue(result, 'hour')).toBeUndefined()
  })
})
