<script setup lang="ts">
import { ref } from 'vue'
import type { TreeSelectValue } from '@expcat/tigercat-core'
import { TreeSelect } from '@expcat/tigercat-vue/TreeSelect'

const value = ref<TreeSelectValue>('')
const treeData = [
  {
    key: 'china',
    label: '中国',
    value: 'china',
    children: [
      { key: 'beijing', label: '北京', value: 'beijing' },
      { key: 'shanghai', label: '上海', value: 'shanghai' }
    ]
  },
  { key: 'singapore', label: '新加坡', value: 'singapore' }
]
</script>

<template>
  <TreeSelect
    v-model="value"
    :tree-data="treeData"
    searchable
    placeholder="搜索地区"
    class="w-full max-w-sm" />
</template>
