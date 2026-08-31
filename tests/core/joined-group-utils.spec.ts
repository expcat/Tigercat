import { describe, expect, it } from 'vitest'
import {
  getButtonGroupClasses,
  getInputGroupClasses,
  getJoinedGroupItemClasses
} from '@expcat/tigercat-core'

describe('getJoinedGroupItemClasses', () => {
  it('does not shave a lone child', () => {
    const classes = getJoinedGroupItemClasses({ child: 'button' })
    expect(classes).toContain(':first-child:not(:last-child)')
    expect(classes).toContain(':last-child:not(:first-child)')
    expect(classes).not.toContain('[&>button:first-child]:!rounded-e-none')
    expect(classes).not.toContain('[&>button:last-child]:!rounded-s-none')
  })

  it('uses logical inline rounding so RTL keeps the outer corners', () => {
    const classes = getJoinedGroupItemClasses({ child: 'button' })
    expect(classes).toContain('rounded-e-none')
    expect(classes).toContain('rounded-s-none')
    expect(classes).toContain('-ms-px')
    expect(classes).not.toContain('rounded-r-none')
    expect(classes).not.toContain('rounded-l-none')
    expect(classes).not.toContain('-ml-px')
  })

  it('targets button roots, not arbitrary wrappers', () => {
    const classes = getJoinedGroupItemClasses({ child: 'button' })
    expect(classes).toContain('[&>button:')
    expect(classes).not.toContain('[&>*:')
  })

  it('is what ButtonGroup and InputGroup compact consume', () => {
    const buttons = getJoinedGroupItemClasses({ child: 'button' })
    expect(getButtonGroupClasses(false)).toContain(buttons)
    expect(getButtonGroupClasses(true)).toContain(
      getJoinedGroupItemClasses({ orientation: 'vertical', child: 'button' })
    )
    const compact = getInputGroupClasses(true)
    expect(compact).toContain('data-tiger-chrome')
    expect(compact).toContain('focus-within')
    expect(compact).toContain(':first-child:not(:last-child)')
    expect(compact).toContain('rounded-e-none')
  })
})
