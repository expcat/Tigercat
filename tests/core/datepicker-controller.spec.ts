/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  coerceDatePickerRange,
  coerceDatePickerSingle,
  acceptDatePickerCandidate,
  commitDatePickerDay,
  commitDatePickerToday,
  confirmDatePicker,
  emptyDatePickerValue,
  formatDatePickerDisplay,
  parseTypedDatePickerValue,
  resolveDatePickerDisabled,
  resolveTypedDatePickerCommit
} from '@expcat/tigercat-core'

describe('datepicker controller', () => {
  it('coerces a UTC-midnight Date to the same calendar day', () => {
    expect(coerceDatePickerSingle(new Date('2024-01-15'))).toEqual(new Date(2024, 0, 15))
    expect(coerceDatePickerSingle('2024-01-15')).toEqual(new Date(2024, 0, 15))
  })

  it('warns and empties a non-tuple in range mode', () => {
    expect(coerceDatePickerRange('2024-01-15')).toBeNull()
    expect(coerceDatePickerRange(null)).toBeNull()
    expect(coerceDatePickerRange([null, null])).toBeNull()
    expect(coerceDatePickerRange(['2024-01-01', '2024-01-10'])).toEqual([
      new Date(2024, 0, 1),
      new Date(2024, 0, 10)
    ])
  })

  it('commits a single day and closes', () => {
    const picked = new Date(2024, 5, 20)
    const result = commitDatePickerDay({
      range: false,
      picked,
      committed: null,
      preview: null
    })
    expect(result.close).toBe(true)
    expect(result.nextCommitted).toEqual(picked)
  })

  it('uses one two-step range reducer', () => {
    const start = new Date(2024, 5, 10)
    const end = new Date(2024, 5, 20)
    const first = commitDatePickerDay({
      range: true,
      picked: start,
      committed: null,
      preview: null
    })
    expect(first.nextPreview).toEqual([start, null])
    expect(first.close).toBe(false)

    const second = commitDatePickerDay({
      range: true,
      picked: end,
      committed: first.nextCommitted,
      preview: first.nextPreview
    })
    expect(second.nextCommitted).toEqual([start, end])
    expect(second.nextPreview).toBeNull()
    expect(second.close).toBe(false)
  })

  it('sets both range ends to today', () => {
    const today = new Date(2024, 5, 15)
    expect(commitDatePickerToday(true, today)).toEqual({
      nextCommitted: [today, today],
      close: false
    })
  })

  it('does not treat an earlier range end as disabled', () => {
    const start = new Date(2024, 5, 10)
    expect(resolveDatePickerDisabled(new Date(2024, 5, 9), {})).toBe(false)
    expect(resolveDatePickerDisabled(new Date(2024, 5, 11), { minDate: start })).toBe(false)
    expect(resolveDatePickerDisabled(new Date(2024, 5, 9), { minDate: start })).toBe(true)
  })

  it('swaps a range whose end is before the start', () => {
    const accepted = acceptDatePickerCandidate(true, [
      new Date(2024, 0, 10),
      new Date(2024, 0, 1)
    ])
    expect(accepted).toEqual({
      ok: true,
      value: [new Date(2024, 0, 1), new Date(2024, 0, 10)]
    })
    const typed = resolveTypedDatePickerCommit(
      '2024-01-10 - 2024-01-01',
      'yyyy-MM-dd',
      true,
      undefined
    )
    expect(typed).toEqual({
      ok: true,
      value: [new Date(2024, 0, 1), new Date(2024, 0, 10)]
    })
  })

  it('rejects a typed disabled day without a value', () => {
    const result = resolveTypedDatePickerCommit('2024-01-15', 'yyyy-MM-dd', false, undefined, {
      disabledDate: (date) => date.getDate() === 15
    })
    expect(result).toEqual({ ok: false, reason: 'That date is not available.' })
  })

  it('keeps an incomplete range open and names the missing end', () => {
    const start = new Date(2024, 5, 10)
    const result = confirmDatePicker({
      preview: [start, null],
      committed: null
    })
    expect(result.close).toBe(false)
    expect(result.error).toBe('Choose an end date.')
    expect(result.nextPreview).toEqual([start, null])
    expect(result.nextCommitted).toBeNull()
  })

  it('treats committed range empty as null', () => {
    expect(emptyDatePickerValue(true)).toBeNull()
    expect(emptyDatePickerValue(false)).toBeNull()
    expect(parseTypedDatePickerValue('', 'yyyy-MM-dd', true)).toBeNull()
  })

  it('parses and formats the active format, including a typed range', () => {
    expect(parseTypedDatePickerValue('15/01/2024', 'dd/MM/yyyy', false)).toEqual(
      new Date(2024, 0, 15)
    )
    expect(parseTypedDatePickerValue('01/15/2024', 'dd/MM/yyyy', false)).toBeNull()
    expect(formatDatePickerDisplay(false, new Date(2024, 0, 15), 'MM/dd/yyyy')).toBe('01/15/2024')
    expect(parseTypedDatePickerValue('2024-01-01 - 2024-01-10', 'yyyy-MM-dd', true)).toEqual([
      new Date(2024, 0, 1),
      new Date(2024, 0, 10)
    ])
  })
})
