<script setup lang="ts">
import { ref } from 'vue'
import { Tree } from '@expcat/tigercat-vue/Tree'
import type { TreeNode } from '@expcat/tigercat-vue'

const treeData = ref<TreeNode[]>([
  { key: 'design', label: '设计', isLeaf: false },
  { key: 'broken', label: '会失败的节点', isLeaf: false }
])

const loadChildren = (node: TreeNode): Promise<TreeNode[]> =>
  new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (node.key === 'broken') {
        reject(new Error('load failed'))
        return
      }
      resolve([
        { key: `${node.key}-1`, label: `${node.label}子项 1`, isLeaf: true },
        { key: `${node.key}-2`, label: `${node.label}子项 2`, isLeaf: true }
      ])
    }, 400)
  })
</script>

<template>
  <Tree
    :tree-data="treeData"
    :load-data="loadChildren"
    aria-label="懒加载树"
    @update:tree-data="treeData = $event" />
</template>
