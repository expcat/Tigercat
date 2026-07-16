<script setup lang="ts">
import { ref } from 'vue'
import { Segmented } from '@expcat/tigercat-vue/Segmented'

const value = ref<string | number>('list')
const options = [
  { label: '列表', value: 'list' },
  { label: '看板', value: 'board' },
  { label: '日历', value: 'calendar' }
]
const sizes = ['sm', 'md', 'lg'] as const
</script>

<template>
  <div class="space-y-3">
    <Segmented v-for="size in sizes" :key="size" v-model="value" :options="options" :size="size" />
  </div>
</template>
