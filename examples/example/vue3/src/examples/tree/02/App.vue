<script setup lang="ts">
import { Tree } from '@expcat/tigercat-vue/Tree'
import type { TreeNode } from '@expcat/tigercat-vue'

const treeData: TreeNode[] = [
  { key: 'design', label: '设计' },
  { key: 'development', label: '开发' }
]

const loadChildren = (node: TreeNode): Promise<TreeNode[]> =>
  new Promise((resolve) => {
    window.setTimeout(
      () =>
        resolve([
          { key: String(node.key) + '-1', label: node.label + '子项 1', isLeaf: true },
          { key: String(node.key) + '-2', label: node.label + '子项 2', isLeaf: true }
        ]),
      500
    )
  })
</script>

<template>
  <Tree :tree-data="treeData" :load-data="loadChildren" />
</template>
