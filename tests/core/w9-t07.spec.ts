import { describe, expect, it } from 'vitest'
import {
  applyPopupMenuCheck,
  breadcrumbCollapsedMenuItems,
  clampPaginationJump,
  createSectionScrollModel,
  createTypeaheadHighlight,
  isStepClickable,
  isTypeaheadHighlight,
  measureNavigationIndicator,
  menuSchemaToMenuItems,
  nextAffixNotice,
  nextTabOrder,
  nextTreeRangeSelection,
  orderSpotlightWithRecent,
  paginationEllipsisPages,
  popupMenuAccessibleName,
  resolveFloatButtonHref,
  resolvePopupMenuItemType,
  resolveSectionActiveHref,
  sectionScrollBehavior,
  splitOverflowTabKeys,
  spotlightFooterShortcuts,
  tabActivationSelectsOnArrow,
  typeaheadShortcutColumn
} from '@expcat/tigercat-core'
import { getPageNumbers } from '@expcat/tigercat-core'
import { getStepIconClasses } from '@expcat/tigercat-core'

describe('W9 T07 navigation', () => {
  it('E1 shares one popup item model', () => {
    const items = [
      { key: 'a', type: 'checkbox' as const, label: 'A', checked: false },
      { key: 'b', type: 'radio' as const, label: 'B', group: 'g', checked: false },
      { key: 'c', type: 'radio' as const, label: 'C', group: 'g', checked: true },
      { key: 'd', type: 'danger' as const, label: 'Delete' },
      { key: 'e', type: 'separator' as const },
      { key: 'f', href: 'https://example.com', label: 'Docs' }
    ]
    expect(resolvePopupMenuItemType(items[4])).toBe('separator')
    expect(resolvePopupMenuItemType(items[5])).toBe('link')
    expect(popupMenuAccessibleName(items[3])).toContain('Danger')
    const next = applyPopupMenuCheck(items, { key: 'b', checked: true, group: 'g' })
    expect(next.find((item) => item.key === 'b')?.checked).toBe(true)
    expect(next.find((item) => item.key === 'c')?.checked).toBe(false)
  })

  it('E2 copies schema badge onto the menu item', () => {
    const items = menuSchemaToMenuItems([{ key: 'jobs', label: 'Jobs', badge: 3 }])
    expect(items[0]?.badge).toBe(3)
  })

  it('E3 measures the indicator on the logical axis', () => {
    const ltr = measureNavigationIndicator(
      { left: 20, right: 60, width: 40 },
      { left: 0, right: 200 },
      'ltr'
    )
    const rtl = measureNavigationIndicator(
      { left: 20, right: 60, width: 40 },
      { left: 0, right: 200 },
      'rtl'
    )
    expect(ltr.start).toBe(20)
    expect(rtl.start).toBe(140)
  })

  it('E4 splits overflow tabs and reorders once', () => {
    const split = splitOverflowTabKeys({
      keys: ['a', 'b', 'c'],
      widths: [40, 40, 40],
      available: 80,
      activeKey: 'c'
    })
    expect(split.overflow.length).toBeGreaterThan(0)
    expect(split.visible).toContain('c')
    expect(nextTabOrder(['a', 'b', 'c'], 'c', 'a')).toEqual(['c', 'a', 'b'])
    expect(tabActivationSelectsOnArrow('manual')).toBe(false)
    expect(tabActivationSelectsOnArrow('automatic')).toBe(true)
  })

  it('E5 selects a visible range from the anchor', () => {
    const range = nextTreeRangeSelection({
      visibleKeys: ['a', 'b', 'c', 'd'],
      disabledKeys: ['b'],
      anchor: 'a',
      key: 'd'
    })
    expect(range.keys).toEqual(['a', 'c', 'd'])
  })

  it('E6 highlights the typeahead match and shows a shortcut column', () => {
    const highlight = createTypeaheadHighlight()
    const match = highlight.push('b', ['Alpha', 'Beta', 'Gamma'], -1)
    expect(match?.index).toBe(1)
    expect(isTypeaheadHighlight('Beta', 'b')).toBe(true)
    expect(typeaheadShortcutColumn('⌘K')).toBe('⌘K')
  })

  it('E7 builds a menu from collapsed breadcrumb items', () => {
    const menu = breadcrumbCollapsedMenuItems([
      { key: 1, label: 'Docs', href: '/docs' },
      { key: 2, label: 'API' }
    ])
    expect(menu[0]?.type).toBe('link')
    expect(menu[1]?.type).toBe('item')
  })

  it('E9 gates float button links', () => {
    expect(resolveFloatButtonHref('javascript:alert(1)')).toBeUndefined()
    expect(resolveFloatButtonHref('/inbox')).toBe('/inbox')
  })

  it('E10 clamps an ellipsis jump', () => {
    const tokens = getPageNumbers(1, 20, false)
    const index = tokens.indexOf('...')
    expect(paginationEllipsisPages(tokens, index, 20).length).toBeGreaterThan(0)
    expect(clampPaginationJump('99', 20)).toBe(20)
  })

  it('E11 keeps error steps clickable and dots the marker only', () => {
    expect(isStepClickable(true, false, 'error')).toBe(true)
    expect(isStepClickable(false, false, 'error')).toBe(false)
    expect(getStepIconClasses('process', 'md', false, false, true)).toContain('tiger-step-icon--dot')
    expect(getStepIconClasses('process', 'md', false, false, true)).not.toContain('w-10')
  })

  it('E12 sorts recent ids ahead and lists footer shortcuts', () => {
    const items = [
      { key: 'a', label: 'A' },
      { key: 'b', label: 'B', shortcut: '⌘B' },
      { key: 'c', label: 'C', shortcut: '⌘C', disabled: true }
    ]
    expect(orderSpotlightWithRecent(items, ['b']).map((item) => item.key)).toEqual(['b', 'a', 'c'])
    expect(spotlightFooterShortcuts(items)).toEqual(['⌘B'])
  })

  it('E13 shares the section scroll model', () => {
    const model = createSectionScrollModel({
      activeHref: '#one',
      reducedMotion: true
    })
    expect(model.activeHref).toBe('#one')
    expect(model.reducedMotion).toBe(true)
    expect(sectionScrollBehavior(true)).toBe('auto')
    expect(sectionScrollBehavior(false)).toBe('smooth')
    expect(resolveSectionActiveHref(undefined, '#two')).toBe('#two')
    expect(resolveSectionActiveHref('#kept', '#two')).toBe('#kept')
  })

  it('E14 notifies once per stuck and release', () => {
    expect(nextAffixNotice(null, true)).toBe(true)
    expect(nextAffixNotice(true, true)).toBeNull()
    expect(nextAffixNotice(true, false)).toBe(false)
    expect(nextAffixNotice(false, false)).toBeNull()
  })
})
