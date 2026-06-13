import { describe, it, expect } from 'vitest'
import { getFormItemLabelClasses } from '@expcat/tigercat-core'

describe('getFormItemLabelClasses labelAlign defaults', () => {
  it('defaults horizontal labels to right alignment', () => {
    expect(getFormItemLabelClasses({ labelPosition: 'right' })).toContain('text-right')
    expect(getFormItemLabelClasses({})).toContain('text-right')
  })

  it('defaults top labels to left alignment', () => {
    const cls = getFormItemLabelClasses({ labelPosition: 'top' })
    expect(cls).toContain('text-left')
    expect(cls).not.toContain('text-right')
  })

  it('honours an explicit labelAlign over the position-based default', () => {
    expect(getFormItemLabelClasses({ labelPosition: 'top', labelAlign: 'right' })).toContain(
      'text-right'
    )
  })
})
