<script setup lang="ts">
import { Space } from '@expcat/tigercat-vue/Space'
import { ref } from 'vue'
import { TreeSelect } from '@expcat/tigercat-vue/TreeSelect'

const val = ref<string | number | undefined>(undefined)
const val2 = ref<string | number | undefined>(undefined)
const treeData = [
  {
    key: 'dev',
    label: '研发部',
    value: 'dev',
    children: [
      {
        key: 'fe',
        label: '前端组',
        value: 'fe',
        children: [
          { key: 'zs', label: '张三', value: 'zs' },
          { key: 'ls', label: '李四', value: 'ls' }
        ]
      },
      {
        key: 'be',
        label: '后端组',
        value: 'be',
        children: [{ key: 'ww', label: '王五', value: 'ww' }]
      }
    ]
  },
  { key: 'pm', label: '产品部', value: 'pm', children: [{ key: 'zl', label: '赵六', value: 'zl' }] }
]
</script>

<template>
  <div class="min-w-0">
    <TreeSelect v-model="val" :tree-data="treeData" placeholder="请选择成员" />
  </div>
</template>
