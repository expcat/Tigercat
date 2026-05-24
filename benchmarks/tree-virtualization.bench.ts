import { bench, describe } from 'vitest'
import {
  filterTreeNodes,
  getAutoExpandKeys,
  getTreeNodeClasses,
  getVisibleTreeItems,
  type TreeNode
} from '@expcat/tigercat-core'

function makeTree(levels: number, breadth: number, prefix = 'node'): TreeNode[] {
  if (levels <= 0) return []

  return Array.from({ length: breadth }, (_, index) => {
    const key = `${prefix}-${index}`
    return {
      key,
      label: `Node ${key}`,
      children: makeTree(levels - 1, breadth, key)
    }
  })
}

describe('Tree virtualization data prep', () => {
  const treeData = makeTree(5, 5)
  const expandedKeys = getAutoExpandKeys(treeData, new Set(['node-0']))

  bench('flatten visible tree nodes', () => {
    getVisibleTreeItems(treeData, expandedKeys)
  })

  bench('filter large tree and compute expanded keys', () => {
    const filtered = filterTreeNodes(treeData, 'node-0-1')
    getAutoExpandKeys(filtered, new Set(['node-0-1']))
  })

  bench('visible node class generation', () => {
    const visibleItems = getVisibleTreeItems(treeData, expandedKeys)
    for (const item of visibleItems) {
      getTreeNodeClasses(false, false, item.node.disabled ?? false, false, 'md')
    }
  })
})
