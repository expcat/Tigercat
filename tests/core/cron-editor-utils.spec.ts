import { describe, expect, it } from 'vitest'
import {
  applyCronFieldMode,
  buildCronFieldValue,
  buildCronFieldValueFromDraft,
  cronFieldMetas,
  cronFormValue,
  defaultCronExpression,
  defaultCronPresetValues,
  describeCronExpression,
  getCronExpressionParts,
  getCronFieldIssue,
  getCronFieldValue,
  isCronExpressionEmpty,
  normalizeCronExpression,
  nextCronRun,
  parseCronSchedule,
  parseCronFieldControl,
  seedCronFieldDraft,
  seedCronFieldDrafts,
  updateCronExpressionField,
  validateCronExpression,
  validateCronField
} from '@expcat/tigercat-core'

import { zhCN } from '@expcat/tigercat-core/locales/zh-CN'

const minuteMeta = cronFieldMetas[0]
const hourMeta = cronFieldMetas[1]

describe('cron-editor-utils', () => {
  it('describes Chinese any, specific, range and step fields without expanding ranges', () => {
    expect(describeCronExpression('* * * * *', zhCN)).toBe('执行时间：每分钟，每小时，每天，每月。')
    expect(describeCronExpression('15 * * * *', zhCN)).toContain('分钟：15')
    expect(describeCronExpression('0-59 * * * *', zhCN)).toContain('分钟：0–59')
    expect(describeCronExpression('*/5 * * * *', zhCN)).toContain('分钟：每隔 5')
    expect(describeCronExpression('1-9/2 3 * * 1,5', zhCN)).toContain('分钟：1–9，每隔 2')
    expect(describeCronExpression('0 0 1 * 1', zhCN)).toContain('日期：1 或 星期：1')
  })

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
    expect(isCronExpressionEmpty(null)).toBe(true)
    expect(isCronExpressionEmpty(undefined)).toBe(true)
    expect(isCronExpressionEmpty('* * * * *')).toBe(false)
    expect(cronFormValue('')).toBeNull()
    expect(cronFormValue('*/0')).toBeNull()
    expect(cronFormValue('foo')).toBeNull()
    expect(cronFormValue('0 0 * * *')).toBe('0 0 * * *')
    expect(seedCronFieldDrafts('').minute.raw).toBe('')
    expect(seedCronFieldDrafts('').minute.raw).not.toBe('*')
    expect(seedCronFieldDraft(undefined).raw).toBe('')
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

  it('expands numeric steps consistently with summaries and next runs', () => {
    const expression = '5/2 * * * *'

    expect(validateCronExpression(expression).valid).toBe(true)
    expect([...parseCronSchedule(expression)!.minute]).toEqual([
      5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39, 41, 43, 45, 47, 49, 51,
      53, 55, 57, 59
    ])
    expect(describeCronExpression(expression, zhCN)).toContain('分钟：5–59，每隔 2')
    expect(nextCronRun(expression, new Date(2026, 10, 15, 9, 5))).toEqual(
      new Date(2026, 10, 15, 9, 7)
    )
    expect(nextCronRun(expression, new Date(2026, 10, 15, 9, 59))).toEqual(
      new Date(2026, 10, 15, 10, 5)
    )
    expect([...parseCronSchedule('5 * * * *')!.minute]).toEqual([5])
  })

  it('treats blank expressions as valid forms but unparseable schedules', () => {
    expect(validateCronExpression('   ').valid).toBe(true)
    for (const expression of ['', '   ']) {
      expect(parseCronSchedule(expression)).toBeNull()
      expect(nextCronRun(expression)).toBeNull()
      expect(describeCronExpression(expression)).toBeNull()
    }
  })

  it('finds the next leap day beyond a two-year window', () => {
    expect(nextCronRun('0 0 29 2 *', new Date(2024, 2, 1))).toEqual(new Date(2028, 1, 29))
    expect(nextCronRun('0 0 29 2 *', new Date(2096, 2, 1))).toEqual(new Date(2104, 1, 29))
  })

  it('rejects expressions with the wrong number of fields without rewriting them', () => {
    const result = validateCronExpression('0 0 0 * * *')

    expect(result.valid).toBe(false)
    expect(result.issues.map((issue) => issue.field)).toEqual(['expression'])
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
