import { describe, expect, it } from 'vitest'
import { resolveAutoCompleteDisplayValue } from '@expcat/tigercat-core'

const options = [
  { label: '北京 Beijing', value: 'beijing' },
  { label: 'Apple', value: 'apple' },
  { label: 'Zero', value: 0 }
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
