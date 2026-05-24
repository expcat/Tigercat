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

function makeTwoLevelTree(rootCount: number, childrenPerRoot: number): TreeNode[] {
  return Array.from({ length: rootCount }, (_, rootIndex) => ({
    key: `root-${rootIndex}`,
    label: `Root ${rootIndex}`,
    children: Array.from({ length: childrenPerRoot }, (_, childIndex) => ({
      key: `root-${rootIndex}-${childIndex}`,
      label: `Node ${rootIndex}-${childIndex}`
    }))
  }))
}

describe('Tree virtualization data prep', () => {
  const treeData = makeTree(5, 5)
  const expandedKeys = getAutoExpandKeys(treeData, new Set(['node-0']))
  const tree1k = makeTwoLevelTree(20, 49)
  const tree5k = makeTwoLevelTree(50, 99)
  const expanded1k = new Set(tree1k.map((node) => node.key))
  const expanded5k = new Set(tree5k.map((node) => node.key))

  bench('flatten visible tree nodes', () => {
    getVisibleTreeItems(treeData, expandedKeys)
  })

  bench('filter large tree and compute expanded keys', () => {
    const filtered = filterTreeNodes(treeData, 'node-0-1')
    getAutoExpandKeys(filtered, new Set(['node-0-1']))
  })

  bench('1000 nodes: flatten expanded tree', () => {
    getVisibleTreeItems(tree1k, expanded1k)
  })

  bench('5000 nodes: flatten expanded tree', () => {
    getVisibleTreeItems(tree5k, expanded5k)
  })

  bench('1000 nodes: search and auto-expand', () => {
    const filtered = filterTreeNodes(tree1k, 'Node 1-')
    getAutoExpandKeys(filtered, new Set(['root-1']))
  })

  bench('5000 nodes: search and auto-expand', () => {
    const filtered = filterTreeNodes(tree5k, 'Node 10-')
    getAutoExpandKeys(filtered, new Set(['root-10']))
  })

  bench('visible node class generation', () => {
    const visibleItems = getVisibleTreeItems(treeData, expandedKeys)
    for (const item of visibleItems) {
      getTreeNodeClasses(false, false, item.node.disabled ?? false, false, 'md')
    }
  })
})
