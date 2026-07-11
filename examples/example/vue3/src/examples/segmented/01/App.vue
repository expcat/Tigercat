<script setup lang="ts">
import { ref } from 'vue'
import { Segmented } from '@expcat/tigercat-vue/Segmented'

const value = ref<string | number>('weekly')
const options = [
  { label: '日', value: 'daily' },
  { label: '周', value: 'weekly' },
  { label: '月', value: 'monthly' },
  { label: '年', value: 'yearly', disabled: true }
]
</script>

<template>
  <Segmented v-model="value" :options="options" size="lg" block />
</template>
