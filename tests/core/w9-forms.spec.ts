import { describe, expect, it } from 'vitest'
import {
  addDecimalString,
  addTags,
  collapsedTagSummary,
  commitSelectOption,
  createFormEngine,
  deleteMentionBeforeCaret,
  describeCronExpression,
  filesFromDirectoryList,
  filterCheckedPaths,
  formErrorSummary,
  formatCalendarUnit,
  getValueByPath,
  highlightMatchFragments,
  insertFieldArrayItem,
  insertTextAtCaret,
  moveTag,
  moveTransferOneWay,
  nextCronRun,
  normalizeSelectOptions,
  parseCalendarUnit,
  parseInputNumberModel,
  pressureLineWidth,
  removeFieldArrayItem,
  resolveSelectTags,
  selectAllSelectValues,
  shiftFieldArrayErrors,
  shuffleInPlace,
  signatureInkBounds,
  signatureRedo,
  signatureUndo,
  snapTimeColumnScroll,
  sliderPushApartRange
} from '@expcat/tigercat-core'

describe('W9 form core', () => {
  it('selects filtered options up to max and summarizes omitted names', () => {
    const options = [
      { label: 'Ada', value: 'a' },
      { label: 'Bea', value: 'b', disabled: true },
      { label: 'Cam', value: 'c' }
    ]
    expect(selectAllSelectValues({ value: ['a'], options, maxCount: 2 })).toEqual(['a', 'c'])
    expect(
      commitSelectOption({ option: options[2], value: ['a'], multiple: true, maxCount: 1 })
    ).toEqual(['a'])
    const tags = resolveSelectTags({
      value: ['a', 'c'],
      options,
      maxTagCount: 1
    })
    expect(tags.collapsedItems.map((item) => item.label)).toEqual(['Cam'])
    expect(collapsedTagSummary(tags.collapsedItems)).toBe('Cam')
    expect(
      normalizeSelectOptions([{ name: 'Ada', id: 'a', note: 'Pilot' }], {
        label: 'name',
        value: 'id',
        description: 'note'
      })
    ).toEqual([{ label: 'Ada', value: 'a', description: 'Pilot' }])
  })

  it('keeps field-array paths stable across insert and remove', () => {
    const inserted = insertFieldArrayItem({ rows: [{ name: 'a' }, { name: 'c' }] }, 'rows', 1, {
      name: 'b'
    })
    expect(getValueByPath(inserted, 'rows[1].name')).toBe('b')
    expect(getValueByPath(inserted, 'rows[2].name')).toBe('c')
    const removed = removeFieldArrayItem(inserted, 'rows', 0)
    expect(getValueByPath(removed, 'rows[0].name')).toBe('b')
    expect(
      shiftFieldArrayErrors(
        [{ field: 'rows[2].name', message: 'bad' }],
        'rows',
        0,
        'remove'
      )[0].field
    ).toBe('rows[1].name')
    const engine = createFormEngine({ initialValues: { rows: [{ name: 'a' }] } })
    engine.insertFieldArrayItem('rows', 1, { name: 'b' })
    expect(engine.getFieldValue('rows[1].name')).toBe('b')
    engine.removeFieldArrayItem('rows', 0)
    expect(engine.getFieldValue('rows[0].name')).toBe('b')
  })

  it('stores unsafe integers as strings and steps them as strings', () => {
    expect(parseInputNumberModel('12')).toBe(12)
    expect(parseInputNumberModel('9007199254740993')).toBe('9007199254740993')
    expect(addDecimalString('9007199254740993', 1)).toBe('9007199254740994')
  })

  it('pushes slider thumbs apart and snaps time columns', () => {
    expect(sliderPushApartRange([2, 2], 2, 'min', 0, 10, 1)).toEqual([2, 3])
    expect(snapTimeColumnScroll(33, 20)).toBe(40)
  })

  it('reorders tags and records why a tag was rejected', () => {
    expect(moveTag(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'c', 'a'])
    expect(addTags(['a'], ['a', 'b'], { max: 2 }).rejections).toEqual([
      { tag: 'a', reason: 'duplicate' }
    ])
  })

  it('formats calendar units and cron next run without month names', () => {
    const date = new Date(2024, 0, 15, 8, 30)
    expect(formatCalendarUnit(date, 'month')).toBe('2024-01')
    expect(formatCalendarUnit(date, 'quarter')).toBe('2024-Q1')
    expect(formatCalendarUnit(date, 'year')).toBe('2024')
    expect(parseCalendarUnit('2024-W03', 'week')).toBeInstanceOf(Date)
    const sentence = describeCronExpression('0 0 * * 1')
    expect(sentence).toContain('minute 0')
    expect(sentence).not.toMatch(/January|JAN/)
    const next = nextCronRun('0 0 * * *', new Date(2024, 0, 15, 8, 30))
    expect(next?.getHours()).toBe(0)
    expect(next && next > new Date(2024, 0, 15, 8, 30)).toBe(true)
  })

  it('covers transfer, mentions, keyboard, upload, signature, and error summary helpers', () => {
    expect(highlightMatchFragments('Alpha beta', 'be')).toEqual([
      { text: 'Alpha ', match: false },
      { text: 'be', match: true },
      { text: 'ta', match: false }
    ])
    expect(insertTextAtCaret('12', '3', 1).value).toBe('132')
    expect(shuffleInPlace([1, 2, 3], () => 0)).toEqual([2, 3, 1])
    const mention = deleteMentionBeforeCaret('hi @ada ', 7)
    expect(mention.deleted).toBe(true)
    expect(mention.value).toBe('hi  ')
    expect(
      moveTransferOneWay('left', 'right', ['a'], ['a'], [{ key: 'a', label: 'A' }]).movedKeys
    ).toEqual([])
    expect(filterCheckedPaths([['a'], ['a', 'b']], 'child')).toEqual([['a', 'b']])
    const directory = new File([], 'directory')
    const real = new File(['x'], 'a.txt', { type: 'text/plain' })
    expect(filesFromDirectoryList([directory, real])).toEqual([real])
    expect(pressureLineWidth(2, 1)).toBeGreaterThan(pressureLineWidth(2, 0))
    const bounds = signatureInkBounds([{ points: [{ x: 2, y: 3 }, { x: 6, y: 8 }], color: '#000', lineWidth: 1 }])
    expect(bounds?.width).toBe(4)
    const redone = signatureRedo(signatureUndo({ past: [1], present: 2, future: [] }))
    expect(redone.present).toBe(2)
    expect(formErrorSummary([{ field: 'name', message: 'Required' }, { field: 'name', message: 'Again' }])).toEqual([
      { field: 'name', message: 'Required' }
    ])
  })
})
