import { describe, it, expect } from 'vitest'
import { getFormItemLabelClasses } from '@expcat/tigercat-core'

describe('getFormItemLabelClasses labelAlign defaults', () => {
  it('defaults horizontal labels to right alignment', () => {
    expect(getFormItemLabelClasses({ labelPosition: 'right' })).toContain('text-end')
    expect(getFormItemLabelClasses({})).toContain('text-end')
  })

  it('defaults top labels to start alignment', () => {
    const cls = getFormItemLabelClasses({ labelPosition: 'top' })
    expect(cls).toContain('text-start')
    expect(cls).not.toContain('text-end')
  })

  it('honours an explicit labelAlign over the position-based default', () => {
    expect(getFormItemLabelClasses({ labelPosition: 'top', labelAlign: 'right' })).toContain(
      'text-end'
    )
  })
})
