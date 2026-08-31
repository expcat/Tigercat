<script setup lang="ts">
import { Tree } from '@expcat/tigercat-vue/Tree'
import type { TreeNode } from '@expcat/tigercat-vue'

const treeData: TreeNode[] = [
  {
    key: 'design',
    label: '设计',
    children: [
      { key: 'ui', label: '界面设计' },
      { key: 'ux', label: '体验设计' }
    ]
  },
  { key: 'development', label: '开发' }
]
</script>

<template>
  <Tree :tree-data="treeData" default-expand-all aria-label="项目结构" />
</template>
