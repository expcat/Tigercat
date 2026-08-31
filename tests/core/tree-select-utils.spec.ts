/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import {
  TREE_SELECT_DEFAULT_HEIGHT,
  alignTreeSelectVirtualScroll,
  getTreeSelectDisplayLabel,
  getTreeSelectOpenExpandedKeys,
  getTreeSelectTriggerKeyIntent,
  getTreeSelectVisibleIndex,
  getTreeSelectVirtualAlignScrollTop,
  isTreeNodeExpandable,
  isTreeSelectValueEmpty,
  normalizeTreeSelectValue,
  resolveTreeSelectVisibleItems,
  type TreeNode
} from '@expcat/tigercat-core'

const treeData: TreeNode[] = [
  {
    key: 'root',
    label: 'Root',
    children: [
      { key: 'child-a', label: 'Child A' },
      { key: 'child-b', label: 'Child B' }
    ]
  },
  { key: 'leaf', label: 'Leaf' }
]

describe('tree-select helpers', () => {
  it('keeps overlay-family virtual defaults', () => {
    expect(TREE_SELECT_DEFAULT_HEIGHT).toBe(256)
  })

  it('treats isLeaf true as not expandable even with children', () => {
    expect(
      isTreeNodeExpandable({
        key: 'n',
        label: 'N',
        isLeaf: true,
        children: [{ key: 'c', label: 'C' }]
      })
    ).toBe(false)
  })

  it('finds the visible index of a selected node', () => {
    const items = resolveTreeSelectVisibleItems({
      treeData,
      expandedKeys: new Set(['root']),
      searchQuery: ''
    })
    expect(getTreeSelectVisibleIndex(items, 'child-b')).toBe(2)
    expect(getTreeSelectVisibleIndex(items, ['leaf', 'child-a'])).toBe(1)
    expect(getTreeSelectVisibleIndex(items, 'missing')).toBe(-1)
    expect(getTreeSelectVisibleIndex(items, [])).toBe(-1)
    expect(getTreeSelectVisibleIndex(items, undefined)).toBe(-1)
    expect(getTreeSelectVisibleIndex(items, '')).toBe(-1)
  })

  it('keeps empty string and 0 as legal keys', () => {
    expect(isTreeSelectValueEmpty('', false)).toBe(false)
    expect(isTreeSelectValueEmpty(0, false)).toBe(false)
    expect(isTreeSelectValueEmpty(undefined, false)).toBe(true)
    expect(normalizeTreeSelectValue('', false)).toBe('')
    expect(getTreeSelectDisplayLabel([{ key: '', label: 'Blank' }], '')).toBe('Blank')
    expect(getTreeSelectDisplayLabel([{ key: 0, label: 'Zero' }], 0)).toBe('Zero')
  })

  it('expands selected ancestors when opening', () => {
    const keys = getTreeSelectOpenExpandedKeys({
      treeData,
      selectedKeys: ['child-a'],
      defaultExpandAll: false,
      expandedKeys: []
    })
    expect([...keys]).toContain('root')
  })

  it('filters visible rows and keeps ancestors', () => {
    const items = resolveTreeSelectVisibleItems({
      treeData,
      expandedKeys: new Set(),
      searchQuery: 'Child A'
    })
    expect(items.some((item) => item.key === 'child-a')).toBe(true)
    expect(items.some((item) => item.key === 'root')).toBe(true)
    expect(items.some((item) => item.key === 'leaf')).toBe(false)
  })

  it('aligns scrollTop so the active index stays in the window', () => {
    const itemHeight = 32
    const viewportHeight = 200
    expect(getTreeSelectVirtualAlignScrollTop(0, -1, itemHeight, viewportHeight)).toBe(0)
    expect(getTreeSelectVirtualAlignScrollTop(400, 2, itemHeight, viewportHeight)).toBe(64)
  })

  it('writes aligned scrollTop and dispatches scroll on the container', () => {
    const el = document.createElement('div')
    el.scrollTop = 0
    const handler = vi.fn()
    el.addEventListener('scroll', handler)
    const next = alignTreeSelectVirtualScroll(el, 80, 32, 200)
    expect(next).toBe(80 * 32 + 32 - 200)
    expect(el.scrollTop).toBe(next)
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('opens from a closed trigger', () => {
    expect(
      getTreeSelectTriggerKeyIntent({
        key: 'ArrowDown',
        open: false,
        searchable: false,
        clearable: true,
        hasValue: false
      }).type
    ).toBe('open')
  })
})
