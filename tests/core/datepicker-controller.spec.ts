/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  coerceDatePickerRange,
  coerceDatePickerSingle,
  commitDatePickerDay,
  commitDatePickerToday,
  formatDatePickerDisplay,
  parseTypedDatePickerValue,
  resolveDatePickerDisabled
} from '@expcat/tigercat-core'

describe('datepicker controller', () => {
  it('coerces a UTC-midnight Date to the same calendar day', () => {
    expect(coerceDatePickerSingle(new Date('2024-01-15'))).toEqual(new Date(2024, 0, 15))
    expect(coerceDatePickerSingle('2024-01-15')).toEqual(new Date(2024, 0, 15))
  })

  it('warns and empties a non-tuple in range mode', () => {
    expect(coerceDatePickerRange('2024-01-15')).toEqual([null, null])
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
      committed: [null, null],
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

  it('disables dates before the in-progress range start', () => {
    const start = new Date(2024, 5, 10)
    expect(
      resolveDatePickerDisabled(new Date(2024, 5, 9), {
        rangeStart: start,
        rangeSelectingEnd: true
      })
    ).toBe(true)
    expect(
      resolveDatePickerDisabled(new Date(2024, 5, 11), {
        rangeStart: start,
        rangeSelectingEnd: true
      })
    ).toBe(false)
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
