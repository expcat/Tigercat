<script setup lang="ts">
import { ref } from 'vue'
import { TreeSelect } from '@expcat/tigercat-vue/TreeSelect'

const value = ref<(string | number)[] | undefined>(undefined)
const treeData = [
  {
    key: 'eng',
    label: '工程',
    children: [
      { key: 'fe', label: '前端' },
      { key: 'be', label: '后端' }
    ]
  },
  { key: 'design', label: '设计' }
]
</script>

<template>
  <TreeSelect
    v-model="value"
    :tree-data="treeData"
    multiple
    default-expand-all
    class="w-full max-w-sm" />
</template>
