<script setup lang="ts">
import { Tree } from '@expcat/tigercat-vue/Tree'
import type { TreeNode } from '@expcat/tigercat-vue'

const treeData: TreeNode[] = Array.from({ length: 8 }, (_, group) => ({
  key: `g-${group}`,
  label: `分组 ${group + 1}`,
  children: Array.from({ length: 8 }, (_, i) => ({
    key: `g-${group}-${i}`,
    label: `节点 ${group + 1}-${i + 1}`
  }))
}))
</script>

<template>
  <Tree
    :tree-data="treeData"
    searchable
    show-line
    virtual
    :height="240"
    :item-height="32"
    default-expand-all
    aria-label="虚拟树" />
</template>
