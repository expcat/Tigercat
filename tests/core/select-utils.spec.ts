import { describe, expect, it, vi } from 'vitest'
import {
  buildSelectListRows,
  clearSelectValue,
  commitSelectOption,
  createSelectOptionFromQuery,
  createSelectSearchDebouncer,
  defaultSelectFilterOption,
  filterOptions,
  findSelectTypeaheadIndex,
  getCreateSelectOptionLabel,
  getSelectActiveAlignScrollTop,
  getSelectClosedHomeEndIndex,
  getSelectOptionClasses,
  getSelectRootClasses,
  getSelectSelectedValues,
  getSelectTriggerKeyIntent,
  getSelectVirtualRange,
  isSelectValueEmpty,
  normalizeSelectValue,
  pruneCreatedSelectOptions,
  rememberSelectOptions,
  resolveCreatableSelectOption,
  resolveSelectActiveIndex,
  resolveSelectDisplayText,
  resolveSelectFilteredOptions,
  serializeSelectFormValues,
  shouldShowSelectClear,
  type SelectOptions
} from '@expcat/tigercat-core'

const options: SelectOptions = [
  { label: 'Alpha', value: 'alpha' },
  { label: 'Beta', value: 'beta' }
]

describe('select-utils', () => {
  describe('filter and creatable', () => {
    it('skips local filtering for remote search', () => {
      expect(
        resolveSelectFilteredOptions(options, 'Alpha', { searchable: true, remote: true })
      ).toBe(options)
    })

    it('matches label and value, and keeps a group when the group name matches', () => {
      const grouped: SelectOptions = [
        {
          label: 'Fruit',
          options: [
            { label: 'Apple', value: 'a' },
            { label: 'Pear', value: 'p' }
          ]
        },
        { label: 'Beta', value: 'beta' }
      ]
      expect(filterOptions(grouped, 'rui')).toEqual([grouped[0]])
      expect(filterOptions(grouped, 'ppl')).toEqual([
        { label: 'Fruit', options: [{ label: 'Apple', value: 'a' }] }
      ])
      expect(defaultSelectFilterOption('beta', { label: 'B', value: 'beta' })).toBe(true)
    })

    it('creates a new option from a unique query and follows numeric option values', () => {
      expect(resolveCreatableSelectOption(options, 'Gamma', { creatable: true })).toEqual({
        label: 'Gamma',
        value: 'Gamma'
      })
      expect(createSelectOptionFromQuery('12', [{ label: 'One', value: 1 }])).toEqual({
        label: '12',
        value: 12
      })
    })

    it('does not create duplicates by label or value, case-insensitive', () => {
      expect(resolveCreatableSelectOption(options, 'Alpha', { creatable: true })).toBe(null)
      expect(resolveCreatableSelectOption(options, 'alpha', { creatable: true })).toBe(null)
      expect(resolveCreatableSelectOption(options, 'ALPHA', { creatable: true })).toBe(null)
    })

    it('formats the creatable option from a locale template', () => {
      expect(getCreateSelectOptionLabel({ label: 'Gamma', value: 'Gamma' })).toBe('Create "Gamma"')
      expect(getCreateSelectOptionLabel({ label: 'Gamma', value: 'Gamma' }, '创建“{label}”')).toBe(
        '创建“Gamma”'
      )
      expect(getCreateSelectOptionLabel({ label: 'Gamma', value: 'Gamma' }, 'Add')).toBe(
        'Add "Gamma"'
      )
    })

    it('debounces search callbacks and keeps only the latest query', () => {
      const onSearch = vi.fn()
      const callbacks = new Map<number, () => void>()
      let nextHandle = 0
      const debouncer = createSelectSearchDebouncer({
        delay: 200,
        onSearchChange: onSearch,
        setTimer: (callback) => {
          nextHandle += 1
          callbacks.set(nextHandle, callback)
          return nextHandle
        },
        clearTimer: (handle) => callbacks.delete(handle)
      })

      debouncer.schedule('a')
      debouncer.schedule('ab')

      expect(onSearch).not.toHaveBeenCalled()
      expect(callbacks.size).toBe(1)

      callbacks.get(nextHandle)?.()
      expect(onSearch).toHaveBeenCalledWith('ab')
    })
  })

  describe('value and display', () => {
    it('treats empty string as a selected value, not empty', () => {
      expect(isSelectValueEmpty('', false)).toBe(false)
      expect(isSelectValueEmpty(undefined, false)).toBe(true)
      expect(isSelectValueEmpty([], true)).toBe(true)
      expect(
        shouldShowSelectClear({ clearable: true, disabled: false, value: '', multiple: false })
      ).toBe(true)
    })

    it('normalizes a non-array multiple value to []', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
      expect(normalizeSelectValue('1', true)).toEqual([])
      expect(getSelectSelectedValues('1', true)).toEqual([])
      warn.mockRestore()
    })

    it('keeps labels for selected values missing from current options', () => {
      const cache = rememberSelectOptions(new Map(), [{ label: 'Remote', value: 'r' }], ['r'])
      expect(
        resolveSelectDisplayText({
          value: 'r',
          multiple: false,
          options: [],
          optionCache: cache,
          placeholder: 'Pick'
        })
      ).toBe('Remote')
    })

    it('drops created options once they exist in options', () => {
      expect(
        pruneCreatedSelectOptions(
          [{ label: 'Gamma', value: 'Gamma' }],
          [{ label: 'Gamma', value: 'Gamma' }]
        )
      ).toEqual([])
    })

    it('formats overflow with the locale more-count template', () => {
      expect(
        resolveSelectDisplayText({
          value: ['alpha', 'beta'],
          multiple: true,
          options,
          placeholder: 'Pick',
          maxTagCount: 1,
          moreCountText: '+{count} more'
        })
      ).toBe('Alpha +1 more')
    })

    it('commits single, toggles multiple, and clears to undefined / []', () => {
      expect(
        commitSelectOption({ option: options[0] as never, value: undefined, multiple: false })
      ).toBe('alpha')
      expect(
        commitSelectOption({
          option: options[0] as never,
          value: ['alpha'],
          multiple: true
        })
      ).toEqual([])
      expect(clearSelectValue(false)).toBeUndefined()
      expect(clearSelectValue(true)).toEqual([])
    })

    it('serializes hidden form values', () => {
      expect(serializeSelectFormValues('a', false)).toEqual(['a'])
      expect(serializeSelectFormValues(['a', 'b'], true)).toEqual(['a', 'b'])
      expect(serializeSelectFormValues(undefined, false)).toEqual([])
    })
  })

  describe('active index and keyboard', () => {
    it('opens on the first selected enabled item, then stays on a multi-select click', () => {
      const items = [
        { label: 'A', value: 'a' },
        { label: 'B', value: 'b' },
        { label: 'C', value: 'c' }
      ]
      expect(
        resolveSelectActiveIndex({
          items,
          previousIndex: -1,
          selectedValues: ['a', 'c'],
          reason: 'open'
        })
      ).toBe(0)
      expect(
        resolveSelectActiveIndex({
          items,
          previousIndex: 0,
          selectedValues: ['a', 'c'],
          reason: 'select',
          selectedIndex: 2
        })
      ).toBe(2)
    })

    it('keeps the current option after filter when it is still visible', () => {
      const filtered = [{ label: 'Beta', value: 'beta' }]
      expect(
        resolveSelectActiveIndex({
          items: filtered,
          previousIndex: 1,
          previousValue: 'beta',
          selectedValues: [],
          reason: 'filter'
        })
      ).toBe(0)
    })

    it('maps closed and open trigger keys', () => {
      expect(
        getSelectTriggerKeyIntent({
          key: 'ArrowDown',
          open: false,
          searchable: false,
          clearable: true,
          hasValue: false
        })
      ).toEqual({ type: 'open' })
      expect(
        getSelectTriggerKeyIntent({
          key: 'Backspace',
          open: false,
          searchable: false,
          clearable: true,
          hasValue: true
        })
      ).toEqual({ type: 'clear' })
      expect(
        getSelectTriggerKeyIntent({
          key: 'ArrowDown',
          open: true,
          searchable: false,
          clearable: true,
          hasValue: false
        })
      ).toEqual({ type: 'navigate', key: 'ArrowDown' })
      expect(
        getSelectTriggerKeyIntent({
          key: ' ',
          open: true,
          searchable: true,
          clearable: true,
          hasValue: false,
          fromSearchInput: true
        })
      ).toEqual({ type: 'none' })
      expect(getSelectClosedHomeEndIndex(options as never, 'End')).toBe(1)
    })

    it('typeahead jumps to the next prefix match', () => {
      const items = [
        { label: 'Apple', value: 'a' },
        { label: 'Apricot', value: 'p' },
        { label: 'Banana', value: 'b' }
      ]
      expect(findSelectTypeaheadIndex(items, 'ap', -1)).toBe(0)
      expect(findSelectTypeaheadIndex(items, 'ap', 0)).toBe(1)
    })
  })

  describe('virtual rows and chrome', () => {
    it('flattens groups and creatable into one window', () => {
      const rows = buildSelectListRows([{ label: 'G', options: [{ label: 'A', value: 'a' }] }], {
        label: 'new',
        value: 'new'
      })
      expect(rows.map((row) => row.kind)).toEqual(['group', 'option', 'option'])
      expect(rows[2]).toMatchObject({ kind: 'option', isCreate: true, optionIndex: 1 })
      const range = getSelectVirtualRange(0, 80, rows.length, 40, 0)
      expect(range.totalHeight).toBe(120)
      expect(
        getSelectActiveAlignScrollTop({ scrollTop: 0, listHeight: 40, rowIndex: 2, itemHeight: 40 })
      ).toBe(80)
    })

    it('uses flex-1 in a group and logical option chrome', () => {
      expect(getSelectRootClasses(true)).toContain('flex-1')
      expect(getSelectRootClasses(false)).toContain('w-full')
      expect(
        getSelectOptionClasses({ isSelected: false, isDisabled: true, isActive: false })
      ).not.toContain('cursor-pointer')
    })
  })
})
