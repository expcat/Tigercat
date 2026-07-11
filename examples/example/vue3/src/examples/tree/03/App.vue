<script setup lang="ts">
import { ref } from 'vue'
import { Input } from '@expcat/tigercat-vue/Input'
import { Tree } from '@expcat/tigercat-vue/Tree'
import type { TreeNode } from '@expcat/tigercat-vue'

const treeData: TreeNode[] = [
  {
    key: 'frameworks',
    label: 'Frameworks',
    children: [
      { key: 'react', label: 'React' },
      { key: 'vue', label: 'Vue' }
    ]
  },
  { key: 'tooling', label: 'Tooling' }
]

const filterValue = ref('')
</script>

<template>
  <div class="space-y-3">
    <Input v-model="filterValue" placeholder="搜索节点" />
    <Tree :tree-data="treeData" :filter-value="filterValue" default-expand-all />
  </div>
</template>
