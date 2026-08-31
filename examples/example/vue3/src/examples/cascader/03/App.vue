<script setup lang="ts">
import { ref } from 'vue'
import { Cascader } from '@expcat/tigercat-vue/Cascader'

const value = ref<(string | number)[] | undefined>(undefined)
const options = [
  {
    label: '华东',
    value: 'east',
    children: [
      { label: '上海', value: 'shanghai' },
      { label: '杭州', value: 'hangzhou' }
    ]
  },
  {
    label: '华南',
    value: 'south',
    children: [{ label: '广州', value: 'guangzhou' }]
  }
]
</script>

<template>
  <Cascader
    v-model="value"
    :options="options"
    change-on-select
    expand-trigger="hover"
    class="w-full max-w-sm" />
</template>
