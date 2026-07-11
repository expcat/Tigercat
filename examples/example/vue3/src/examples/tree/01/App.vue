<script setup lang="ts">
import { ref } from 'vue'
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

const checkedKeys = ref<(string | number)[]>(['ui'])
</script>

<template>
  <Tree
    v-model:checkedKeys="checkedKeys"
    :tree-data="treeData"
    checkable
    selectable
    default-expand-all />
</template>
