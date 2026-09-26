/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import {
  TREE_SELECT_DEFAULT_HEIGHT,
  resolveTreeSelectListHeight,
  alignTreeSelectVirtualScroll,
  getTreeSelectDisplayLabel,
  getTreeSelectDropdownMinWidth,
  getTreeSelectNodeIndentStyle,
  getTreeSelectOpenExpandedKeys,
  getTreeSelectTriggerKeyIntent,
  getTreeSelectVisibleIndex,
  getTreeSelectVirtualAlignScrollTop,
  isTreeNodeExpandable,
  coerceTreeSelectFormValue,
  countTreeNodes,
  isTreeSelectValueEmpty,
  normalizeTreeSelectValue,
  shouldApplyTreeSelectDefaultExpandAll,
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

  it('insets every row by the shared popup padding and floors the panel on the trigger', () => {
    expect(getTreeSelectDropdownMinWidth()).toBe('var(--tiger-overlay-reference-width, 0px)')
    expect(getTreeSelectNodeIndentStyle(1)).toEqual({
      paddingInlineStart: '0.75rem',
      paddingInlineEnd: '0.75rem'
    })
    expect(getTreeSelectNodeIndentStyle(2)).toEqual({
      paddingInlineStart: 'calc(0.75rem + 24px)',
      paddingInlineEnd: '0.75rem'
    })
  })

  it('resolves listHeight and ignores any legacy height alias', () => {
    expect(resolveTreeSelectListHeight()).toBe(TREE_SELECT_DEFAULT_HEIGHT)
    expect(resolveTreeSelectListHeight(undefined)).toBe(TREE_SELECT_DEFAULT_HEIGHT)
    expect(resolveTreeSelectListHeight(80)).toBe(80)
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

  it('treats empty string as empty and keeps 0 as a key', () => {
    expect(isTreeSelectValueEmpty('', false)).toBe(true)
    expect(isTreeSelectValueEmpty(null, false)).toBe(true)
    expect(isTreeSelectValueEmpty(0, false)).toBe(false)
    expect(isTreeSelectValueEmpty(undefined, false)).toBe(true)
    expect(isTreeSelectValueEmpty('', true)).toBe(true)
    expect(normalizeTreeSelectValue('', false)).toBeNull()
    expect(normalizeTreeSelectValue('', true)).toEqual([])
    expect(coerceTreeSelectFormValue('', true)).toEqual([])
    expect(coerceTreeSelectFormValue('', false)).toBeNull()
    expect(coerceTreeSelectFormValue(undefined, true)).toBeUndefined()
    expect(getTreeSelectDisplayLabel([{ key: '', label: 'Blank' }], '')).toBe('')
    expect(getTreeSelectDisplayLabel([{ key: 0, label: 'Zero' }], 0)).toBe('Zero')
  })

  it('applies defaultExpandAll only when the tree becomes non-empty', () => {
    expect(shouldApplyTreeSelectDefaultExpandAll(0, countTreeNodes(treeData), true)).toBe(true)
    expect(
      shouldApplyTreeSelectDefaultExpandAll(
        countTreeNodes(treeData),
        countTreeNodes(treeData),
        true
      )
    ).toBe(false)
    expect(shouldApplyTreeSelectDefaultExpandAll(0, 0, true)).toBe(false)
    expect(shouldApplyTreeSelectDefaultExpandAll(2, 0, true)).toBe(false)
    expect(shouldApplyTreeSelectDefaultExpandAll(0, 2, false)).toBe(false)
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
