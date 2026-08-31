import { describe, expect, it } from 'vitest'
import {
  getChoiceGroupClasses,
  getRadioGroupKeyboardNextIndex,
  resolveRadioInputName
} from '@expcat/tigercat-core'

describe('radio group helpers', () => {
  it('merges user class with default vertical layout', () => {
    const classes = getChoiceGroupClasses({ className: 'flex' })
    expect(classes.split(/\s+/)).toEqual(expect.arrayContaining(['flex', 'flex-col', 'gap-2']))
  })

  it('switches to horizontal layout without dropping user class', () => {
    const classes = getChoiceGroupClasses({ direction: 'horizontal', className: 'mt-4' })
    expect(classes.split(/\s+/)).toEqual(
      expect.arrayContaining(['flex', 'flex-row', 'flex-wrap', 'gap-2', 'mt-4'])
    )
  })

  it('moves with arrows, Home, and End, and flips inline keys in RTL', () => {
    expect(getRadioGroupKeyboardNextIndex('ArrowDown', 0, 3, false)).toBe(1)
    expect(getRadioGroupKeyboardNextIndex('ArrowRight', 0, 3, true)).toBe(2)
    expect(getRadioGroupKeyboardNextIndex('ArrowLeft', 0, 3, true)).toBe(1)
    expect(getRadioGroupKeyboardNextIndex('Home', 2, 3, false)).toBe(0)
    expect(getRadioGroupKeyboardNextIndex('End', 0, 3, false)).toBe(2)
    expect(getRadioGroupKeyboardNextIndex('Escape', 0, 3, false)).toBeNull()
  })

  it('omits a standalone radio name when none is provided', () => {
    expect(resolveRadioInputName(undefined, undefined)).toBeUndefined()
    expect(resolveRadioInputName('choice', undefined)).toBe('choice')
    expect(resolveRadioInputName(undefined, 'group')).toBe('group')
  })
})
