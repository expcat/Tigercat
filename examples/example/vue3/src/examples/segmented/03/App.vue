<script setup lang="ts">
import { ref } from 'vue'
import { Segmented } from '@expcat/tigercat-vue/Segmented'

const value = ref<string | number>('all')
const disabledValue = ref<string | number>('active')
const options = [
  { label: '全部', value: 'all' },
  { label: '进行中', value: 'active' },
  { label: '已完成', value: 'done' }
]
</script>

<template>
  <div class="space-y-3">
    <Segmented v-model="value" :options="options" block />
    <Segmented v-model="disabledValue" :options="options" disabled />
    <p class="text-sm text-gray-500">block 撑满容器宽度；disabled 禁用整个控件。</p>
  </div>
</template>
