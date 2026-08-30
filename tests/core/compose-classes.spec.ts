import { describe, expect, it } from 'vitest'
import { composeComponentClasses } from '@expcat/tigercat-core'

describe('composeComponentClasses', () => {
  it('joins string fragments and the consumer className', () => {
    expect(composeComponentClasses('base', 'size-md', 'className-from-prop')).toBe(
      'base size-md className-from-prop'
    )
  })

  it('merges a Vue class object and array with className', () => {
    expect(
      composeComponentClasses('root', { active: true, disabled: false }, ['array-a', 'array-b'], 'extra')
    ).toBe('root active array-a array-b extra')
  })

  it('drops falsy fragments including 0 and empty string', () => {
    expect(composeComponentClasses('keep', null, undefined, false, 0, '', 'tail')).toBe('keep tail')
  })
})
