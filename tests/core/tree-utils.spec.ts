import { describe, expect, it } from 'vitest'
import {
  calculateCheckedState,
  checkedSetsFromState,
  filterTreeNodes,
  findNode,
  getAllKeys,
  getAutoExpandKeys,
  getCheckedKeysByStrategy,
  getDescendantKeys,
  getLeafKeys,
  getParentKeys,
  getTreeNodeClasses,
  getTreeNodeExpandIconClasses,
  getVisibleTreeItems,
  handleNodeCheck,
  treeBaseClasses,
  treeEmptyStateClasses,
  treeLineClasses,
  treeLoadingClasses,
  treeNodeCheckboxClasses,
  treeNodeChildrenClasses,
  treeNodeContentClasses,
  treeNodeDisabledClasses,
  treeNodeExpandIconClasses,
  treeNodeExpandIconExpandedClasses,
  treeNodeHoverClasses,
  treeNodeIconClasses,
  treeNodeIndentClasses,
  treeNodeLabelClasses,
  treeNodeSelectedClasses,
  treeNodeWrapperClasses,
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
          { key: 'leaf-b2', label: 'Leaf B2', isLeaf: true }
        ]
      }
    ]
  },
  { key: 'standalone', label: 'Standalone', disabled: true }
]

describe('tree-utils classes', () => {
  it('exports stable class constants', () => {
    expect(treeBaseClasses).toContain('w-full')
    expect(treeNodeWrapperClasses).toBe('select-none')
    expect(treeNodeContentClasses).toContain('cursor-pointer')
    expect(treeNodeHoverClasses).toContain('hover:bg-gray-50')
    expect(treeNodeSelectedClasses).toContain('tiger-primary')
    expect(treeNodeDisabledClasses).toContain('cursor-not-allowed')
    expect(treeNodeIndentClasses).toContain('w-6')
    expect(treeNodeExpandIconClasses).toContain('transition-transform')
    expect(treeNodeExpandIconExpandedClasses).toContain('rotate-90')
    expect(treeNodeCheckboxClasses).toContain('focus:ring')
    expect(treeNodeIconClasses).toContain('flex-shrink-0')
    expect(treeNodeLabelClasses).toContain('truncate')
    expect(treeNodeChildrenClasses).toBe('ml-6')
    expect(treeLoadingClasses).toContain('animate-spin')
    expect(treeEmptyStateClasses).toContain('text-center')
    expect(treeLineClasses).toContain('border-l')
  })

  it('combines node state classes', () => {
    expect(getTreeNodeClasses(false, false)).toContain(treeNodeHoverClasses)
    expect(getTreeNodeClasses(true, false, true)).toContain(treeNodeSelectedClasses)
    expect(getTreeNodeClasses(true, false, true)).toContain('w-full')
    expect(getTreeNodeClasses(false, true)).toContain(treeNodeDisabledClasses)
    expect(getTreeNodeClasses(false, true)).not.toContain(treeNodeHoverClasses)
  })

  it('rotates the expand icon only when expanded', () => {
    expect(getTreeNodeExpandIconClasses(false)).toBe(treeNodeExpandIconClasses)
    expect(getTreeNodeExpandIconClasses(true)).toContain(treeNodeExpandIconExpandedClasses)
  })
})

describe('tree-utils traversal', () => {
  it('flattens visible tree items according to expanded keys', () => {
    expect(getVisibleTreeItems(treeData).map((item) => item.key)).toEqual(['root', 'standalone'])

    const expanded = new Set<string | number>(['root', 'child-b'])
    expect(
      getVisibleTreeItems(treeData, expanded).map((item) => [item.key, item.level, item.parentKey])
    ).toEqual([
      ['root', 1, undefined],
      ['child-a', 2, 'root'],
      ['child-b', 2, 'root'],
      ['leaf-b1', 3, 'child-b'],
      ['leaf-b2', 3, 'child-b'],
      ['standalone', 1, undefined]
    ])
  })

  it('filters visible tree items to matched keys', () => {
    const expanded = new Set<string | number>(['root', 'child-b'])
    const matched = new Set<string | number>(['root', 'child-b', 'leaf-b2'])

    expect(getVisibleTreeItems(treeData, expanded, matched).map((item) => item.key)).toEqual([
      'root',
      'child-b',
      'leaf-b2'
    ])
  })

  it('collects all keys, leaf keys, parents, descendants, and found nodes', () => {
    expect(getAllKeys(treeData)).toEqual([
      'root',
      'child-a',
      'child-b',
      'leaf-b1',
      'leaf-b2',
      'standalone'
    ])
    expect(getLeafKeys(treeData)).toEqual(['child-a', 'leaf-b1', 'leaf-b2', 'standalone'])
    expect(findNode(treeData, 'child-b')?.label).toBe('Child B')
    expect(findNode(treeData, 'missing')).toBeNull()
    expect(getParentKeys(treeData, 'leaf-b2')).toEqual(['root', 'child-b'])
    expect(getParentKeys(treeData, 'missing')).toEqual([])
    expect(getDescendantKeys(findNode(treeData, 'root')!)).toEqual([
      'child-a',
      'child-b',
      'leaf-b1',
      'leaf-b2'
    ])
    expect(getDescendantKeys({ key: 'leaf', label: 'Leaf' })).toEqual([])
  })
})

describe('tree-utils checked state', () => {
  it('returns strict checked state without cascading', () => {
    expect(calculateCheckedState(treeData, ['child-b'], true)).toEqual({
      checked: ['child-b'],
      halfChecked: []
    })
  })

  it('checks complete parent subtrees and half-checks partial parents', () => {
    expect(calculateCheckedState(treeData, ['child-b'])).toEqual({
      checked: ['child-b', 'leaf-b1', 'leaf-b2'],
      halfChecked: ['root']
    })

    expect(calculateCheckedState(treeData, ['leaf-b1'])).toEqual({
      checked: ['leaf-b1'],
      halfChecked: ['child-b', 'root']
    })
  })

  it('handles node check and uncheck in strict and cascading modes', () => {
    expect(handleNodeCheck(treeData, 'child-b', true, [])).toEqual({
      checked: ['child-b', 'leaf-b1', 'leaf-b2'],
      halfChecked: ['root']
    })
    expect(handleNodeCheck(treeData, 'child-b', false, ['child-b', 'leaf-b1'])).toEqual({
      checked: [],
      halfChecked: []
    })
    expect(handleNodeCheck(treeData, 'child-b', true, [], true)).toEqual({
      checked: ['child-b'],
      halfChecked: []
    })
    expect(handleNodeCheck(treeData, 'child-b', false, ['child-b'], true)).toEqual({
      checked: [],
      halfChecked: []
    })
    expect(handleNodeCheck(treeData, 'missing', true, ['standalone'])).toEqual({
      checked: ['standalone'],
      halfChecked: []
    })
  })

  it('filters checked keys by strategy', () => {
    const checkedState = calculateCheckedState(treeData, ['root', 'standalone'])

    expect(getCheckedKeysByStrategy(checkedState, treeData, 'all')).toEqual(checkedState.checked)
    expect(getCheckedKeysByStrategy(checkedState, treeData, 'parent')).toEqual([
      'root',
      'standalone'
    ])
    expect(getCheckedKeysByStrategy(checkedState, treeData, 'child')).toEqual([
      'child-a',
      'leaf-b1',
      'leaf-b2',
      'standalone'
    ])
  })

  it('creates set lookups from checked state', () => {
    const sets = checkedSetsFromState({ checked: ['a'], halfChecked: ['b'] })

    expect(sets.checkedSet.has('a')).toBe(true)
    expect(sets.halfCheckedSet.has('b')).toBe(true)
  })
})

describe('tree-utils filtering', () => {
  it('returns no matches for empty filter values', () => {
    expect(filterTreeNodes(treeData, '').size).toBe(0)
  })

  it('matches nodes and their ancestors with the default filter', () => {
    expect(Array.from(filterTreeNodes(treeData, 'leaf b2'))).toEqual(['leaf-b2', 'child-b', 'root'])
  })

  it('supports custom filter functions and auto-expand key derivation', () => {
    const matched = filterTreeNodes(treeData, 'disabled', (_value, node) => Boolean(node.disabled))

    expect(Array.from(matched)).toEqual(['standalone'])
    expect(Array.from(getAutoExpandKeys(treeData, new Set(['leaf-b1', 'child-a'])))).toEqual([
      'root',
      'child-b'
    ])
  })
})
