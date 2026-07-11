<script setup lang="ts">
import { ref } from 'vue'
import type { TreeSelectValue } from '@expcat/tigercat-core'
import { TreeSelect } from '@expcat/tigercat-vue/TreeSelect'

const value = ref<TreeSelectValue>('')
const treeData = [
  {
    key: 'engineering',
    label: '研发部',
    value: 'engineering',
    children: [
      { key: 'frontend', label: '前端组', value: 'frontend' },
      { key: 'backend', label: '后端组', value: 'backend' }
    ]
  },
  { key: 'product', label: '产品部', value: 'product' }
]
</script>

<template>
  <TreeSelect
    v-model="value"
    :tree-data="treeData"
    placeholder="请选择团队"
    class="w-full max-w-sm" />
</template>
