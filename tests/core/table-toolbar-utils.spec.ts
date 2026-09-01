/**
 * @vitest-environment node
 */

import { describe, expect, it } from 'vitest'
import {
  applyToolbarLocalView,
  canSubmitToolbarSearch,
  isToolbarSearchRemote,
  resolveToolbarFilterMap,
  resolveToolbarPageChange,
  resolveToolbarSelectedKeys,
  seedToolbarFilterState,
  splitCompositeHostAttrs,
  toggleHiddenColumnKey,
  toolbarHasSearch,
  type TableColumn,
  type TableToolbarFilter
} from '@expcat/tigercat-core'

const columns: TableColumn[] = [
  { key: 'name', title: 'Name' },
  { key: 'status', title: 'Status' }
]

describe('table-toolbar-utils', () => {
  it('toggles hidden keys with a set so controlled [] cannot append duplicates', () => {
    expect(toggleHiddenColumnKey([], 'email', false)).toEqual(['email'])
    expect(toggleHiddenColumnKey(['email'], 'email', false)).toEqual(['email'])
    expect(toggleHiddenColumnKey(['email', 'role'], 'email', true)).toEqual(['role'])
  })

  it('keeps resolved filters to current defs plus extra keys that were set', () => {
    const defs: TableToolbarFilter[] = [
      { key: 'status', label: 'Status', value: 'active' },
      { key: 'team', label: 'Team' }
    ]
    const resolved = resolveToolbarFilterMap(defs, { team: 'design', gone: 'x' }, ['ageRange'])
    expect(resolved).toEqual({ status: 'active', team: 'design' })
    const withExtra = resolveToolbarFilterMap(defs, { team: 'design', ageRange: 3 }, ['ageRange'])
    expect(withExtra).toEqual({ status: 'active', team: 'design', ageRange: 3 })
  })

  it('seeds missing uncontrolled filter keys without allocating when nothing is new', () => {
    const defs: TableToolbarFilter[] = [{ key: 'status', label: 'Status', defaultValue: null }]
    const prev = { status: null as const }
    expect(seedToolbarFilterState(prev, defs)).toBe(prev)
    expect(seedToolbarFilterState({}, defs)).toEqual({ status: null })
  })

  it('filters the current dataSource locally by search substring and scalar filter keys', () => {
    const rows = [
      { id: 1, name: 'Ada', status: 'active' },
      { id: 2, name: 'Lin', status: 'paused' }
    ]
    expect(applyToolbarLocalView(rows, columns, 'ad', {})).toEqual([rows[0]])
    expect(applyToolbarLocalView(rows, columns, '', { status: 'paused' })).toEqual([rows[1]])
    expect(applyToolbarLocalView(rows, columns, 'ada', { status: 'paused' })).toEqual([])
    expect(applyToolbarLocalView(rows, columns, '', { status: null, extra: { min: 1 } })).toEqual(
      rows
    )
  })

  it('treats toolbar.selectedKeys as an override of table selection', () => {
    expect(resolveToolbarSelectedKeys([9], [1], [2])).toEqual([9])
    expect(resolveToolbarSelectedKeys(undefined, [1], [2])).toEqual([1])
    expect(resolveToolbarSelectedKeys(undefined, undefined, [2])).toEqual([2])
  })

  it('fires page-size independently of page-index changes', () => {
    expect(resolveToolbarPageChange({ current: 2, pageSize: 10 }, 10)).toEqual({
      kind: 'page',
      page: { current: 2, pageSize: 10 }
    })
    expect(resolveToolbarPageChange({ current: 1, pageSize: 20 }, 10)).toEqual({
      kind: 'size',
      page: { current: 1, pageSize: 20 }
    })
  })

  it('shows search when any search channel is present and keeps the button live for local mode', () => {
    expect(toolbarHasSearch(undefined)).toBe(false)
    expect(toolbarHasSearch({ searchPlaceholder: 'Find' })).toBe(true)
    expect(toolbarHasSearch({ search: false, searchPlaceholder: 'Find' })).toBe(false)
    expect(isToolbarSearchRemote({ searchMode: 'remote' })).toBe(true)
    expect(canSubmitToolbarSearch({ searchPlaceholder: 'Find' })).toBe(true)
    expect(canSubmitToolbarSearch({ searchMode: 'remote', searchPlaceholder: 'Find' })).toBe(false)
    expect(
      canSubmitToolbarSearch({
        searchMode: 'remote',
        searchPlaceholder: 'Find',
        onSearchChange: () => undefined
      })
    ).toBe(true)
  })

  it('puts id/style/data/aria on the host and leaves table listeners on rest', () => {
    const { host, rest } = splitCompositeHostAttrs({
      id: 'grid',
      style: { height: 320 },
      'data-testid': 'dt',
      'aria-label': 'Members',
      onRowClick: 1,
      className: 'outer'
    })
    expect(host).toEqual({
      id: 'grid',
      style: { height: 320 },
      'data-testid': 'dt',
      'aria-label': 'Members',
      className: 'outer'
    })
    expect(rest).toEqual({ onRowClick: 1 })
  })
})
