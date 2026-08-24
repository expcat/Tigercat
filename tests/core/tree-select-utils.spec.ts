/**
 * @vitest-environment happy-dom
 */

import { describe, expect, it, vi } from 'vitest'
import {
  TREE_SELECT_DEFAULT_HEIGHT,
  TREE_SELECT_DEFAULT_ITEM_HEIGHT,
  alignTreeSelectVirtualScroll,
  flattenTreeSelectNodes,
  getTreeSelectDropdownClasses,
  getTreeSelectVisibleIndex,
  getTreeSelectVirtualAlignScrollTop,
  treeSelectDropdownClasses,
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

describe('tree-select virtual helpers', () => {
  it('keeps Tree-aligned virtual defaults', () => {
    expect(TREE_SELECT_DEFAULT_HEIGHT).toBe(400)
    expect(TREE_SELECT_DEFAULT_ITEM_HEIGHT).toBe(32)
  })

  it('drops nested overflow on the dropdown when virtual is enabled', () => {
    expect(getTreeSelectDropdownClasses()).toBe(treeSelectDropdownClasses)
    expect(getTreeSelectDropdownClasses(false)).toContain('max-h-60')
    expect(getTreeSelectDropdownClasses(false)).toContain('overflow-auto')
    expect(getTreeSelectDropdownClasses(true)).not.toContain('max-h-60')
    expect(getTreeSelectDropdownClasses(true)).toContain('overflow-hidden')
  })

  it('finds the visible index of a selected node', () => {
    const expanded = new Set<string | number>(['root'])
    const nodes = flattenTreeSelectNodes(treeData, expanded)

    expect(getTreeSelectVisibleIndex(nodes, 'child-b')).toBe(2)
    expect(getTreeSelectVisibleIndex(nodes, ['leaf', 'child-a'])).toBe(1)
    expect(getTreeSelectVisibleIndex(nodes, 'missing')).toBe(-1)
    expect(getTreeSelectVisibleIndex(nodes, [])).toBe(-1)
    expect(getTreeSelectVisibleIndex(nodes, undefined)).toBe(-1)
  })

  it('aligns scrollTop so the active index stays in the window', () => {
    const itemHeight = TREE_SELECT_DEFAULT_ITEM_HEIGHT
    const viewportHeight = 200

    expect(getTreeSelectVirtualAlignScrollTop(0, -1, itemHeight, viewportHeight)).toBe(0)
    expect(getTreeSelectVirtualAlignScrollTop(0, 2, itemHeight, viewportHeight)).toBe(0)

    const scrolledUp = getTreeSelectVirtualAlignScrollTop(400, 2, itemHeight, viewportHeight)
    expect(scrolledUp).toBe(64)

    const scrolledDown = getTreeSelectVirtualAlignScrollTop(0, 80, itemHeight, viewportHeight)
    expect(scrolledDown).toBe(80 * itemHeight + itemHeight - viewportHeight)
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

    expect(alignTreeSelectVirtualScroll(null, 0, 32, 200)).toBe(0)
  })
})
