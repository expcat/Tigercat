<script setup lang="ts">
import { ref } from 'vue'
import { Cascader } from '@expcat/tigercat-vue/Cascader'

const value = ref<(string | number)[]>([])
const options = [
  {
    label: '产品',
    value: 'product',
    children: [
      { label: '设计', value: 'design' },
      { label: '运营', value: 'operations' }
    ]
  },
  {
    label: '研发',
    value: 'engineering',
    children: [
      { label: '前端', value: 'frontend' },
      { label: '后端', value: 'backend' }
    ]
  }
]
</script>

<template>
  <Cascader
    v-model="value"
    :options="options"
    searchable
    placeholder="搜索部门"
    class="w-full max-w-sm" />
</template>
