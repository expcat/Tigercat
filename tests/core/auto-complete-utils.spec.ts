import { describe, expect, it } from 'vitest'
import {
  defaultAutoCompleteFilter,
  filterAutoCompleteOptions,
  findAutoCompleteOption,
  getAutoCompleteOptionKey,
  resolveAutoCompleteBlurCommit,
  resolveAutoCompleteDisplayValue,
  resolveAutoCompleteInitialQuery,
  shouldShowAutoCompleteClear
} from '@expcat/tigercat-core'

const options = [
  { label: '北京 Beijing', value: 'beijing' },
  { label: 'Apple', value: 'apple' },
  { label: 'Zero', value: 0 },
  { label: 'Banana', value: 'banana', disabled: true }
]

describe('resolveAutoCompleteDisplayValue', () => {
  it('returns matching option.label', () => {
    expect(resolveAutoCompleteDisplayValue('beijing', options)).toBe('北京 Beijing')
    expect(resolveAutoCompleteDisplayValue('apple', options)).toBe('Apple')
  })

  it('returns String(value) when unmatched, including empty string', () => {
    expect(resolveAutoCompleteDisplayValue('free text', options)).toBe('free text')
    expect(resolveAutoCompleteDisplayValue('', options)).toBe('')
  })

  it('uses fallback for nullish values', () => {
    expect(resolveAutoCompleteDisplayValue(undefined, options, 'fallback')).toBe('fallback')
    expect(resolveAutoCompleteDisplayValue(null, options)).toBe('')
  })

  it('does not treat numeric 0 as empty', () => {
    expect(resolveAutoCompleteDisplayValue(0, options)).toBe('Zero')
    expect(resolveAutoCompleteDisplayValue(0, [])).toBe('0')
  })
})

describe('filterAutoCompleteOptions', () => {
  it('matches label case-insensitively by default', () => {
    expect(filterAutoCompleteOptions(options, 'APP').map((item) => item.value)).toEqual(['apple'])
  })

  it('matches option.value as well as label', () => {
    expect(filterAutoCompleteOptions(options, 'beijing').map((item) => item.label)).toEqual([
      '北京 Beijing'
    ])
  })

  it('returns all options when the query is empty', () => {
    expect(filterAutoCompleteOptions(options, '')).toEqual(options)
  })

  it('skips local filtering when filterOption is false', () => {
    expect(filterAutoCompleteOptions(options, 'zzz', false)).toEqual(options)
  })

  it('uses a custom predicate', () => {
    const startsWith = (query: string, option: { label: string }) => option.label.startsWith(query)
    expect(filterAutoCompleteOptions(options, 'A', startsWith).map((item) => item.label)).toEqual([
      'Apple'
    ])
  })
})

describe('defaultAutoCompleteFilter', () => {
  it('is case-insensitive on label', () => {
    expect(defaultAutoCompleteFilter('app', options[1])).toBe(true)
    expect(defaultAutoCompleteFilter('zzz', options[1])).toBe(false)
  })
})

describe('findAutoCompleteOption', () => {
  it('matches label or value case-insensitively and skips disabled', () => {
    expect(findAutoCompleteOption(options, 'APPLE')?.value).toBe('apple')
    expect(findAutoCompleteOption(options, 'BeiJing')?.value).toBe('beijing')
    expect(findAutoCompleteOption(options, 'banana')).toBeUndefined()
  })
})

describe('resolveAutoCompleteBlurCommit', () => {
  it('commits a matching option and rewrites the query to its label', () => {
    const result = resolveAutoCompleteBlurCommit({
      query: 'apple',
      committed: undefined,
      optionList: options,
      allowFreeInput: true
    })
    expect(result).toEqual({
      value: 'apple',
      query: 'Apple',
      option: options[1],
      didCommit: true
    })
  })

  it('commits free text when allowFreeInput is true', () => {
    const result = resolveAutoCompleteBlurCommit({
      query: 'kiwi',
      committed: 'apple',
      optionList: options,
      allowFreeInput: true
    })
    expect(result).toEqual({ value: 'kiwi', query: 'kiwi', didCommit: true })
  })

  it('reverts unmatched query when allowFreeInput is false', () => {
    const result = resolveAutoCompleteBlurCommit({
      query: 'kiwi',
      committed: 'apple',
      optionList: options,
      allowFreeInput: false
    })
    expect(result).toEqual({ value: 'apple', query: 'Apple', didCommit: false })
  })

  it('clears the committed value when the query is emptied', () => {
    const result = resolveAutoCompleteBlurCommit({
      query: '',
      committed: 'apple',
      optionList: options,
      allowFreeInput: true
    })
    expect(result).toEqual({ value: undefined, query: '', didCommit: true })
  })
})

describe('resolveAutoCompleteInitialQuery', () => {
  it('uses defaultSearchValue only when unselected', () => {
    expect(
      resolveAutoCompleteInitialQuery({
        defaultSearchValue: 'q',
        optionList: options
      })
    ).toBe('q')
    expect(
      resolveAutoCompleteInitialQuery({
        committed: 'apple',
        defaultSearchValue: 'q',
        optionList: options
      })
    ).toBe('Apple')
  })
})

describe('getAutoCompleteOptionKey', () => {
  it('prefers option.id and otherwise uses index + value', () => {
    expect(getAutoCompleteOptionKey({ label: 'A', value: 'a', id: 'custom' }, 0)).toBe('custom')
    expect(getAutoCompleteOptionKey({ label: 'A', value: 'a' }, 2)).toBe('2-a')
  })
})

describe('shouldShowAutoCompleteClear', () => {
  it('shows when the query or a committed value is present', () => {
    expect(shouldShowAutoCompleteClear({ clearable: true, query: 'x' })).toBe(true)
    expect(shouldShowAutoCompleteClear({ clearable: true, committed: '' })).toBe(true)
    expect(shouldShowAutoCompleteClear({ clearable: true, query: '' })).toBe(false)
    expect(shouldShowAutoCompleteClear({ clearable: true, disabled: true, query: 'x' })).toBe(false)
  })
})
