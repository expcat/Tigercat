/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  adjacentTimePickerColumn,
  applyTimePickerColumn,
  applyTimePickerRangeColumn,
  coerceTimePickerRange,
  coerceTimePickerSingle,
  commitTimePickerNow,
  commitTimePickerOk,
  formTimePickerValue,
  generateHours,
  isHourOptionDisabled,
  isMinuteOptionDisabled,
  parseTime,
  parseTypedTimePickerValue,
  seedTimePickerDraft,
  type TimePickerConstraints
} from '@expcat/tigercat-core'

const constraints = (overrides: Partial<TimePickerConstraints> = {}): TimePickerConstraints => ({
  hourStep: 1,
  minuteStep: 1,
  secondStep: 1,
  format: '24',
  showSeconds: false,
  ...overrides
})

describe('timepicker controller', () => {
  it('parses 24-hour values and 12-hour display strings', () => {
    expect(parseTime('14:30')).toEqual({ hours: 14, minutes: 30, seconds: 0 })
    expect(parseTime('02:30 PM')).toEqual({ hours: 14, minutes: 30, seconds: 0 })
    expect(parseTime('02:30 AM')).toEqual({ hours: 2, minutes: 30, seconds: 0 })
    expect(parseTime('14:30 PM')).toBeNull()
    expect(parseTime('02:30 下午', { periodLabels: { am: '上午', pm: '下午' } })).toEqual({
      hours: 14,
      minutes: 30,
      seconds: 0
    })
  })

  it('includes 12 in 12-hour hour lists', () => {
    expect(generateHours(1, '12')).toEqual([12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    expect(generateHours(2, '12')).toEqual([12, 2, 4, 6, 8, 10])
  })

  it('treats empty string and non-tuple range values as empty', () => {
    expect(coerceTimePickerSingle('')).toBeNull()
    expect(coerceTimePickerSingle('14:30')).toBe('14:30')
    expect(coerceTimePickerRange('10:00')).toBeNull()
    expect(coerceTimePickerRange(['10:00', '11:00'])).toEqual(['10:00', '11:00'])
    expect(coerceTimePickerRange(null)).toBeNull()
  })

  it('enables hour 9 when minTime is 09:30 because 09:30 is still legal', () => {
    const limited = constraints({ minTime: '09:30' })
    const empty = seedTimePickerDraft(null, '24')
    expect(isHourOptionDisabled(9, limited, null)).toBe(false)
    expect(isHourOptionDisabled(8, limited, null)).toBe(true)
    expect(
      isMinuteOptionDisabled(0, limited, {
        parts: { hours: 9, minutes: 0, seconds: 0 },
        period: 'AM'
      })
    ).toBe(true)
    expect(
      isMinuteOptionDisabled(30, limited, {
        parts: { hours: 9, minutes: 0, seconds: 0 },
        period: 'AM'
      })
    ).toBe(false)
    expect(empty.parts).toBeNull()
  })

  it('does not emit on column apply; OK commits the draft', () => {
    const draft = applyTimePickerColumn(
      seedTimePickerDraft(null, '24'),
      'hour',
      9,
      constraints({ minTime: '09:30' })
    )
    expect(draft.parts).toEqual({ hours: 9, minutes: 0, seconds: 0 })
    const withMinute = applyTimePickerColumn(draft, 'minute', 30, constraints({ minTime: '09:30' }))
    const committed = commitTimePickerOk({
      range: false,
      draft: withMinute,
      draftRange: null,
      constraints: constraints({ minTime: '09:30' })
    })
    expect(committed).toEqual({ nextCommitted: '09:30', close: true })
  })

  it('keeps an in-progress range out of Form until both ends exist', () => {
    const first = applyTimePickerRangeColumn({
      draftRange: null,
      activePart: 'start',
      column: 'hour',
      option: 10,
      constraints: constraints()
    })
    expect(first.nextRange).toEqual(['10:00', null])
    expect(first.nextActivePart).toBe('end')
    expect(formTimePickerValue(true, first.nextRange)).toBeNull()

    const second = applyTimePickerRangeColumn({
      draftRange: first.nextRange,
      activePart: 'end',
      column: 'hour',
      option: 11,
      constraints: constraints()
    })
    expect(second.nextRange).toEqual(['10:00', '11:00'])
    expect(formTimePickerValue(true, second.nextRange)).toEqual(['10:00', '11:00'])
  })

  it('clamps an end earlier than start to start', () => {
    const result = applyTimePickerRangeColumn({
      draftRange: ['12:00', '12:00'],
      activePart: 'end',
      column: 'hour',
      option: 9,
      constraints: constraints()
    })
    expect(result.nextRange).toEqual(['12:00', '12:00'])
  })

  it('parses typed 12-hour input using the active format', () => {
    expect(parseTypedTimePickerValue('02:30 PM', '12', false, false, { am: 'AM', pm: 'PM' })).toBe(
      '14:30'
    )
    expect(parseTypedTimePickerValue('10:00 - 11:30', '24', false, true)).toEqual([
      '10:00',
      '11:30'
    ])
  })

  it('commits Now aligned to step', () => {
    const now = new Date(2024, 5, 15, 14, 37, 20)
    const result = commitTimePickerNow(false, now, constraints({ minuteStep: 15 }))
    expect(result.nextCommitted).toBe('14:30')
    expect(result.close).toBe(true)
  })

  it('moves between columns with logical arrow keys', () => {
    const columns = ['hour', 'minute', 'second'] as const
    expect(adjacentTimePickerColumn('hour', [...columns], 'ltr', 'ArrowRight')).toBe('minute')
    expect(adjacentTimePickerColumn('minute', [...columns], 'rtl', 'ArrowRight')).toBe('hour')
    expect(adjacentTimePickerColumn('hour', [...columns], 'ltr', 'ArrowLeft')).toBeNull()
  })

  it('honors disabledTime for a whole hour', () => {
    const limited = constraints({
      disabledTime: (time) => time.startsWith('13:')
    })
    expect(isHourOptionDisabled(13, limited, null)).toBe(true)
    expect(isHourOptionDisabled(12, limited, null)).toBe(false)
  })
})
