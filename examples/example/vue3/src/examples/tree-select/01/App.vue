<script setup lang="ts">
import { ref } from 'vue'
import { FormItem } from '@expcat/tigercat-vue/FormItem'
import { TreeSelect } from '@expcat/tigercat-vue/TreeSelect'

const value = ref<string | number | undefined>(undefined)
const treeData = [
  {
    key: 'engineering',
    label: '研发部',
    children: [
      { key: 'frontend', label: '前端组' },
      { key: 'backend', label: '后端组' }
    ]
  },
  { key: 'product', label: '产品部' }
]
</script>

<template>
  <FormItem label="团队" class="w-full max-w-sm">
    <TreeSelect v-model="value" :tree-data="treeData" default-expand-all />
  </FormItem>
</template>
