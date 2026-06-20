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
  getFirstVisibleChildKey,
  getLeafKeys,
  getParentKeys,
  getTreeKeyboardAction,
  getTreeNodeClasses,
  getTreeNodeExpandIconClasses,
  getVisibleTreeItems,
  handleNodeCheck,
  type TreeKeyboardContext,
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

describe('getFirstVisibleChildKey', () => {
  const expanded = new Set<string | number>(['root', 'child-b'])
  const visible = getVisibleTreeItems(treeData, expanded)

  it('returns the first visible child of an expanded node', () => {
    expect(getFirstVisibleChildKey(visible, 'root')).toBe('child-a')
    expect(getFirstVisibleChildKey(visible, 'child-b')).toBe('leaf-b1')
  })

  it('returns undefined for leaves and unknown keys', () => {
    expect(getFirstVisibleChildKey(visible, 'child-a')).toBeUndefined()
    expect(getFirstVisibleChildKey(visible, 'leaf-b2')).toBeUndefined()
    expect(getFirstVisibleChildKey(visible, 'missing')).toBeUndefined()
  })

  it('skips disabled children', () => {
    const data: TreeNode[] = [
      {
        key: 'p',
        label: 'P',
        children: [
          { key: 'c1', label: 'C1', disabled: true },
          { key: 'c2', label: 'C2' }
        ]
      }
    ]
    const items = getVisibleTreeItems(data, new Set(['p']))
    expect(getFirstVisibleChildKey(items, 'p')).toBe('c2')
  })
})

describe('getTreeKeyboardAction', () => {
  // Expanded tree, disabled `standalone` excluded from the focus ring.
  const focusableKeys: (string | number)[] = ['root', 'child-a', 'child-b', 'leaf-b1', 'leaf-b2']

  const makeCtx = (overrides: Partial<TreeKeyboardContext>): TreeKeyboardContext => ({
    key: 'ArrowDown',
    nodeKey: 'root',
    currentKey: 'root',
    focusableKeys,
    parentKey: undefined,
    firstChildKey: undefined,
    isExpandable: false,
    isExpanded: false,
    isParentExpanded: false,
    isChecked: false,
    selectable: false,
    checkable: false,
    ...overrides
  })

  it('returns null for keys the tree does not handle', () => {
    expect(getTreeKeyboardAction(makeCtx({ key: 'a' }))).toBeNull()
    expect(getTreeKeyboardAction(makeCtx({ key: 'Tab' }))).toBeNull()
  })

  describe('linear navigation', () => {
    it('moves down and up within the focus ring', () => {
      expect(getTreeKeyboardAction(makeCtx({ key: 'ArrowDown', currentKey: 'root' }))).toEqual({
        type: 'focus',
        key: 'child-a'
      })
      expect(getTreeKeyboardAction(makeCtx({ key: 'ArrowUp', currentKey: 'child-a' }))).toEqual({
        type: 'focus',
        key: 'root'
      })
    })

    it('stays on the current key at the boundaries', () => {
      expect(getTreeKeyboardAction(makeCtx({ key: 'ArrowUp', currentKey: 'root' }))).toEqual({
        type: 'focus',
        key: 'root'
      })
      expect(getTreeKeyboardAction(makeCtx({ key: 'ArrowDown', currentKey: 'leaf-b2' }))).toEqual({
        type: 'focus',
        key: 'leaf-b2'
      })
    })

    it('jumps to the first/last focusable key', () => {
      expect(getTreeKeyboardAction(makeCtx({ key: 'Home', currentKey: 'leaf-b2' }))).toEqual({
        type: 'focus',
        key: 'root'
      })
      expect(getTreeKeyboardAction(makeCtx({ key: 'End', currentKey: 'root' }))).toEqual({
        type: 'focus',
        key: 'leaf-b2'
      })
    })
  })

  describe('ArrowRight', () => {
    it('expands a collapsed expandable node', () => {
      expect(
        getTreeKeyboardAction(
          makeCtx({ key: 'ArrowRight', nodeKey: 'child-b', isExpandable: true, isExpanded: false })
        )
      ).toEqual({ type: 'toggleExpand', key: 'child-b' })
    })

    it('focuses the first child of an expanded node', () => {
      expect(
        getTreeKeyboardAction(
          makeCtx({
            key: 'ArrowRight',
            nodeKey: 'child-b',
            currentKey: 'child-b',
            isExpandable: true,
            isExpanded: true,
            firstChildKey: 'leaf-b1'
          })
        )
      ).toEqual({ type: 'focus', key: 'leaf-b1' })
    })

    it('is a no-op on a leaf', () => {
      expect(getTreeKeyboardAction(makeCtx({ key: 'ArrowRight', nodeKey: 'leaf-b1' }))).toEqual({
        type: 'none'
      })
    })
  })

  describe('ArrowLeft', () => {
    it('collapses an expanded expandable node', () => {
      expect(
        getTreeKeyboardAction(
          makeCtx({ key: 'ArrowLeft', nodeKey: 'child-b', isExpandable: true, isExpanded: true })
        )
      ).toEqual({ type: 'toggleExpand', key: 'child-b' })
    })

    it('focuses the parent of a leaf', () => {
      expect(
        getTreeKeyboardAction(
          makeCtx({
            key: 'ArrowLeft',
            nodeKey: 'leaf-b1',
            currentKey: 'leaf-b1',
            parentKey: 'child-b'
          })
        )
      ).toEqual({ type: 'focus', key: 'child-b' })
    })

    it('stays on the current key when there is no parent', () => {
      expect(
        getTreeKeyboardAction(makeCtx({ key: 'ArrowLeft', nodeKey: 'root', currentKey: 'root' }))
      ).toEqual({ type: 'focus', key: 'root' })
    })
  })

  describe('Escape', () => {
    it('collapses an expanded expandable node', () => {
      expect(
        getTreeKeyboardAction(
          makeCtx({ key: 'Escape', nodeKey: 'child-b', isExpandable: true, isExpanded: true })
        )
      ).toEqual({ type: 'toggleExpand', key: 'child-b' })
    })

    it('collapses and focuses an expanded parent from a leaf', () => {
      expect(
        getTreeKeyboardAction(
          makeCtx({
            key: 'Escape',
            nodeKey: 'leaf-b1',
            parentKey: 'child-b',
            isParentExpanded: true
          })
        )
      ).toEqual({ type: 'collapseAndFocus', collapseKey: 'child-b', focusKey: 'child-b' })
    })

    it('only focuses the parent when it is already collapsed', () => {
      expect(
        getTreeKeyboardAction(
          makeCtx({
            key: 'Escape',
            nodeKey: 'leaf-b1',
            parentKey: 'child-b',
            isParentExpanded: false
          })
        )
      ).toEqual({ type: 'collapseAndFocus', collapseKey: undefined, focusKey: 'child-b' })
    })

    it('is a no-op on a root leaf', () => {
      expect(getTreeKeyboardAction(makeCtx({ key: 'Escape', nodeKey: 'root' }))).toEqual({
        type: 'none'
      })
    })
  })

  describe('Enter and Space', () => {
    it('selects on Enter when selectable', () => {
      expect(
        getTreeKeyboardAction(makeCtx({ key: 'Enter', nodeKey: 'child-a', selectable: true }))
      ).toEqual({ type: 'select', key: 'child-a' })
    })

    it('toggles expand on Enter when not selectable but expandable', () => {
      expect(
        getTreeKeyboardAction(makeCtx({ key: 'Enter', nodeKey: 'child-b', isExpandable: true }))
      ).toEqual({ type: 'toggleExpand', key: 'child-b' })
    })

    it('is a no-op on Enter for a non-selectable leaf', () => {
      expect(getTreeKeyboardAction(makeCtx({ key: 'Enter', nodeKey: 'leaf-b1' }))).toEqual({
        type: 'none'
      })
    })

    it('checks on Space when checkable', () => {
      expect(
        getTreeKeyboardAction(
          makeCtx({ key: ' ', nodeKey: 'child-a', checkable: true, isChecked: false })
        )
      ).toEqual({ type: 'check', key: 'child-a', checked: true })
    })

    it('toggles expand on Space when not checkable but expandable', () => {
      expect(
        getTreeKeyboardAction(makeCtx({ key: ' ', nodeKey: 'child-b', isExpandable: true }))
      ).toEqual({ type: 'toggleExpand', key: 'child-b' })
    })
  })
})
