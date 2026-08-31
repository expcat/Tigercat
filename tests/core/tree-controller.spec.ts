import { describe, expect, it } from 'vitest'
import {
  applyLoadedChildren,
  applyTreeDrop,
  applyTreeFilter,
  mergeLoadedChildren,
  nextTreeCheckedState,
  nextTreeExpandedKeys,
  nextTreeSelectedKeys,
  reconcileUncontrolledExpandedKeys,
  resolveInitialExpandedKeys,
  resolveTreeDropPosition,
  resolveTreeSelection,
  resolveTreeView,
  shouldLoadTreeNode,
  type TreeNode
} from '@expcat/tigercat-core'

const treeData: TreeNode[] = [
  {
    key: 'root',
    label: 'Root',
    children: [
      { key: 'child-a', label: 'Child A' },
      {
        key: 'child-b',
        label: 'Child B',
        children: [
          { key: 'leaf-b1', label: 'Leaf B1' },
          { key: 'leaf-b2', label: 'Leaf B2' }
        ]
      }
    ]
  }
]

describe('resolveTreeSelection', () => {
  it('keeps selectable true when selectionMode is omitted', () => {
    expect(resolveTreeSelection({})).toEqual({ selectable: true, multiple: false })
    expect(resolveTreeSelection({ selectable: false })).toEqual({
      selectable: false,
      multiple: false
    })
    expect(resolveTreeSelection({ multiple: true })).toEqual({ selectable: true, multiple: true })
  })

  it('lets selectionMode override selectable/multiple', () => {
    expect(resolveTreeSelection({ selectionMode: 'none', selectable: true })).toEqual({
      selectable: false,
      multiple: false
    })
    expect(resolveTreeSelection({ selectionMode: 'multiple', multiple: false })).toEqual({
      selectable: true,
      multiple: true
    })
  })
})

describe('expanded keys', () => {
  it('unions defaultExpandAll with defaultExpandedKeys', () => {
    const resolved = resolveInitialExpandedKeys({
      treeData,
      defaultExpandAll: true,
      defaultExpandedKeys: ['child-b']
    })
    expect(resolved.controlled).toBe(false)
    expect(resolved.keys).toEqual(expect.arrayContaining(['root', 'child-a', 'child-b', 'leaf-b1']))
  })

  it('treats an empty expandedKeys array as controlled', () => {
    expect(resolveInitialExpandedKeys({ treeData, expandedKeys: [] })).toEqual({
      controlled: true,
      keys: []
    })
  })

  it('expands a late-arriving tree when defaultExpandAll is still untouched', () => {
    expect(
      reconcileUncontrolledExpandedKeys({
        current: [],
        treeData,
        defaultExpandAll: true,
        userHasToggled: false
      })
    ).toEqual(['root', 'child-a', 'child-b', 'leaf-b1', 'leaf-b2'])
  })

  it('does not reset user toggles when treeData identity changes', () => {
    expect(
      reconcileUncontrolledExpandedKeys({
        current: ['root'],
        treeData: [...treeData],
        defaultExpandAll: true,
        userHasToggled: true
      })
    ).toEqual(['root'])
  })

  it('toggles a key without depending on 1 vs "1"', () => {
    expect(nextTreeExpandedKeys([1], '1', false)).toEqual([])
    expect(nextTreeExpandedKeys([], 1, true)).toEqual([1])
  })
})

describe('select and check', () => {
  it('single-select does not deselect unless allowDeselect', () => {
    expect(
      nextTreeSelectedKeys({
        current: ['root'],
        key: 'root',
        multiple: false,
        allowDeselect: false
      })
    ).toEqual(['root'])
    expect(
      nextTreeSelectedKeys({ current: ['root'], key: 'root', multiple: false, allowDeselect: true })
    ).toEqual([])
  })

  it('checks a parent without mutating disabled children', () => {
    const data: TreeNode[] = [
      {
        key: 'p',
        label: 'P',
        children: [
          { key: 'ok', label: 'OK' },
          { key: 'off', label: 'Off', disabled: true }
        ]
      }
    ]
    const next = nextTreeCheckedState(data, 'p', true, [])
    expect(next.checked.sort()).toEqual(['ok', 'p'])
    expect(data[0].children?.[1].disabled).toBe(true)
  })
})

describe('filter', () => {
  it('auto-expands ancestors and retracts them when the query clears', () => {
    const applied = applyTreeFilter({
      treeData,
      query: 'Leaf B1',
      autoExpandParent: true,
      currentExpanded: []
    })
    expect(applied.matchedKeys.has('leaf-b1')).toBe(true)
    expect(applied.nextExpandedKeys).toEqual(expect.arrayContaining(['root', 'child-b']))

    const cleared = applyTreeFilter({
      treeData,
      query: '',
      autoExpandParent: true,
      currentExpanded: ['root', 'child-b'],
      previousAutoExpand: applied.autoExpandKeys
    })
    expect(cleared.matchedKeys.size).toBe(0)
    expect(cleared.nextExpandedKeys).toEqual([])
  })
})

describe('lazy load', () => {
  it('requests empty non-leaf children and merges without mutating the source', () => {
    const parent: TreeNode = { key: 'p', label: 'P', children: [] }
    const source = [parent]
    expect(
      shouldLoadTreeNode({
        node: parent,
        hasLoadData: true,
        loadedIds: new Set(),
        loadingIds: new Set()
      })
    ).toBe(true)

    const children = [{ key: 'c', label: 'C' }]
    const next = applyLoadedChildren(source, 'p', children)
    expect(source[0].children).toEqual([])
    expect(next[0]).not.toBe(source[0])
    expect(next[0].children).toEqual(children)

    const overlaid = mergeLoadedChildren(source, new Map([['p', children]]))
    expect(overlaid[0].children).toEqual(children)
    expect(source[0].children).toEqual([])
  })
})

describe('drop', () => {
  it('moves a node before/after/inside without mutating source identity', () => {
    const before = applyTreeDrop({
      treeData,
      dragKey: 'child-a',
      dropKey: 'child-b',
      position: 'after'
    })
    expect(treeData[0].children?.map((node) => node.key)).toEqual(['child-a', 'child-b'])
    expect(before?.[0].children?.map((node) => node.key)).toEqual(['child-b', 'child-a'])
    expect(before?.[0].children?.[0]).toBe(treeData[0].children?.[1])

    const inside = applyTreeDrop({
      treeData,
      dragKey: 'child-a',
      dropKey: 'child-b',
      position: 'inside'
    })
    expect(inside?.[0].children?.map((node) => node.key)).toEqual(['child-b'])
    expect(inside?.[0].children?.[0].children?.map((node) => node.key)).toEqual([
      'leaf-b1',
      'leaf-b2',
      'child-a'
    ])
  })

  it('rejects dropping a node onto itself or into its descendant', () => {
    expect(
      applyTreeDrop({ treeData, dragKey: 'root', dropKey: 'leaf-b1', position: 'inside' })
    ).toBeNull()
    expect(
      applyTreeDrop({ treeData, dragKey: 'child-a', dropKey: 'child-a', position: 'after' })
    ).toBeNull()
  })

  it('resolves drop position from pointer Y', () => {
    expect(resolveTreeDropPosition(10, 0, 40, true)).toBe('before')
    expect(resolveTreeDropPosition(20, 0, 40, true)).toBe('inside')
    expect(resolveTreeDropPosition(38, 0, 40, true)).toBe('after')
    expect(resolveTreeDropPosition(20, 0, 40, false)).toBe('after')
  })
})

describe('resolveTreeView', () => {
  it('flattens visible rows with setsize from the same window', () => {
    const view = resolveTreeView({
      treeData,
      expandedKeys: ['root'],
      selectedKeys: ['child-a'],
      checkedState: { checked: [], halfChecked: [] },
      selectable: true,
      checkable: false,
      hasLoadData: false
    })
    expect(view.visibleItems.map((item) => item.key)).toEqual(['root', 'child-a', 'child-b'])
    expect(view.rows[1]?.selected).toBe(true)
    expect(view.rows[1]?.posinset).toBe(2)
    expect(view.rows[1]?.setsize).toBe(3)
    expect(view.focusableKeys).toEqual(['root', 'child-a', 'child-b'])
  })
})
