import { describe, it, expect } from 'vitest'
import {
  getFieldMessageClasses,
  getFormItemErrorBlockClasses,
  getFormItemErrorClasses,
  getFormItemLabelClasses,
  getInputErrorClasses
} from '@expcat/tigercat-core'

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

describe('field error tip', () => {
  it('uses spacing, type, and error color tokens under the control', () => {
    const cls = getFormItemErrorClasses('md', { visible: true })
    expect(cls).toContain('tiger-form-item__error')
    expect(cls).toContain('--tiger-spacing-md')
    expect(cls).toContain('--tiger-font-size-sm')
    expect(cls).toContain('--tiger-line-height-normal')
    expect(cls).toContain('--tiger-font-weight-normal')
    expect(cls).toContain('--tiger-error')
    expect(cls).not.toContain('mt-1')
    expect(cls).not.toContain('min-h-')
  })

  it('steps type with the control size and shares that scale with standalone fields', () => {
    expect(getFieldMessageClasses('sm')).toContain('--tiger-primitive-font-size-xs')
    expect(getFieldMessageClasses('lg')).toContain('--tiger-font-size-base')
    expect(getInputErrorClasses('lg')).toBe(getFieldMessageClasses('lg', 'error'))
  })

  it('paints the block tip with the error wash token', () => {
    const cls = getFormItemErrorBlockClasses()
    expect(cls).toContain('--tiger-error-bg-hover')
    expect(cls).not.toContain('--tiger-error-bg]')
    expect(cls).toContain('--tiger-spacing-md')
  })

  it('uses the secondary text token for helper copy', () => {
    const cls = getFieldMessageClasses('md', 'hint')
    expect(cls).toContain('--tiger-text-secondary')
    expect(cls).not.toContain('--tiger-error')
  })
})
