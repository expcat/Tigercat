/**
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest'
import {
  getAutoCompleteOptionClasses,
  getCascaderOptionClasses,
  getMentionsOptionClasses,
  getPopupListOptionActiveClasses,
  getSelectOptionClasses,
  getTreeSelectNodeClasses,
  popupListOptionActiveClasses
} from '@expcat/tigercat-core'

function expectPanelClippedActive(classes: string) {
  expect(classes).toContain(popupListOptionActiveClasses)
  expect(classes).not.toContain('ring-inset')
  expect(classes).not.toContain('ring-2')
}

describe('popup list option active state', () => {
  it('uses a panel-clipped fill instead of an inset ring', () => {
    expect(getPopupListOptionActiveClasses({ active: true })).toBe(popupListOptionActiveClasses)
    expect(getPopupListOptionActiveClasses({ active: true, disabled: true })).toBe('')
    expect(getPopupListOptionActiveClasses({ active: true, selected: true })).toBe('')

    expectPanelClippedActive(
      getSelectOptionClasses({ isSelected: false, isDisabled: false, isActive: true })
    )
    expectPanelClippedActive(
      getCascaderOptionClasses({ isSelected: false, isDisabled: false, isActive: true })
    )
    expectPanelClippedActive(getAutoCompleteOptionClasses({ isActive: true }))
    expectPanelClippedActive(getMentionsOptionClasses({ isActive: true }))
    expectPanelClippedActive(getTreeSelectNodeClasses({ isActive: true }))
  })

  it('keeps the selected tree row on a real fill token', () => {
    const selected = getTreeSelectNodeClasses({ isSelected: true, isActive: true })
    expect(selected).toContain(popupListOptionActiveClasses)
    expect(selected).not.toContain('outline-bg-active')
    expect(selected).not.toContain('ring-inset')
    expect(selected).not.toMatch(/(?:^|\s)rounded(?:\s|$)/)

    const disabled = getSelectOptionClasses({
      isSelected: false,
      isDisabled: true,
      isActive: true
    })
    expect(disabled).not.toContain(popupListOptionActiveClasses)
    expect(disabled).not.toContain('ring-inset')
  })
})
