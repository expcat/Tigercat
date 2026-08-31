<script setup lang="ts">
import { ref } from 'vue'
import { TreeSelect } from '@expcat/tigercat-vue/TreeSelect'

const value = ref<string | number | undefined>(undefined)
const treeData = [
  {
    key: 'china',
    label: '中国',
    children: [
      { key: 'beijing', label: '北京' },
      { key: 'shanghai', label: '上海' }
    ]
  },
  { key: 'singapore', label: '新加坡' }
]
</script>

<template>
  <TreeSelect v-model="value" :tree-data="treeData" searchable clearable class="w-full max-w-sm" />
</template>
