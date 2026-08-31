/**
 * @vitest-environment node
 */

import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  isKeyOpen,
  isKeySelected,
  nextOpenKeys,
  nextSelectedKeys,
  reconcileSearchOpenKeys,
  replaceKeys,
  resolveMenuCollapsed,
  resolveMenuMode,
  resolveSearchFilter,
  toggleKey,
  warnControlledSearchOpenKeys
} from '@expcat/tigercat-core'
import type { MenuItem } from '@expcat/tigercat-core'

const items: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard' },
  {
    key: 1,
    label: 'Administration',
    children: [
      { key: 'users', label: 'Users' },
      { key: 'roles', label: 'Roles' }
    ]
  }
]

describe('menu-controller keys', () => {
  it('treats 1 and "1" as the same selected/open key', () => {
    expect(isKeySelected(1, ['1'])).toBe(true)
    expect(isKeySelected('1', [1])).toBe(true)
    expect(isKeyOpen(1, ['1'])).toBe(true)
    expect(replaceKeys(1, ['1'])).toEqual([])
    expect(toggleKey('1', [1])).toEqual([])
  })

  it('single-selects: next click of the selected key emits []', () => {
    expect(nextSelectedKeys([], 'a')).toEqual(['a'])
    expect(nextSelectedKeys(['a'], 'a')).toEqual([])
    expect(nextSelectedKeys(['a', 'b'], 'c')).toEqual(['c'])
    expect(replaceKeys('c', ['a', 'b'])).toEqual(['c'])
  })

  it('toggles openKeys and respects multiple=false', () => {
    expect(nextOpenKeys({ current: [], key: 'a', multiple: true })).toEqual(['a'])
    expect(nextOpenKeys({ current: ['a'], key: 'b', multiple: true })).toEqual(['a', 'b'])
    expect(nextOpenKeys({ current: ['a'], key: 'b', multiple: false })).toEqual(['b'])
    expect(nextOpenKeys({ current: ['a'], key: 'a', multiple: true })).toEqual([])
    expect(nextOpenKeys({ current: ['a'], key: 'a', multiple: true, open: true })).toEqual(['a'])
  })

  it('inline+collapsed resolves to vertical popup mode', () => {
    expect(resolveMenuMode('inline', true)).toBe('vertical')
    expect(resolveMenuMode('inline', false)).toBe('inline')
    expect(resolveMenuMode('horizontal', true)).toBe('horizontal')
  })

  it('ignores collapsed on horizontal and warns once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(resolveMenuCollapsed('horizontal', true)).toBe(false)
    expect(resolveMenuCollapsed('vertical', true)).toBe(true)
    expect(warn).toHaveBeenCalledTimes(1)
    warn.mockRestore()
  })
})

describe('menu-controller search open keys', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('unions search ancestor keys and retracts them when the query clears', () => {
    const opened = reconcileSearchOpenKeys({
      openKeys: [],
      previousSearchExpandKeys: [],
      nextSearchExpandKeys: [1]
    })
    expect(opened.openKeys).toEqual([1])
    expect(opened.searchExpandKeys).toEqual([1])

    const cleared = reconcileSearchOpenKeys({
      openKeys: opened.openKeys,
      previousSearchExpandKeys: opened.searchExpandKeys,
      nextSearchExpandKeys: []
    })
    expect(cleared.openKeys).toEqual([])
    expect(cleared.searchExpandKeys).toEqual([])
  })

  it('does not retract a submenu the user already opened', () => {
    const opened = reconcileSearchOpenKeys({
      openKeys: [1],
      previousSearchExpandKeys: [],
      nextSearchExpandKeys: [1]
    })
    expect(opened.searchExpandKeys).toEqual([])

    const cleared = reconcileSearchOpenKeys({
      openKeys: opened.openKeys,
      previousSearchExpandKeys: opened.searchExpandKeys,
      nextSearchExpandKeys: []
    })
    expect(cleared.openKeys).toEqual([1])
  })

  it('filters nested matches and reports expand keys without defaultOpenKeys', () => {
    const { filtered, expandKeys } = resolveSearchFilter({
      items,
      query: 'Roles'
    })
    expect(filtered).toHaveLength(1)
    expect(filtered[0]?.children?.some((child) => child.key === 'roles')).toBe(true)
    expect(expandKeys).toEqual([1])
  })

  it('warns when a controlled openKeys misses search ancestors', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    warnControlledSearchOpenKeys({
      controlled: true,
      openKeys: [],
      searchExpandKeys: ['admin']
    })
    expect(warn).toHaveBeenCalledTimes(1)
    warn.mockRestore()
  })
})
