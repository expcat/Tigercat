import { describe, it, expect } from 'vitest'
import {
  findFirstEnabledIndex,
  findLastEnabledIndex,
  findNextEnabledIndex,
  getCyclicIndex,
  getDisclosureStateAttr,
  getInitialPickerActiveIndex,
  getPickerComboboxAria,
  getPickerListboxAria,
  getPickerNavigationIndex,
  getPickerOptionAria,
  getPickerOptionId,
  getPickerTriggerKeyAction
} from '@expcat/tigercat-core'

interface Item {
  value: string
  disabled?: boolean
}

const items: Item[] = [
  { value: 'a', disabled: true },
  { value: 'b' },
  { value: 'c', disabled: true },
  { value: 'd' },
  { value: 'e', disabled: true }
]

describe('picker-utils', () => {
  describe('findFirstEnabledIndex', () => {
    it('returns the first enabled index', () => {
      expect(findFirstEnabledIndex(items)).toBe(1)
    })

    it('returns -1 for empty list', () => {
      expect(findFirstEnabledIndex([])).toBe(-1)
    })

    it('returns -1 when all disabled', () => {
      expect(findFirstEnabledIndex([{ value: 'x', disabled: true }])).toBe(-1)
    })

    it('respects custom predicate', () => {
      const data = [{ v: 1 }, { v: 2 }]
      expect(findFirstEnabledIndex(data, (it) => it.v < 2)).toBe(1)
    })
  })

  describe('findLastEnabledIndex', () => {
    it('returns the last enabled index', () => {
      expect(findLastEnabledIndex(items)).toBe(3)
    })

    it('returns -1 for empty list', () => {
      expect(findLastEnabledIndex([])).toBe(-1)
    })
  })

  describe('findNextEnabledIndex', () => {
    it('moves forward and skips disabled items', () => {
      expect(findNextEnabledIndex(items, 1, 1)).toBe(3)
    })

    it('moves backward and skips disabled items', () => {
      expect(findNextEnabledIndex(items, 3, -1)).toBe(1)
    })

    it('starts from head when current is -1 and direction is +1', () => {
      expect(findNextEnabledIndex(items, -1, 1)).toBe(1)
    })

    it('starts from tail when current is -1 and direction is -1', () => {
      expect(findNextEnabledIndex(items, -1, -1)).toBe(3)
    })

    it('returns current when no enabled item exists in direction', () => {
      expect(findNextEnabledIndex(items, 3, 1)).toBe(3)
      expect(findNextEnabledIndex(items, 1, -1)).toBe(1)
    })

    it('returns -1 for empty list', () => {
      expect(findNextEnabledIndex([], 0, 1)).toBe(-1)
    })
  })

  describe('getInitialPickerActiveIndex', () => {
    it('returns first enabled index only when active-first is enabled', () => {
      expect(getInitialPickerActiveIndex(items, true)).toBe(1)
      expect(getInitialPickerActiveIndex(items, false)).toBe(-1)
    })
  })

  describe('getPickerNavigationIndex', () => {
    it('maps arrow and boundary keys to enabled indexes', () => {
      expect(getPickerNavigationIndex(items, 1, 'ArrowDown')).toBe(3)
      expect(getPickerNavigationIndex(items, 3, 'ArrowUp')).toBe(1)
      expect(getPickerNavigationIndex(items, 3, 'Home')).toBe(1)
      expect(getPickerNavigationIndex(items, 1, 'End')).toBe(3)
      expect(getPickerNavigationIndex(items, 1, 'Enter')).toBe(1)
    })
  })

  describe('picker aria helpers', () => {
    it('builds combobox aria props with active descendant only while expanded', () => {
      expect(getPickerOptionId('list', 2)).toBe('list-option-2')
      expect(getPickerComboboxAria({ expanded: true, listboxId: 'list', activeIndex: 2 })).toEqual({
        role: 'combobox',
        'aria-expanded': true,
        'aria-haspopup': 'listbox',
        'aria-controls': 'list',
        'aria-activedescendant': 'list-option-2',
        'data-state': 'open'
      })
      expect(getPickerComboboxAria({ expanded: false, listboxId: 'list', activeIndex: 2 })).toEqual(
        {
          role: 'combobox',
          'aria-expanded': false,
          'aria-haspopup': 'listbox',
          'aria-controls': undefined,
          'aria-activedescendant': undefined,
          'data-state': 'closed'
        }
      )
    })

    it('getDisclosureStateAttr maps open state to data-state', () => {
      expect(getDisclosureStateAttr(true)).toEqual({ 'data-state': 'open' })
      expect(getDisclosureStateAttr(false)).toEqual({ 'data-state': 'closed' })
    })

    it('builds listbox and option aria props', () => {
      expect(getPickerListboxAria({ id: 'list', label: 'Choices' })).toEqual({
        id: 'list',
        role: 'listbox',
        'aria-label': 'Choices'
      })
      expect(getPickerOptionAria({ selected: true, disabled: true })).toEqual({
        role: 'option',
        'aria-selected': true,
        'aria-disabled': true
      })
      expect(getPickerOptionAria({})).toEqual({
        role: 'option',
        'aria-selected': false,
        'aria-disabled': undefined
      })
    })
  })

  describe('getPickerTriggerKeyAction', () => {
    it('normalizes trigger key actions', () => {
      expect(getPickerTriggerKeyAction('Enter', false)).toBe('toggle')
      expect(getPickerTriggerKeyAction(' ', true)).toBe('toggle')
      expect(getPickerTriggerKeyAction('ArrowDown', false)).toBe('open')
      expect(getPickerTriggerKeyAction('ArrowDown', true)).toBe('none')
      expect(getPickerTriggerKeyAction('Escape', true)).toBe('close')
      expect(getPickerTriggerKeyAction('Escape', false)).toBe('none')
    })
  })

  describe('getCyclicIndex', () => {
    it('advances and wraps around the end', () => {
      expect(getCyclicIndex(3, 0, 1)).toBe(1)
      expect(getCyclicIndex(3, 1, 1)).toBe(2)
      expect(getCyclicIndex(3, 2, 1)).toBe(0)
    })

    it('retreats and wraps around the start', () => {
      expect(getCyclicIndex(3, 2, -1)).toBe(1)
      expect(getCyclicIndex(3, 0, -1)).toBe(2)
    })

    it('treats an uninitialized index as before the first item', () => {
      expect(getCyclicIndex(3, -1, 1)).toBe(0)
      expect(getCyclicIndex(3, -1, -1)).toBe(1)
    })

    it('returns -1 for an empty list', () => {
      expect(getCyclicIndex(0, 0, 1)).toBe(-1)
      expect(getCyclicIndex(0, 0, -1)).toBe(-1)
    })
  })
})
